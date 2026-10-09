// Server Component: fetches rooms and schedule data from Prisma and passes to CalendarView.
// FullCalendar is loaded client-side inside CalendarView for rich interactive scheduling.

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeading } from "@/components/ui";
import { getRoomViewer } from "@/lib/room-access";
import { CalendarView, type CalendarEventItem, type CalendarRoomItem } from "@/components/calendar-view";
import { getCalendarBookings } from "@/lib/bookings";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await getRoomViewer();
  const serverIsAdmin = user?.role === "ADMIN";

  const prisma = getPrisma();
  const dbRooms = await prisma.room.findMany({
    where: { isActive: true },
    select: { id: true, name: true, location: true, capacity: true, imageUrl: true },
    orderBy: { name: "asc" },
  });
  const rooms: CalendarRoomItem[] = dbRooms;

  const dbBookings = await getCalendarBookings(undefined, serverIsAdmin);
  const bookings: CalendarEventItem[] = dbBookings.map((b) => ({
    id: b.id,
    roomId: b.roomId,
    roomName: b.room.name,
    roomLocation: b.room.location,
    topic: b.topic,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    status: b.status as "PENDING" | "APPROVED",
    attendeeCount: b.attendeeCount,
  }));

  return (
    <div className="workspace-page mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="page-heading flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <PageHeading
          eyebrow="ตารางห้องประชุม"
          title="เลือกเวลาที่ลงตัว"
          description="ดูตารางแต่ละห้อง เช็กช่วงเวลาว่าง และวางแผนการประชุมได้อย่างมั่นใจ"
        />
        <Link href="/rooms" className="button-primary shrink-0">
          <Plus className="h-4 w-4" />
          จองห้องประชุม
        </Link>
      </div>

      <CalendarView rooms={rooms} bookings={bookings} serverIsAdmin={serverIsAdmin} />
    </div>
  );
}
