import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(2, "ชื่ออย่างน้อย 2 ตัวอักษร").max(100, "ชื่อไม่เกิน 100 ตัวอักษร"),
  email: z.string().trim().toLowerCase().email("รูปแบบอีเมลไม่ถูกต้อง").max(254, "อีเมลยาวเกินไป"),
  department: z.string().trim().max(150, "หน่วยงานไม่เกิน 150 ตัวอักษร"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
