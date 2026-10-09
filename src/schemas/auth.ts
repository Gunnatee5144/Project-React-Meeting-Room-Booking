import { z } from "zod";

// Shared by the client forms (React Hook Form) and the Server Actions, which re-validate
// because client-side checks can be bypassed.

const email = z.string().trim().toLowerCase().min(1, "กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง").max(254, "อีเมลยาวเกินไป");

// bcrypt only uses the first 72 bytes, so cap the length instead of silently truncating.
const newPassword = z
  .string()
  .min(8, "รหัสผ่านอย่างน้อย 8 ตัวอักษร")
  .max(72, "รหัสผ่านไม่เกิน 72 ตัวอักษร")
  .refine(value => new TextEncoder().encode(value).length <= 72, "รหัสผ่านยาวเกินไป")
  .refine(value => /[A-Za-z]/.test(value) && /\d/.test(value), "รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข");

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "ชื่ออย่างน้อย 2 ตัวอักษร").max(100, "ชื่อไม่เกิน 100 ตัวอักษร"),
    email,
    department: z.string().trim().max(150, "หน่วยงานไม่เกิน 150 ตัวอักษร"),
    password: newPassword,
    confirmPassword: z.string().min(1, "กรุณายืนยันรหัสผ่าน"),
  })
  .refine(value => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "รหัสผ่านและการยืนยันไม่ตรงกัน",
  });

export const loginSchema = z.object({
  email,
  // Do not enforce the registration policy at login so older accounts can still sign in.
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน").max(200, "รหัสผ่านยาวเกินไป"),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1, "รหัสผู้ใช้ไม่ถูกต้อง").max(100),
  role: z.enum(["USER", "ADMIN"], { error: "สิทธิ์ต้องเป็น USER หรือ ADMIN" }),
});

export type RegisterInput = z.input<typeof registerSchema>;
export type LoginInput = z.input<typeof loginSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
