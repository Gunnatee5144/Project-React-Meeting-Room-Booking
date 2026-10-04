"use client";
import { EmptyState } from "@/components/ui";
export default function AdminRoomError({ reset }: { reset: () => void }) {
  return <><EmptyState title="โหลดข้อมูลจัดการห้องไม่สำเร็จ" description="กรุณาลองใหม่อีกครั้ง" /><div className="button-row error-actions"><button className="button" onClick={reset}>ลองใหม่</button></div></>;
}
