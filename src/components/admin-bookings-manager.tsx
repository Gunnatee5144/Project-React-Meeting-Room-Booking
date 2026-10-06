"use client";

// Client Component: Admin Bookings Review Manager.
// Allows admin to inspect, approve, or reject pending booking requests with an optional/required admin note.
// Calls the reviewBooking Server Action which updates database status and sends email notifications.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Users,
  Search,
  AlertTriangle,
  User,
  Send,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/context/toast-context";
import { reviewBooking } from "@/actions/bookings";

export interface AdminBookingItem {
  id: string;
  roomId: string;
  roomName: string;
  roomLocation: string;
  userId: string;
  userName: string;
  userEmail: string;
  userDepartment?: string | null;
  topic: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  attendeeCount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  adminNote?: string | null;
  createdAt: string;
}

interface AdminBookingsManagerProps {
  initialBookings: AdminBookingItem[];
}

export function AdminBookingsManager({ initialBookings }: AdminBookingsManagerProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<AdminBookingItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Approve modal/confirmation
  const [approveTarget, setApproveTarget] = useState<AdminBookingItem | null>(null);
  const [approveNote, setApproveNote] = useState("อนุมัติคำขอจองตามระเบียบเรียบร้อย");

  const filtered = initialBookings.filter((b) => {
    if (activeTab !== "ALL" && b.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTopic = b.topic.toLowerCase().includes(q);
      const matchRoom = b.roomName.toLowerCase().includes(q);
      const matchUser = b.userName.toLowerCase().includes(q);
      if (!matchTopic && !matchRoom && !matchUser) return false;
    }
    return true;
  });

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

  const handleConfirmApprove = async () => {
    if (!approveTarget) return;
    setIsSubmitting(true);
    try {
      const res = await reviewBooking(approveTarget.id, {
        status: "APPROVED",
        adminNote: approveNote,
      });

      if (res.success) {
        toast.success("อนุมัติคำขอแล้ว", res.message);
        setApproveTarget(null);
        router.refresh();
      } else {
        toast.error("อนุมัติไม่สำเร็จ", res.message);
      }
    } catch {
      toast.error("ข้อผิดพลาด", "ไม่สามารถบันทึกผลได้ กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    setIsSubmitting(true);
    try {
      const res = await reviewBooking(rejectTarget.id, {
        status: "REJECTED",
        adminNote: rejectReason || "ขออภัย ไม่อนุมัติคำขอจองเนื่องจากเหตุผลความจำเป็นของอาคาร",
      });

      if (res.success) {
        toast.info("ปฏิเสธคำขอแล้ว", res.message);
        setRejectTarget(null);
        setRejectReason("");
        router.refresh();
      } else {
        toast.error("ดำเนินการไม่สำเร็จ", res.message);
      }
    } catch {
      toast.error("ข้อผิดพลาด", "ไม่สามารถบันทึกผลได้ กรุณาลองใหม่");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(["PENDING", "APPROVED", "REJECTED", "CANCELLED", "ALL"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab === "PENDING"
                ? "รอตรวจสอบ"
                : tab === "APPROVED"
                ? "อนุมัติแล้ว"
                : tab === "REJECTED"
                ? "ไม่อนุมัติ"
                : tab === "CANCELLED"
                ? "ยกเลิกแล้ว"
                : "ทั้งหมด"}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาตามหัวข้อ, ห้อง, หรือชื่อผู้จอง..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs"
          />
        </div>
      </div>

      {/* Bookings Table / Cards */}
      {filtered.length === 0 ? (
        <div className="surface-panel rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 text-sm">
          ไม่พบรายการคำขอจองตามเงื่อนไขที่เลือก
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

                {/* Review action buttons for PENDING requests */}
                {b.status === "PENDING" && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setApproveTarget(b)}
                      className="button-primary text-xs px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>อนุมัติ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectTarget(b)}
                      className="button-secondary text-xs px-3.5 py-1.5 text-rose-600 hover:bg-rose-50 border-rose-200 flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>ปฏิเสธ</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    ผู้จอง: <strong>{b.userName}</strong> ({b.userEmail})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    {formatDate(b.startTime)} | {formatTime(b.startTime)} – {formatTime(b.endTime)} น.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>ผู้เข้าร่วม: {b.attendeeCount} คน</span>
                </div>
              </div>

              {/* Note */}
              {b.adminNote && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="font-semibold">หมายเหตุ / เหตุผล:</span> {b.adminNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      {approveTarget && (
        <Dialog title="ยืนยันการอนุมัติคำขอจอง" onClose={() => setApproveTarget(null)}>
          <div className="space-y-4 text-sm">
            <p className="text-xs text-slate-600">
              คุณกำลังจะอนุมัติคำขอจองห้อง <strong>{approveTarget.roomName}</strong> สำหรับหัวข้อ &ldquo;
              <strong>{approveTarget.topic}</strong>&rdquo;
            </p>

            <div className="space-y-1">
              <label htmlFor="approve-note-field" className="text-xs font-semibold text-slate-700">
                หมายเหตุเพิ่มเติม (ส่งในอีเมลแจ้งผู้จอง):
              </label>
              <input
                id="approve-note-field"
                type="text"
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApproveTarget(null)}
                className="button-secondary text-xs px-4 py-2"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmApprove}
                className="button text-xs px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "กำลังบันทึก…" : "ยืนยันอนุมัติและส่งอีเมล"}</span>
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <Dialog title="ระบุเหตุผลที่ไม่อนุมัติคำขอ" onClose={() => setRejectTarget(null)}>
          <div className="space-y-4 text-sm">
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                การปฏิเสธคำขอจะส่งอีเมลแจ้งเหตุผลไปยังผู้จอง ({rejectTarget.userEmail}) ทันที
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="reject-reason-field" className="text-xs font-semibold text-slate-700">
                เหตุผลการปฏิเสธคำขอ:
              </label>
              <textarea
                id="reject-reason-field"
                rows={3}
                placeholder="เช่น ห้องปิดปรับปรุงระบบไฟฟ้าในวันดังกล่าว, จัดกิจกรรมของคณะ..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="button-secondary text-xs px-4 py-2"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmReject}
                className="button text-xs px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "กำลังบันทึก…" : "ยืนยันปฏิเสธและส่งอีเมล"}</span>
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
