import { execFileSync } from "node:child_process";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

// Isolated in-memory PostgreSQL. Never reads the application's DATABASE_URL.
const db = new PGlite();
const schema = execFileSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "diff", "--from-empty", "--to-schema", "prisma/schema.prisma", "--script"], { encoding: "utf8", env: { ...process.env, DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:55432/postgres" } });
await db.exec(schema);
await db.exec(`
  INSERT INTO "User" (id, name, email, "passwordHash", department, role) VALUES
    ('test-admin', 'Admin Test', 'admin@example.test', 'test-only-unused-hash', 'Engineering', 'ADMIN'),
    ('test-user', 'Gun Test', 'gun@example.test', 'test-only-unused-hash', 'Engineering', 'USER'),
    ('test-other', 'Other User', 'other@example.test', 'test-only-unused-hash', null, 'USER');
  INSERT INTO "Equipment" (id, name) VALUES ('test-screen', 'จอภาพ'), ('test-board', 'ไวท์บอร์ด');
  INSERT INTO "Room" (id, name, location, capacity, "isActive") VALUES
    ('test-free', '01 ห้องพร้อมใช้', 'อาคารเรียน ชั้น 1', 12, true),
    ('test-busy', '02 ห้องมีการจอง', 'อาคารเรียน ชั้น 2', 20, true),
    ('test-inactive', '03 ห้องปิดใช้งาน', 'อาคารเรียน ชั้น 3', 8, false);
  INSERT INTO "RoomEquipment" ("roomId", "equipmentId") VALUES
    ('test-free', 'test-screen'), ('test-free', 'test-board'), ('test-busy', 'test-screen');
  INSERT INTO "Booking" (id, "roomId", "userId", topic, "startTime", "endTime", "attendeeCount", status, "updatedAt") VALUES
    ('test-booking', 'test-busy', 'test-other', 'PRIVATE TOPIC MUST NOT LEAK', '2030-10-04 02:00:00', '2030-10-04 03:00:00', 15, 'PENDING', CURRENT_TIMESTAMP),
    ('test-rejected', 'test-free', 'test-other', 'PRIVATE REJECTED TOPIC', '2030-10-04 02:00:00', '2030-10-04 03:00:00', 2, 'REJECTED', CURRENT_TIMESTAMP);
`);
for (let index = 1; index <= 14; index++) await db.query('INSERT INTO "Room" (id, name, location, capacity) VALUES ($1,$2,$3,2)', [`test-page-${index}`, `ทดสอบแบ่งหน้า ${String(index).padStart(2, "0")}`, "อาคารทดสอบ"]);

const server = new PGLiteSocketServer({ db, host: "127.0.0.1", port: 55432, maxConnections: 20 });
await server.start();
console.log("Isolated test database ready on 127.0.0.1:55432");
// The database is entirely in memory; immediate exit avoids waiting for a
// pooled connection when Playwright tears down the paired web servers.
process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
