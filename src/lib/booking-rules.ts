// Booking rules shared by the Server Actions, Route Handlers and tests. Pure functions only
// (no database, no server-only) so every rule can be unit-tested.

export const BOOKING_MAX_ADVANCE_DAYS = 30;
export const BOOKING_MAX_ADVANCE_MS = BOOKING_MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000;
/** A user may cancel only when the meeting starts at least this far in the future. */
export const CANCEL_MIN_NOTICE_MS = 60 * 60 * 1000;
/** Allowance for clock drift between the browser and the server when submitting a form. */
export const START_TIME_GRACE_MS = 60_000;

/** Statuses that hold a room (and are covered by the database exclusion constraint). */
export const ACTIVE_BOOKING_STATUSES = ["PENDING", "APPROVED"] as const;
export const OVERLAP_CONSTRAINT_NAME = "no_overlapping_bookings";

export const OVERLAP_MESSAGE = "ช่วงเวลาดังกล่าวมีคำขอจองหรือได้รับการอนุมัติแล้ว กรุณาเลือกช่วงเวลาอื่น";

export function isActiveBookingStatus(status: string): boolean {
  return (ACTIVE_BOOKING_STATUSES as readonly string[]).includes(status);
}

/** Strict overlap: touching intervals (10:00 end vs 10:00 start) do not overlap. */
export function intervalsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart.getTime() < bEnd.getTime() && aEnd.getTime() > bStart.getTime();
}

export function canCancelBooking(status: string, startTime: Date, now = Date.now()): boolean {
  return isActiveBookingStatus(status) && startTime.getTime() - now >= CANCEL_MIN_NOTICE_MS;
}

export function canEditBooking(status: string, startTime: Date, now = Date.now()): boolean {
  return isActiveBookingStatus(status) && startTime.getTime() > now;
}

export type TimeRuleIssue = { field: "startTime" | "endTime" | "date"; message: string };

/** Time rules from the proposal: future start, end after start, at most 30 days ahead. */
export function checkBookingTimes(start: Date, end: Date, now = Date.now()): TimeRuleIssue | null {
  if (end.getTime() <= start.getTime()) return { field: "endTime", message: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น" };
  if (start.getTime() < now - START_TIME_GRACE_MS) return { field: "startTime", message: "เวลาเริ่มต้นต้องอยู่ในอนาคต" };
  if (start.getTime() > now + BOOKING_MAX_ADVANCE_MS) return { field: "date", message: `จองล่วงหน้าได้ไม่เกิน ${BOOKING_MAX_ADVANCE_DAYS} วัน` };
  return null;
}

export type RoomRuleIssue = { field?: "attendeeCount"; message: string };

/** Room rules: the room must be active and the attendee count a positive integer within capacity. */
export function checkRoomForBooking(room: { capacity: number; isActive: boolean }, attendeeCount: number): RoomRuleIssue | null {
  if (!room.isActive) return { message: "ห้องประชุมนี้ปิดปรับปรุง ไม่สามารถส่งคำขอจองได้" };
  if (!Number.isInteger(attendeeCount) || attendeeCount < 1) return { field: "attendeeCount", message: "จำนวนผู้เข้าร่วมต้องเป็นจำนวนเต็มบวก" };
  if (attendeeCount > room.capacity) return { field: "attendeeCount", message: `ห้องนี้รองรับได้สูงสุด ${room.capacity} คน` };
  return null;
}

/**
 * True when PostgreSQL rejected a write with the exclusion-constraint violation (SQLSTATE 23P01)
 * from "no_overlapping_bookings". With Prisma 7 + the pg adapter this surfaces as P2039 whose
 * meta.driverAdapterError.cause.originalCode is "23P01", so look through the error generically.
 */
export function isOverlapConstraintError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const seen = new Set<unknown>();
  const stack: unknown[] = [error];
  while (stack.length) {
    const value = stack.pop();
    if (typeof value !== "object" || value === null || seen.has(value)) continue;
    seen.add(value);
    const record = value as Record<string, unknown>;
    if (record.code === "23P01" || record.originalCode === "23P01") return true;
    if (typeof record.message === "string" && record.message.includes(OVERLAP_CONSTRAINT_NAME)) return true;
    stack.push(record.meta, record.cause, record.driverAdapterError);
  }
  return false;
}
