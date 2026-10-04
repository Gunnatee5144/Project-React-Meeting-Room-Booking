import type { ReactNode } from "react";
import { Shield, User } from "lucide-react";

export type StatusType =
  | "AVAILABLE"
  | "APPROVED"
  | "PENDING"
  | "REJECTED"
  | "CANCELLED"
  | "MAINTENANCE";
export function StatusBadge({
  status,
  label,
  className = "",
}: {
  status: StatusType | string;
  label?: string;
  className?: string;
}) {
  const value = status.toUpperCase();
  const tone =
    value === "AVAILABLE" || value === "APPROVED"
      ? "success"
      : value === "PENDING"
        ? "warning"
        : value === "REJECTED"
          ? "error"
          : "neutral";
  const labels: Record<string, string> = {
    AVAILABLE: "พร้อมใช้งาน",
    APPROVED: "อนุมัติแล้ว",
    PENDING: "รอตรวจสอบ",
    REJECTED: "ไม่อนุมัติ",
    CANCELLED: "ยกเลิกแล้ว",
    MAINTENANCE: "ปิดปรับปรุง",
  };
  return (
    <span className={"status-badge status-badge--" + tone + " " + className}>
      {label || labels[value] || value}
    </span>
  );
}
export function CodeBadge({
  code,
  className = "",
}: {
  code: string;
  className?: string;
}) {
  return <span className={"code-badge " + className}>{code}</span>;
}
export function RoleBadge({
  role,
  className = "",
}: {
  role: "USER" | "ADMIN" | string;
  className?: string;
}) {
  const isAdmin = role.toUpperCase() === "ADMIN";
  const Icon = isAdmin ? Shield : User;
  return (
    <span className={"role-badge " + className}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {isAdmin ? "ผู้ดูแลระบบ" : "สมาชิก CMU"}
    </span>
  );
}
export function FeatureTag({
  icon,
  label,
  className = "",
}: {
  icon?: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={
        "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 " +
        className
      }
    >
      {icon}
      {label}
    </span>
  );
}
export function EyebrowBadge({
  label,
  icon,
  className = "",
}: {
  label: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={"page-eyebrow " + className}>
      {icon}
      {label}
    </div>
  );
}
