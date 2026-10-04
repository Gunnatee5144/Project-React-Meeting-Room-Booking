"use client";

// Client Component: interactive add/delete of equipment with pending state; mutations go
// through Server Actions and router.refresh() re-renders the server data.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEquipment, deleteEquipment } from "@/actions/rooms";

export function EquipmentManager({ equipment }: { equipment: { id: string; name: string }[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  return <section className="panel equipment-manager"><h2>จัดการอุปกรณ์</h2><p className="muted">เพิ่มรายการอุปกรณ์ แล้วเลือกให้ห้องแต่ละห้อง ลบได้เมื่อไม่มีห้องใช้อุปกรณ์นั้น</p>
    <form className="equipment-create" onSubmit={async event => {
      event.preventDefault(); setPending(true); setMessage("");
      try { const result = await createEquipment(name); setMessage(result.message); if (result.success) { setName(""); router.refresh(); } }
      catch { setMessage("เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่"); } finally { setPending(false); }
    }}><label htmlFor="equipment-name">ชื่ออุปกรณ์ใหม่</label><div className="button-row"><input id="equipment-name" value={name} onChange={event => setName(event.target.value)} minLength={2} maxLength={80} required /><button className="button secondary" disabled={pending}>{pending ? "กำลังบันทึก…" : "เพิ่มอุปกรณ์"}</button></div></form>
    {message && <p className="notice" role="status">{message}</p>}
    <ul className="equipment-admin-list">{equipment.map(item => <li key={item.id}><span>{item.name}</span>{confirmId === item.id ? <div className="button-row"><span>ยืนยันลบ?</span><button className="button danger" disabled={pending} onClick={async () => {
      setPending(true); setMessage("");
      try { const result = await deleteEquipment(item.id); setMessage(result.message); setConfirmId(null); if (result.success) router.refresh(); }
      catch { setMessage("เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่"); } finally { setPending(false); }
    }}>ยืนยันลบ</button><button className="button secondary" disabled={pending} onClick={() => setConfirmId(null)}>กลับ</button></div> : <button className="text-link" aria-label={`ลบอุปกรณ์ ${item.name}`} disabled={pending} onClick={() => setConfirmId(item.id)}>ลบ</button>}</li>)}</ul>
  </section>;
}
