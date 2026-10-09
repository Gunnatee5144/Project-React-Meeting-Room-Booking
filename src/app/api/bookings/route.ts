// Route Handler: GET /api/bookings?start=&end=&roomId=&status=
// Used by the calendar to reload events when the visible date range changes. It verifies the
// session on the server and limits what each viewer can see (see lib/booking-visibility.ts).

import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getPrisma } from "@/lib/prisma";
import { bookingsQuerySchema } from "@/schemas/booking-query";
import { allowedStatuses, toBookingApiItem } from "@/lib/booking-visibility";

export const dynamic = "force-dynamic";

const MAX_RESULTS = 1000;
const noStore = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const viewer = await getSessionUser();
  if (!viewer) {
    return NextResponse.json({ error: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบ" }, { status: 401, headers: noStore });
  }

  const params = request.nextUrl.searchParams;
  const parsed = bookingsQuerySchema.safeParse({
    start: params.get("start") ?? undefined,
    end: params.get("end") ?? undefined,
    roomId: params.get("roomId") && params.get("roomId") !== "all" ? params.get("roomId") : undefined,
    status: params.get("status") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "พารามิเตอร์ไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400, headers: noStore },
    );
  }
  const { start, end, roomId, status } = parsed.data;

  // A non-admin asking for a status they may not list gets the default, not an error or a leak.
  const statuses = allowedStatuses(viewer, status);

  try {
    const rows = await getPrisma().booking.findMany({
      where: {
        status: { in: statuses as ("PENDING" | "APPROVED" | "REJECTED" | "CANCELLED")[] },
        startTime: { lt: end },
        endTime: { gt: start },
        ...(roomId ? { roomId } : {}),
      },
      select: {
        id: true, roomId: true, userId: true, topic: true, startTime: true, endTime: true,
        attendeeCount: true, status: true, adminNote: true,
        room: { select: { name: true, location: true } },
        user: { select: { name: true, email: true } },
      },
      orderBy: [{ startTime: "asc" }, { id: "asc" }],
      take: MAX_RESULTS + 1,
    });
    const truncated = rows.length > MAX_RESULTS;
    return NextResponse.json(
      { bookings: rows.slice(0, MAX_RESULTS).map(row => toBookingApiItem(row, viewer)), truncated },
      { headers: noStore },
    );
  } catch (error) {
    console.error("GET /api/bookings failed", error);
    return NextResponse.json({ error: "SERVER_ERROR", message: "ดึงข้อมูลการจองไม่สำเร็จ" }, { status: 500, headers: noStore });
  }
}
