"use server";

// Server Actions (mutations): the account to change comes from the verified session, never from
// browser input, so one user cannot edit another.

import { revalidatePath } from "next/cache";
import { getRoomViewer } from "@/lib/room-access";
import { getPrisma } from "@/lib/prisma";
import { profileSchema } from "@/schemas/profile";
import type { RoomActionResult } from "@/types/room-actions";

export async function updateProfile(input: unknown): Promise<RoomActionResult> {
  const user = await getRoomViewer();
  if (!user) return { success: false, message: "กรุณาเข้าสู่ระบบก่อนแก้ไขข้อมูล" };
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "ตรวจสอบข้อมูลที่ระบุ", fieldErrors: parsed.error.flatten().fieldErrors };
  try {
    await getPrisma().user.update({ where: { id: user.id }, data: {
      name: parsed.data.name, email: parsed.data.email, department: parsed.data.department || null,
    } });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") return { success: false, message: "อีเมลนี้มีผู้ใช้งานแล้ว", fieldErrors: { email: ["อีเมลนี้มีผู้ใช้งานแล้ว"] } };
    console.error("Profile update failed", error);
    return { success: false, message: "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่" };
  }
  revalidatePath("/", "layout");
  revalidatePath("/profile");
  return { success: true, message: "บันทึกข้อมูลส่วนตัวแล้ว" };
}