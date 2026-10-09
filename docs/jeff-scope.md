# Jeff — Booking Workflow, Calendar & Email Notifications

Source: Section 7 of `Readme.md` on branch `Jeff` (682110169 ณฤกส ปันด้วง).

## Delivery order

- [x] 1. Booking Zod schema (`src/schemas/booking.ts`) and action types (`src/types/booking-actions.ts`) with strict Bangkok datetime validation, future range, 30-day advance limit, and positive attendee integer constraints.
- [x] 2. Email notification utility (`src/lib/email/mailer.ts`) using Nodemailer with automatic SMTP detection and fallback logger simulation.
- [x] 3. Server Actions for the booking lifecycle (`src/actions/bookings.ts`):
  - `createBooking`: Validates session, checks room status and attendee limits, executes strict overlap conflict detection against `PENDING`/`APPROVED` bookings, and creates booking in `PENDING` state.
  - `updateBooking`: Allows owner to update pending/approved bookings before start time; resets status back to `PENDING` for administrator review.
  - `cancelBooking`: Allows owner to cancel pending/approved bookings at least 1 hour before scheduled start time.
  - `reviewBooking`: Admin-only action to approve or reject booking requests, records admin notes, and triggers email notifications to the requester.
- [x] 4. Server-rendered `/rooms/[id]/book` page with authenticated session check and React Hook Form + Zod Client Component (`src/components/booking-form.tsx`).
- [x] 5. FullCalendar integration on `/calendar` (`src/components/calendar-view.tsx`) using `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, and `@fullcalendar/interaction` with room filters, view switcher, and booking detail modals.
- [x] 6. User booking management on `/my-bookings` (`src/components/my-bookings-manager.tsx`) with status filtering, confirmation download slips, cancel dialog with 1-hour constraint, and edit dialogs.
- [x] 7. Administrator booking review portal on `/admin/bookings` (`src/components/admin-bookings-manager.tsx`) with search, filter tabs, approve modal, and reject modal with required note and automated email delivery.
- [x] 8. Unit test coverage (`tests/booking-schema.test.mjs`, `tests/booking-email.test.mjs`).

## Ownership boundaries

- **Folk:** Database migrations, seeds, authentication, session issuance, AuthContext, user administration, reports.
- **Gun:** Responsive shell, design tokens, navigation, `/`, `/rooms`, `/rooms/[id]`, `/profile`, `/admin/rooms`.
- **Jeff:** Booking schema, booking actions, booking form, FullCalendar, my bookings, admin bookings, email notification service.

## Verification

- `npm test`: 23 passing tests (including 10 new tests for schema validation and email simulation).
- `npm run typecheck`: TypeScript passes with zero errors (`tsc --noEmit`).
- `npm run lint`: ESLint passes with zero warnings (`--max-warnings=0`).
- `npm run build`: Production Next.js Turbopack build succeeds with all dynamic SSR routes.
