"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BrandMark } from "@/components/ui/brand";

const links = [
  { href: "/", label: "หน้าแรก" },
  { href: "/rooms", label: "ค้นหาห้อง" },
  { href: "/calendar", label: "ปฏิทิน" },
  { href: "/my-bookings", label: "การจองของฉัน" },
];

export function Navigation() {
  const user = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const items = user?.role === "ADMIN" ? [...links, { href: "/admin/rooms", label: "จัดการห้อง" }] : links;
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) { setOpen(false); toggle.current?.focus(); }
    };
    const outside = (event: PointerEvent) => {
      if (open && !header.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", close); document.removeEventListener("pointerdown", outside); };
  }, [open]);
  return <header className="site-header" ref={header}>
    <div className="nav-shell">
      <Link href="/" className="brand" onClick={() => setOpen(false)} aria-label="MEETSYNC หน้าแรก">
        <span className="brand-symbol"><BrandMark /></span>
        <span className="brand-word">meetsync<span>.</span><small>DII · CHIANG MAI UNIVERSITY</small></span>
      </Link>
      <button ref={toggle} type="button" className="menu-toggle icon-button" aria-label={open ? "ปิดเมนู" : "เมนู"} aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      <nav id="main-nav" aria-label="เมนูหลัก" className={`main-nav${open ? " is-open" : ""}`}>
        {items.map(item => <Link key={item.href} href={item.href} aria-current={pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`)) ? "page" : undefined} onClick={() => setOpen(false)}>{item.label}</Link>)}
        <Link className="nav-account" href={user ? "/profile" : "/login"} onClick={() => setOpen(false)}>{user ? <><UserRound size={16} />{user.name}</> : <>เข้าสู่ระบบ <ArrowUpRight size={16} /></>}</Link>
      </nav>
    </div>
  </header>;
}
