"use client";

// Client Component: Manages user bookings list, filtering, cancellation dialog (with >= 1 hr validation),
// booking edit modal (Server Action updateBooking), and downloadable confirmation slip.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Users,
  Download,
  Building2,
  X,
  Edit3,
  AlertTriangle,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/context/toast-context";
import { cancelBooking, updateBooking } from "@/actions/bookings";

export interface UserBookingRecord {
  id: string;
  roomId: string;
  roomName: string;
  roomLocation: string;
  topic: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  attendeeCount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  adminNote?: string | null;
  createdAt: string;
  userName?: string;
  userDepartment?: string | null;
  canCancel: boolean;
  canEdit: boolean;
}

interface MyBookingsManagerProps {
  initialBookings: UserBookingRecord[];
  allRooms?: { id: string; name: string; capacity: number }[];
}

type BookingFilter = "ALL" | UserBookingRecord["status"];
const filters: { key: BookingFilter; label: string }[] = [
  { key: "ALL", label: "ทั้งหมด" },
  { key: "PENDING", label: "รอตรวจสอบ" },
  { key: "APPROVED", label: "อนุมัติแล้ว" },
  { key: "REJECTED", label: "ไม่อนุมัติ" },
  { key: "CANCELLED", label: "ยกเลิกแล้ว" },
];

const timeOptions = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

