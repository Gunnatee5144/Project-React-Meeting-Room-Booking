// Server Component: fetches room and current session on the server before rendering.
// Only BookingForm is a Client Component to manage user interactions and react-hook-form state.

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeading, EmptyState } from "@/components/ui";
import { BookingForm } from "@/components/booking-form";
import { getRoom } from "@/lib/rooms";
import { getRoomViewer } from "@/lib/room-access";

export const dynamic = "force-dynamic";

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookRoomPage({ params }: BookPageProps) {
  const { id } = await params;

  if (!process.env.DATABASE_URL) {
    return (
      <EmptyState
        title="ยังไม่พร้อมส่งคำขอจอง"
        description="ระบบฐานข้อมูลยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้งในภายหลัง"
        href="/rooms"
        label="กลับไปหน้ารายการห้อง"
      />
    );
  }

  const room = await getRoom(id);
  if (!room) {
    notFound();
  }

  const user = await getRoomViewer();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/rooms/${id}/book`)}`);
  }

  const roomFormatted = {
    id: room.id,
    name: room.name,
    location: room.location,
    capacity: room.capacity,
    imageUrl: room.imageUrl,
    isActive: room.isActive,
    equipment: room.equipment.map((item) => ({
      id: item.equipment.id,
      name: item.equipment.name,
    })),
  };

  return (
    <div className="workspace-page mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <Link
          href={`/rooms/${room.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้ารายละเอียดห้อง ({room.name})</span>
        </Link>
      </div>

      <PageHeading
        eyebrow="ส่งคำขอจองห้องประชุม"
        title="เตรียมการประชุมของคุณ"
        description="กรอกข้อมูลการประชุม ระบบจะตรวจสอบช่วงเวลาและส่งคำขอไปยังผู้ดูแลระบบ"
      />

      <BookingForm room={roomFormatted} currentUser={user} />
    </div>
  );
}
