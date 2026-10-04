import type { ReactNode } from "react";
import Link from "next/link";

export function PageHeading({ eyebrow, title, description, children }: {
  eyebrow?: string; title: string; description?: string; children?: ReactNode;
}) {
  return <header className="page-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>
    {description && <p className="muted">{description}</p>}</div>{children}</header>;
}

export function EmptyState({ title, description, href, label }: {
  title: string; description: string; href?: string; label?: string;
}) {
  return <div className="empty-state"><h2>{title}</h2><p className="muted">{description}</p>
    {href && label && <Link className="button secondary" href={href}>{label}</Link>}</div>;
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p className="field-error" id={id}>{message}</p> : null;
}

export function RoomPlan() {
  return <svg viewBox="0 0 460 320" role="img" aria-label="ภาพประกอบผังห้องประชุม" className="room-plan">
    <defs><pattern id="plan-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="currentColor" strokeWidth=".4" opacity=".18" /></pattern></defs>
    <rect width="460" height="320" rx="12" fill="url(#plan-grid)" />
    <g fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M45 50H200V130M200 180V270H45V50M230 50H415V270H230V210M230 160V50" />
      <path d="M200 130a50 50 0 0 1-50 50M200 180H150M230 160a50 50 0 0 1 50 50M230 210H280" strokeWidth="1.5" />
      <rect x="86" y="105" width="65" height="113" rx="20" /><rect x="278" y="95" width="87" height="130" rx="25" />
      {[112,148,184].map(y => <g key={y}><path d={`M70 ${y}h8m81 0h8M263 ${y}h8m102 0h8`} strokeWidth="8" strokeLinecap="round" /></g>)}
      <path d="M97 77H142M290 68H350" strokeWidth="5" strokeLinecap="round" />
    </g>
    <g fontFamily="monospace" fontSize="12" fill="currentColor"><text x="80" y="296">MEETING ROOM</text><text x="285" y="296">CONFERENCE</text></g>
  </svg>;
}
