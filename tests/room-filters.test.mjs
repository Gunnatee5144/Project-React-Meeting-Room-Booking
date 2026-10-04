import assert from "node:assert/strict";
import { test } from "node:test";
import { bangkokDate, parseBangkokDateTime, readRoomFilters, roomFilterSchema, roomSearchUrl, buildRoomWhere, dayWindow } from "../src/lib/room-filters.ts";

test("Bangkok dates use UTC+7 regardless of the server timezone", () => {
  assert.equal(bangkokDate(new Date("2026-10-03T18:00:00Z")), "2026-10-04");
  assert.equal(parseBangkokDateTime("2026-10-04", "09:30").toISOString(), "2026-10-04T02:30:00.000Z");
  assert.equal(dayWindow("2026-10-04").end.toISOString(), "2026-10-04T17:00:00.000Z");
});

test("invalid dates and rolled-over times are rejected", () => {
  for (const [date, time] of [["2026-02-29", "09:00"], ["2026-04-31", "09:00"], ["2026-13-01", "09:00"], ["2026-10-04", "24:00"], ["2026-10-04", "12:60"], ["foo", "12:00"]]) assert.equal(parseBangkokDateTime(date, time), null);
  assert.ok(parseBangkokDateTime("2028-02-29", "09:00"));
});

test("all time fields are required together and ranges cannot reverse", () => {
  const base = readRoomFilters({});
  assert.ok(roomFilterSchema.safeParse(base).success);
  for (const change of [{ date: "2026-10-04" }, { start: "09:00", end: "10:00" }, { date: "2026-10-04", start: "10:00", end: "09:00" }, { date: "2026-10-04", start: "10:00", end: "10:00" }]) assert.equal(roomFilterSchema.safeParse({ ...base, ...change }).success, false);
});

test("numeric filters reject negatives, fractions and huge offsets", () => {
  for (const capacity of ["-1", "0", "1.5", "10001", "1e2", "abc"]) assert.equal(roomFilterSchema.safeParse(readRoomFilters({ capacity })).success, false);
  for (const page of ["-1", "0", "100001", "1.5", "Infinity"]) assert.equal(roomFilterSchema.safeParse(readRoomFilters({ page })).success, false);
});

test("URL filters round-trip repeated equipment and encoded Thai text", () => {
  const filters = readRoomFilters({ q: "ห้อง A & B", equipment: ["screen", "board", "screen"], capacity: "8", date: "2026-10-04", start: "09:00", end: "10:00" });
  const url = new URL(roomSearchUrl(filters, 2), "https://example.test");
  assert.equal(url.searchParams.get("q"), "ห้อง A & B");
  assert.deepEqual(url.searchParams.getAll("equipment"), ["screen", "board"]);
  assert.equal(url.searchParams.get("page"), "2");
  assert.equal(roomSearchUrl(readRoomFilters({}), 1), "/rooms");
});

test("availability excludes pending/approved overlap but permits adjacent bookings", () => {
  const filters = readRoomFilters({ equipment: ["screen", "board"], date: "2026-10-04", start: "09:00", end: "10:00" });
  const where = buildRoomWhere(filters);
  assert.equal(where.isActive, true);
  assert.equal(where.AND.length, 2);
  assert.deepEqual(where.bookings.none.status.in, ["PENDING", "APPROVED"]);
  const conflicts = (start, end) => new Date(start) < where.bookings.none.startTime.lt && new Date(end) > where.bookings.none.endTime.gt;
  assert.equal(conflicts("2026-10-04T01:00:00Z", "2026-10-04T02:00:00Z"), false);
  assert.equal(conflicts("2026-10-04T03:00:00Z", "2026-10-04T04:00:00Z"), false);
  assert.equal(conflicts("2026-10-04T02:30:00Z", "2026-10-04T03:30:00Z"), true);
});
