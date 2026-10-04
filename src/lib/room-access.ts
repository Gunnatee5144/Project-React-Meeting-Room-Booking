import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { readSessionSubject } from "@/lib/session-token";

export const profileSelect = { id: true, name: true, email: true, department: true, role: true };
export const sessionCookieName = () => process.env.SESSION_COOKIE_NAME || "session";

// This is the sole integration point for Folk's verified server session helper.
// No unverified cookie fields, client state, or browser-supplied role authorize access.
export const getRoomViewer = cache(async () => {
  const token = (await cookies()).get(sessionCookieName())?.value;
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret) return null;
  const id = readSessionSubject(token, secret);
  if (!id) return null;
  return getPrisma().user.findUnique({ where: { id }, select: profileSelect });
});

export async function requireRoomViewer(nextPath: "/profile" | "/admin/rooms") {
  const user = await getRoomViewer();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export async function requireRoomAdmin() {
  const user = await requireRoomViewer("/admin/rooms");
  return user.role === "ADMIN" ? user : null;
}
