"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Plus,
  Building2,
} from "lucide-react";
import { useApp } from "@/context/app-context";
import type { BookingItem } from "@/lib/mock-data";
import { StatusBadge, CodeBadge, EyebrowBadge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";

const dateKey = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
const time = (value: string) =>
  new Date(value).toLocaleTimeString("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
  });
const fullDate = (date: Date) =>
  date.toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function CalendarPage() {
  const { rooms, bookings } = useApp();
  const [selectedRoomId, setSelectedRoomId] = useState("all");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(
    null,
  );
  const shiftDate = (days: number) =>
    setCurrentDate((date) => {
      const next = new Date(date);
      next.setDate(next.getDate() + days);
      return next;
    });
  const monday = new Date(currentDate);
  monday.setDate(
    monday.getDate() + (monday.getDay() === 0 ? -6 : 1 - monday.getDay()),
  );
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + index);
    return date;
  });
  const activeBookings = bookings.filter(
    (booking) => booking.status === "APPROVED" || booking.status === "PENDING",
  );
  const filtered = activeBookings.filter(
    (booking) => selectedRoomId === "all" || booking.roomId === selectedRoomId,
  );
  const agenda = filtered
    .filter(
      (booking) =>
        dateKey(new Date(booking.startTime)) === dateKey(currentDate),
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="workspace-page mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="page-heading flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200">
        <div>
          <EyebrowBadge label="ตารางห้องประชุม" className="mb-3" />
          <h1>เลือกเวลาที่ลงตัว</h1>
          <p>ดูตารางแต่ละห้อง เช็กช่วงว่าง แล้ววางแผนการประชุมครั้งถัดไป</p>
        </div>
        <Link href="/rooms" className="button-primary">
          <Plus className="h-4 w-4" />
          จองห้องประชุม
        </Link>
      </div>
      <div className="calendar-layout">
        <aside className="calendar-sidebar">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">ห้องประชุม</h2>
            <span className="text-xs text-slate-400">{rooms.length} ห้อง</span>
          </div>
          <button
            onClick={() => setSelectedRoomId("all")}
            aria-pressed={selectedRoomId === "all"}
            className={
              "calendar-room-option " +
              (selectedRoomId === "all" ? "is-active" : "")
            }
          >
            <CalendarDays className="h-5 w-5" />
            <span>ทุกห้องประชุม</span>
          </button>
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              aria-pressed={selectedRoomId === room.id}
              className={
                "calendar-room-option " +
                (selectedRoomId === room.id ? "is-active" : "")
              }
            >
              <img
                src={room.imageUrl}
                alt=""
                className="h-11 w-11 rounded-xl object-cover"
              />
              <span className="min-w-0 text-left">
                <strong className="block truncate text-xs font-semibold">
                  {room.roomCode}
                </strong>
                <span className="block truncate text-[11px] text-slate-500">
                  {room.name}
                </span>
              </span>
            </button>
          ))}
          <div className="mt-6 border-t border-slate-200 pt-5 text-xs leading-relaxed text-slate-500">
            <span className="block font-medium text-slate-800 mb-2">
              สถานะบนตาราง
            </span>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="APPROVED" />
              <StatusBadge status="PENDING" />
            </div>
            <p className="mt-3">
              คำขอที่รอตรวจสอบแสดงบนตารางเพื่อช่วยวางแผนเวลา
            </p>
          </div>
        </aside>
        <section className="surface-panel rounded-3xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-7">
            <div>
              <p className="text-xs text-slate-500">ตารางประจำสัปดาห์</p>
              <h2 className="text-xl font-semibold mt-1">
                {currentDate.toLocaleDateString("th-TH", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="rounded-xl border border-slate-200 px-4 text-xs font-medium"
              >
                วันนี้
              </button>
              <button
                onClick={() => shiftDate(-7)}
                className="icon-button"
                aria-label="สัปดาห์ก่อน"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => shiftDate(7)}
                className="icon-button"
                aria-label="สัปดาห์ถัดไป"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="px-5 pb-4 lg:hidden">
            <label htmlFor="calendar-room" className="sr-only">
              เลือกห้องประชุม
            </label>
            <select
              id="calendar-room"
              value={selectedRoomId}
              onChange={(event) => setSelectedRoomId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            >
              <option value="all">ทุกห้องประชุม</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.roomCode} · {room.name}
                </option>
              ))}
            </select>
          </div>
          <div className="calendar-week">
            {days.map((date) => {
              const key = dateKey(date);
              const selected = key === dateKey(currentDate);
              const count = filtered.filter(
                (booking) => dateKey(new Date(booking.startTime)) === key,
              ).length;
              return (
                <button
                  key={key}
                  onClick={() => setCurrentDate(date)}
                  aria-pressed={selected}
                  className={"calendar-day " + (selected ? "is-active" : "")}
                >
                  <span>
                    {date.toLocaleDateString("th-TH", { weekday: "short" })}
                  </span>
                  <strong>{date.getDate()}</strong>
                  <span
                    className="calendar-day-dots"
                    aria-label={count + " การจอง"}
                  >
                    {Array.from({ length: Math.min(count, 3) }, (_, index) => (
                      <i key={index} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="px-5 py-7 sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h3 className="text-sm font-semibold">{fullDate(currentDate)}</h3>
              <span className="text-xs text-slate-400">
                {agenda.length} การจอง
              </span>
            </div>
            {agenda.length === 0 ? (
              <div className="calendar-empty">
                <CalendarDays className="h-10 w-10 text-blue-300" />
                <h3 className="text-xl font-semibold mt-5">
                  วันนี้ยังไม่มีการจอง
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  เลือกห้องที่เหมาะกับทีม แล้วส่งคำขอจองได้เลย
                </p>
                <Link
                  className="button-primary mt-6"
                  href={
                    selectedRoomId === "all"
                      ? "/rooms"
                      : "/rooms/" + selectedRoomId + "/book"
                  }
                >
                  เลือกห้องและเวลา
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {agenda.map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className="agenda-booking group"
                  >
                    <div className="agenda-time">
                      <strong>{time(booking.startTime)}</strong>
                      <span>{time(booking.endTime)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2 items-center mb-2">
                        <CodeBadge
                          code={
                            rooms.find((room) => room.id === booking.roomId)
                              ?.roomCode || booking.roomId
                          }
                        />
                        <StatusBadge status={booking.status} />
                      </div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-700">
                        {booking.topic}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5">
                        {booking.roomName}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-slate-500">
                        <span>{booking.userName}</span>
                        <span className="inline-flex gap-1.5 items-center">
                          <Users className="h-3.5 w-3.5" />
                          {booking.attendeeCount} คน
                        </span>
                      </div>
                    </div>
                    <ArrowUpRight className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      {selectedBooking && (
        <Dialog
          title="รายละเอียดการจอง"
          onClose={() => setSelectedBooking(null)}
        >
          <EyebrowBadge
            label={"การจอง " + selectedBooking.id}
            className="mb-3"
          />
          <h2 className="text-2xl font-semibold pr-10">
            {selectedBooking.topic}
          </h2>
          <div className="mt-4">
            <StatusBadge status={selectedBooking.status} />
          </div>
          <div className="mt-6 rounded-2xl bg-blue-50 p-5 space-y-3 text-sm">
            <p className="flex gap-3">
              <Building2 className="h-5 w-5 shrink-0 text-blue-600" />
              {selectedBooking.roomName}
            </p>
            <p className="flex gap-3">
              <CalendarDays className="h-5 w-5 shrink-0 text-blue-600" />
              {fullDate(new Date(selectedBooking.startTime))}
            </p>
            <p className="flex gap-3">
              <Clock className="h-5 w-5 shrink-0 text-blue-600" />
              {time(selectedBooking.startTime)} –{" "}
              {time(selectedBooking.endTime)} น.
            </p>
            <p className="flex gap-3">
              <Users className="h-5 w-5 shrink-0 text-blue-600" />
              {selectedBooking.attendeeCount} คน
            </p>
          </div>
          <dl className="mt-6 space-y-4 text-sm">
            <div>
              <dt className="text-slate-400 text-xs">ผู้จอง</dt>
              <dd className="mt-1">
                {selectedBooking.userName} · {selectedBooking.userDepartment}
              </dd>
            </div>
            {selectedBooking.description && (
              <div>
                <dt className="text-slate-400 text-xs">รายละเอียด</dt>
                <dd className="mt-1 leading-relaxed">
                  {selectedBooking.description}
                </dd>
              </div>
            )}
            {selectedBooking.adminNote && (
              <div>
                <dt className="text-slate-400 text-xs">หมายเหตุผู้ดูแล</dt>
                <dd className="mt-1">{selectedBooking.adminNote}</dd>
              </div>
            )}
          </dl>
          <Link
            href={"/rooms/" + selectedBooking.roomId}
            className="button-secondary w-full mt-7"
          >
            รายละเอียดห้อง
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Dialog>
      )}
    </div>
  );
}
