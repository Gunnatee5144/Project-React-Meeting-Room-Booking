import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";

// Runs the real init migration (including the hand-written exclusion constraint) in an
// isolated in-memory PostgreSQL. Never touches DATABASE_URL.
let db;

before(async () => {
  db = new PGlite({ extensions: { btree_gist } });
  await db.exec(readFileSync("prisma/migrations/20261010000000_init/migration.sql", "utf8"));
  await db.exec(`
    INSERT INTO "User" (id, name, email, "passwordHash") VALUES ('u1', 'A', 'a@example.test', 'x');
    INSERT INTO "Room" (id, name, location, capacity) VALUES ('r1', 'Room 1', 'L', 10), ('r2', 'Room 2', 'L', 10);
  `);
});
after(async () => { await db.close(); });

let counter = 0;
function insert(roomId, start, end, status = "PENDING", attendees = 2) {
  counter += 1;
  return db.query(
    `INSERT INTO "Booking" (id, "roomId", "userId", topic, "startTime", "endTime", "attendeeCount", status, "updatedAt")
     VALUES ($1, $2, 'u1', 't', $3, $4, $5, $6::"BookingStatus", CURRENT_TIMESTAMP)`,
    [`b${counter}`, roomId, start, end, attendees, status],
  );
}

test("overlapping PENDING/APPROVED bookings in the same room are rejected by the database", async () => {
  await insert("r1", "2030-01-01 09:00", "2030-01-01 10:00", "APPROVED");
  await assert.rejects(insert("r1", "2030-01-01 09:30", "2030-01-01 10:30", "PENDING"), { code: "23P01" });
  await assert.rejects(insert("r1", "2030-01-01 08:00", "2030-01-01 11:00", "PENDING"), { code: "23P01" });
});

test("back-to-back bookings, other rooms, and inactive statuses do not conflict", async () => {
  await insert("r1", "2030-01-01 10:00", "2030-01-01 11:00");
  await insert("r1", "2030-01-01 08:00", "2030-01-01 09:00");
  await insert("r2", "2030-01-01 09:00", "2030-01-01 10:00");
  await insert("r1", "2030-01-01 09:00", "2030-01-01 10:00", "REJECTED");
  await insert("r1", "2030-01-01 09:00", "2030-01-01 10:00", "CANCELLED");
});

test("re-activating a cancelled booking over an active one is rejected", async () => {
  await assert.rejects(
    db.query(`UPDATE "Booking" SET status = 'PENDING' WHERE status = 'CANCELLED' AND "roomId" = 'r1'`),
    { code: "23P01" },
  );
});

test("integrity checks reject inverted times and non-positive counts", async () => {
  await assert.rejects(insert("r2", "2030-02-01 10:00", "2030-02-01 09:00"), { code: "23514" });
  await assert.rejects(insert("r2", "2030-02-01 10:00", "2030-02-01 10:00"), { code: "23514" });
  await assert.rejects(insert("r2", "2030-02-01 10:00", "2030-02-01 11:00", "PENDING", 0), { code: "23514" });
});
