"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Users,
  Search,
  Filter,
  AlertTriangle,
  FileText,
  User,
  SlidersHorizontal,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { useApp } from "@/context/app-context";
import { useToast } from "@/context/toast-context";
import { BookingItem } from "@/lib/mock-data";
import { StatusBadge, CodeBadge, EyebrowBadge } from "@/components/ui/badge";

export default function AdminBookingsPage() {
  const { bookings, reviewBooking, currentUser, switchRole } = useApp();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectModalBooking, setRejectModalBooking] =
    useState<BookingItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filteredBookings = bookings.filter((b) => {
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

  const handleApprove = (booking: BookingItem) => {
    reviewBooking(booking.id, "APPROVED", "อนุมัติคำขอจองตามระเบียบเรียบร้อย");
  };

  const handleConfirmReject = () => {
    if (!rejectModalBooking) return;
    reviewBooking(
      rejectModalBooking.id,
      "REJECTED",
      rejectReason ||
        "ขออภัย ไม่อนุมัติคำขอจองเนื่องจากเหตุผลความจำเป็นของอาคาร",
    );
    setRejectModalBooking(null);
    setRejectReason("");
  };

  return (
    <div className="workspace-page mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="page-heading flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <EyebrowBadge label="คำขอจอง" className="mb-2" />
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            จัดการคำขอจองห้องประชุม
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            ตรวจสอบรายละเอียด อนุมัติ หรือปฏิเสธคำขอจองห้องประชุม
            พร้อมระบุเหตุผลและบันทึก
          </p>
        </div>

        {/* Admin Navigation Shortcut */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/rooms"
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
          >
            จัดการห้อง
          </Link>
          <Link
            href="/admin/users"
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
          >
            จัดการผู้ใช้
          </Link>
          <Link
            href="/admin/reports"
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
          >
            รายงานสถิติ
          </Link>
        </div>
      </div>

      {/* Role Notice if not Admin */}
      {currentUser.role !== "ADMIN" && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>
              ขณะนี้คุณกำลังดูหน้านี้ในบทบาท{" "}
              <strong>ผู้ใช้ทั่วไป (User)</strong> คุณสามารถสลับเป็น Admin
              เพื่อทดลองอนุมัติคำขอได้ทันที
            </span>
          </div>
          <button
            onClick={() => switchRole("ADMIN")}
            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 whitespace-nowrap cursor-pointer shadow-xs"
          >
            สลับเป็น Admin ทันที
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 surface-panel rounded-2xl border border-slate-200 bg-white shadow-xs">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {[
            {
              key: "PENDING",
              label: `รอตรวจสอบ (${bookings.filter((b) => b.status === "PENDING").length})`,
            },
            {
              key: "APPROVED",
              label: `อนุมัติแล้ว (${bookings.filter((b) => b.status === "APPROVED").length})`,
            },
            {
              key: "REJECTED",
              label: `ปฏิเสธ (${bookings.filter((b) => b.status === "REJECTED").length})`,
            },
            { key: "ALL", label: `ทั้งหมด (${bookings.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.key
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาหัวข้อ, ผู้จอง, หรือห้อง..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>
      </div>

      {/* Table / Card List */}
      {filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-400 space-y-2">
          <Clock className="w-8 h-8 mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-800">
            ไม่พบคำขอจองในสถานะนี้
          </h3>
          <p className="text-xs text-slate-500">
            ลองปรับเปลี่ยนสถานะหรือคำค้นหาด้านบน
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="surface-panel rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <CodeBadge code={`#${b.id}`} />
                  <span className="text-xs text-slate-500">
                    ยื่นคำขอเมื่อ{" "}
                    {new Date(b.createdAt).toLocaleDateString("th-TH")}
                  </span>
                </div>

                <div>
                  <StatusBadge status={b.status} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {b.topic}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>
                      {b.roomName} ({b.roomLocation})
                    </span>
                  </div>
                  {b.description && (
                    <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      {b.description}
                    </p>
                  )}
                  {b.equipmentNeeded && b.equipmentNeeded.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1 text-[11px] text-slate-500">
                      <span>อุปกรณ์ที่ขอ:</span>
                      {b.equipmentNeeded.map((eq, i) => (
                        <span
                          key={i}
                          className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]"
                        >
                          {eq}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ผู้ขอจอง:</span>
                    <span className="font-semibold text-slate-900">
                      {b.userName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">หน่วยงาน:</span>
                    <span className="text-slate-700">{b.userDepartment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">วันที่:</span>
                    <span className="font-medium">
                      {new Date(b.startTime).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">เวลา:</span>
                    <span className="font-mono font-bold text-blue-800">
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
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">จำนวน:</span>
                    <span>{b.attendeeCount} คน</span>
                  </div>
                </div>
              </div>

              {b.adminNote && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold">บันทึกของ Admin:</span>{" "}
                  {b.adminNote}
                  {b.reviewedByName && (
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      ผู้ตรวจสอบ: {b.reviewedByName}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons for Review */}
              {b.status === "PENDING" && (
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    onClick={() => setRejectModalBooking(b)}
                    className="px-3.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>ปฏิเสธคำขอ</span>
                  </button>

                  <button
                    onClick={() => handleApprove(b)}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>อนุมัติคำขอ</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalBooking && (
        <Dialog
          title={"ปฏิเสธคำขอจอง"}
          onClose={() => setRejectModalBooking(null)}
        >
          <div className="space-y-5">
            <p className="text-xs text-slate-600 leading-relaxed">
              ระบุเหตุผลในการไม่อนุมัติคำขอจอง{" "}
              <strong>&quot;{rejectModalBooking.topic}&quot;</strong> ของคุณ{" "}
              {rejectModalBooking.userName} ผู้จองจะเห็นเหตุผลนี้ในรายการจอง
            </p>

            <div className="space-y-1.5">
              <label
                htmlFor="bookings-field-1"
                className="text-xs font-semibold text-slate-700"
              >
                เหตุผลในการปฏิเสธ <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="bookings-field-1"
                rows={3}
                required
                placeholder="เช่น ห้องปิดปรับปรุงระบบไฟฟ้าเร่งด่วน, ตารางซ้อนทับกับกิจกรรมระดับสถาบัน..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalBooking(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
              >
                ยืนยันปฏิเสธคำขอ
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
