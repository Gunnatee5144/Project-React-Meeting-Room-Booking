"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Menu,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useApp } from "@/context/app-context";
import { BrandMark } from "@/components/ui/brand";

const primaryLinks = [
  { href: "/", label: "หน้าแรก", exact: true },
  { href: "/rooms", label: "ห้องประชุม" },
  { href: "/calendar", label: "ปฏิทิน" },
  { href: "/my-bookings", label: "การจองของฉัน" },
];
const adminLinks = [
  { href: "/admin/bookings", label: "คำขอจอง" },
  { href: "/admin/rooms", label: "จัดการห้อง" },
  { href: "/admin/users", label: "ผู้ใช้งาน" },
  { href: "/admin/reports", label: "รายงาน" },
];

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, switchRole } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const adminContainer = useRef<HTMLDivElement>(null);
  const adminButton = useRef<HTMLButtonElement>(null);
  const mobileButton = useRef<HTMLButtonElement>(null);
  const isAdminRoute = pathname.startsWith("/admin");
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);
  const closeMenus = () => {
    setAdminOpen(false);
    setMobileOpen(false);
  };

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (
        adminContainer.current &&
        !adminContainer.current.contains(event.target as Node)
      )
        setAdminOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (adminOpen) {
        setAdminOpen(false);
        adminButton.current?.focus();
      }
      if (mobileOpen) {
        setMobileOpen(false);
        mobileButton.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [adminOpen, mobileOpen]);

  return (
    <header className="site-nav-shell">
      <div className="site-nav">
        <Link
          href="/"
          onClick={closeMenus}
          className="flex shrink-0 items-center gap-3"
          aria-label="MEETSYNC หน้าแรก"
        >
          <span className="brand-mark">
            <BrandMark className="h-6 w-6" />
          </span>
          <span>
            <span className="brand-name block">
              meetsync<span className="text-blue-600">.</span>
            </span>
            <span className="brand-caption block">DII · CMU</span>
          </span>
        </Link>

        <nav
          className="ml-auto hidden items-center gap-1 lg:flex"
          aria-label="เมนูหลัก"
        >
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenus}
              aria-current={
                isActive(link.href, link.exact) ? "page" : undefined
              }
              className={
                "nav-link " +
                (isActive(link.href, link.exact) ? "is-active" : "")
              }
            >
              {link.label}
            </Link>
          ))}
          <div className="relative" ref={adminContainer}>
            <button
              ref={adminButton}
              type="button"
              onClick={() => setAdminOpen((open) => !open)}
              aria-expanded={adminOpen}
              aria-controls="admin-navigation"
              className={
                "nav-link " + (isAdminRoute || adminOpen ? "is-active" : "")
              }
            >
              ผู้ดูแลระบบ{" "}
              <ChevronDown
                className={
                  "h-3.5 w-3.5 transition-transform " +
                  (adminOpen ? "rotate-180" : "")
                }
                aria-hidden="true"
              />
            </button>
            {adminOpen && (
              <nav
                id="admin-navigation"
                className="glass-dropdown absolute right-0 top-full mt-3 w-52 p-2"
                aria-label="เมนูผู้ดูแลระบบ"
              >
                <p className="flex items-center gap-2 px-3 py-2 text-[11px] text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  พื้นที่จัดการ
                </p>
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenus}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={
                      "nav-link w-full " +
                      (pathname === link.href ? "is-active" : "")
                    }
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
          </div>
        </nav>

        <div className="hidden shrink-0 items-center gap-3 border-l border-slate-200 pl-4 lg:flex">
          <button
            type="button"
            onClick={() =>
              switchRole(currentUser.role === "ADMIN" ? "USER" : "ADMIN")
            }
            className="nav-role inline-flex items-center gap-2"
            aria-label="สลับบทบาทผู้ใช้งาน"
          >
            {currentUser.role === "ADMIN" ? "ผู้ดูแล" : "สมาชิก"}{" "}
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <Link
            href="/profile"
            onClick={closeMenus}
            className="nav-profile"
            aria-label={"ดูโปรไฟล์ " + currentUser.name}
          >
            <img
              src={currentUser.avatarUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover ring-2 ring-blue-50"
            />
            <span className="hidden max-w-24 truncate xl:block">
              {currentUser.name.split(" ")[0]}
            </span>
          </Link>
        </div>

        <button
          ref={mobileButton}
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="ml-auto grid h-11 w-11 place-items-center rounded-xl bg-slate-50 text-slate-700 lg:hidden"
          aria-label={mobileOpen ? "ปิดเมนู" : "เปิดเมนู"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-navigation"
          className="nav-mobile animate-fade-in lg:hidden"
          aria-label="เมนูมือถือ"
        >
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenus}
              className={
                "nav-link flex w-full " +
                (isActive(link.href, link.exact) ? "is-active" : "")
              }
              aria-current={
                isActive(link.href, link.exact) ? "page" : undefined
              }
            >
              {link.label}
            </Link>
          ))}
          <p className="my-3 border-t border-slate-100 px-3 pt-4 text-[11px] text-slate-400">
            พื้นที่ผู้ดูแลระบบ
          </p>
          <div className="grid grid-cols-2">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenus}
                className={
                  "nav-link " + (pathname === link.href ? "is-active" : "")
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <Link href="/profile" onClick={closeMenus} className="nav-profile">
              <img
                src={currentUser.avatarUrl}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
              />
              {currentUser.name.split(" ")[0]}
            </Link>
            <button
              type="button"
              className="nav-role"
              onClick={() =>
                switchRole(currentUser.role === "ADMIN" ? "USER" : "ADMIN")
              }
            >
              {currentUser.role === "ADMIN"
                ? "สลับเป็นสมาชิก"
                : "สลับเป็นผู้ดูแล"}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
