import assert from "node:assert/strict";
import { test } from "node:test";
import { buildReport, formatReportDate, parseReportDate, resolveReportRange } from "../src/lib/reports.ts";

const bkk = text => new Date(`${text}+07:00`);
const rooms = [
  { id: "a", name: "Room A", isActive: true },
  { id: "b", name: "Room B", isActive: true },
  { id: "old", name: "Closed", isActive: false },
];
const booking = (roomId, start, end, status = "APPROVED") => ({ roomId, startTime: bkk(start), endTime: bkk(end), status, attendeeCount: 3 });
const from = bkk("2030-01-01T00:00:00");
const to = bkk("2030-01-08T00:00:00"); // exclusive, 7 days

test("utilization counts approved hours inside opening hours against available hours", () => {
  const report = buildReport(rooms, [
    booking("a", "2030-01-02T09:00:00", "2030-01-02T11:00:00"),
    booking("a", "2030-01-03T07:00:00", "2030-01-03T09:00:00"), // 1h before opening + 1h inside
    booking("b", "2030-01-02T13:00:00", "2030-01-02T14:00:00", "PENDING"),
    booking("b", "2030-01-04T13:00:00", "2030-01-04T14:00:00", "REJECTED"),
    booking("b", "2030-01-05T13:00:00", "2030-01-05T14:00:00", "CANCELLED"),
  ], from, to);
  assert.equal(report.days, 7);
  assert.equal(report.availableHoursPerRoom, 70);
  const a = report.rooms.find(room => room.roomId === "a");
  assert.equal(a.approvedCount, 2);
  assert.equal(a.bookedHours, 3);
  assert.equal(a.utilization, 0.0429);
  assert.equal(report.rooms.find(room => room.roomId === "b").approvedCount, 0);
  assert.deepEqual(report.statusCounts, { PENDING: 1, APPROVED: 2, REJECTED: 1, CANCELLED: 1 });
  assert.equal(report.totalBookings, 5);
  assert.equal(report.approvedHours, 4);
});

test("rooms are ranked by approved bookings; inactive rooms only appear with data", () => {
  const report = buildReport(rooms, [
    booking("b", "2030-01-02T09:00:00", "2030-01-02T10:00:00"),
    booking("b", "2030-01-03T09:00:00", "2030-01-03T10:00:00"),
    booking("a", "2030-01-02T09:00:00", "2030-01-02T10:00:00"),
  ], from, to);
  assert.deepEqual(report.rooms.map(room => room.roomId), ["b", "a"]);
  const withOld = buildReport(rooms, [booking("old", "2030-01-02T09:00:00", "2030-01-02T10:00:00")], from, to);
  assert.ok(withOld.rooms.some(room => room.roomId === "old"));
});

test("popular hours use Bangkok clock hours, including bookings that cross hour boundaries", () => {
  const report = buildReport(rooms, [booking("a", "2030-01-02T09:30:00", "2030-01-02T11:15:00")], from, to);
  assert.equal(report.hourlyHours[9], 0.5);
  assert.equal(report.hourlyHours[10], 1);
  assert.equal(report.hourlyHours[11], 0.25);
  assert.equal(report.hourlyHours.reduce((sum, value) => sum + value, 0), 1.75);
});

test("bookings are clipped to the range and outside bookings are ignored", () => {
  const report = buildReport(rooms, [
    booking("a", "2029-12-31T23:00:00", "2030-01-01T09:00:00"), // only 09:00 of Jan 1 hour counts... 00:00-09:00 within range
    booking("a", "2030-02-01T09:00:00", "2030-02-01T10:00:00"),
  ], from, to);
  assert.equal(report.totalBookings, 1);
  assert.equal(report.approvedHours, 9);
  assert.equal(report.rooms.find(room => room.roomId === "a").bookedHours, 1, "only 08:00-09:00 is within opening hours");
});

test("empty data gives zeroes without NaN", () => {
  const report = buildReport([], [], from, to);
  assert.equal(report.overallUtilization, 0);
  assert.equal(report.totalBookings, 0);
  assert.equal(report.rooms.length, 0);
});

test("report date handling", () => {
  assert.equal(parseReportDate("2030-02-30"), null);
  assert.equal(parseReportDate("nope"), null);
  assert.equal(formatReportDate(parseReportDate("2030-03-04")), "2030-03-04");
  const now = new Date("2030-06-15T20:00:00Z"); // 03:00 on 16 June in Bangkok
  const fallback = resolveReportRange(undefined, undefined, now);
  assert.equal(formatReportDate(fallback.from), "2030-05-18");
  assert.equal(formatReportDate(new Date(fallback.toExclusive.getTime() - 1)), "2030-06-16");
  assert.equal(fallback.error, null);
  const custom = resolveReportRange("2030-01-01", "2030-01-31", now);
  assert.equal(custom.error, null);
  assert.equal(custom.toExclusive.toISOString(), bkk("2030-02-01T00:00:00").toISOString());
  for (const [f, t] of [["2030-02-01", "2030-01-01"], ["bad", "2030-01-01"], ["2030-01-01", undefined], ["2020-01-01", "2030-01-01"]]) {
    assert.ok(resolveReportRange(f, t, now).error, `${f} ${t}`);
  }
});
