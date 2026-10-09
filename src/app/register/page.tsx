// Server Component: signed-in visitors are redirected away. New accounts are always role USER;
// that is enforced in the registerUser Server Action, not by this page.

import { redirect } from "next/navigation";
import { PageHeading } from "@/components/ui";
import { RegisterForm } from "@/components/auth-forms";
import { getSessionUser } from "@/lib/auth/session";
import { defaultLandingPath, safeNextPath } from "@/lib/auth/redirect";

export const dynamic = "force-dynamic";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const rawNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = safeNextPath(rawNext) ?? undefined;
  const user = await getSessionUser();
  if (user) redirect(next ?? defaultLandingPath(user.role));
  return <div className="auth-shell">
    <PageHeading eyebrow="สมาชิกใหม่" title="สมัครสมาชิก" description="สร้างบัญชีด้วยชื่อ อีเมล รหัสผ่าน และหน่วยงาน เพื่อเริ่มจองห้องประชุม" />
    <section className="panel auth-panel"><RegisterForm next={next} /></section>
  </div>;
}
