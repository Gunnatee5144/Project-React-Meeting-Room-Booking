// Server Component: a signed-in visitor is redirected before any HTML is sent; only the form
// itself is a Client Component. `?next=` is reduced to a safe same-site path.

import { redirect } from "next/navigation";
import { PageHeading } from "@/components/ui";
import { LoginForm } from "@/components/auth-forms";
import { getSessionUser } from "@/lib/auth/session";
import { defaultLandingPath, safeNextPath } from "@/lib/auth/redirect";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = safeNextPath(rawNext) ?? undefined;
  const user = await getSessionUser();
  if (user) redirect(next ?? defaultLandingPath(user.role));
  return <div className="auth-shell">
    <PageHeading eyebrow="บัญชีผู้ใช้" title="เข้าสู่ระบบ" description="เข้าสู่ระบบด้วยอีเมลและรหัสผ่านเพื่อจองห้องประชุมและติดตามสถานะคำขอ" />
    <section className="panel auth-panel"><LoginForm next={next} /></section>
  </div>;
}
