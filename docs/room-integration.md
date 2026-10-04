# Room and profile integration

## Server identity

`src/lib/room-access.ts` is the single integration point with Folk's auth work.
Gun does not implement registration, login, session issuance, or AuthContext.
Until those arrive, the adapter verifies an **HS256 JWT** from the HttpOnly
`session` cookie (`SESSION_COOKIE_NAME` can override the name). The secret comes
from `SESSION_SECRET`, with at least 32 characters. JWT claims: `sub` is the
database User ID, `exp` is an integer Unix timestamp in seconds; optional `nbf`
is checked. Unverified, expired, malformed, or unsupported tokens fail closed.

After verification the adapter reads the User from the database. User identity
and role never come from browser input or JWT role claims. Missing/deleted users
are signed out; a database failure surfaces as an error, not public access.

When Folk merges authentication, replace the body of `getRoomViewer()` with the
team's verified server session reader, preserving its return shape:

```ts
type RoomViewer = {
  id: string;
  name: string;
  email: string;
  department: string | null;
  role: "USER" | "ADMIN";
} | null;
```

The reader must validate expiry/revocation and fetch current DB role. Replace
`logoutProfileSession()` with Folk's `logoutUser` as well; the interim logout
only removes the adapter's cookie and cannot revoke an auth owner's DB session.
Root layout passes only name and role to navigation. Folk can wrap its existing
children with AuthProvider without changing room components.

Pages redirect guests to `/login?next=...`. Server Actions return a failed result
for unauthorized calls and perform their own checks before any database writes,
following [Next.js authentication guidance](https://nextjs.org/docs/app/guides/authentication).

## Profile action

`updateProfile(input)` accepts `{ name, email, department }`. The session decides
which account changes. Browser `id`, `role`, or `passwordHash` properties are
ignored. Empty department becomes null; duplicate emails return a field error.
Names and emails are normalized and layout/profile views are revalidated.

## Room queries

`/rooms?q=&capacity=&date=YYYY-MM-DD&start=HH:mm&end=HH:mm&equipment=ID&page=1`

Repeat `equipment` for several IDs. All selected equipment is required. Date,
start, and end must appear together. Times always use Asia/Bangkok (UTC+7).
Public listings show only active rooms. Availability uses strict overlap
`booking.start < requested.end && booking.end > requested.start`, blocking
PENDING/APPROVED but permitting adjacent intervals. There is no availability
cache; booking actions must still recheck within their own transaction.

`/rooms/[id]?date=YYYY-MM-DD` displays the selected day's occupied intervals.
Its database selection omits user identity, topic, and admin notes.

Database setup remains with Folk: migrations, exclusion constraint, and seeds
from the proposal must be applied before connecting a shared database.

## Room actions

`createRoom(input)`, `updateRoom(id, input)`, and `deleteRoom(id)` return
`{ success, message, fieldErrors? }`. Room input is `{ name, location, capacity,
imageUrl, isActive, equipmentIds }`. IDs come from Equipment rows. Images are
optional HTTPS URLs without embedded credentials, loaded directly by the browser;
the server never fetches arbitrary admin image URLs.

Each mutation checks the current session, then rechecks the actor's current DB
role inside a serializable transaction. Equipment assignments change atomically
with room fields. Unknown equipment fails rather than silently removing fields.
Capacity cannot drop below an active booking's attendee count. Serialization
conflicts retry up to three times. History-bearing rooms are disabled on delete;
rooms with zero bookings are deleted. A concurrent FK conflict returns a retry
message, preserving the new booking.

`createEquipment(name)` prevents duplicate names (case insensitive);
`deleteEquipment(id)` only removes equipment unused by all rooms. Room and
equipment changes invalidate public, booking, calendar, and admin views.
