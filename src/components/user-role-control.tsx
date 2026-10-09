"use client";

// Client Component: needs state for the select, a pending flag and the result message.
// updateUserRole re-checks that the caller is an admin on the server; this only collects input.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole } from "@/actions/users";

export function UserRoleControl({ userId, name, role, isSelf }: { userId: string; name: string; role: "USER" | "ADMIN"; isSelf: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState(role);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  if (isSelf) return <span className="muted">บัญชีของคุณ (เปลี่ยนสิทธิ์ตัวเองไม่ได้)</span>;

  const changed = value !== role;
  return <div className="role-control">
    <label className="sr-only" htmlFor={`role-${userId}`}>สิทธิ์ของ {name}</label>
    <select id={`role-${userId}`} value={value} disabled={pending} onChange={event => { setValue(event.target.value as "USER" | "ADMIN"); setMessage(null); }}>
      <option value="USER">ผู้ใช้งาน (USER)</option>
      <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
    </select>
    <button type="button" className="button secondary" disabled={pending || !changed} onClick={() => {
      if (value === "ADMIN" && !window.confirm(`ให้สิทธิ์ผู้ดูแลระบบแก่ ${name}?`)) return;
      startTransition(async () => {
        try {
          const result = await updateUserRole(userId, value);
          setMessage({ ok: result.success, text: result.message });
          if (result.success) router.refresh(); else setValue(role);
        } catch { setMessage({ ok: false, text: "เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่" }); setValue(role); }
      });
    }}>{pending ? "กำลังบันทึก…" : "บันทึกสิทธิ์"}</button>
    {message && <p className={message.ok ? "field-hint" : "field-error"} role={message.ok ? "status" : "alert"}>{message.text}</p>}
  </div>;
}
