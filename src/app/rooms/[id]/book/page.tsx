"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  ShieldCheck,
  Send,
} from "lucide-react";
import { useApp } from "@/context/app-context";
import { useToast } from "@/context/toast-context";
import { CodeBadge, EyebrowBadge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BookRoomPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { getRoomById, currentUser, bookings, createBooking } = useApp();
  const { toast } = useToast();

  const room = getRoomById(resolvedParams.id);

  // Form states
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => {
    // Tomorrow as default date
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  });
  const [startHour, setStartHour] = useState("09:00");
  const [endHour, setEndHour] = useState("11:00");
  const [attendeeCount, setAttendeeCount] = useState("5");
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!room) {
    return (
      <div className="workspace-page mx-auto max-w-3xl px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">ไม่พบห้องประชุม</h1>
        <Link href="/rooms" className="text-blue-700 underline text-sm">
          กลับหน้ารายการห้อง
        </Link>
      </div>
    );
  }

  // Conflict detection
  const startISO = `${date}T${startHour}:00+07:00`;
  const endISO = `${date}T${endHour}:00+07:00`;

  const hasConflict = bookings.some((b) => {
    if (
      b.roomId !== room.id ||
      b.status === "CANCELLED" ||
      b.status === "REJECTED"
    ) {
      return false;
    }
    const bStart = new Date(b.startTime).getTime();
    const bEnd = new Date(b.endTime).getTime();
    const reqStart = new Date(startISO).getTime();
    const reqEnd = new Date(endISO).getTime();

    // Overlap condition
    return reqStart < bEnd && reqEnd > bStart;
  });

  const isInvalidTimeRange = startHour >= endHour;
  const isOverCapacity = parseInt(attendeeCount, 10) > room.capacity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!room.isActive) {
      toast.warning("ห้องนี้ปิดปรับปรุง", "กรุณาเลือกห้องอื่นสำหรับการประชุม");
      return;
    }

    if (!topic.trim()) {
      toast.error(
        "กรุณาระบุหัวข้อการประชุม",
        "จำเป็นต้องระบุวัตถุประสงค์สั้นๆ",
      );
      return;
    }

    if (isInvalidTimeRange) {
      toast.error(
        "เวลาเริ่มต้นและสิ้นสุดไม่ถูกต้อง",
        "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น",
      );
      return;
    }

    if (isOverCapacity) {
      toast.error(
        "จำนวนผู้เข้าร่วมเกินความจุ",
        `ห้องนี้รองรับได้สูงสุด ${room.capacity} คน แต่คุณระบุ ${attendeeCount} คน`,
      );
      return;
    }

    if (hasConflict) {
      toast.error(
        "ตรวจพบการจองซ้อนเวลา",
        "ช่วงเวลาดังกล่าวมีคำขอจองแล้ว กรุณาเลือกช่วงเวลาใหม่",
      );
      return;
    }

    if (!agreeTerms) {
      toast.warning(
        "ข้อตกลงการใช้งาน",
        "กรุณากดยินยอมปฏิบัติตามระเบียบการใช้ห้อง",
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      createBooking({
        roomId: room.id,
        roomName: room.name,
        roomLocation: room.location,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userDepartment: currentUser.department,
        topic,
        description,
        startTime: startISO,
        endTime: endISO,
        attendeeCount: parseInt(attendeeCount, 10),
        equipmentNeeded: selectedEquipments,
      });

      router.push("/my-bookings");
    }, 600);
  };

  return (
    <div className="workspace-page mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top back button */}
      <div>
        <Link
          href={`/rooms/${room.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้ารายละเอียดห้อง ({room.name})</span>
        </Link>
      </div>

      {/* Header */}
      <div className="page-heading">
        <EyebrowBadge label="ส่งคำขอจอง" className="mb-2" />
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          เตรียมการประชุมของคุณ
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          กรอกรายละเอียดการประชุมเพื่อส่งคำขอจอง
          ระบบจะตรวจสอบเวลาซ้อนทับอัตโนมัติ
        </p>
      </div>

      {/* Main Grid: Form + Room Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 cols): The Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="surface-panel rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs"
          >
            {/* Step 1: Meeting Info */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>1. ข้อมูลหัวข้อการประชุม</span>
              </h2>

              <div className="space-y-1.5">
                <label
                  htmlFor="book-field-1"
                  className="text-xs font-semibold text-slate-700"
                >
                  หัวข้อ / ชื่องานประชุม{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  id="book-field-1"
                  type="text"
                  required
                  placeholder="เช่น ประชุมวางแผนงานวิจัยประจำสัปดาห์"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-sm font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="book-field-2"
                  className="text-xs font-semibold text-slate-700"
                >
                  รายละเอียด / วัตถุประสงค์โดยสังเขป
                </label>
                <textarea
                  id="book-field-2"
                  rows={3}
                  placeholder="ระบุวาระการประชุม หรือความต้องการพิเศษเพิ่มเติม..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-sm"
                />
              </div>
            </div>

            {/* Step 2: Date & Time Schedule */}
            <div className="space-y-4 pt-2">
              <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>2. วันที่และช่วงเวลาที่ต้องการใช้ห้อง</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="book-field-3"
                    className="text-xs font-semibold text-slate-700"
                  >
                    วันที่ใช้งาน <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="book-field-3"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="book-field-4"
                    className="text-xs font-semibold text-slate-700"
                  >
                    เวลาเริ่มต้น <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="book-field-4"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs font-medium cursor-pointer"
                  >
                    {[
                      "08:00",
                      "08:30",
                      "09:00",
                      "09:30",
                      "10:00",
                      "10:30",
                      "11:00",
                      "11:30",
                      "12:00",
                      "12:30",
                      "13:00",
                      "13:30",
                      "14:00",
                      "14:30",
                      "15:00",
                      "15:30",
                      "16:00",
                      "16:30",
                      "17:00",
                      "17:30",
                      "18:00",
                      "18:30",
                      "19:00",
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t} น.
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="book-field-5"
                    className="text-xs font-semibold text-slate-700"
                  >
                    เวลาสิ้นสุด <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="book-field-5"
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs font-medium cursor-pointer"
                  >
                    {[
                      "08:30",
                      "09:00",
                      "09:30",
                      "10:00",
                      "10:30",
                      "11:00",
                      "11:30",
                      "12:00",
                      "12:30",
                      "13:00",
                      "13:30",
                      "14:00",
                      "14:30",
                      "15:00",
                      "15:30",
                      "16:00",
                      "16:30",
                      "17:00",
                      "17:30",
                      "18:00",
                      "18:30",
                      "19:00",
                      "20:00",
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t} น.
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Conflict Live Alert */}
              {isInvalidTimeRange ? (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>
                    เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น กรุณาปรับเปลี่ยนเวลา
                  </span>
                </div>
              ) : hasConflict ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    <strong>ตรวจพบเวลาซ้อนทับ:</strong>{" "}
                    มีการจองห้องนี้ในช่วงเวลา {date} {startHour} - {endHour} น.
                    อยู่แล้ว กรุณาเลือกช่วงเวลาอื่น
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    ช่วงเวลานี้ <strong>ว่างพร้อมใช้งาน</strong>{" "}
                    สามารถส่งคำขอจองได้ทันที
                  </span>
                </div>
              )}
            </div>

            {/* Step 3: Attendees & Equipment */}
            <div className="space-y-4 pt-2">
              <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>3. ผู้เข้าร่วมและอุปกรณ์</span>
              </h2>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="book-field-6"
                    className="text-xs font-semibold text-slate-700"
                  >
                    จำนวนผู้เข้าร่วมประชุม (คน){" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    ความจุห้องสูงสุด: {room.capacity} คน
                  </span>
                </div>
                <input
                  id="book-field-6"
                  type="number"
                  min="1"
                  max={room.capacity}
                  required
                  value={attendeeCount}
                  onChange={(e) => setAttendeeCount(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none ${
                    isOverCapacity
                      ? "border-rose-400 bg-rose-50"
                      : "border-slate-200 focus:border-blue-600"
                  }`}
                />
                {isOverCapacity && (
                  <p className="text-xs text-rose-600">
                    จำนวนคนเกินความจุที่ห้องนี้รองรับได้ ({room.capacity} คน)
                  </p>
                )}
              </div>

              {/* Equipment Checkboxes */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-slate-700">
                  อุปกรณ์ที่ต้องการจัดเตรียมล่วงหน้า
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {room.equipment.map((eq) => (
                    <label
                      key={eq}
                      className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-slate-50 text-xs text-slate-700 cursor-pointer hover:bg-slate-100"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEquipments.includes(eq)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEquipments([...selectedEquipments, eq]);
                          } else {
                            setSelectedEquipments(
                              selectedEquipments.filter((item) => item !== eq),
                            );
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span>{eq}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Terms & Submit */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="leading-relaxed">
                  ข้าพเจ้ายินยอมปฏิบัติตามระเบียบการใช้ห้องประชุม
                  ดูแลรักษาความสะอาด
                  และรับผิดชอบต่ออุปกรณ์คอมพิวเตอร์และสื่อโสตทัศนูปกรณ์ที่ขอยืมใช้งาน
                </span>
              </label>

              <button
                type="submit"
                disabled={
                  !room.isActive ||
                  isSubmitting ||
                  hasConflict ||
                  isInvalidTimeRange ||
                  isOverCapacity
                }
                className={`w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                  !room.isActive ||
                  isSubmitting ||
                  hasConflict ||
                  isInvalidTimeRange ||
                  isOverCapacity
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-700/20 active:scale-[0.99] cursor-pointer"
                }`}
              >
                {isSubmitting ? (
                  <span>กำลังส่งคำขอจองห้อง...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>
                      {room.isActive
                        ? "ยืนยันและส่งคำขอจองห้อง"
                        : "ห้องนี้ปิดปรับปรุง"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (1 col): Room Card Preview & User Info */}
        <div className="space-y-6">
          {/* Room Summary Preview */}
          <div className="surface-panel rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ห้องที่เลือกจอง
            </div>

            <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100">
              <img
                src={room.imageUrl}
                alt={room.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <CodeBadge code={room.roomCode} />
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {room.name}
              </h3>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>{room.location}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>ความจุห้อง:</span>
                <span className="font-semibold text-slate-900">
                  {room.capacity} คน
                </span>
              </div>
              <div className="flex justify-between">
                <span>ชั้นที่ตั้ง:</span>
                <span className="font-semibold text-slate-900">
                  ชั้น {room.floor}
                </span>
              </div>
            </div>
          </div>

          {/* Current User Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3 text-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ข้อมูลผู้ขอจอง
            </div>
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div>
                <div className="font-bold text-slate-900">
                  {currentUser.name}
                </div>
                <div className="text-slate-500 text-[11px]">
                  {currentUser.email}
                </div>
                <div className="text-slate-600 text-[11px] mt-0.5">
                  {currentUser.department}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
