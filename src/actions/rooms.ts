"use server";

import { revalidatePath } from "next/cache";
import { getRoomViewer } from "@/lib/room-access";
import { getPrisma } from "@/lib/prisma";
import { deleteManagedRoom, RoomManagementError, roomTransaction, saveManagedRoom } from "@/lib/room-management";
import { equipmentNameSchema, roomIdSchema, roomSchema } from "@/schemas/room";
import type { RoomActionResult } from "@/types/room-actions";

function refreshRooms(id?: string) {
  for (const path of ["/", "/rooms", "/calendar", "/my-bookings", "/admin/rooms", "/admin/bookings", "/admin/reports"]) revalidatePath(path);
  if (id) { revalidatePath(`/rooms/${id}`); revalidatePath(`/rooms/${id}/book`); }
  else revalidatePath("/rooms/[id]", "page");
}

function failure(error: unknown): RoomActionResult {
  if (error instanceof RoomManagementError) return { success: false, message: error.message };
  if (typeof error === "object" && error !== null && "code" in error) {
    if (error.code === "P2002") return { success: false, message: "ชื่อนี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น" };
    if (error.code === "P2003" || error.code === "P2034") return { success: false, message: "ข้อมูลเปลี่ยนไประหว่างบันทึก กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง" };
    if (error.code === "P2025") return { success: false, message: "ไม่พบข้อมูลนี้ กรุณาโหลดหน้าใหม่" };
  }
  console.error("Room management failed", error);
  return { success: false, message: "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่" };
}

export async function createRoom(input: unknown): Promise<RoomActionResult> {
  const actor = await getRoomViewer();
  if (actor?.role !== "ADMIN") return { success: false, message: "คุณไม่มีสิทธิ์จัดการห้องประชุม" };
  const parsed = roomSchema.safeParse(input);
  if (!parsed.success) return { success: false, message: "ตรวจสอบข้อมูลห้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  try { const room = await saveManagedRoom(getPrisma(), actor.id, parsed.data); refreshRooms(room.id); return { success: true, message: "เพิ่มห้องประชุมแล้ว" }; } catch (error) { return failure(error); }
}

export async function updateRoom(id: unknown, input: unknown): Promise<RoomActionResult> {
  const actor = await getRoomViewer();
  if (actor?.role !== "ADMIN") return { success: false, message: "คุณไม่มีสิทธิ์จัดการห้องประชุม" };
  const roomId = roomIdSchema.safeParse(id);
  const parsed = roomSchema.safeParse(input);
  if (!roomId.success) return { success: false, message: "ไม่พบห้องประชุมนี้" };
  if (!parsed.success) return { success: false, message: "ตรวจสอบข้อมูลห้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  try { await saveManagedRoom(getPrisma(), actor.id, parsed.data, roomId.data); refreshRooms(roomId.data); return { success: true, message: "บันทึกข้อมูลห้องแล้ว" }; } catch (error) { return failure(error); }
}

export async function deleteRoom(id: unknown): Promise<RoomActionResult> {
  const actor = await getRoomViewer();
  if (actor?.role !== "ADMIN") return { success: false, message: "คุณไม่มีสิทธิ์จัดการห้องประชุม" };
  const roomId = roomIdSchema.safeParse(id);
  if (!roomId.success) return { success: false, message: "ไม่พบห้องประชุมนี้" };
  try { const message = await deleteManagedRoom(getPrisma(), actor.id, roomId.data); refreshRooms(roomId.data); return { success: true, message }; } catch (error) { return failure(error); }
}

export async function createEquipment(input: unknown): Promise<RoomActionResult> {
  const actor = await getRoomViewer();
  if (actor?.role !== "ADMIN") return { success: false, message: "คุณไม่มีสิทธิ์จัดการอุปกรณ์" };
  const name = equipmentNameSchema.safeParse(input);
  if (!name.success) return { success: false, message: name.error.issues[0].message };
  try {
    await roomTransaction(getPrisma(), actor.id, async transaction => {
      if (await transaction.equipment.findFirst({ where: { name: { equals: name.data, mode: "insensitive" } }, select: { id: true } })) throw new RoomManagementError("ชื่ออุปกรณ์นี้มีอยู่แล้ว");
      await transaction.equipment.create({ data: { name: name.data } });
    });
    refreshRooms(); return { success: true, message: "เพิ่มอุปกรณ์แล้ว" };
  } catch (error) { return failure(error); }
}

export async function deleteEquipment(id: unknown): Promise<RoomActionResult> {
  const actor = await getRoomViewer();
  if (actor?.role !== "ADMIN") return { success: false, message: "คุณไม่มีสิทธิ์จัดการอุปกรณ์" };
  const equipmentId = roomIdSchema.safeParse(id);
  if (!equipmentId.success) return { success: false, message: "ไม่พบอุปกรณ์นี้" };
  try {
    await roomTransaction(getPrisma(), actor.id, async transaction => {
      const item = await transaction.equipment.findUnique({ where: { id: equipmentId.data }, select: { _count: { select: { rooms: true } } } });
      if (!item) throw new RoomManagementError("ไม่พบอุปกรณ์นี้");
      if (item._count.rooms) throw new RoomManagementError("อุปกรณ์นี้ใช้ในห้องประชุมอยู่ ต้องนำออกจากห้องก่อนลบ");
      await transaction.equipment.delete({ where: { id: equipmentId.data } });
    });
    refreshRooms(); return { success: true, message: "ลบอุปกรณ์แล้ว" };
  } catch (error) { return failure(error); }
}
