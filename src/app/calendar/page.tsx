// Server Component: requireUser() redirects guests on the server, then only the room list is read
// here. Bookings are loaded by CalendarView (Client Component) from GET /api/bookings whenever the
// visible date range or the selected room changes, so the schedule is never served from a cache.

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeading } from "@/components/ui";
import { requireUser } from "@/lib/auth/guards";
import { CalendarView, type CalendarRoomItem } from "@/components/calendar-view";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  await requireUser("/calendar");

  const rooms: CalendarRoomItem[] = await getPrisma().room.findMany({
    where: { isActive: true },
    select: { id: true, name: true, location: true, capacity: true, imageUrl: true },
    orderBy: { name: "asc" },
  });

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

      <CalendarView rooms={rooms} />
    </div>
  );
}
