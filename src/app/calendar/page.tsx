// Server Component: fetches rooms and schedule data on the server and passes to CalendarView.
// FullCalendar is loaded client-side inside CalendarView for rich interactive scheduling.

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeading } from "@/components/ui";
import { CalendarView, type CalendarEventItem } from "@/components/calendar-view";
import { getCalendarBookings } from "@/lib/bookings";
import { getPrisma } from "@/lib/prisma";
import { INITIAL_ROOMS, INITIAL_BOOKINGS } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  let rooms: { id: string; name: string; location: string }[] = [];
  let bookings: CalendarEventItem[] = [];

  if (process.env.DATABASE_URL) {
    try {
      const prisma = getPrisma();
      const dbRooms = await prisma.room.findMany({
        where: { isActive: true },
        select: { id: true, name: true, location: true },
        orderBy: { name: "asc" },
      });
      rooms = dbRooms;

      const dbBookings = await getCalendarBookings();
      bookings = dbBookings.map((b) => ({
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
    } catch (e) {
      console.error("Database calendar fetch failed, falling back to initial data:", e);
    }
  }

  // Fallback to sample data if database not yet migrated or empty
  if (rooms.length === 0) {
    rooms = INITIAL_ROOMS.map((r) => ({
      id: r.id,
      name: r.name,
      location: r.location,
    }));
  }
  if (bookings.length === 0) {
    bookings = INITIAL_BOOKINGS.filter(
      (b) => b.status === "PENDING" || b.status === "APPROVED"
    ).map((b) => ({
      id: b.id,
      roomId: b.roomId,
      roomName: b.roomName,
      roomLocation: b.roomLocation,
      topic: b.topic,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status as "PENDING" | "APPROVED",
      attendeeCount: b.attendeeCount,
    }));
  }

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

      <CalendarView rooms={rooms} bookings={bookings} />
    </div>
  );
}
