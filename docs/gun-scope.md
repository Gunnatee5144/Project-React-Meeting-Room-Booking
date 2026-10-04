# Gun — Frontend UI & Room Management

Source: section 7 of `Readme.md` on branch `Gun` after the responsibility swap.

## Delivery order

1. Responsive application shell, navigation, design tokens, reusable UI, and `/`.
2. Server-rendered `/rooms`, URL search filters, equipment and availability queries.
3. `/rooms/[id]`, room information and a privacy-safe booking schedule.
4. Protected `/profile` and `updateProfile` with React Hook Form and Zod.
5. Protected `/admin/rooms`, equipment selection, image URLs, `createRoom`,
   `updateRoom`, and history-preserving `deleteRoom`.
6. Validation, integration documentation, and final verification.

Each finished stage is committed and pushed to `Gun`.

## Ownership boundaries

Folk owns migrations, seeds, authentication, session issuance, AuthContext,
booking validation, the bookings API, admin users, and reports. Jeff owns booking
actions, booking forms, calendar, booking history, reviews, and email.

Gun owns profile and room actions. Shared schema and authentication integration
changes must remain small and documented. No seed data is presented as real
availability. Every mutation verifies server identity, never client context.

## Visual direction

An everyday campus booking tool, with clear Thai copy and a room-plan motif.
Ink `#163b40`, teal `#116b66`, mint `#e9f3ef`, paper `#f7f9f8`, white `#ffffff`,
muted text `#526568`. Thai-capable system sans type and monospace room labels.
Opaque surfaces suit the campus workflow better than the design search's glass
effects and hospitality typography. The floor plan is an illustration, not live
availability.

## Verification

Lint, TypeScript, Prisma validation, production build, focused behavioral tests,
desktop/mobile visual checks, keyboard navigation, loading/empty/error states.
