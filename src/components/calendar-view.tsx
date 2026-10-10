"use client";

// Client Component: FullCalendar integration for individual room schedules.
// Features per-room tabs, selected room details banner with quick booking action,
// and click-to-view dialogs exclusively for administrators.
// Events are loaded from GET /api/bookings every time the visible date range or the selected
// room changes. That Route Handler verifies the session and masks other people's bookings
// ("จองแล้ว"), so this component only displays what the server already allowed.

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg, EventInput, EventSourceFuncArg } from "@fullcalendar/core";
import {
  CalendarDays,
  Clock,
  Users,
  Building2,
  Plus,
  Lock,
  Shield,
  Layers,
  User,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { toApiTimestamp, toBangkokWallClock } from "@/lib/calendar-time";
import type { BookingApiItem } from "@/lib/booking-visibility";

const emptySubscribe = () => () => {};

class CalendarLoadError extends Error {}

export interface CalendarRoomItem {
  id: string;
  name: string;
  location: string;
  capacity?: number;
  imageUrl?: string | null;
}

interface CalendarViewProps {
  rooms: CalendarRoomItem[];
}

export function CalendarView({ rooms }: CalendarViewProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Display only: GET /api/bookings decides on the server what this viewer may see.
  const isAdmin = useAuth()?.role === "ADMIN";

  // Default to the first room in the list
  const [selectedRoomId, setSelectedRoomId] = useState<string>(() => rooms[0]?.id || "");

  const [activeEvent, setActiveEvent] = useState<BookingApiItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || rooms[0] || null;
  }, [rooms, selectedRoomId]);
  const roomId = selectedRoom?.id;

  // FullCalendar calls this for every visible range; a new function identity (another room)
  // makes it fetch again. Responses are never cached, so the latest statuses are always shown.
  const loadEvents = useCallback(async (range: EventSourceFuncArg): Promise<EventInput[]> => {
    if (!roomId) return [];
    try {
      const query = new URLSearchParams({ start: toApiTimestamp(range.startStr), end: toApiTimestamp(range.endStr), roomId });
      const response = await fetch(`/api/bookings?${query}`, { cache: "no-store" });
      if (response.status === 401) throw new CalendarLoadError("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่เพื่อดูตารางห้อง");
      if (!response.ok) throw new CalendarLoadError("โหลดตารางการจองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      const data = (await response.json()) as { bookings: BookingApiItem[]; truncated: boolean };
      setVisibleCount(data.bookings.length);
      setLoadError(data.truncated ? "มีรายการจำนวนมาก แสดงได้เพียงบางส่วน กรุณาเลือกช่วงวันที่สั้นลง" : null);
      return data.bookings.map((booking) => ({
        id: booking.id,
        title: booking.title,
        start: toBangkokWallClock(booking.start),
        end: toBangkokWallClock(booking.end),
        backgroundColor: booking.status === "APPROVED" ? "#16a34a" : "#ca8a04",
        borderColor: booking.status === "APPROVED" ? "#15803d" : "#a16207",
        textColor: "#ffffff",
        extendedProps: booking,
      }));
    } catch (error) {
      setVisibleCount(0);
      setLoadError(error instanceof CalendarLoadError ? error.message : "โหลดตารางการจองไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อ");
      return [];
    }
  }, [roomId]);

  const handleEventClick = (info: EventClickArg) => {
    // Only administrators can open the detailed modal
    if (!isAdmin) return;
    const data = info.event.extendedProps as BookingApiItem;
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
                  มุมมองผู้ใช้ทั่วไป (ซ่อนหัวข้อของผู้อื่น)
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
          <span className="text-slate-400 font-medium">({visibleCount} รายการในช่วงที่แสดง)</span>
        </div>
        {!isAdmin && (
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 bg-slate-100/70 px-2.5 py-1 rounded-lg border border-slate-200/60">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>แสดงเฉพาะช่วงเวลาที่มีการจอง เพื่อรักษาความเป็นส่วนตัว</span>
          </div>
        )}
      </div>

      {loadError && <p className="notice error" role="alert">{loadError}</p>}

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
          now={() => toBangkokWallClock(new Date())}
          events={loadEvents}
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
                <h3 className="font-bold text-slate-900 text-base">{activeEvent.title}</h3>
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
                <span>วันที่: {formatThaiDate(activeEvent.start)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>เวลา: {formatThaiTimeRange(activeEvent.start, activeEvent.end)}</span>
              </div>
              {activeEvent.userName ? (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>ผู้จอง: {activeEvent.userName}{activeEvent.userEmail ? ` (${activeEvent.userEmail})` : ""}</span>
                </div>
              ) : null}
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
