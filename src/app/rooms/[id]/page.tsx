"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Users,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Share2,
  Tv,
  Wifi,
  Video,
  Projector,
  Mic,
  PenTool,
  Cast,
  Armchair,
  Sparkles,
  Info,
} from "lucide-react";
import { useApp } from "@/context/app-context";
import { useToast } from "@/context/toast-context";
import { StatusBadge, CodeBadge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoomDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { getRoomById, bookings } = useApp();
  const { toast } = useToast();

  const room = getRoomById(resolvedParams.id);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!room) {
    return (
      <div className="workspace-page mx-auto max-w-4xl px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">
          ไม่พบห้องประชุมที่ระบุ
        </h1>
        <p className="text-sm text-slate-600">
          ห้องประชุมนี้อาจถูกลบหรือระบุรหัสไม่ถูกต้อง
        </p>
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้ารายการห้องประชุม
        </Link>
      </div>
    );
  }

  const gallery =
    room.galleryImages && room.galleryImages.length > 0
      ? room.galleryImages
      : [room.imageUrl];

  // Bookings for this room
  const roomBookings = bookings.filter(
    (b) =>
      b.roomId === room.id &&
      b.status !== "CANCELLED" &&
      b.status !== "REJECTED",
  );

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(
        "คัดลอกลิงก์แล้ว",
        "ลิงก์ห้องประชุมถูกคัดลอกไปยังคลิปบอร์ดของคุณ",
      );
    } catch {
      toast.info(
        "แชร์ลิงก์ห้อง",
        "คัดลอก URL จากแถบที่อยู่ของเบราว์เซอร์ได้เลย",
      );
    }
  };

  return (
    <div className="workspace-page mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Share */}
      <div className="flex items-center justify-between">
        <Link
          href="/rooms"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้าห้องประชุมทั้งหมด</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>แชร์ห้องนี้</span>
        </button>
      </div>

      {/* Main Grid: Gallery & Info vs Sticky CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 cols): Media Gallery & Detailed Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery Showcase */}
          <div className="space-y-3">
            <div className="room-detail-photo relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md">
              <img
                src={gallery[selectedImageIndex] || room.imageUrl}
                alt={room.name}
                className="w-full h-full object-cover transition-all duration-700"
              />

              {/* Status pill overlay */}
              <div className="absolute top-4 left-4">
                <StatusBadge
                  status={room.isActive ? "AVAILABLE" : "MAINTENANCE"}
                  label={
                    room.isActive ? "พร้อมใช้งานตามปกติ" : "ปิดปรับปรุงชั่วคราว"
                  }
                />
              </div>

              <div className="absolute top-4 right-4">
                <CodeBadge code={room.roomCode} />
              </div>
            </div>

            {/* Thumbnail Strip */}
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`ดูภาพห้องที่ ${idx + 1}`}
                    aria-pressed={selectedImageIndex === idx}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? "border-blue-600 ring-2 ring-blue-200"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Room Title & Location */}
          <div className="page-heading space-y-3 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>
                {room.location} · ชั้น {room.floor}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {room.name}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              {room.description}
            </p>
          </div>

          {/* Key Specs Card Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                ความจุรองรับ
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {room.capacity} ที่นั่ง
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                ตำแหน่งอาคาร
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5 truncate">
                {room.building}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                ระดับชั้น
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                ชั้น {room.floor}
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                เวลาทำการ
              </div>
              <div className="text-base font-bold text-blue-700 mt-0.5">
                08:00 - 20:00 น.
              </div>
            </div>
          </div>

          {/* Equipment & Facilities List */}
          <div className="space-y-4 surface-panel rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tv className="w-5 h-5 text-blue-600" />
                <span>อุปกรณ์และสิ่งอำนวยความสะดวกในห้อง</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {room.equipment.length} รายการ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {room.equipment.map((eq, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>{eq}</span>
                </div>
              ))}
            </div>

            {room.features && room.features.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  คุณสมบัติพิเศษของพื้นที่
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {room.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200/60"
                    >
                      ★ {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Schedule / Existing Bookings for this room */}
          <div className="space-y-4 surface-panel rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>ตารางการใช้งานห้องนี้</span>
              </h2>
              <Link
                href="/calendar"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
              >
                ดูปฏิทินรวมทุกห้อง
              </Link>
            </div>

            {roomBookings.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                ยังไม่มีรายการจองใกล้ถึงเวลา คุณเลือกช่วงว่างเพื่อส่งคำขอได้
              </div>
            ) : (
              <div className="space-y-2.5">
                {roomBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{b.topic}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        ผู้จอง: {b.userName} ({b.userDepartment}) · ผู้เข้าร่วม{" "}
                        {b.attendeeCount} คน
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 text-[11px]">
                        {new Date(b.startTime).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        {new Date(b.startTime).toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(b.endTime).toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rules & Guidelines */}
          {room.rules && room.rules.length > 0 && (
            <div className="space-y-3 surface-panel rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-slate-500" />
                <span>ระเบียบและข้อปฏิบัติในการใช้ห้อง</span>
              </h2>
              <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                {room.rules.map((rule, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column (1 col): Sticky Booking Action Card */}
        <div className="room-summary sticky top-28 space-y-4">
          <div className="surface-panel rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 space-y-6">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                สถานะปัจจุบัน
              </div>
              <div className="flex items-center gap-2 mt-1">
                {room.isActive ? (
                  <span className="text-blue-700 font-bold text-lg flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                    เปิดให้จองใช้งาน
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold text-lg">
                    ปิดปรับปรุงชั่วคราว
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 border-y border-slate-100 py-4">
              <div className="flex justify-between">
                <span>ค่าบริการสำหรับบุคลากร/นักศึกษา:</span>
                <span className="font-bold text-blue-700">
                  ไม่มีค่าใช้จ่าย (ฟรี)
                </span>
              </div>
              <div className="flex justify-between">
                <span>การยืนยันคำขอ:</span>
                <span className="font-medium text-slate-900">
                  ตรวจรับรองโดยผู้ดูแลระบบ
                </span>
              </div>
              <div className="flex justify-between">
                <span>การป้องกันการซ้อน:</span>
                <span className="font-medium text-blue-700">
                  เปิดใช้งานอัตโนมัติ
                </span>
              </div>
            </div>

            {/* Direct Book Button CTA */}
            <div className="space-y-2">
              <Link
                href={`/rooms/${room.id}/book`}
                className={`w-full py-3.5 px-4 rounded-xl text-center text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                  room.isActive
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-700/20 active:scale-[0.99]"
                    : "bg-slate-200 text-slate-400 pointer-events-none"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>ดำเนินการจองห้องนี้ทันที</span>
              </Link>

              <Link
                href="/calendar"
                className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors block border border-slate-200"
              >
                ดูช่วงเวลาว่างบนปฏิทิน
              </Link>
            </div>

            <div className="text-[11px] text-slate-500 text-center leading-relaxed">
              เมื่อส่งคำขอจอง
              ระบบจะแจ้งเตือนไปยังผู้ดูแลระบบและส่งอีเมลสรุปคำขอให้ท่าน
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
