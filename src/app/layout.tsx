import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Link from "next/link";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "Meeting Room Booking",
  description: "ระบบจองห้องประชุมออนไลน์",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body>
        <a className="skip-link" href="#main-content">ข้ามไปเนื้อหา</a>
        <Navigation user={null} />
        <main id="main-content" className="page-shell">{children}</main>
        <footer className="site-footer"><div className="footer-shell"><span>Meeting Room · ระบบจองห้องประชุม</span><Link href="/rooms">ค้นหาพื้นที่สำหรับการประชุมครั้งถัดไป</Link></div></footer>
      </body>
    </html>
  );
}
