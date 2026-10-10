import "server-only";
import { getPrisma } from "@/lib/prisma";

export function isBookingCancellable(status: string, startTime: Date | string): boolean {
  if (status !== "PENDING" && status !== "APPROVED") return false;
  const startMs = typeof startTime === "string" ? new Date(startTime).getTime() : startTime.getTime();
  return startMs - Date.now() >= 60 * 60 * 1000;
}

export function isBookingEditable(status: string, startTime: Date | string): boolean {
  if (status !== "PENDING" && status !== "APPROVED") return false;
  const startMs = typeof startTime === "string" ? new Date(startTime).getTime() : startTime.getTime();
  return startMs > Date.now();
}

export async function getUserBookings(userId: string) {
  return getPrisma().booking.findMany({
    where: { userId },
    include: {
      room: {
        select: {
          id: true,
          name: true,
          location: true,
          capacity: true,
          imageUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminBookings() {
  return getPrisma().booking.findMany({
    include: {
      room: {
        select: {
          id: true,
          name: true,
          location: true,
          capacity: true,
          imageUrl: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
