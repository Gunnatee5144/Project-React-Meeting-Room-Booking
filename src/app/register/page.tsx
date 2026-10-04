"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/context/toast-context";
import { EyebrowBadge } from "@/components/ui/badge";
import { BrandMark } from "@/components/ui/brand";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("วิทยาลัยนวัตกรรมดิจิทัล (DII)");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error(
        "รหัสผ่านไม่ตรงกัน",
        "กรุณาตรวจสอบการกรอกรหัสผ่านทั้งสองช่องให้ตรงกัน",
      );
      return;
    }

    if (password.length < 6) {
      toast.warning(
        "รหัสผ่านสั้นเกินไป",
        "กรุณาตั้งรหัสผ่านความยาวอย่างน้อย 6 ตัวอักษร",
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      toast.success(
        "สมัครสมาชิกสำเร็จ!",
        `ยินดีต้อนรับ ${name} เข้าสู่ระบบจองห้องประชุม MEETSYNC`,
      );
      router.push("/login");
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="auth-page min-h-[calc(100vh-14rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="auth-register-layout">
        <div className="auth-register-visual">
          <div className="flex items-center gap-3 text-blue-700">
            <BrandMark className="h-7 w-7" />
            <span className="text-xl font-bold tracking-tight">meetsync.</span>
          </div>
          <h2 className="mt-10 text-4xl font-medium leading-snug">
            เริ่มต้นไอเดียดี ๆ<br />
            ด้วยพื้นที่ที่ใช่
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-slate-500 max-w-sm">
            ค้นหาห้อง ส่งคำขอ และติดตามการจอง
            <br />
            พื้นที่สำหรับทุกทีมใน DII CMU
          </p>
          <div className="mt-10 aspect-[4/3] overflow-hidden rounded-[70px_20px_20px_20px]">
            <img
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80"
              alt="พื้นที่ทำงานที่เปิดรับไอเดียใหม่"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="auth-card w-full rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 space-y-6">
          <div>
            <EyebrowBadge label="เริ่มต้นใช้งาน" className="mb-2" />
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              สมัครสมาชิก
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              ลงทะเบียนด้วยข้อมูลบุคลากรหรือนักศึกษาเพื่อเริ่มต้นใช้งานระบบจองห้องประชุม
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="register-field-1"
                className="text-xs font-semibold text-slate-700"
              >
                ชื่อ - นามสกุล <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-4 text-slate-400" />
                <input
                  id="register-field-1"
                  type="text"
                  required
                  placeholder="เช่น นายศรัณย์ กระจ่างแก้ว"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-field-2"
                className="text-xs font-semibold text-slate-700"
              >
                อีเมลมหาวิทยาลัย (@cmu.ac.th){" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-4 text-slate-400" />
                <input
                  id="register-field-2"
                  type="email"
                  required
                  placeholder="firstname_l@cmu.ac.th"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="register-field-3"
                className="text-xs font-semibold text-slate-700"
              >
                หน่วยงาน / คณะ / สาขาวิชา{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-4 text-slate-400" />
                <input
                  id="register-field-3"
                  type="text"
                  required
                  placeholder="เช่น วิทยาลัยนวัตกรรมดิจิทัล (DII)"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="register-field-4"
                  className="text-xs font-semibold text-slate-700"
                >
                  รหัสผ่าน <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-4 text-slate-400" />
                  <input
                    id="register-field-4"
                    type="password"
                    required
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="register-field-5"
                  className="text-xs font-semibold text-slate-700"
                >
                  ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-4 text-slate-400" />
                  <input
                    id="register-field-5"
                    type="password"
                    required
                    placeholder="พิมพ์ซ้ำอีกครั้ง"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.99] cursor-pointer"
              >
                <span>
                  {isLoading ? "กำลังสร้างบัญชี..." : "ลงทะเบียนเข้าใช้งาน"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            มีบัญชีผู้ใช้งานอยู่แล้ว?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-700 hover:underline"
            >
              เข้าสู่ระบบที่นี่
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
