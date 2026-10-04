"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  const isHome = usePathname() === "/";
  return <footer className="site-footer">
    {isHome && <div className="footer-cta"><div><h2>การประชุมครั้งถัดไป<br />เริ่มจากพื้นที่ที่ใช่</h2><p>ให้ทีมโฟกัสกับไอเดีย ส่วนเรื่องห้องประชุมให้ MEETSYNC ดูแล</p></div><Link href="/rooms" className="button-light">ค้นหาห้องของคุณ <ArrowUpRight size={20} /></Link></div>}
    <div className="footer-content"><div className="footer-grid">
      <div><p className="footer-brand">meetsync<span>.</span></p><p className="footer-muted mt-4">พื้นที่ประชุมสำหรับบุคลากรและนักศึกษา<br />วิทยาลัยนวัตกรรมดิจิทัล มหาวิทยาลัยเชียงใหม่</p></div>
      <div className="grid grid-cols-2 gap-5"><div><Link href="/rooms" className="footer-link block">ห้องประชุม</Link><Link href="/calendar" className="footer-link block">ปฏิทินห้อง</Link></div><div><Link href="/my-bookings" className="footer-link block">การจองของฉัน</Link><Link href="/profile" className="footer-link block">โปรไฟล์</Link></div></div>
      <div><p className="footer-muted">GOOD SPACE. GREAT IDEAS.</p><p className="footer-muted">ค้นหา เลือกเวลา ส่งคำขอ<br />พร้อมสำหรับทุกการทำงานร่วมกัน</p><Link href="/rooms" className="footer-link inline-flex items-center gap-2">เริ่มต้นการประชุม <ArrowUpRight size={16} /></Link></div>
    </div><div className="footer-bottom"><span>© {new Date().getFullYear()} MEETSYNC · DII CMU</span><span>MADE FOR MEETING. BUILT FOR CONNECTING.</span></div></div>
  </footer>;
}
