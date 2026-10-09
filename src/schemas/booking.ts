import { z } from "zod";

export const THAI_TIME_ZONE = "Asia/Bangkok";

export function parseBangkokDateTime(date: string, time: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  if (year < 2000 || year > 2100 || hour > 23 || minute > 59) return null;
  const calendar = new Date(Date.UTC(year, month - 1, day));
  if (calendar.getUTCFullYear() !== year || calendar.getUTCMonth() !== month - 1 || calendar.getUTCDate() !== day) return null;
  return new Date(`${date}T${time}:00+07:00`);
}

export const bookingSchema = z.object({
  roomId: z.string().min(1, "กรุณาระบุห้องประชุม").max(100),
  topic: z.string().trim().min(2, "หัวข้อการประชุมอย่างน้อย 2 ตัวอักษร").max(200, "หัวข้อการประชุมไม่เกิน 200 ตัวอักษร"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "รูปแบบเวลาเริ่มไม่ถูกต้อง (HH:mm)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "รูปแบบเวลาสิ้นสุดไม่ถูกต้อง (HH:mm)"),
  attendeeCount: z.number().int("จำนวนผู้เข้าร่วมต้องเป็นจำนวนเต็ม").min(1, "จำนวนผู้เข้าร่วมอย่างน้อย 1 คน").max(10000, "จำนวนผู้เข้าร่วมไม่เกิน 10,000 คน"),
  description: z.string().trim().max(1000, "รายละเอียดไม่เกิน 1,000 ตัวอักษร").optional(),
}).superRefine((value, context) => {
  const start = parseBangkokDateTime(value.date, value.startTime);
  const end = parseBangkokDateTime(value.date, value.endTime);

  if (!start) {
    context.addIssue({ code: "custom", path: ["startTime"], message: "ระบุวันที่และเวลาเริ่มต้นให้ถูกต้อง" });
    return;
  }
  if (!end) {
    context.addIssue({ code: "custom", path: ["endTime"], message: "ระบุวันที่และเวลาสิ้นสุดให้ถูกต้อง" });
    return;
  }
  if (end <= start) {
    context.addIssue({ code: "custom", path: ["endTime"], message: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น" });
  }

  const now = Date.now();
  // Allow a 1-minute grace period for clock drift during form submission
  if (start.getTime() < now - 60_000) {
    context.addIssue({ code: "custom", path: ["startTime"], message: "เวลาเริ่มต้นต้องอยู่ในอนาคต" });
  }

  const maxAdvanceMs = 30 * 24 * 60 * 60 * 1000;
  if (start.getTime() > now + maxAdvanceMs) {
    context.addIssue({ code: "custom", path: ["date"], message: "จองล่วงหน้าได้ไม่เกิน 30 วัน" });
  }
});

export const bookingIdSchema = z.string().min(1, "รหัสการจองไม่ถูกต้อง").max(100);

export const cancelBookingSchema = z.object({
  id: bookingIdSchema,
  reason: z.string().trim().max(500, "ระบุเหตุผลไม่เกิน 500 ตัวอักษร").optional(),
});

export const reviewBookingSchema = z.object({
  id: bookingIdSchema,
  status: z.enum(["APPROVED", "REJECTED"], { error: "สถานะต้องเป็น APPROVED หรือ REJECTED" }),
  adminNote: z.string().trim().max(500, "หมายเหตุไม่เกิน 500 ตัวอักษร").optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type ReviewBookingInput = z.infer<typeof reviewBookingSchema>;
