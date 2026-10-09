// Pure aggregation for /admin/reports so the numbers can be unit-tested without a database.
// All wall-clock reasoning is Asia/Bangkok (UTC+7, no daylight saving).

export const REPORT_TZ_OFFSET_MS = 7 * 60 * 60 * 1000;
/** Bookable day assumed by the utilization figure: 08:00-18:00 every day. */
export const OPEN_HOUR = 8;
export const CLOSE_HOUR = 18;
export const MAX_REPORT_DAYS = 366;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export type ReportRoom = { id: string; name: string; isActive: boolean };
export type ReportBooking = {
  roomId: string;
  startTime: Date;
  endTime: Date;
  status: string;
  attendeeCount: number;
};

export type RoomReportRow = {
  roomId: string;
  name: string;
  /** APPROVED bookings that overlap the report range. */
  approvedCount: number;
  /** Approved hours inside opening hours (08:00-18:00), clipped to the range. */
  bookedHours: number;
  /** bookedHours / available hours in the range, 0..1. */
  utilization: number;
};

export type Report = {
  days: number;
  availableHoursPerRoom: number;
  statusCounts: Record<"PENDING" | "APPROVED" | "REJECTED" | "CANCELLED", number>;
  totalBookings: number;
  approvedHours: number;
  rooms: RoomReportRow[];
  /** Approved booked hours per Bangkok clock hour (index 0..23), clipped to the range. */
  hourlyHours: number[];
  /** Overall utilization across all counted rooms, 0..1. */
  overallUtilization: number;
};

const round = (value: number, digits = 2) => Math.round(value * 10 ** digits) / 10 ** digits;

/** Parses a YYYY-MM-DD date as Bangkok midnight. Returns null for impossible dates. */
export function parseReportDate(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 2000 || year > 2100) return null;
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return new Date(`${value}T00:00:00+07:00`);
}

export function formatReportDate(date: Date): string {
  return new Date(date.getTime() + REPORT_TZ_OFFSET_MS).toISOString().slice(0, 10);
}

/**
 * Resolves ?from=&to= (inclusive dates). Falls back to the last 30 days ending today when absent
 * or invalid, and reports why via `error` so the page can tell the admin.
 */
export function resolveReportRange(fromText: string | undefined, toText: string | undefined, now = new Date()) {
  const todayStart = parseReportDate(formatReportDate(now)) as Date;
  const fallback = { from: new Date(todayStart.getTime() - 29 * DAY_MS), toExclusive: new Date(todayStart.getTime() + DAY_MS) };
  if (!fromText && !toText) return { ...fallback, error: null as string | null };
  const from = parseReportDate(fromText);
  const to = parseReportDate(toText);
  if (!from || !to) return { ...fallback, error: "รูปแบบวันที่ไม่ถูกต้อง จึงแสดงข้อมูล 30 วันล่าสุดแทน" };
  const toExclusive = new Date(to.getTime() + DAY_MS);
  if (toExclusive.getTime() <= from.getTime()) return { ...fallback, error: "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น จึงแสดงข้อมูล 30 วันล่าสุดแทน" };
  if ((toExclusive.getTime() - from.getTime()) / DAY_MS > MAX_REPORT_DAYS) return { ...fallback, error: `เลือกช่วงวันที่ได้ไม่เกิน ${MAX_REPORT_DAYS} วัน จึงแสดงข้อมูล 30 วันล่าสุดแทน` };
  return { from, toExclusive, error: null };
}

/** Calls fn for every Bangkok clock-hour slice of [start, end) with the minutes covered. */
function eachHourSlice(start: number, end: number, fn: (hourOfDay: number, ms: number) => void) {
  let cursor = start;
  while (cursor < end) {
    const local = cursor + REPORT_TZ_OFFSET_MS;
    const nextBoundary = cursor + (HOUR_MS - (((local % HOUR_MS) + HOUR_MS) % HOUR_MS));
    const sliceEnd = Math.min(end, nextBoundary);
    const hourOfDay = Math.floor((((local % DAY_MS) + DAY_MS) % DAY_MS) / HOUR_MS);
    fn(hourOfDay, sliceEnd - cursor);
    cursor = sliceEnd;
  }
}

export function buildReport(rooms: ReportRoom[], bookings: ReportBooking[], from: Date, toExclusive: Date): Report {
  const rangeStart = from.getTime();
  const rangeEnd = toExclusive.getTime();
  const days = Math.round((rangeEnd - rangeStart) / DAY_MS);
  const availableHoursPerRoom = days * (CLOSE_HOUR - OPEN_HOUR);

  const statusCounts = { PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 };
  const hourlyMs = new Array<number>(24).fill(0);
  const perRoom = new Map<string, { approvedCount: number; openMs: number }>();
  let totalBookings = 0;
  let approvedMs = 0;

  for (const booking of bookings) {
    const start = booking.startTime.getTime();
    const end = booking.endTime.getTime();
    if (!(start < rangeEnd && end > rangeStart)) continue;
    totalBookings += 1;
    if (booking.status in statusCounts) statusCounts[booking.status as keyof typeof statusCounts] += 1;
    if (booking.status !== "APPROVED") continue;

    const stat = perRoom.get(booking.roomId) ?? { approvedCount: 0, openMs: 0 };
    stat.approvedCount += 1;
    const clippedStart = Math.max(start, rangeStart);
    const clippedEnd = Math.min(end, rangeEnd);
    approvedMs += clippedEnd - clippedStart;
    eachHourSlice(clippedStart, clippedEnd, (hour, ms) => {
      hourlyMs[hour] += ms;
      if (hour >= OPEN_HOUR && hour < CLOSE_HOUR) stat.openMs += ms;
    });
    perRoom.set(booking.roomId, stat);
  }

  // Active rooms always appear (so unused rooms show 0%); inactive rooms only when they have data.
  const rows: RoomReportRow[] = rooms
    .filter(room => room.isActive || perRoom.has(room.id))
    .map(room => {
      const stat = perRoom.get(room.id) ?? { approvedCount: 0, openMs: 0 };
      const bookedHours = stat.openMs / HOUR_MS;
      return {
        roomId: room.id,
        name: room.name,
        approvedCount: stat.approvedCount,
        bookedHours: round(bookedHours),
        utilization: availableHoursPerRoom > 0 ? round(Math.min(1, bookedHours / availableHoursPerRoom), 4) : 0,
      };
    })
    .sort((a, b) => b.approvedCount - a.approvedCount || b.bookedHours - a.bookedHours || a.name.localeCompare(b.name));

  const totalAvailable = rows.length * availableHoursPerRoom;
  const totalBooked = rows.reduce((sum, row) => sum + row.bookedHours, 0);

  return {
    days,
    availableHoursPerRoom,
    statusCounts,
    totalBookings,
    approvedHours: round(approvedMs / HOUR_MS),
    rooms: rows,
    hourlyHours: hourlyMs.map(ms => round(ms / HOUR_MS)),
    overallUtilization: totalAvailable > 0 ? round(Math.min(1, totalBooked / totalAvailable), 4) : 0,
  };
}
