import "server-only";
import { getPrisma } from "@/lib/prisma";
import { buildRoomWhere, ROOM_PAGE_SIZE, type RoomFilters } from "@/lib/room-filters";

export const roomSelect = {
  id: true, name: true, location: true, capacity: true, imageUrl: true, isActive: true,
  equipment: { select: { equipment: { select: { id: true, name: true } } }, orderBy: { equipment: { name: "asc" as const } } },
};

export async function listEquipment() {
  return getPrisma().equipment.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

export async function searchRooms(filters: RoomFilters) {
  const prisma = getPrisma();
  const where = buildRoomWhere(filters);
  const [rooms, total] = await prisma.$transaction([
    prisma.room.findMany({ where, select: roomSelect, orderBy: [{ name: "asc" }, { id: "asc" }], take: ROOM_PAGE_SIZE, skip: (Number(filters.page) - 1) * ROOM_PAGE_SIZE }),
    prisma.room.count({ where }),
  ]);
  return { rooms, total };
}

export async function getRoom(id: string) {
  return getPrisma().room.findUnique({ where: { id }, select: roomSelect });
}

export async function getRoomSchedule(roomId: string, start: Date, end: Date) {
  // Public schedule intentionally omits identity, topic, attendee count, and notes.
  return getPrisma().booking.findMany({
    where: { roomId, status: { in: ["PENDING", "APPROVED"] }, startTime: { lt: end }, endTime: { gt: start } },
    select: { id: true, startTime: true, endTime: true, status: true }, orderBy: { startTime: "asc" },
  });
}
