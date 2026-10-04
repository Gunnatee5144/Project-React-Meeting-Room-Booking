import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { RoomInput } from "@/schemas/room";

export class RoomManagementError extends Error {}

export async function roomTransaction<T>(prisma: PrismaClient, actorId: string, work: (transaction: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(async transaction => {
        const actor = await transaction.user.findUnique({ where: { id: actorId }, select: { role: true } });
        if (actor?.role !== "ADMIN") throw new RoomManagementError("คุณไม่มีสิทธิ์จัดการห้องประชุม");
        return work(transaction);
      }, { isolationLevel: "Serializable" });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2034" && attempt < 2) continue;
      throw error;
    }
  }
  throw new RoomManagementError("มีการเปลี่ยนข้อมูลพร้อมกัน กรุณาลองใหม่");
}

export async function saveManagedRoom(prisma: PrismaClient, actorId: string, input: RoomInput, id?: string) {
  return roomTransaction(prisma, actorId, async transaction => {
    if (id) {
      const room = await transaction.room.findUnique({ where: { id }, select: { id: true } });
      if (!room) throw new RoomManagementError("ไม่พบห้องประชุมนี้");
      const tooLarge = await transaction.booking.findFirst({ where: {
        roomId: id, status: { in: ["PENDING", "APPROVED"] }, endTime: { gt: new Date() }, attendeeCount: { gt: input.capacity },
      }, select: { id: true } });
      if (tooLarge) throw new RoomManagementError("ลดความจุไม่ได้ มีการจองที่ยังไม่สิ้นสุดซึ่งใช้จำนวนคนมากกว่านี้");
    }
    const count = await transaction.equipment.count({ where: { id: { in: input.equipmentIds } } });
    if (count !== input.equipmentIds.length) throw new RoomManagementError("รายการอุปกรณ์เปลี่ยนไป กรุณาโหลดหน้าใหม่");
    const data = { name: input.name, location: input.location, capacity: input.capacity, imageUrl: input.imageUrl || null, isActive: input.isActive };
    if (id) return transaction.room.update({ where: { id }, data: { ...data, equipment: {
      deleteMany: {}, create: input.equipmentIds.map(equipmentId => ({ equipmentId })),
    } }, select: { id: true } });
    return transaction.room.create({ data: { ...data, equipment: { create: input.equipmentIds.map(equipmentId => ({ equipmentId })) } }, select: { id: true } });
  });
}

export async function deleteManagedRoom(prisma: PrismaClient, actorId: string, id: string) {
  return roomTransaction(prisma, actorId, async transaction => {
    const room = await transaction.room.findUnique({ where: { id }, select: { id: true, _count: { select: { bookings: true } } } });
    if (!room) throw new RoomManagementError("ไม่พบห้องประชุมนี้");
    if (room._count.bookings > 0) {
      await transaction.room.update({ where: { id }, data: { isActive: false } });
      return "ปิดใช้งานห้องแล้ว เก็บประวัติการจองไว้ครบ";
    }
    await transaction.room.delete({ where: { id } });
    return "ลบห้องที่ไม่มีประวัติการจองแล้ว";
  });
}
