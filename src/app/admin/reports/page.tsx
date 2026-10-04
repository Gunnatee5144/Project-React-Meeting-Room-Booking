"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Building2,
  Clock,
  Download,
  CheckCircle2,
  CalendarDays,
  PieChart,
} from "lucide-react";
import { useToast } from "@/context/toast-context";
import { useApp } from "@/context/app-context";
import { EyebrowBadge } from "@/components/ui/badge";

function minutes(value: string) {
  const parts = new Date(value)
    .toLocaleTimeString("en-GB", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .split(":")
    .map(Number);
  return parts[0] * 60 + parts[1];
}
export default function AdminReportsPage() {
  const { toast } = useToast();
  const { rooms, bookings } = useApp();
  const [dateRange, setDateRange] = useState("month");
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  if (dateRange === "week") {
    start.setDate(today.getDate() - (today.getDay() || 7) + 1);
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 7);
  }
  if (dateRange === "quarter") {
    start.setMonth(Math.floor(today.getMonth() / 3) * 3, 1);
    end.setTime(start.getTime());
    end.setMonth(start.getMonth() + 3);
  }
  if (dateRange === "year") {
    start.setMonth(0, 1);
    end.setFullYear(start.getFullYear() + 1, 0, 1);
  }
  const period = bookings.filter((booking) => {
    const date = new Date(booking.startTime);
    return date >= start && date < end;
  });
  const approved = period.filter((booking) => booking.status === "APPROVED");
  const reviewed = period.filter(
    (booking) => booking.status === "APPROVED" || booking.status === "REJECTED",
  );
  const hours = approved.reduce(
    (sum, booking) =>
      sum +
      (new Date(booking.endTime).getTime() -
        new Date(booking.startTime).getTime()) /
        3600000,
    0,
  );
  const topRooms = rooms
    .map((room) => ({
      ...room,
      count: approved.filter((booking) => booking.roomId === room.id).length,
    }))
    .sort((a, b) => b.count - a.count);
  const maxRoom = Math.max(1, ...topRooms.map((room) => room.count));
  const slots = [
    { label: "08:00 – 10:00", start: 480, end: 600 },
    { label: "10:00 – 12:00", start: 600, end: 720 },
    { label: "12:00 – 14:00", start: 720, end: 840 },
    { label: "14:00 – 16:00", start: 840, end: 960 },
    { label: "16:00 – 18:00", start: 960, end: 1080 },
  ];
  const peakHours = slots.map((slot) => ({
    ...slot,
    count: approved.filter(
      (booking) =>
        minutes(booking.startTime) < slot.end &&
        minutes(booking.endTime) > slot.start,
    ).length,
  }));
  const maxHour = Math.max(1, ...peakHours.map((slot) => slot.count));
  const departments = Array.from(
    new Set(approved.map((booking) => booking.userDepartment)),
  )
    .map((name) => ({
      name,
      count: approved.filter((booking) => booking.userDepartment === name)
        .length,
    }))
    .sort((a, b) => b.count - a.count);
  const exportReport = () => {
    const cell = (value: string | number) => {
      const raw = String(value);
      const safe = /^[=+\-@\t\r]/.test(raw) ? "'" + raw : raw;
      return '"' + safe.replaceAll('"', '""') + '"';
    };
    const rows = [
      [
        "รหัสการจอง",
        "ห้องประชุม",
        "หัวข้อ",
        "หน่วยงาน",
        "เวลาเริ่ม",
        "เวลาสิ้นสุด",
        "ผู้เข้าร่วม",
        "สถานะ",
      ],
      ...period.map((booking) => [
        booking.id,
        booking.roomName,
        booking.topic,
        booking.userDepartment,
        booking.startTime,
        booking.endTime,
        booking.attendeeCount,
        booking.status,
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(
        ["\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n")],
        { type: "text/csv;charset=utf-8;" },
      ),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "meetsync-report-" + dateRange + ".csv";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("ดาวน์โหลดรายงานแล้ว", period.length + " รายการในไฟล์ CSV");
  };
  const metrics = [
    {
      label: "คำขอจองทั้งหมด",
      value: period.length,
      unit: "คำขอ",
      note: "รวมทุกสถานะในช่วงที่เลือก",
      Icon: CalendarDays,
    },
    {
      label: "การจองที่อนุมัติ",
      value: approved.length,
      unit: "ครั้ง",
      note: "พร้อมใช้งานตามกำหนด",
      Icon: CheckCircle2,
    },
    {
      label: "ชั่วโมงการประชุม",
      value: hours.toFixed(1),
      unit: "ชั่วโมง",
      note: "รวมเวลาของการจองที่อนุมัติ",
      Icon: Clock,
    },
    {
      label: "อัตราการอนุมัติ",
      value: reviewed.length
        ? Math.round((approved.length / reviewed.length) * 100) + "%"
        : "—",
      unit: "",
      note: "จากคำขอที่ตรวจสอบแล้ว",
      Icon: ArrowUpRight,
    },
  ];
  return (
    <div className="workspace-page mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="page-heading flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200">
        <div>
          <EyebrowBadge label="ภาพรวมการใช้งาน" className="mb-3" />
          <h1>ทุกการประชุม ในภาพเดียว</h1>
          <p>ดูการใช้พื้นที่และช่วงเวลาจากข้อมูลการจองในระบบ</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="ช่วงเวลารายงาน"
            value={dateRange}
            onChange={(event) => setDateRange(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="week">สัปดาห์นี้</option>
            <option value="month">เดือนนี้</option>
            <option value="quarter">ไตรมาสนี้</option>
            <option value="year">ปีนี้</option>
          </select>
          <button onClick={exportReport} className="button-primary">
            <Download className="h-4 w-4" />
            ดาวน์โหลด CSV
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-500">
        {start.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}{" "}
        –{" "}
        {new Date(end.getTime() - 1).toLocaleDateString("th-TH", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>
      <div className="report-metrics">
        {metrics.map(({ label, value, unit, note, Icon }) => (
          <div key={label} className="report-metric">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{label}</span>
              <Icon className="h-5 w-5 text-blue-500" />
            </div>
            <p className="mt-6 flex items-baseline gap-2">
              <strong className="text-4xl font-semibold tracking-tight text-slate-900">
                {value}
              </strong>
              <span className="text-xs text-slate-400">{unit}</span>
            </p>
            <p className="mt-2 text-[11px] text-slate-400">{note}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        <section className="surface-panel rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-7">
            <Building2 className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">พื้นที่ที่ทีมเลือกใช้</h2>
          </div>
          <div className="space-y-6">
            {topRooms.map((room) => (
              <div key={room.id} className="flex gap-4 items-center">
                <img
                  src={room.imageUrl}
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex gap-3 justify-between text-xs mb-2">
                    <span className="font-medium truncate">{room.name}</span>
                    <span className="shrink-0 text-slate-500">
                      {room.count} ครั้ง
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-700"
                      style={{ width: (room.count / maxRoom) * 100 + "%" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="surface-panel rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-7">
            <Clock className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">ช่วงเวลาที่มีการประชุม</h2>
          </div>
          <div className="space-y-6">
            {peakHours.map((slot) => (
              <div key={slot.label}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-medium">{slot.label} น.</span>
                  <span className="text-slate-500">{slot.count} การประชุม</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-400 transition-all duration-700"
                    style={{ width: (slot.count / maxHour) * 100 + "%" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[11px] text-slate-400">
            การประชุมที่คร่อมหลายช่วงเวลานับในแต่ละช่วง
          </p>
        </section>
        <section className="surface-panel lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-7">
            <PieChart className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">การใช้งานตามหน่วยงาน</h2>
          </div>
          {departments.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">
              ยังไม่มีการจองที่อนุมัติในช่วงนี้
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {departments.map((department) => (
                <div
                  key={department.name}
                  className="flex flex-wrap justify-between gap-4 py-4 text-sm"
                >
                  <span>{department.name}</span>
                  <span className="text-slate-500">
                    {department.count} ครั้ง{" "}
                    <span className="text-blue-600 ml-4">
                      {Math.round((department.count / approved.length) * 100)}%
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
