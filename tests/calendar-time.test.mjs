import assert from "node:assert/strict";
import { test } from "node:test";
import { toApiTimestamp, toBangkokWallClock } from "../src/lib/calendar-time.ts";
import { bookingsQuerySchema } from "../src/schemas/booking-query.ts";

test("instants become Bangkok wall-clock strings without an offset", () => {
  assert.equal(toBangkokWallClock("2030-10-04T02:00:00.000Z"), "2030-10-04T09:00:00");
  assert.equal(toBangkokWallClock(new Date("2030-10-04T09:00:00+07:00")), "2030-10-04T09:00:00");
  // Crossing midnight moves the calendar day, not just the hour.
  assert.equal(toBangkokWallClock("2030-12-31T18:30:00Z"), "2031-01-01T01:30:00");
  assert.equal(toBangkokWallClock("not a date"), "");
});

test("calendar range boundaries are sent to the API as Bangkok time", () => {
  assert.equal(toApiTimestamp("2030-09-29T00:00:00"), "2030-09-29T00:00:00+07:00");
  assert.equal(toApiTimestamp("2030-09-29T00:00:00+07:00"), "2030-09-29T00:00:00+07:00");
  assert.equal(toApiTimestamp("2030-09-29T00:00:00Z"), "2030-09-29T00:00:00Z");
  assert.equal(toApiTimestamp("2030-09-29"), "2030-09-29");
});

test("a visible week round-trips through the API query schema", () => {
  const parsed = bookingsQuerySchema.safeParse({ start: toApiTimestamp("2030-09-29T00:00:00"), end: toApiTimestamp("2030-10-06T00:00:00") });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.start.toISOString(), "2030-09-28T17:00:00.000Z");
  // A 09:00 Bangkok booking on the first day falls inside the range and is drawn at 09:00.
  const booking = new Date("2030-09-29T02:00:00Z");
  assert.equal(booking >= parsed.data.start && booking < parsed.data.end, true);
  assert.equal(toBangkokWallClock(booking), "2030-09-29T09:00:00");
});
