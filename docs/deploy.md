# Deploying MEETSYNC

Owner: Database / Auth (Folk). Next.js 16 on Node 24, PostgreSQL 14+ (needs the `btree_gist`
extension, which every managed PostgreSQL offers).

## 1. Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | `postgresql://user:pass@host:port/db?sslmode=require` for managed databases |
| `DATABASE_CA_CERT` | managed DB with private CA | PEM text, newlines as `\n`. Without it a TLS-verifying connection to Aiven fails |
| `SESSION_SECRET` | yes | 32+ random characters. Rotating it signs everyone out |
| `SESSION_COOKIE_NAME` | no | default `session` |
| `SEED_USER_PASSWORD`, `SEED_ADMIN_PASSWORD` | when seeding a non-local DB | never reuse the local defaults |
| `SMTP_*` | for approval e-mails | without them e-mails are only logged |

The session cookie is `HttpOnly`, `SameSite=Lax` and `Secure` in production, so the site must be
served over HTTPS (Vercel, Render and similar do this; plain `http://` with `next start` will not
keep a login).

## 2. Database

```sh
npm run db:deploy      # prisma migrate deploy: applies prisma/migrations (never prompts, never resets)
npm run db:seed        # optional: sample rooms, equipment, users, bookings
```

`db:deploy` creates all tables **and** the hand-written constraints in
`prisma/migrations/20261010000000_init/migration.sql`:

- `no_overlapping_bookings` - exclusion constraint on `Booking`: one room cannot have two
  `PENDING`/`APPROVED` bookings with overlapping time (back-to-back is allowed).
- `CHECK` constraints: end after start, attendee count and room capacity positive.

Do not use `prisma db push`: it skips migrations and so skips these constraints. When changing the
schema later, create a new migration with `npm run db:migrate -- --name <change>` instead of editing
the init migration once it has been applied anywhere shared.

The seed never resets an existing account's email, password or role, so it is safe to re-run.
Seed passwords:

- local database: `password123` (users) and `adminpass123` (admin) unless the variables are set;
- any other database: `SEED_USER_PASSWORD` and `SEED_ADMIN_PASSWORD` are mandatory. Change the
  admin password after first login and use `/admin/users` to promote real admins.

## 3. Build and start

```sh
npm ci
npm run build          # prisma generate + next build
npm start
```

On Vercel set the variables above, use the default build command, and run `npm run db:deploy`
once against the production `DATABASE_URL` (locally or from CI) before the first release and after
each migration. Prefer a separate database for preview deployments.

## 4. Pre-release checklist

- [ ] `npm run lint && npm run typecheck && npm test && npm run build`
- [ ] `SESSION_SECRET` is random, unique per environment, and not in git
- [ ] Seed admin password changed; unused demo users removed or re-passworded
- [ ] Migrations applied (`db:deploy`) and `no_overlapping_bookings` exists:
      `SELECT conname FROM pg_constraint WHERE conname = 'no_overlapping_bookings';`
- [ ] HTTPS enabled; log in, refresh, log out, and visit `/admin/users` as a normal user (expect redirect to `/`)

## 5. Known limits

- The session is a stateless JWT: logging out clears the browser cookie but cannot revoke a copied
  token before it expires (7 days). Role and deleted-account checks are re-read from the database on
  every request, so demotions and deletions take effect immediately.
- The login throttle (5 failures / 15 min per email) is in memory per server instance.
