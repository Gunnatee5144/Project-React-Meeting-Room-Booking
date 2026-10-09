"use client";

// Client Component: FullCalendar integration for individual room schedules.
// Features per-room tabs, selected room details banner with quick booking action,
// privacy-safe event masking for students/general users ("จองแล้ว"),
// and click-to-view dialogs exclusively for administrators.

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import {
  CalendarDays,
  Clock,
  Users,
  Building2,
  Plus,
  Lock,
  Shield,
  Layers,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/badge";
import { useApp } from "@/context/app-context";

const emptySubscribe = () => () => {};

export interface CalendarRoomItem {
  id: string;
  name: string;
  location: string;
  capacity?: number;
  imageUrl?: string | null;
}

export interface CalendarEventItem {
  id: string;
  roomId: string;
  roomName: string;
  roomLocation?: string;
  topic: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  status: "PENDING" | "APPROVED";
  attendeeCount?: number;
}

interface CalendarViewProps {
  rooms: CalendarRoomItem[];
  bookings: CalendarEventItem[];
  serverIsAdmin?: boolean;
}

export function CalendarView({ rooms, bookings, serverIsAdmin = false }: CalendarViewProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { currentUser } = useApp();

  // Determine if the current viewer is an Admin (either from server session or mock demo role)
  const isAdmin = Boolean(serverIsAdmin || currentUser?.role === "ADMIN");

  // Default to the first room in the list
  const [selectedRoomId, setSelectedRoomId] = useState<string>(() => rooms[0]?.id || "");

  const [activeEvent, setActiveEvent] = useState<CalendarEventItem | null>(null);

  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || rooms[0] || null;
  }, [rooms, selectedRoomId]);

  // Strictly filter bookings for the currently selected room
  const filteredBookings = useMemo(() => {
    if (!selectedRoom) return [];
    return bookings.filter((b) => b.roomId === selectedRoom.id);
  }, [bookings, selectedRoom]);

  // Mask titles for non-admins to "จองแล้ว"
  const calendarEvents = useMemo(() => {
    return filteredBookings.map((b) => ({
      id: b.id,
      title: isAdmin ? b.topic : "จองแล้ว",
      start: b.startTime,
      end: b.endTime,
      backgroundColor: b.status === "APPROVED" ? "#16a34a" : "#ca8a04",
      borderColor: b.status === "APPROVED" ? "#15803d" : "#a16207",
      textColor: "#ffffff",
      extendedProps: b,
    }));
  }, [filteredBookings, isAdmin]);

  const handleEventClick = (info: EventClickArg) => {
    // Only administrators can open the detailed modal
    if (!isAdmin) return;
    const data = info.event.extendedProps as CalendarEventItem;
    setActiveEvent(data);
  };

  const formatThaiTimeRange = (start: string, end: string) => {
    const s = new Date(start).toLocaleTimeString("th-TH", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
    });
    const e = new Date(end).toLocaleTimeString("th-TH", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${s} – ${e} น.`;
  };

  const formatThaiDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      timeZone: "Asia/Bangkok",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!mounted) {
    return (
      <div className="surface-panel rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
        กำลังโหลดปฏิทินการจองห้องประชุม...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Room Selection Tabs Bar */}
      <div className="surface-panel rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-slate-500 shrink-0 px-2 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            ห้องประชุม:
          </span>
          {rooms.map((r) => {
            const isActive = r.id === (selectedRoom?.id ?? "");
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRoomId(r.id)}
                className={`px-3.5 py-2 rounded-xl font-medium transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70"
                }`}
              >
                <span>{r.name}</span>
                {r.capacity ? (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      isActive ? "bg-white/20 text-white font-normal" : "bg-slate-200/70 text-slate-600"
                    }`}
                  >
                    {r.capacity} ที่นั่ง
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Selected Room Summary Card with Quick Booking Action */}
      {selectedRoom && (
        <div className="surface-panel rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-white p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900">{selectedRoom.name}</h2>
              {selectedRoom.capacity && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
                  <Users className="w-3 h-3" />
                  รองรับสูงสุด {selectedRoom.capacity} คน
                </span>
              )}
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200/70 px-2.5 py-0.5 rounded-full">
                  <Shield className="w-3 h-3" />
                  มุมมองผู้ดูแลระบบ (เห็นหัวข้อ)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" />
                  มุมมองนักศึกษา (ซ่อนหัวข้อ)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {selectedRoom.location} · ตารางการใช้งานประจำห้อง
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/rooms/${selectedRoom.id}/book`}
              className="button-primary text-xs shrink-0 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              จองห้องนี้
            </Link>
          </div>
        </div>
      )}

      {/* 3. Legend & Privacy Indicator Bar */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 px-1 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            อนุมัติแล้ว
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            รอตรวจสอบ
          </span>
          <span className="text-slate-400 font-medium">({filteredBookings.length} รายการในห้องนี้)</span>
        </div>
        {!isAdmin && (
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-slate-100/70 px-2.5 py-1 rounded-lg border border-slate-200/60">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>แสดงเฉพาะช่วงเวลาที่มีการจอง เพื่อรักษาความเป็นส่วนตัว</span>
          </div>
        )}
      </div>

      {/* 4. FullCalendar Dedicated View */}
      <div className="surface-panel rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs overflow-hidden">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "วันนี้",
            month: "เดือน",
            week: "สัปดาห์",
            day: "วัน",
          }}
          locale="th"
          timeZone="Asia/Bangkok"
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={false}
          nowIndicator={true}
          events={calendarEvents}
          eventClick={isAdmin ? handleEventClick : undefined}
          eventContent={(eventInfo) => (
            <div className="flex flex-col items-center justify-center text-center w-full h-full p-1.5 overflow-hidden select-none gap-0.5">
              {eventInfo.timeText ? (
                <span className="text-xs sm:text-[13px] font-semibold opacity-95 leading-tight tracking-wide">
                  {eventInfo.timeText}
                </span>
              ) : null}
              <span className="text-sm sm:text-base font-extrabold leading-tight tracking-wide drop-shadow-xs max-w-full truncate px-1">
                {eventInfo.event.title}
              </span>
            </div>
          )}
          height="auto"
          aspectRatio={1.6}
        />
      </div>

      {/* 5. Booking Detail Dialog (Administrators Only) */}
      {isAdmin && activeEvent && (
        <Dialog title="รายละเอียดการจองห้อง (มุมมองผู้ดูแลระบบ)" onClose={() => setActiveEvent(null)}>
          <div className="space-y-4 text-sm">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{activeEvent.topic}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>
                    {activeEvent.roomName} {activeEvent.roomLocation ? `(${activeEvent.roomLocation})` : ""}
                  </span>
                </div>
              </div>
              <StatusBadge status={activeEvent.status} />
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600 shrink-0" />
                <span>วันที่: {formatThaiDate(activeEvent.startTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>เวลา: {formatThaiTimeRange(activeEvent.startTime, activeEvent.endTime)}</span>
              </div>
              {activeEvent.attendeeCount ? (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>จำนวนผู้เข้าร่วม: {activeEvent.attendeeCount} คน</span>
                </div>
              ) : null}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
              <Link
                href="/admin/bookings"
                className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                onClick={() => setActiveEvent(null)}
              >
                จัดการคำขอจองในระบบ Admin ↗
              </Link>
              <button
                type="button"
                onClick={() => setActiveEvent(null)}
                className="button-secondary text-xs px-4 py-2"
              >
                ปิด
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
