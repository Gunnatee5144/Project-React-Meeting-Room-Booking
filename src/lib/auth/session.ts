import "server-only";

// Session = HS256 JWT in an HttpOnly cookie. The token carries only the user id; the user's
// current name/email/role are always re-read from the database, so a role change or a deleted
// account takes effect on the next request. Nothing here trusts browser-supplied identity.

import { cache } from "react";
import { cookies } from "next/headers";
import { getPrisma } from "@/lib/prisma";
import { readSessionSubject, signSessionToken, SESSION_MAX_AGE_SECONDS } from "@/lib/session-token";

export const sessionUserSelect = { id: true, name: true, email: true, department: true, role: true } as const;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  department: string | null;
  role: "USER" | "ADMIN";
};

export const sessionCookieName = () => process.env.SESSION_COOKIE_NAME || "session";

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  }
  return secret;
}

/** Current user from the verified session cookie, or null for guests. Cached per request. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(sessionCookieName())?.value;
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret) return null;
  const id = readSessionSubject(token, secret);
  if (!id) return null;
  return getPrisma().user.findUnique({ where: { id }, select: sessionUserSelect });
});

/** Issues the session cookie after a successful register/login. */
export async function createSession(userId: string): Promise<void> {
  const token = signSessionToken(userId, sessionSecret());
  (await cookies()).set(sessionCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Removes the session cookie. */
export async function destroySession(): Promise<void> {
  (await cookies()).delete(sessionCookieName());
}
