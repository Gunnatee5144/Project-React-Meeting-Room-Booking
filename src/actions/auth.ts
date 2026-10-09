"use server";

// Server Actions for membership: register, login, logout. Everything is re-validated here with
// the shared Zod schemas; the browser never decides the role (new accounts are always USER).

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/auth/session";
import { defaultLandingPath, safeNextPath } from "@/lib/auth/redirect";
import { createLoginLimiter } from "@/lib/auth/rate-limit";
import { loginSchema, registerSchema } from "@/schemas/auth";
import type { AuthActionResult } from "@/types/auth-actions";

const BCRYPT_COST = 12;
const limiter = createLoginLimiter();

// Compared against when the email is unknown so response time does not reveal which emails exist.
let dummyHash: Promise<string> | undefined;
const getDummyHash = () => (dummyHash ??= bcrypt.hash("not-a-real-password", BCRYPT_COST));

const BAD_CREDENTIALS = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "P2002";
}

export async function registerUser(input: unknown, next?: unknown): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "ตรวจสอบข้อมูลที่ระบุ", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { name, email, department, password } = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    // `role` is set explicitly: self-registration can never create an ADMIN.
    const user = await getPrisma().user.create({
      data: { name, email, department: department || null, passwordHash, role: "USER" },
      select: { id: true, role: true },
    });
    await createSession(user.id);
    revalidatePath("/", "layout");
    return { success: true, message: "สมัครสมาชิกสำเร็จ", redirectTo: safeNextPath(next) ?? defaultLandingPath(user.role) };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { success: false, message: "อีเมลนี้มีผู้ใช้งานแล้ว", fieldErrors: { email: ["อีเมลนี้มีผู้ใช้งานแล้ว"] } };
    }
    console.error("Registration failed", error);
    return { success: false, message: "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }
}

export async function loginUser(input: unknown, next?: unknown): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: "ตรวจสอบข้อมูลที่ระบุ", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { email, password } = parsed.data;

  const gate = limiter.check(email);
  if (!gate.allowed) {
    const minutes = Math.max(1, Math.ceil(gate.retryAfterSeconds / 60));
    return { success: false, message: `พยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณาลองใหม่ในอีก ${minutes} นาที` };
  }

  try {
    const user = await getPrisma().user.findUnique({
      where: { email },
      select: { id: true, role: true, passwordHash: true },
    });
    const valid = await bcrypt.compare(password, user?.passwordHash ?? (await getDummyHash()));
    if (!user || !valid) {
      limiter.fail(email);
      return { success: false, message: BAD_CREDENTIALS };
    }
    limiter.reset(email);
    await createSession(user.id);
    revalidatePath("/", "layout");
    return { success: true, message: "เข้าสู่ระบบสำเร็จ", redirectTo: safeNextPath(next) ?? defaultLandingPath(user.role) };
  } catch (error) {
    console.error("Login failed", error);
    return { success: false, message: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }
}

/** Clears the session cookie and sends the user to /login. Used as a <form action>. */
export async function logoutUser(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/login");
}
