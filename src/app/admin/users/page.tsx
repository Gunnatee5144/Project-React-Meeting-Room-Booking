"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Shield,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  Mail,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { useToast } from "@/context/toast-context";
import { UserProfile } from "@/lib/mock-data";
import { RoleBadge, EyebrowBadge } from "@/components/ui/badge";

export default function AdminUsersPage() {
  const { toast } = useToast();

  const [usersList, setUsersList] = useState<UserProfile[]>([
    {
      id: "usr-1",
      name: "กันต์ธีร์ วารีสอาด",
      email: "guntee_w@cmu.ac.th",
      role: "USER",
      department: "วิทยาลัยนวัตกรรมดิจิทัล (DII)",
      phone: "089-123-4567",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      studentId: "682110161",
    },
    {
      id: "usr-2",
      name: "ศรัณย์ กระจ่างแก้ว",
      email: "saran_k@cmu.ac.th",
      role: "USER",
      department: "ภาควิชาวิศวกรรมคอมพิวเตอร์",
      phone: "081-987-6543",
      avatarUrl:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
      studentId: "682110193",
    },
    {
      id: "usr-3",
      name: "ณฤกส ปันด้วง",
      email: "naruekhet_p@cmu.ac.th",
      role: "USER",
      department: "วิทยาลัยนวัตกรรมดิจิทัล (DII)",
      phone: "082-345-6789",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      studentId: "682110169",
    },
    {
      id: "usr-admin",
      name: "ดร. สมชาย ภัทรเดช (Admin)",
      email: "admin.meeting@cmu.ac.th",
      role: "ADMIN",
      department: "ศูนย์เทคโนโลยีและบริหารอาคารกลาง",
      phone: "053-941-234",
      avatarUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    },
    {
      id: "usr-5",
      name: "พัชราภรณ์ วงศ์สว่าง",
      email: "patcharaporn_w@cmu.ac.th",
      role: "USER",
      department: "กองวิเทศสัมพันธ์",
      phone: "084-555-1234",
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "USER" | "ADMIN">("ALL");

  const toggleRole = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newRole = u.role === "ADMIN" ? "USER" : "ADMIN";
          toast.success(
            "ปรับปรุงสิทธิ์ผู้ใช้สำเร็จ",
            `เปลี่ยนสิทธิ์ของ "${u.name}" เป็น ${newRole === "ADMIN" ? "ผู้ดูแลระบบ (Admin)" : "ผู้ใช้งานทั่วไป (User)"}`,
          );
          return { ...u, role: newRole };
        }
        return u;
      }),
    );
  };

  const filteredUsers = usersList.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="workspace-page mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="page-heading flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <EyebrowBadge label="จัดการสมาชิก" className="mb-2" />
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            จัดการผู้ใช้และสิทธิ์การเข้าถึง
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            กำหนดบทบาท User / Admin
            ค้นหาข้อมูลบุคลากรและนักศึกษาที่ลงทะเบียนในระบบ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/bookings"
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
          >
            จัดการคำขอจอง
          </Link>
          <Link
            href="/admin/reports"
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
          >
            รายงานสถิติ
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 surface-panel rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center gap-2">
          {["ALL", "USER", "ADMIN"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                roleFilter === r
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {r === "ALL"
                ? "ผู้ใช้ทั้งหมด"
                : r === "ADMIN"
                  ? "เฉพาะ Admin"
                  : "เฉพาะ User"}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, อีเมล, หรือสาขาวิชา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-blue-600 font-medium"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="surface-panel rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">ผู้ใช้งาน</th>
                <th className="py-3 px-4">หน่วยงาน / สังกัด</th>
                <th className="py-3 px-4">เบอร์โทรศัพท์</th>
                <th className="py-3 px-4">สิทธิ์ปัจจุบัน</th>
                <th className="py-3 px-4 text-right">ปรับปรุงสิทธิ์</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900">
                          {user.name}
                        </div>
                        <div className="text-slate-400 text-[11px] font-mono">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div>{user.department}</div>
                    {user.studentId && (
                      <div className="text-slate-400 font-mono text-[11px]">
                        รหัส: {user.studentId}
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono">{user.phone}</td>

                  <td className="py-3.5 px-4">
                    <RoleBadge role={user.role} />
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => toggleRole(user.id)}
                      className={`px-3 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                        user.role === "ADMIN"
                          ? "border-slate-200 hover:bg-slate-100 text-slate-700"
                          : "border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role === "ADMIN"
                        ? "เปลี่ยนเป็น User"
                        : "เลื่อนขั้นเป็น Admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
