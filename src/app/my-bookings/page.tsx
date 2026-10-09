// Server Component: fetches the current user's booking history securely from the database.
// Only MyBookingsManager is a Client Component to handle user confirmation dialogs and mutations.

import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeading } from "@/components/ui";
import { getRoomViewer } from "@/lib/room-access";
import { getUserBookings, isBookingCancellable, isBookingEditable } from "@/lib/bookings";
import { MyBookingsManager, type UserBookingRecord } from "@/components/my-bookings-manager";

export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  const user = await getRoomViewer();

  if (!user) {
    redirect("/login?next=/my-bookings");
  }

  const dbBookings = await getUserBookings(user.id);
  const bookings: UserBookingRecord[] = dbBookings.map((b) => ({
    id: b.id,
    roomId: b.roomId,
    roomName: b.room.name,
    roomLocation: b.room.location,
    topic: b.topic,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    attendeeCount: b.attendeeCount,
    status: b.status as UserBookingRecord["status"],
    adminNote: b.adminNote,
    createdAt: b.createdAt.toISOString(),
    userName: user.name,
    userDepartment: user.department,
    canCancel: isBookingCancellable(b.status, b.startTime),
    canEdit: isBookingEditable(b.status, b.startTime),
  }));

  return (
    <div className="workspace-page mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="page-heading flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <PageHeading
          eyebrow="การจองของคุณ"
          title="นัดหมายและการจองของฉัน"
          description="ติดตามสถานะคำขอ แก้ไขรายละเอียด หรือยกเลิกการจองตามเงื่อนไขของระบบ"
        />
        <Link href="/rooms" className="button-primary shrink-0">
          <Plus className="h-4 w-4" />
          จองห้องเพิ่ม
        </Link>
      </div>

      <MyBookingsManager initialBookings={bookings} />
    </div>
  );
}
