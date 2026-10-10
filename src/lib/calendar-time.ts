// Time conversion between GET /api/bookings (real instants, ISO 8601 with "Z") and FullCalendar.
// The calendar runs with timeZone="Asia/Bangkok" but without a time zone plugin, so it cannot
// convert offsets: it reads the wall-clock part of a date string and ignores the offset, and it
// reports visible ranges without one. These helpers do that conversion explicitly. Thailand has
// no daylight saving time, so the offset is always +07:00. Pure functions so they can be tested.

const BANGKOK_OFFSET = "+07:00";
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Instant -> Bangkok wall-clock string without offset: "2030-10-04T02:00:00.000Z" -> "2030-10-04T09:00:00". */
export function toBangkokWallClock(instant: string | Date): string {
  const time = typeof instant === "string" ? new Date(instant).getTime() : instant.getTime();
  if (Number.isNaN(time)) return "";
  return new Date(time + BANGKOK_OFFSET_MS).toISOString().slice(0, 19);
}

/**
 * Calendar range boundary -> timestamp accepted by GET /api/bookings. A string that already
 * carries an offset (or is a plain date, which the API reads as Bangkok midnight) is kept as is.
 */
export function toApiTimestamp(calendarDate: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(calendarDate) || /(Z|[+-]\d{2}:\d{2})$/.test(calendarDate)) return calendarDate;
  return `${calendarDate}${BANGKOK_OFFSET}`;
}
