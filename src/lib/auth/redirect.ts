// Pure helpers (no server-only) so they can be unit-tested and shared with client forms.

/**
 * Accepts only same-site absolute paths ("/rooms?x=1"). Rejects protocol-relative URLs,
 * backslashes, and anything with a scheme so `?next=` cannot become an open redirect.
 */
export function safeNextPath(next: unknown): string | null {
  if (typeof next !== "string") return null;
  if (next.length === 0 || next.length > 500) return null;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  if (/[\u0000-\u001f]/.test(next)) return null;
  // Never send a signed-in user back to the auth pages.
  const pathOnly = next.split(/[?#]/)[0];
  if (pathOnly === "/login" || pathOnly === "/register") return null;
  return next;
}

/** Where a user lands after login when no safe `next` was supplied. */
export function defaultLandingPath(role: "USER" | "ADMIN"): string {
  return role === "ADMIN" ? "/admin/bookings" : "/rooms";
}
