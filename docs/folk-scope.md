# Folk — Database, Auth & Core Logic

Source: Section 7 of `Readme.md` (682110193 ศรัณย์ กระจ่างแก้ว).

## Delivery order

- [x] 1. Prisma schema and the init migration (`prisma/migrations/20261010000000_init/migration.sql`) with the hand-written `CHECK` constraints and the `no_overlapping_bookings` exclusion constraint.
- [x] 2. Seed data (`scripts/seed-database.mjs`, `npm run db:seed`): rooms, equipment, sample users and one admin. Passwords come from `SEED_USER_PASSWORD` / `SEED_ADMIN_PASSWORD`; a non-local database refuses to seed without them.
- [x] 3. Session (`src/lib/auth/session.ts`, `src/lib/session-token.ts`): HS256 JWT in an HttpOnly cookie, valid for 7 days. The token carries only the user id; name, email and role are re-read from the database on every request.
- [x] 4. Guards (`src/lib/auth/guards.ts`): `requireUser`, `requireAdmin` for pages and `getAdminOrNull` for Server Actions and Route Handlers. `safeNextPath` (`src/lib/auth/redirect.ts`) keeps `?next=` on the same site.
- [x] 5. Membership Server Actions (`src/actions/auth.ts`): `registerUser` (always role `USER`, bcrypt cost 12), `loginUser` (5 failures per 15 minutes per email, constant-time for unknown emails) and `logoutUser`.
- [x] 6. `/register` and `/login` with React Hook Form + Zod (`src/components/auth-forms.tsx`, `src/schemas/auth.ts`).
- [x] 7. `AuthContext` (`src/context/AuthContext.tsx`) fed from the server session in `src/app/layout.tsx`.
- [x] 8. Shared booking conditions (`src/lib/booking-rules.ts`) and the query schema (`src/schemas/booking-query.ts`).
- [x] 9. Route Handler `GET /api/bookings` (`src/app/api/bookings/route.ts`): verifies the session, validates `start` / `end` / `roomId` / `status`, masks other people's bookings (`src/lib/booking-visibility.ts`) and answers with `Cache-Control: no-store`. The calendar calls it for every visible range.
- [x] 10. `/admin/users` with `updateUserRole` (`src/actions/users.ts`) and `/admin/reports` (`src/lib/reports.ts`): utilisation, most booked rooms and popular hours for a date range kept in the URL.
- [x] 11. Deployment guide (`docs/deploy.md`).

## Ownership boundaries

- **Folk:** Database migrations, seeds, authentication, session issuance, AuthContext, booking validation rules, the bookings API, user administration, reports, deployment.
- **Gun:** Responsive shell, design tokens, navigation, `/`, `/rooms`, `/rooms/[id]`, `/profile`, `/admin/rooms`.
- **Jeff:** Booking schema, booking actions, booking form, FullCalendar, my bookings, admin bookings, email notification service.

## Verification

- `npm test`: 55 passing tests, including `tests/auth.test.mjs`, `tests/booking-rules.test.mjs`, `tests/migration-constraint.test.mjs`, `tests/profile-session.test.mjs` and `tests/reports.test.mjs`.
- `npm run test:e2e`: 19 passing tests; guards and forged-role handling are covered in `tests/e2e/rooms.spec.ts` and `tests/e2e/bookings.spec.ts`.
- `npm run lint`, `npm run typecheck`, `npm run db:validate` and `npm run build` pass.

## Known limits

- The session is a stateless JWT: logout clears the cookie but cannot revoke a copied token before it expires.
- The login throttle is kept in memory per server instance.
- The e2e database (`tests/support/test-db.mjs`) is built from `schema.prisma`, so it does not contain the exclusion constraint; that constraint is tested separately in `tests/migration-constraint.test.mjs`.
