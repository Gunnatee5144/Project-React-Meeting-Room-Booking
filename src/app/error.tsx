"use client";

import Link from "next/link";
import { RefreshCw, ArrowLeft, CalendarDays } from "lucide-react";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="state-page">
      <div className="grid h-24 w-24 place-items-center rounded-[28px] bg-blue-50 text-blue-600">
        <CalendarDays className="h-10 w-10" strokeWidth={1.5} />
      </div>
      <h1 className="mt-8 text-3xl font-semibold">โหลดหน้านี้ไม่สำเร็จ</h1>
      <p className="mt-3 text-sm text-slate-500">
        ลองอีกครั้งเพื่อกลับไปวางแผนการประชุมของคุณ
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="button-secondary">
          <ArrowLeft className="h-4 w-4" />
          หน้าแรก
        </Link>
        <button onClick={reset} className="button-primary">
          <RefreshCw className="h-4 w-4" />
          ลองอีกครั้ง
        </button>
      </div>
    </section>
  );
}
