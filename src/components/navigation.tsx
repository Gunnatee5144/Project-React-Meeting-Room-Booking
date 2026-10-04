"use client";

// Client Component: highlights the active link (usePathname), toggles the mobile menu
// (useState) and reads the signed-in user from AuthContext.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const links = [{ href: "/rooms", label: "ค้นหาห้อง" }, { href: "/calendar", label: "ปฏิทิน" }, { href: "/my-bookings", label: "การจองของฉัน" }];

export function Navigation() {
  const user = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = user?.role === "ADMIN" ? [...links, { href: "/admin/rooms", label: "จัดการห้อง" }] : links;
  return <header className="site-header"><div className="nav-shell">
    <Link href="/" className="brand" onClick={() => setOpen(false)} aria-label="Meeting Room หน้าแรก">
      <span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></span><span>Meeting Room<small>พื้นที่สำหรับทุกการประชุม</small></span>
    </Link>
    <button type="button" className="menu-toggle button secondary" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>{open ? "ปิดเมนู" : "เมนู"}</button>
    <nav id="main-nav" aria-label="เมนูหลัก" className={`main-nav${open ? " is-open" : ""}`}>
      {items.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "page" : undefined} onClick={() => setOpen(false)}>{item.label}</Link>)}
      {user ? <Link className="nav-account" href="/profile" aria-current={pathname === "/profile" ? "page" : undefined} onClick={() => setOpen(false)}>{user.name}</Link> : <Link className="nav-account" href="/login" onClick={() => setOpen(false)}>เข้าสู่ระบบ</Link>}
    </nav>
  </div></header>;
}
