import "server-only";

// Guards for Server Components, Server Actions and Route Handlers. Always evaluated on the
// server from the verified session; AuthContext on the client is for display only.

import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";
import { safeNextPath } from "@/lib/auth/redirect";

function loginUrl(nextPath?: string): string {
  const next = safeNextPath(nextPath);
  return next ? `/login?next=${encodeURIComponent(next)}` : "/login";
}

/** Page guard: guests are redirected to /login?next=...; returns the signed-in user. */
export async function requireUser(nextPath?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(loginUrl(nextPath));
  return user;
}

/**
 * Page guard for admin pages: guests go to /login, signed-in non-admins go home.
 * Returns the admin user.
 */
export async function requireAdmin(nextPath?: string): Promise<SessionUser> {
  const user = await requireUser(nextPath);
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

/** Server Action / Route Handler guard: returns the admin, or null (caller returns a failed result / 403). */
export async function getAdminOrNull(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  return user?.role === "ADMIN" ? user : null;
}
