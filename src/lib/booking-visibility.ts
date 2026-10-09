// Decides how much of a booking each viewer may see. Pure so it can be unit-tested; the
// Route Handler passes in what it read from the database and the verified session.

export const MASKED_TOPIC = "จองแล้ว";

export type ViewerLike = { id: string; role: "USER" | "ADMIN" };

export type BookingRow = {
  id: string;
  roomId: string;
  userId: string;
  topic: string;
  startTime: Date;
  endTime: Date;
  attendeeCount: number;
  status: string;
  adminNote: string | null;
  room: { name: string; location: string };
  user: { name: string; email: string };
};

export type BookingApiItem = {
  id: string;
  roomId: string;
  roomName: string;
  roomLocation: string;
  title: string;
  start: string;
  end: string;
  status: string;
  mine: boolean;
  /** Only for the owner and admins. */
  attendeeCount?: number;
  adminNote?: string | null;
  /** Only for admins. */
  userName?: string;
  userEmail?: string;
};

/**
 * Admins see everything. Owners see their own booking in full. Everyone else sees only that the
 * slot is taken: no topic, attendee count, admin note or booker identity.
 */
export function toBookingApiItem(row: BookingRow, viewer: ViewerLike): BookingApiItem {
  const isAdmin = viewer.role === "ADMIN";
  const mine = row.userId === viewer.id;
  const item: BookingApiItem = {
    id: row.id,
    roomId: row.roomId,
    roomName: row.room.name,
    roomLocation: row.room.location,
    title: isAdmin || mine ? row.topic : MASKED_TOPIC,
    start: row.startTime.toISOString(),
    end: row.endTime.toISOString(),
    status: row.status,
    mine,
  };
  if (isAdmin || mine) {
    item.attendeeCount = row.attendeeCount;
    item.adminNote = row.adminNote;
  }
  if (isAdmin) {
    item.userName = row.user.name;
    item.userEmail = row.user.email;
  }
  return item;
}

/**
 * Non-admins can only list statuses that occupy a room (PENDING/APPROVED); REJECTED and
 * CANCELLED history of other people is never exposed. Admins may filter by any status.
 */
export function allowedStatuses(viewer: ViewerLike, requested?: string): string[] {
  if (viewer.role === "ADMIN") return requested ? [requested] : ["PENDING", "APPROVED"];
  if (requested === "PENDING" || requested === "APPROVED") return [requested];
  return ["PENDING", "APPROVED"];
}
