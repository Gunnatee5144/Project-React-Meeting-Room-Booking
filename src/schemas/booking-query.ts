import { z } from "zod";

// Query string of GET /api/bookings. FullCalendar sends ISO timestamps (start/end); plain
// YYYY-MM-DD dates are accepted too and read as Asia/Bangkok midnight.

const MAX_RANGE_MS = 366 * 24 * 60 * 60 * 1000;

function toDate(value: string): Date | null {
  const text = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const date = new Date(`${text}T00:00:00+07:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  // Require an ISO shape so "1", "tomorrow" and other Date.parse quirks are rejected.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/.test(text)) return null;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

const dateParam = (label: string) =>
  z.string({ error: `ต้องระบุ ${label}` }).max(40).transform((value, context) => {
    const date = toDate(value);
    if (!date) context.addIssue({ code: "custom", message: `${label} ต้องเป็นวันที่แบบ ISO 8601` });
    return date as Date;
  });

export const bookingsQuerySchema = z
  .object({
    start: dateParam("start"),
    end: dateParam("end"),
    roomId: z.string().trim().min(1).max(100).optional(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]).optional(),
  })
  .superRefine((value, context) => {
    if (!(value.start instanceof Date) || !(value.end instanceof Date)) return;
    if (value.end.getTime() <= value.start.getTime()) {
      context.addIssue({ code: "custom", path: ["end"], message: "end ต้องอยู่หลัง start" });
    } else if (value.end.getTime() - value.start.getTime() > MAX_RANGE_MS) {
      context.addIssue({ code: "custom", path: ["end"], message: "ช่วงเวลาต้องไม่เกิน 366 วัน" });
    }
  });

export type BookingsQuery = z.infer<typeof bookingsQuerySchema>;
