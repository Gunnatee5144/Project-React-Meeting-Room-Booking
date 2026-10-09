import "server-only";
import { redirect } from "next/navigation";
import { getSessionUser, sessionCookieName, sessionUserSelect } from "@/lib/auth/session";

// Room, profile and booking code reads identity through this module. It now delegates to the
// real session in src/lib/auth (JWT cookie issued by loginUser/registerUser). No unverified
// cookie fields, client state, or browser-supplied role authorize access.
export const profileSelect = sessionUserSelect;
export { sessionCookieName };
export const getRoomViewer = getSessionUser;

export async function requireRoomViewer(nextPath: "/profile" | "/admin/rooms") {
  const user = await getRoomViewer();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export async function requireRoomAdmin() {
  const user = await requireRoomViewer("/admin/rooms");
  return user.role === "ADMIN" ? user : null;
}
