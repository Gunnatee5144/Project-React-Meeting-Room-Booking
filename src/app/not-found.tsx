import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <section className="state-page">
      <p
        className="text-[110px] font-medium leading-none tracking-tight text-blue-200"
        aria-hidden="true"
      >
        404<span className="text-blue-600">.</span>
      </p>
      <h1 className="mt-8 text-3xl font-semibold">ยังไม่พบพื้นที่นี้</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
        ลิงก์อาจเปลี่ยนไปหรือหน้านี้ไม่มีอยู่แล้ว
        กลับไปเลือกห้องสำหรับการประชุมครั้งถัดไปได้เลย
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="button-secondary">
          <ArrowLeft className="h-4 w-4" />
          หน้าแรก
        </Link>
        <Link href="/rooms" className="button-primary">
          สำรวจห้องประชุม
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
