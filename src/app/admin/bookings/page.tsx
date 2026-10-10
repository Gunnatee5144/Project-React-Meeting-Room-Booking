// Server Component: Admin Bookings Management Page.
// requireAdmin() runs on the server before any data is read: guests go to /login, signed-in
// non-admins go home (sending them to /login would bounce straight back here).
// AdminBookingsManager handles interactive review actions (approve/reject) and email triggers.

import Link from "next/link";
import { PageHeading } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/guards";
import { getAdminBookings } from "@/lib/bookings";
import { AdminBookingsManager, type AdminBookingItem } from "@/components/admin-bookings-manager";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  await requireAdmin("/admin/bookings");

  const dbBookings = await getAdminBookings();
  const bookings: AdminBookingItem[] = dbBookings.map((b) => ({
    id: b.id,
    roomId: b.roomId,
    roomName: b.room.name,
    roomLocation: b.room.location,
    userId: b.userId,
    userName: b.user.name,
    userEmail: b.user.email,
    userDepartment: b.user.department,
    topic: b.topic,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    attendeeCount: b.attendeeCount,
    status: b.status as AdminBookingItem["status"],
    adminNote: b.adminNote,
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <div className="workspace-page mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="page-heading flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <PageHeading
          eyebrow="ผู้ดูแลระบบ"
          title="จัดการคำขอจองห้องประชุม"
          description="ตรวจสอบรายละเอียด อนุมัติ หรือปฏิเสธคำขอจองห้องประชุม พร้อมระบุเหตุผลและส่งอีเมลแจ้งผล"
        />

        {/* Admin Navigation Shortcuts */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/rooms"
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
          >
            จัดการห้อง
          </Link>
          <Link
            href="/admin/users"
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
          >
            จัดการผู้ใช้
          </Link>
          <Link
            href="/admin/reports"
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
          >
            รายงานสถิติ
          </Link>
        </div>
      </div>

      <AdminBookingsManager initialBookings={bookings} />
    </div>
  );
}
