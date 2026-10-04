"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Mail, Phone } from "lucide-react";

export function Footer() {
  const isHome = usePathname() === "/";
  return (
    <footer className="site-footer">
      {isHome && (
        <div className="footer-cta">
          <div>
            <h2>
              การประชุมครั้งถัดไป
              <br />
              เริ่มจากพื้นที่ที่ใช่
            </h2>
            <p>ให้ทีมโฟกัสกับไอเดีย ส่วนเรื่องห้องประชุมให้ MEETSYNC ดูแล</p>
          </div>
          <Link href="/rooms" className="button-light shrink-0">
            ค้นหาห้องของคุณ{" "}
            <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      )}
      <div className="footer-content">
        <div className="footer-grid">
          <div>
            <p className="footer-brand">
              meetsync<span>.</span>
            </p>
            <p className="footer-muted mt-4 max-w-sm">
              พื้นที่ประชุมสำหรับบุคลากรและนักศึกษา
              <br />
              วิทยาลัยนวัตกรรมดิจิทัล มหาวิทยาลัยเชียงใหม่
            </p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <Link href="/rooms" className="footer-link block">
                ห้องประชุม
              </Link>
              <Link href="/calendar" className="footer-link block">
                ปฏิทินห้อง
              </Link>
            </div>
            <div>
              <Link href="/my-bookings" className="footer-link block">
                การจองของฉัน
              </Link>
              <Link href="/profile" className="footer-link block">
                โปรไฟล์
              </Link>
            </div>
          </div>
          <div>
            <a
              href="mailto:meetsync.support@cmu.ac.th"
              className="footer-link flex items-center gap-2"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              meetsync.support@cmu.ac.th
            </a>
            <a
              href="tel:053941234"
              className="footer-link flex items-center gap-2"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              053-941-234
            </a>
            <p className="footer-muted mt-2">จันทร์–ศุกร์ 08:30–16:30 น.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 MEETSYNC · CMU DII</span>
          <span>พัฒนาโดยกลุ่ม มหาเทพโฟค</span>
        </div>
      </div>
    </footer>
  );
}
