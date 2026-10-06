"use client";

// Client Component: FullCalendar integration for meeting room bookings.
// Interactive calendar allowing users to switch views (Month, Week, Day),
// filter events by room, and inspect booking details via an accessible Dialog.

import { useState, useMemo, useSyncExternalStore } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import { CalendarDays, Clock, Users, Building2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/badge";

const emptySubscribe = () => () => {};

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
  rooms: { id: string; name: string; location: string }[];
  bookings: CalendarEventItem[];
}

export function CalendarView({ rooms, bookings }: CalendarViewProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("all");
  const [activeEvent, setActiveEvent] = useState<CalendarEventItem | null>(null);

  const filteredBookings = useMemo(() => {
    if (selectedRoomId === "all") return bookings;
    return bookings.filter((b) => b.roomId === selectedRoomId);
  }, [bookings, selectedRoomId]);

  const calendarEvents = useMemo(() => {
    return filteredBookings.map((b) => ({
      id: b.id,
      title: `${b.roomName}: ${b.topic}`,
      start: b.startTime,
      end: b.endTime,
      backgroundColor: b.status === "APPROVED" ? "#16a34a" : "#ca8a04",
      borderColor: b.status === "APPROVED" ? "#15803d" : "#a16207",
      textColor: "#ffffff",
      extendedProps: b,
    }));
  }, [filteredBookings]);

  const handleEventClick = (info: EventClickArg) => {
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
      {/* Top Filter Bar */}
      <div className="surface-panel rounded-2xl border border-slate-200 bg-white p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <label htmlFor="calendar-room-filter" className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            เลือกห้องประชุม:
          </label>
          <select
            id="calendar-room-filter"
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium cursor-pointer max-w-xs"
          >
            <option value="all">ทุกห้องประชุม ({rooms.length} ห้อง)</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
            อนุมัติแล้ว
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            รอตรวจสอบ
          </span>
          <span className="text-slate-400">({filteredBookings.length} รายการ)</span>
        </div>
      </div>

      {/* FullCalendar Wrapper */}
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
          eventClick={handleEventClick}
          height="auto"
          aspectRatio={1.6}
        />
      </div>

      {/* Booking Detail Dialog */}
      {activeEvent && (
        <Dialog title="รายละเอียดการจองห้อง" onClose={() => setActiveEvent(null)}>
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
              {activeEvent.attendeeCount && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>จำนวนผู้เข้าร่วม: {activeEvent.attendeeCount} คน</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
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
