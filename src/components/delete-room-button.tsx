"use client";

// Client Component: needs a confirmation step, pending state and onClick handlers before
// calling the deleteRoom Server Action.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteRoom } from "@/actions/rooms";

export function DeleteRoomButton({ id, name, hasHistory }: { id: string; name: string; hasHistory: boolean }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const label = hasHistory ? "ปิดใช้งานห้อง" : "ลบห้อง";
  return <div className="delete-room-control">{confirming ? <div className="delete-confirm" role="group" aria-label={`ยืนยัน${label}`}><p>{hasHistory ? `ปิดใช้งาน ${name}? ประวัติการจองจะยังอยู่` : `ลบ ${name} ถาวร? หากพบประวัติการจอง ระบบจะปิดใช้งานแทน`}</p><div className="button-row"><button className="button danger" disabled={pending} onClick={async () => {
    setPending(true); setMessage("");
    try { const result = await deleteRoom(id); setMessage(result.message); if (result.success) { setConfirming(false); router.refresh(); } }
    catch { setMessage("เชื่อมต่อไม่สำเร็จ กรุณาลองใหม่"); }
    finally { setPending(false); }
  }}>{pending ? "กำลังบันทึก…" : `ยืนยัน${label}`}</button><button className="button secondary" disabled={pending} onClick={() => setConfirming(false)}>กลับ</button></div></div> : <button className="text-link delete-link" onClick={() => { setMessage(""); setConfirming(true); }}>{label}</button>}{message && <p role="status" className="notice">{message}</p>}</div>;
}
