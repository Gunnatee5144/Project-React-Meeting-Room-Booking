"use server";

// Admin-only user management. The actor comes from the verified session and is re-read from the
// database on every call; the browser cannot supply who is acting or promote itself.

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { getAdminOrNull } from "@/lib/auth/guards";
import { updateUserRoleSchema } from "@/schemas/auth";
import type { RoomActionResult } from "@/types/room-actions";

export async function updateUserRole(userId: unknown, role: unknown): Promise<RoomActionResult> {
  const actor = await getAdminOrNull();
  if (!actor) return { success: false, message: "เฉพาะผู้ดูแลระบบเท่านั้นที่จัดการสิทธิ์ผู้ใช้ได้" };

  const parsed = updateUserRoleSchema.safeParse({ userId, role });
  if (!parsed.success) {
    return { success: false, message: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Blocking self-changes also guarantees at least one admin always remains: the actor.
  if (parsed.data.userId === actor.id) {
    return { success: false, message: "ไม่สามารถเปลี่ยนสิทธิ์ของบัญชีที่กำลังใช้งานอยู่ได้" };
  }

  try {
    const prisma = getPrisma();
    const target = await prisma.user.findUnique({ where: { id: parsed.data.userId }, select: { id: true, name: true, role: true } });
    if (!target) return { success: false, message: "ไม่พบผู้ใช้นี้" };
    if (target.role === parsed.data.role) return { success: true, message: "สิทธิ์ของผู้ใช้เป็นค่านี้อยู่แล้ว" };

    await prisma.user.update({ where: { id: target.id }, data: { role: parsed.data.role } });
    revalidatePath("/admin/users");
    return {
      success: true,
      message: `เปลี่ยนสิทธิ์ของ ${target.name} เป็น ${parsed.data.role === "ADMIN" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"} แล้ว`,
    };
  } catch (error) {
    console.error("updateUserRole failed", error);
    return { success: false, message: "เปลี่ยนสิทธิ์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" };
  }
}
