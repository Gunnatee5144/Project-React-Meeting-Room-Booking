"use client";

import { useEffect, useState } from "react";
import { BrandMark } from "./brand";

const PRELOADER_KEY = "meetsync_has_preloaded";

export function SitePreloader() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    let hasPreloaded = false;
    try {
      hasPreloaded = Boolean(window.sessionStorage.getItem(PRELOADER_KEY));
    } catch {}
    if (hasPreloaded) {
      const timer = window.setTimeout(() => setVisible(false), 0);
      return () => window.clearTimeout(timer);
    }

    const exitTimer = window.setTimeout(() => setExiting(true), 620);
    const removeTimer = window.setTimeout(() => {
      setVisible(false);
      try {
        window.sessionStorage.setItem(PRELOADER_KEY, "true");
      } catch {}
    }, 880);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`site-preloader fixed inset-0 z-[10000] grid place-items-center text-slate-900 transition-opacity duration-300 ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label="กำลังเตรียมระบบ MEETSYNC"
    >
      <div className="site-preloader__content flex flex-col items-center px-6 text-center">
        <div className="site-preloader__mark mb-10">
          <div className="preloader-orbit" aria-hidden="true" />
          <BrandMark className="h-9 w-9" />
        </div>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
          DII · Chiang Mai University
        </p>
        <p className="mt-3 text-3xl font-bold tracking-tight">meetsync.</p>
        <p className="mt-2 text-sm text-slate-500">
          กำลังเตรียมพื้นที่ประชุมของคุณ
        </p>
        <div className="mt-7 h-0.5 w-40 overflow-hidden rounded-full bg-blue-100">
          <div className="preloader-sweep h-full w-1/3 rounded-full bg-blue-600" />
        </div>
      </div>
    </div>
  );
}
