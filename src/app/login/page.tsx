"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  Shield,
  Sparkles,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "@/context/app-context";
import { useToast } from "@/context/toast-context";
import { DEMO_USERS } from "@/lib/mock-data";
import { BrandMark } from "@/components/ui/brand";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useApp();
  const { toast } = useToast();

  const [email, setEmail] = useState("guntee_w@cmu.ac.th");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // Check if admin
      if (email.toLowerCase().includes("admin")) {
        setCurrentUser(DEMO_USERS.admin);
        toast.success(
          "เข้าสู่ระบบสำเร็จ (Admin)",
          `ยินดีต้อนรับ ${DEMO_USERS.admin.name}`,
        );
        router.push("/admin/bookings");
      } else {
        setCurrentUser(DEMO_USERS.user);
        toast.success(
          "เข้าสู่ระบบสำเร็จ (User)",
          `ยินดีต้อนรับ ${DEMO_USERS.user.name}`,
        );
        router.push("/rooms");
      }
      setIsLoading(false);
    }, 450);
  };

  const handleDemoFill = (role: "USER" | "ADMIN") => {
    if (role === "ADMIN") {
      setEmail("admin.meeting@cmu.ac.th");
      setPassword("adminpass123");
      toast.info("เลือกบัญชี Admin", "กรอกข้อมูลบัญชีผู้ดูแลระบบตัวอย่างแล้ว");
    } else {
      setEmail("guntee_w@cmu.ac.th");
      setPassword("password123");
      toast.info(
        "เลือกบัญชี User",
        "กรอกข้อมูลบัญชีผู้ใช้งานทั่วไปตัวอย่างแล้ว",
      );
    }
  };

  return (
    <div className="auth-page min-h-[calc(100vh-14rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="auth-card w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-none">
        {/* Left Editorial Visual Section */}
        <div className="auth-visual relative hidden md:flex flex-col justify-between p-10 bg-slate-900 text-white overflow-hidden">
          {/* Subtle background image */}
          <img
            src="https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1000&q=80"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/30 to-blue-700/20" />

          {/* Top Brand */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center">
              <BrandMark className="h-6 w-6" />
            </div>
            <span className="font-bold tracking-tight text-white">
              meetsync. <span className="font-light text-white/60">· DII</span>
            </span>
          </div>

          {/* Quote & Value Proposition */}
          <div className="relative z-10 space-y-3">
            <h3 className="text-xl font-bold leading-snug">
              พื้นที่พร้อม
              <br />
              สำหรับไอเดียใหม่
            </h3>
            <p className="text-xs text-white/70 leading-relaxed">
              วิทยาลัยนวัตกรรมดิจิทัล มหาวิทยาลัยเชียงใหม่
            </p>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="p-8 sm:p-10 space-y-6 flex flex-col justify-center">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
              เข้าสู่ระบบ
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              เข้าสู่ระบบด้วยอีเมลมหาวิทยาลัย (@cmu.ac.th) เพื่อดำเนินการจองห้อง
            </p>
          </div>

          {/* Demo Quick-fill Buttons for Grading / Testing */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              ทดลองใช้งานด้วยบัญชีตัวอย่าง
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill("USER")}
                className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-blue-500 text-[11px] font-medium text-slate-700 hover:text-blue-700 transition-colors text-center cursor-pointer shadow-2xs"
              >
                ผู้ใช้ทั่วไป (User)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("ADMIN")}
                className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-blue-500 text-[11px] font-medium text-slate-700 hover:text-blue-700 transition-colors text-center cursor-pointer shadow-2xs"
              >
                ผู้ดูแลระบบ (Admin)
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="login-field-1"
                className="text-xs font-semibold text-slate-700"
              >
                อีเมล (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-4 text-slate-400" />
                <input
                  id="login-field-1"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@cmu.ac.th"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="login-field-2"
                  className="text-xs font-semibold text-slate-700"
                >
                  รหัสผ่าน (Password)
                </label>
                <a
                  href="mailto:meetsync.support@cmu.ac.th"
                  className="text-[11px] text-blue-700 hover:underline"
                >
                  ติดต่อผู้ดูแล
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-4 text-slate-400" />
                <input
                  id="login-field-2"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.99] cursor-pointer"
            >
              <span>{isLoading ? "กำลังตรวจสอบข้อมูล..." : "เข้าสู่ระบบ"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Link to Register */}
          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            ยังไม่มีบัญชีผู้ใช้งาน?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-700 hover:underline"
            >
              สมัครสมาชิกที่นี่
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
