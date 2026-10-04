"use client";

// Client Component: Next.js error boundaries must be Client Components (reset() is a browser callback).

import { useEffect } from "react";
import { EmptyState } from "@/components/ui";

export default function RoomError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Room page failed", error); }, [error]);
  return <><EmptyState title="โหลดข้อมูลห้องไม่สำเร็จ" description="กรุณาลองใหม่อีกครั้ง หากยังใช้งานไม่ได้ให้ติดต่อผู้ดูแลระบบ" /><div className="button-row error-actions"><button className="button" onClick={reset}>ลองใหม่</button></div></>;
}
