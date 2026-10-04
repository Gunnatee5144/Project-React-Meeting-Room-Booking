"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Clock,
  Users,
  Plus,
  Download,
  FileCheck2,
  X,
  Building2,
} from "lucide-react";
import { useApp } from "@/context/app-context";
import { useToast } from "@/context/toast-context";
import type { BookingItem } from "@/lib/mock-data";
import { StatusBadge, CodeBadge, EyebrowBadge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";

type BookingFilter = "ALL" | BookingItem["status"];
const filters: { key: BookingFilter; label: string }[] = [
  { key: "ALL", label: "ทั้งหมด" },
  { key: "PENDING", label: "รอตรวจสอบ" },
  { key: "APPROVED", label: "อนุมัติแล้ว" },
  { key: "REJECTED", label: "ไม่อนุมัติ" },
  { key: "CANCELLED", label: "ยกเลิกแล้ว" },
];
const dateText = (date: string) =>
  new Date(date).toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const timeText = (date: string) =>
  new Date(date).toLocaleTimeString("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function MyBookingsPage() {
  const { getUserBookings, cancelBooking, rooms } = useApp();
  const { toast } = useToast();
  const bookings = getUserBookings().toSorted((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  const [activeTab, setActiveTab] = useState<BookingFilter>("ALL");
  const [cancelBookingItem, setCancelBookingItem] =
    useState<BookingItem | null>(null);
  const [reason, setReason] = useState("");
  const [passBooking, setPassBooking] = useState<BookingItem | null>(null);
  const filtered = bookings.filter(
    (booking) => activeTab === "ALL" || booking.status === activeTab,
  );
  const downloadConfirmation = (booking: BookingItem) => {
    const lines = [
      "MEETSYNC · ใบยืนยันการจอง",
      "รหัส: " + booking.id,
      "สถานะ: อนุมัติแล้ว",
      "",
      booking.topic,
      "ห้อง: " + booking.roomName,
      "สถานที่: " + booking.roomLocation,
      "วันที่: " + dateText(booking.startTime),
      "เวลา: " +
        timeText(booking.startTime) +
        " – " +
        timeText(booking.endTime) +
        " น.",
      "ผู้จอง: " + booking.userName,
      "หน่วยงาน: " + booking.userDepartment,
      "จำนวนผู้เข้าร่วม: " + booking.attendeeCount + " คน",
      booking.adminNote ? "หมายเหตุ: " + booking.adminNote : "",
    ];
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + lines.join("\r\n")], {
        type: "text/plain;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "meetsync-" + booking.id + ".txt";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("ดาวน์โหลดใบยืนยันแล้ว", "การจอง " + booking.id);
  };
  return (
    <div className="workspace-page mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="page-heading flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200">
        <div>
          <EyebrowBadge label="การจองของคุณ" className="mb-3" />
          <h1>นัดหมายถัดไปของคุณ</h1>
          <p>ติดตามคำขอ เช็กกำหนดการ และจัดการการประชุมในที่เดียว</p>
        </div>
        <Link href="/rooms" className="button-primary">
          <Plus className="h-4 w-4" />
          จองห้องเพิ่ม
        </Link>
      </div>
      <div className="booking-filters" aria-label="กรองสถานะการจอง">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveTab(filter.key)}
            aria-pressed={activeTab === filter.key}
            className={activeTab === filter.key ? "is-active" : ""}
          >
            {filter.label}
            <span>
              {
                bookings.filter(
                  (booking) =>
                    filter.key === "ALL" || booking.status === filter.key,
                ).length
              }
            </span>
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="surface-panel border border-dashed border-slate-200 rounded-3xl py-20 px-6 text-center">
          <CalendarDays className="h-10 w-10 mx-auto text-blue-300" />
          <h2 className="mt-5 text-xl font-semibold">
            ยังไม่มีการจองในหมวดนี้
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            เริ่มจากห้องที่เหมาะกับทีม แล้วเลือกเวลาที่ลงตัว
          </p>
          <Link className="button-primary mt-6" href="/rooms">
            สำรวจห้องประชุม
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((booking) => {
            const room = rooms.find((item) => item.id === booking.roomId);
            return (
              <article
                key={booking.id}
                className="booking-panel surface-panel border border-slate-200 rounded-3xl bg-white overflow-hidden"
              >
                <div className="booking-panel-body">
                  <div className="booking-room-photo">
                    <img
                      src={room?.imageUrl}
                      alt={booking.roomName}
                      className="h-full w-full object-cover"
                    />
                    <CodeBadge
                      code={room?.roomCode || booking.roomId}
                      className="absolute left-3 bottom-3"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <span className="text-[11px] text-slate-400">
                        {booking.id}
                      </span>
                      <StatusBadge status={booking.status} />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-slate-900">
                      {booking.topic}
                    </h2>
                    <p className="mt-2 text-xs text-slate-500">
                      {booking.roomName}
                    </p>
                    <div className="booking-details">
                      <span>
                        <CalendarDays className="h-4 w-4" />
                        {dateText(booking.startTime)}
                      </span>
                      <span>
                        <Clock className="h-4 w-4" />
                        {timeText(booking.startTime)} –{" "}
                        {timeText(booking.endTime)} น.
                      </span>
                      <span>
                        <Users className="h-4 w-4" />
                        {booking.attendeeCount} คน
                      </span>
                    </div>
                    {booking.description && (
                      <p className="text-xs text-slate-500 leading-relaxed mt-4">
                        {booking.description}
                      </p>
                    )}
                  </div>
                </div>
                {booking.adminNote && (
                  <div className="mx-6 mb-5 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
                    <strong className="font-medium text-slate-800">
                      หมายเหตุผู้ดูแล:{" "}
                    </strong>
                    {booking.adminNote}
                    {booking.reviewedByName && (
                      <span className="block text-[11px] text-slate-400 mt-1">
                        ตรวจสอบโดย {booking.reviewedByName}
                      </span>
                    )}
                  </div>
                )}
                <div className="booking-panel-actions">
                  <Link
                    href={"/rooms/" + booking.roomId}
                    className="inline-flex gap-2 items-center text-xs font-medium text-slate-600 hover:text-blue-600"
                  >
                    รายละเอียดห้อง
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    {booking.status === "APPROVED" && (
                      <>
                        <button
                          onClick={() => setPassBooking(booking)}
                          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-medium text-blue-700"
                        >
                          <FileCheck2 className="h-4 w-4" />
                          ใบยืนยันการจอง
                        </button>
                        <button
                          onClick={() => downloadConfirmation(booking)}
                          className="icon-button"
                          aria-label={"ดาวน์โหลดใบยืนยัน " + booking.topic}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {(booking.status === "APPROVED" ||
                      booking.status === "PENDING") && (
                      <button
                        onClick={() => {
                          setCancelBookingItem(booking);
                          setReason("");
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 text-xs text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <X className="h-3.5 w-3.5" />
                        ยกเลิก
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {passBooking && (
        <Dialog title="ใบยืนยันการจอง" onClose={() => setPassBooking(null)}>
          <div className="booking-ticket">
            <p className="text-xs text-blue-100">MEETSYNC · DII CMU</p>
            <h3 className="mt-5 text-2xl font-semibold">
              {passBooking.roomName}
            </h3>
            <p className="mt-2 text-xs text-blue-100">
              {passBooking.roomLocation}
            </p>
            <div className="mt-8 flex justify-between border-t border-white/20 pt-5 text-sm">
              <span>{dateText(passBooking.startTime)}</span>
              <span>
                {timeText(passBooking.startTime)} –{" "}
                {timeText(passBooking.endTime)}
              </span>
            </div>
          </div>
          <div className="py-6 space-y-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">หัวข้อการประชุม</p>
              <p className="mt-1 font-medium">{passBooking.topic}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">ผู้จอง</p>
                <p className="mt-1">{passBooking.userName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">ผู้เข้าร่วม</p>
                <p className="mt-1">{passBooking.attendeeCount} คน</p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-dashed border-slate-200">
              <CodeBadge code={passBooking.id} />
              <StatusBadge status="APPROVED" />
            </div>
          </div>
          <button
            onClick={() => downloadConfirmation(passBooking)}
            className="button-primary w-full"
          >
            <Download className="h-4 w-4" />
            ดาวน์โหลดใบยืนยัน
          </button>
        </Dialog>
      )}
      {cancelBookingItem && (
        <Dialog
          title="ยกเลิกการจองนี้?"
          onClose={() => setCancelBookingItem(null)}
        >
          <p className="text-sm text-slate-500 leading-relaxed">
            ยกเลิก “{cancelBookingItem.topic}” วันที่{" "}
            {dateText(cancelBookingItem.startTime)}{" "}
            ช่วงเวลานี้จะเปิดให้ผู้อื่นจองได้อีกครั้ง
          </p>
          <label
            htmlFor="cancel-reason"
            className="block text-xs font-medium mt-6 mb-2"
          >
            เหตุผลในการยกเลิก{" "}
            <span className="text-slate-400">(ไม่บังคับ)</span>
          </label>
          <textarea
            id="cancel-reason"
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="เช่น เลื่อนกำหนดการประชุม"
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
          />
          <div className="flex flex-wrap justify-end gap-3 mt-6">
            <button
              className="button-secondary"
              onClick={() => setCancelBookingItem(null)}
            >
              กลับไปการจอง
            </button>
            <button
              className="rounded-xl bg-rose-600 px-5 text-sm font-medium text-white hover:bg-rose-700"
              onClick={() => {
                cancelBooking(cancelBookingItem.id, reason);
                setCancelBookingItem(null);
              }}
            >
              ยืนยันยกเลิก
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