export function MyBookingsManager({ initialBookings }: MyBookingsManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<BookingFilter>("ALL");

  // Cancellation state
  const [cancelTarget, setCancelTarget] = useState<UserBookingRecord | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [isCanceling, setIsCanceling] = useState(false);

  // Edit state
  const [editTarget, setEditTarget] = useState<UserBookingRecord | null>(null);
  const [editTopic, setEditTopic] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editAttendees, setEditAttendees] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);

  const filtered = initialBookings.filter(
    (b) => activeTab === "ALL" || b.status === activeTab
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("th-TH", {
      timeZone: "Asia/Bangkok",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("th-TH", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleOpenEdit = (b: UserBookingRecord) => {
    setEditTarget(b);
    setEditTopic(b.topic);
    const d = new Date(b.startTime);
    const dateStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
    setEditDate(dateStr);

    const sTime = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(b.startTime));
    const eTime = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Bangkok",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(b.endTime));

    setEditStart(sTime);
    setEditEnd(eTime);
    setEditAttendees(b.attendeeCount);
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCanceling(true);
    try {
      const res = await cancelBooking(cancelTarget.id, cancelReason);
      if (res.success) {
        toast.success("ยกเลิกการจองสำเร็จ", res.message);
        setCancelTarget(null);
        setCancelReason("");
        router.refresh();
      } else {
        toast.error("ยกเลิกการจองไม่สำเร็จ", res.message);
      }
    } catch {
      toast.error("ข้อผิดพลาด", "ไม่สามารถยกเลิกการจองได้ กรุณาลองใหม่");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleConfirmUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    setIsUpdating(true);
    try {
      const res = await updateBooking(editTarget.id, {
        roomId: editTarget.roomId,
        topic: editTopic,
        date: editDate,
        startTime: editStart,
        endTime: editEnd,
        attendeeCount: Number(editAttendees),
      });

      if (res.success) {
        toast.success("บันทึกการแก้ไขสำเร็จ", res.message);
        setEditTarget(null);
        router.refresh();
      } else {
        toast.error("แก้ไขไม่สำเร็จ", res.message);
      }
    } catch {
      toast.error("ข้อผิดพลาด", "ไม่สามารถแก้ไขการจองได้ กรุณาลองใหม่");
    } finally {
      setIsUpdating(false);
    }
  };

  const downloadConfirmation = (b: UserBookingRecord) => {
    const lines = [
      "MEETSYNC · เอกสารยืนยันคำขอจองห้องประชุม",
      "รหัสการจอง: " + b.id,
      "สถานะ: " + (b.status === "APPROVED" ? "อนุมัติแล้ว" : b.status === "PENDING" ? "รอตรวจสอบ" : b.status),
      "",
      "หัวข้อการประชุม: " + b.topic,
      "ห้องประชุม: " + b.roomName,
      "สถานที่: " + b.roomLocation,
      "วันที่: " + formatDate(b.startTime),
      "เวลา: " + formatTime(b.startTime) + " – " + formatTime(b.endTime) + " น.",
      "จำนวนผู้เข้าร่วม: " + b.attendeeCount + " คน",
      b.adminNote ? "หมายเหตุผู้ดูแล: " + b.adminNote : "",
    ];
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + lines.join("\r\n")], {
        type: "text/plain;charset=utf-8",
      })
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `meetsync-booking-${b.id}.txt`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("ดาวน์โหลดใบยืนยันแล้ว", `รหัสการจอง ${b.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {filters.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="surface-panel rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-4">
          <p className="text-slate-500 text-sm">ไม่พบรายการจองห้องประชุมในหมวดนี้</p>
          <Link href="/rooms" className="button-primary inline-flex text-xs">
            ค้นหาห้องและจองใหม่
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="surface-panel rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono text-slate-400">
                      ID: {b.id}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{b.topic}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>
                      {b.roomName} ({b.roomLocation})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {b.status === "APPROVED" && (
                    <button
                      type="button"
                      onClick={() => downloadConfirmation(b)}
                      className="button-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                      title="ดาวน์โหลดใบยืนยัน"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>พิมพ์ใบยืนยัน</span>
                    </button>
                  )}

                  {b.canEdit && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(b)}
                      className="button-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                      <span>แก้ไข</span>
                    </button>
                  )}

                  {b.canCancel && (
                    <button
                      type="button"
                      onClick={() => setCancelTarget(b)}
                      className="button-secondary text-xs px-3 py-1.5 text-rose-600 hover:border-rose-300 hover:bg-rose-50 flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>ยกเลิก</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>วันที่: {formatDate(b.startTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    เวลา: {formatTime(b.startTime)} – {formatTime(b.endTime)} น.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>จำนวนผู้เข้าร่วม: {b.attendeeCount} คน</span>
                </div>
              </div>

              {/* Admin Note if Rejected or Approved with note */}
              {b.adminNote && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="font-semibold">หมายเหตุผู้ดูแล:</span> {b.adminNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Dialog */}
      {cancelTarget && (
        <Dialog title="ยืนยันการยกเลิกคำขอจอง" onClose={() => setCancelTarget(null)}>
          <div className="space-y-4 text-sm">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                การยกเลิกสามารถทำได้ก่อนถึงเวลาเริ่มใช้งานอย่างน้อย 1 ชั่วโมง
                หลังจากยกเลิกแล้ว ห้องประชุมจะถูกปล่อยให้ผู้ใช้อื่นจองได้ทันที
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">
                การจอง: {cancelTarget.topic} ({cancelTarget.roomName})
              </p>
              <label htmlFor="cancel-reason" className="text-xs text-slate-600 block mb-1">
                ระบุเหตุผลในการยกเลิก (ไม่บังคับ):
              </label>
              <textarea
                id="cancel-reason"
                rows={3}
                placeholder="เช่น ติดภารกิจด่วน, เลื่อนการประชุม..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancelTarget(null)}
                className="button-secondary text-xs px-4 py-2"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                disabled={isCanceling}
                onClick={handleConfirmCancel}
                className="button text-xs px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isCanceling ? "กำลังยกเลิก…" : "ยืนยันยกเลิกการจอง"}
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Edit Booking Dialog */}
      {editTarget && (
        <Dialog title="แก้ไขคำขอจองห้องประชุม" onClose={() => setEditTarget(null)}>
          <form onSubmit={handleConfirmUpdate} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
              เมื่อแก้ไขข้อมูลแล้ว สถานะจะกลับไปเป็น <strong>รอตรวจสอบ (PENDING)</strong> เพื่อให้ผู้ดูแลอนุมัติใหม่
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">หัวข้อการประชุม</label>
              <input
                type="text"
                required
                value={editTopic}
                onChange={(e) => setEditTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">วันที่</label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">เวลาเริ่ม</label>
                <select
                  value={editStart}
                  onChange={(e) => setEditStart(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                >
                  {timeOptions.slice(0, -1).map((t) => (
                    <option key={t} value={t}>{t} น.</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">เวลาสิ้นสุด</label>
                <select
                  value={editEnd}
                  onChange={(e) => setEditEnd(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs"
                >
                  {timeOptions.slice(1).map((t) => (
                    <option key={t} value={t}>{t} น.</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">จำนวนผู้เข้าร่วม (คน)</label>
              <input
                type="number"
                min={1}
                required
                value={editAttendees}
                onChange={(e) => setEditAttendees(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="button-secondary text-xs px-4 py-2"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isUpdating || editStart >= editEnd}
                className="button-primary text-xs px-4 py-2"
              >
                {isUpdating ? "กำลังบันทึก…" : "บันทึกการแก้ไข"}
              </button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
