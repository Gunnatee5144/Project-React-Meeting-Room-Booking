import { z } from "zod";

export const roomSchema = z.object({
  name: z.string().trim().min(2, "ชื่อห้องอย่างน้อย 2 ตัวอักษร").max(100, "ชื่อห้องไม่เกิน 100 ตัวอักษร"),
  location: z.string().trim().min(2, "ระบุสถานที่อย่างน้อย 2 ตัวอักษร").max(200, "สถานที่ไม่เกิน 200 ตัวอักษร"),
  capacity: z.number().int("จำนวนคนต้องเป็นจำนวนเต็ม").min(1, "ความจุอย่างน้อย 1 คน").max(10000, "ความจุไม่เกิน 10,000 คน"),
  imageUrl: z.string().trim().max(2048, "URL รูปภาพยาวเกินไป").refine(value => {
    if (!value) return true;
    try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
  }, "ใช้ URL รูปภาพแบบ https:// โดยไม่มีชื่อผู้ใช้หรือรหัสผ่าน"),
  isActive: z.boolean(),
  equipmentIds: z.array(z.string().min(1).max(100)).max(25, "เลือกอุปกรณ์ได้ไม่เกิน 25 รายการ").refine(ids => new Set(ids).size === ids.length, "รายการอุปกรณ์ซ้ำกัน"),
});
export const roomIdSchema = z.string().min(1).max(100);
export const equipmentNameSchema = z.string().trim().min(2, "ชื่ออุปกรณ์อย่างน้อย 2 ตัวอักษร").max(80, "ชื่ออุปกรณ์ไม่เกิน 80 ตัวอักษร");
export type RoomInput = z.infer<typeof roomSchema>;
