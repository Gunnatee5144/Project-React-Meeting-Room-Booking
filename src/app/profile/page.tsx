"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Building2,
  Phone,
  Shield,
  Calendar,
  CheckCircle2,
  Clock,
  Save,
  LogOut,
  SlidersHorizontal,
  Sparkles,
  Camera,
} from "lucide-react";
import { useApp } from "@/context/app-context";
import { useToast } from "@/context/toast-context";
import { RoleBadge, EyebrowBadge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { currentUser, setCurrentUser, switchRole, getUserBookings } = useApp();
  const { toast } = useToast();

  const [name, setName] = useState(currentUser.name);
  const [department, setDepartment] = useState(currentUser.department);
  const [phone, setPhone] = useState(currentUser.phone);
  const [email, setEmail] = useState(currentUser.email);
  const [isSaving, setIsSaving] = useState(false);

  const bookings = getUserBookings();
  const approvedBookings = bookings.filter((b) => b.status === "APPROVED");
  const pendingBookings = bookings.filter((b) => b.status === "PENDING");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setCurrentUser({
        ...currentUser,
        name,
        department,
        phone,
        email,
      });
      setIsSaving(false);
      toast.success(
        "บันทึกข้อมูลโปรไฟล์สำเร็จ",
        "การปรับปรุงข้อมูลส่วนตัวได้รับการบันทึกเรียบร้อย",
      );
    }, 400);
  };

  const handleLogout = () => {
    toast.info("ออกจากระบบ", "คุณได้ออกจากระบบเรียบร้อย (Demo mode)");
  };

  return (
    <div className="workspace-page mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="page-heading pb-6 border-b border-slate-200">
        <EyebrowBadge label="บัญชีของคุณ" className="mb-2" />
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          ข้อมูลโปรไฟล์และบัญชีผู้ใช้
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          จัดการข้อมูลส่วนตัว หน่วยงานสังกัด และสถิติการใช้งานห้องประชุม
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (1 col): User Overview Card */}
        <div className="space-y-6">
          <div className="surface-panel rounded-2xl border border-slate-200 bg-white p-6 text-center space-y-4 shadow-xs">
            <div className="relative w-24 h-24 mx-auto">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-full h-full rounded-full object-cover border-4 border-slate-100 shadow-sm"
              />
              <button
                type="button"
                onClick={() =>
                  toast.info(
                    "อัปโหลดรูปภาพ",
                    "ฟังก์ชันอัปโหลดรูปโปรไฟล์ (Demo)",
                  )
                }
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-900 text-white hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
                title="Change Avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {currentUser.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentUser.department}
              </p>
            </div>

            <div>
              <RoleBadge role={currentUser.role} />
            </div>

            {currentUser.studentId && (
              <div className="text-xs text-slate-500 font-mono">
                รหัสนักศึกษา: {currentUser.studentId}
              </div>
            )}

            {/* Quick Demo Role Switcher */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                สลับบทบาททดสอบ (Demo)
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => switchRole("USER")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    currentUser.role === "USER"
                      ? "bg-blue-50 text-blue-800 border-blue-300 font-bold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  User
                </button>
                <button
                  type="button"
                  onClick={() => switchRole("ADMIN")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    currentUser.role === "ADMIN"
                      ? "bg-blue-50 text-blue-800 border-blue-300 font-bold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>

          {/* Usage Statistics Card */}
          <div className="surface-panel rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              สถิติการใช้งานของคุณ
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-2xl font-extrabold text-slate-900">
                  {bookings.length}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  การจองทั้งหมด
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="text-2xl font-extrabold text-blue-700">
                  {approvedBookings.length}
                </div>
                <div className="text-[11px] text-blue-800 mt-0.5">
                  อนุมัติแล้ว
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                <div className="text-2xl font-extrabold text-amber-700">
                  {pendingBookings.length}
                </div>
                <div className="text-[11px] text-amber-800 mt-0.5">
                  รอตรวจสอบ
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-2xl font-extrabold text-slate-900">
                  {approvedBookings
                    .reduce(
                      (sum, booking) =>
                        sum +
                        (new Date(booking.endTime).getTime() -
                          new Date(booking.startTime).getTime()) /
                          3600000,
                      0,
                    )
                    .toFixed(1)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  ชั่วโมงใช้งานรวม
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (2 cols): Profile Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSave}
            className="surface-panel rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs"
          >
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>แก้ไขข้อมูลส่วนตัว</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="profile-field-1"
                  className="text-xs font-semibold text-slate-700"
                >
                  ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    id="profile-field-1"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="profile-field-2"
                  className="text-xs font-semibold text-slate-700"
                >
                  อีเมลประจำตัว <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    id="profile-field-2"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="profile-field-3"
                  className="text-xs font-semibold text-slate-700"
                >
                  หน่วยงาน / คณะ / วิทยาลัย{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    id="profile-field-3"
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="profile-field-4"
                  className="text-xs font-semibold text-slate-700"
                >
                  เบอร์โทรศัพท์ติดต่อ
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    id="profile-field-4"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                การแจ้งเตือน
              </h3>
              <div className="space-y-2">
                <label
                  htmlFor="profile-field-5"
                  className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>
                    ส่งการแจ้งเตือนทางอีเมลเมื่อสถานะการจองได้รับการอนุมัติหรือปฏิเสธ
                  </span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    id="profile-field-5"
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>
                    ส่งการแจ้งเตือนเตือนความจำล่วงหน้า 1
                    ชั่วโมงก่อนถึงเวลาเริ่มประชุม
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>
                  {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
