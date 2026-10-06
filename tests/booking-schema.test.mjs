import assert from "node:assert/strict";
import { test } from "node:test";
import {
  bookingSchema,
  bookingIdSchema,
  cancelBookingSchema,
  reviewBookingSchema,
} from "../src/schemas/booking.ts";

function getFutureDate(days = 1) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

const validBooking = {
  roomId: "room-123",
  topic: "วางแผนงานวิจัยและพัฒนา",
  date: getFutureDate(2),
  startTime: "10:00",
  endTime: "12:00",
  attendeeCount: 10,
  description: "ประชุมระดมความคิด",
};

test("booking schema accepts valid input with Bangkok datetime", () => {
  const parsed = bookingSchema.safeParse(validBooking);
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.topic, "วางแผนงานวิจัยและพัฒนา");
    assert.equal(parsed.data.attendeeCount, 10);
  }
});

test("booking topic requires at least 2 characters and trims whitespace", () => {
  assert.equal(bookingSchema.safeParse({ ...validBooking, topic: " " }).success, false);
  assert.equal(bookingSchema.safeParse({ ...validBooking, topic: "A" }).success, false);
  const parsed = bookingSchema.parse({ ...validBooking, topic: "  หัวข้อทดสอบ  " });
  assert.equal(parsed.topic, "หัวข้อทดสอบ");
});

test("booking requires end time to be strictly after start time", () => {
  assert.equal(bookingSchema.safeParse({ ...validBooking, startTime: "14:00", endTime: "14:00" }).success, false);
  assert.equal(bookingSchema.safeParse({ ...validBooking, startTime: "15:00", endTime: "14:00" }).success, false);
  assert.equal(bookingSchema.safeParse({ ...validBooking, startTime: "13:00", endTime: "14:00" }).success, true);
});

test("booking rejects start times in the past", () => {
  const pastDate = "2020-01-01";
  const result = bookingSchema.safeParse({ ...validBooking, date: pastDate, startTime: "10:00", endTime: "12:00" });
  assert.equal(result.success, false);
});

test("booking rejects dates more than 30 days in advance", () => {
  const farFutureDate = getFutureDate(40);
  const result = bookingSchema.safeParse({ ...validBooking, date: farFutureDate });
  assert.equal(result.success, false);
});

test("attendee count requires a positive integer", () => {
  for (const count of [0, -5, 1.5, "abc", "5"]) {
    assert.equal(bookingSchema.safeParse({ ...validBooking, attendeeCount: count }).success, false);
  }
  assert.equal(bookingSchema.safeParse({ ...validBooking, attendeeCount: 1 }).success, true);
  assert.equal(bookingSchema.safeParse({ ...validBooking, attendeeCount: 50 }).success, true);
});

test("cancel booking schema validates ID and reason constraints", () => {
  assert.equal(cancelBookingSchema.safeParse({ id: "bk-1" }).success, true);
  assert.equal(cancelBookingSchema.safeParse({ id: "bk-1", reason: "ติดธุระด่วน" }).success, true);
  assert.equal(cancelBookingSchema.safeParse({ id: "" }).success, false);
});

test("review booking schema accepts only APPROVED or REJECTED statuses", () => {
  assert.equal(reviewBookingSchema.safeParse({ id: "bk-1", status: "APPROVED" }).success, true);
  assert.equal(reviewBookingSchema.safeParse({ id: "bk-1", status: "REJECTED", adminNote: "ห้องไม่ว่าง" }).success, true);
  assert.equal(reviewBookingSchema.safeParse({ id: "bk-1", status: "PENDING" }).success, false);
  assert.equal(reviewBookingSchema.safeParse({ id: "bk-1", status: "UNKNOWN" }).success, false);
});
