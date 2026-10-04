"use client";

// Client Component: needs onError state to fall back to a placeholder when an admin-supplied
// image URL fails to load.

import { useState } from "react";

export function RoomImage({ src, name, priority = false }: { src: string | null; name: string; priority?: boolean }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const safeSource = src && /^https:\/\//i.test(src) ? src : null;
  return <div className="room-image">
    {safeSource && failedSource !== safeSource ?
      // Arbitrary admin-entered URLs stay in the browser; no server-side image proxy.
      <img src={safeSource} alt={`ห้อง ${name}`} width="720" height="450" loading={priority ? "eager" : "lazy"} referrerPolicy="no-referrer" onError={() => setFailedSource(safeSource)} />
      : <div className="room-image-fallback" role="img" aria-label={`ห้อง ${name} ยังไม่มีรูปภาพ`}><svg viewBox="0 0 120 90" aria-hidden="true"><path d="M18 14h84v62H18zM38 40h44v18H38zM48 30v8m24-8v8M48 60v8m24-8v8" fill="none" stroke="currentColor" strokeWidth="3" /><path d="M18 44v15" stroke="var(--mint)" strokeWidth="5" /></svg><span>พื้นที่สำหรับการประชุม</span></div>}
  </div>;
}
