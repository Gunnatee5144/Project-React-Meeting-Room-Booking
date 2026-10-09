import assert from "node:assert/strict";
import { test } from "node:test";
import { canCancelBooking, canEditBooking, checkBookingTimes, checkRoomForBooking, intervalsOverlap, isOverlapConstraintError } from "../src/lib/booking-rules.ts";
import { allowedStatuses, MASKED_TOPIC, toBookingApiItem } from "../src/lib/booking-visibility.ts";
import { bookingsQuerySchema } from "../src/schemas/booking-query.ts";

const HOUR = 3600_000;
const now = Date.parse("2030-01-01T00:00:00Z");
const at = hours => new Date(now + hours * HOUR);

test("intervals that only touch do not overlap", () => {
  assert.equal(intervalsOverlap(at(9), at(10), at(10), at(11)), false);
  assert.equal(intervalsOverlap(at(10), at(11), at(9), at(10)), false);
  assert.equal(intervalsOverlap(at(9), at(10), at(9.5), at(10.5)), true);
  assert.equal(intervalsOverlap(at(9), at(12), at(10), at(11)), true);
});

test("time rules: future start, end after start, within 30 days", () => {
  assert.equal(checkBookingTimes(at(1), at(2), now), null);
  assert.equal(checkBookingTimes(at(2), at(2), now)?.field, "endTime");
  assert.equal(checkBookingTimes(at(3), at(2), now)?.field, "endTime");
  assert.equal(checkBookingTimes(at(-1), at(1), now)?.field, "startTime");
  assert.equal(checkBookingTimes(new Date(now - 30_000), at(1), now), null, "1 minute grace");
  assert.equal(checkBookingTimes(at(30 * 24), at(30 * 24 + 1), now), null, "exactly 30 days");
  assert.equal(checkBookingTimes(at(30 * 24 + 1), at(30 * 24 + 2), now)?.field, "date");
});

test("room rules: active room and attendees within capacity", () => {
  const room = { capacity: 10, isActive: true };
  assert.equal(checkRoomForBooking(room, 10), null);
  assert.equal(checkRoomForBooking(room, 1), null);
  assert.equal(checkRoomForBooking(room, 11)?.field, "attendeeCount");
  assert.equal(checkRoomForBooking(room, 0)?.field, "attendeeCount");
  assert.equal(checkRoomForBooking(room, 2.5)?.field, "attendeeCount");
  assert.ok(checkRoomForBooking({ ...room, isActive: false }, 2));
});

test("edit and cancel rules", () => {
  assert.equal(canCancelBooking("PENDING", at(1), now), true);
  assert.equal(canCancelBooking("APPROVED", at(0.99), now), false);
  assert.equal(canCancelBooking("REJECTED", at(5), now), false);
  assert.equal(canCancelBooking("CANCELLED", at(5), now), false);
  assert.equal(canEditBooking("PENDING", at(0.1), now), true);
  assert.equal(canEditBooking("APPROVED", at(-0.1), now), false);
  assert.equal(canEditBooking("REJECTED", at(5), now), false);
});

test("exclusion-constraint errors are recognised however Prisma wraps them", () => {
  const prismaStyle = { code: "P2039", meta: { driverAdapterError: { name: "DriverAdapterError", cause: { originalCode: "23P01", kind: "postgres" } } } };
  assert.equal(isOverlapConstraintError(prismaStyle), true);
  assert.equal(isOverlapConstraintError({ code: "23P01" }), true);
  assert.equal(isOverlapConstraintError(new Error('conflicting key value violates exclusion constraint "no_overlapping_bookings"')), true);
  assert.equal(isOverlapConstraintError({ code: "P2002" }), false);
  assert.equal(isOverlapConstraintError(new Error("boom")), false);
  assert.equal(isOverlapConstraintError(null), false);
  const loop = {}; loop.cause = loop;
  assert.equal(isOverlapConstraintError(loop), false, "cycles do not hang");
});

const row = (userId, topic = "Secret topic") => ({
  id: "b1", roomId: "r1", userId, topic, startTime: at(1), endTime: at(2), attendeeCount: 7, status: "APPROVED", adminNote: "private note",
  room: { name: "Room", location: "Floor 1" }, user: { name: "Owner Name", email: "owner@example.test" },
});

test("API visibility: other users see only that the slot is taken", () => {
  const item = toBookingApiItem(row("owner"), { id: "someone-else", role: "USER" });
  assert.equal(item.title, MASKED_TOPIC);
  assert.equal(item.mine, false);
  const text = JSON.stringify(item);
  for (const secret of ["Secret topic", "private note", "Owner Name", "owner@example.test"]) assert.equal(text.includes(secret), false, secret);
  assert.equal("attendeeCount" in item, false);
});

test("API visibility: owner sees own details but not other identities; admin sees all", () => {
  const own = toBookingApiItem(row("owner"), { id: "owner", role: "USER" });
  assert.equal(own.title, "Secret topic");
  assert.equal(own.mine, true);
  assert.equal(own.attendeeCount, 7);
  assert.equal("userEmail" in own, false);
  const admin = toBookingApiItem(row("owner"), { id: "admin", role: "ADMIN" });
  assert.equal(admin.title, "Secret topic");
  assert.equal(admin.userEmail, "owner@example.test");
  assert.equal(admin.mine, false);
});

test("non-admins can never list rejected or cancelled bookings", () => {
  assert.deepEqual(allowedStatuses({ id: "u", role: "USER" }, "REJECTED"), ["PENDING", "APPROVED"]);
  assert.deepEqual(allowedStatuses({ id: "u", role: "USER" }, "CANCELLED"), ["PENDING", "APPROVED"]);
  assert.deepEqual(allowedStatuses({ id: "u", role: "USER" }, "APPROVED"), ["APPROVED"]);
  assert.deepEqual(allowedStatuses({ id: "a", role: "ADMIN" }, "REJECTED"), ["REJECTED"]);
  assert.deepEqual(allowedStatuses({ id: "a", role: "ADMIN" }), ["PENDING", "APPROVED"]);
});

test("GET /api/bookings query validation", () => {
  const ok = bookingsQuerySchema.safeParse({ start: "2030-01-01T00:00:00+07:00", end: "2030-01-08T00:00:00Z", roomId: "r1" });
  assert.equal(ok.success, true);
  assert.equal(ok.data.start.toISOString(), "2029-12-31T17:00:00.000Z");
  assert.equal(bookingsQuerySchema.safeParse({ start: "2030-01-01", end: "2030-01-02" }).success, true, "plain dates");
  for (const bad of [{}, { start: "2030-01-01" }, { start: "nope", end: "2030-01-02" }, { start: "1", end: "2" }, { start: "2030-01-02", end: "2030-01-01" }, { start: "2030-01-01", end: "2031-06-01" }, { start: "2030-02-30", end: "2030-03-02" }, { start: "2030-01-01", end: "2030-01-02", status: "DROP" }]) {
    assert.equal(bookingsQuerySchema.safeParse(bad).success, false, JSON.stringify(bad));
  }
});
