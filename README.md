# MediTime

A medicine reminder app. Add medicines with one or more daily alarm times, get local
notifications when it's time to take them, and track adherence over time. Admins get an
in-app dashboard with registered-user counts and usage stats.

**Stack:** TypeScript everywhere · Express + Prisma ORM + Neon Postgres (API, with
rate limiting) · Better Auth (email/password + Google OAuth + roles) · Expo Router
(mobile app, iOS/Android/web) · Redux Toolkit + RTK Query (client state/data layer) ·
`expo-notifications` for local reminders · Reanimated + Haptics for feel.

## Project layout

```
apps/
  api/     Express API — auth, medicines, logs, admin stats
  mobile/  Expo Router app — the actual MediTime app
packages/
  shared/  Zod schemas + types shared by both
```

## Prerequisites

- **Node.js 20.19.4+** (or 22.13+ / 24.3+) recommended — Metro's own `package.json`
  declares this minimum. In practice `npm install` / `expo export` have worked fine on
  20.11.1 too, but if `npx expo start` behaves oddly, upgrade Node first.
- A free [Neon](https://neon.tech) Postgres project.
- The [Expo Go](https://expo.dev/go) app on your phone, or an Android/iOS simulator.

## 1. Install

```bash
npm install
```

(Installs all three workspaces — `apps/api`, `apps/mobile`, `packages/shared` — from the
repo root.)

## 2. Configure the API

```bash
cp apps/api/.env.example apps/api/.env
```

Fill in:
- `DATABASE_URL` — from your Neon project dashboard (Connection Details → the **direct**
  `postgresql://...` string, hostname without `-pooler`). Just this one — no separate
  pooled/direct pair needed, since this app is a single long-running server, not
  serverless functions.
- `BETTER_AUTH_SECRET` — generate one with `npx @better-auth/cli secret`.
- `BETTER_AUTH_URL` — `http://localhost:3000` for local dev.
- `CORS_ORIGIN` — leave the default; it already whitelists the Expo dev origin and the
  app's `meditime://` scheme (dev-mode `exp://` origins are also allowed automatically).
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — optional. Leave both unset and the app
  just won't show the "Continue with Google" button. To enable it: Google Cloud Console →
  APIs & Services → Credentials → Create OAuth client ID (type: Web application) → add
  an Authorized redirect URI of `{BETTER_AUTH_URL}/api/auth/callback/google` (e.g.
  `http://localhost:3000/api/auth/callback/google`).

Push the schema to your Neon database:

```bash
npm run db:migrate --workspace apps/api
```

Start the API:

```bash
npm run dev:api
```

It should print `MediTime API listening on http://localhost:3000`.

## 3. Configure the mobile app

```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Set `EXPO_PUBLIC_API_URL`:
- Simulator or **web** (`npm run dev:mobile` then press `w`): use `http://localhost:3000`.
  This also matters for auth — Better Auth's session cookie is `SameSite=Lax`, so on web
  it's only sent back to the API if browser and API share the same host. Using the LAN IP
  for the API while the web page is on `localhost` breaks login with no obvious error.
- Physical device / Expo Go: use your computer's **LAN IP** instead, e.g.
  `http://192.168.1.23:3000` (the phone can't reach `localhost` on your laptop). Also add
  that IP to `CORS_ORIGIN` in `apps/api/.env`. Note this IP can change (DHCP) — if the app
  suddenly can't reach the API, check `ipconfig`/`ifconfig` for a new address first.
- This value is baked into the bundle at Metro startup, so **restart `dev:mobile`** after
  changing it — it won't hot-reload.

Start the app:

```bash
npm run dev:mobile
```

Scan the QR code with Expo Go, or press `a`/`i` for a simulator.

## 4. Create your first admin

Everyone who signs up starts as a regular `user`. To promote yourself to `admin` after
your first sign-up:

```bash
npm run db:studio --workspace apps/api
```

This opens Prisma Studio in the browser — open the `User` table, find your row, and
change `role` from `user` to `admin`. Sign out and back in (or just relaunch the app) and
an **Admin** tab appears, from which you can promote/ban other users going forward.

### Or: seed demo accounts instead

```bash
npm run db:seed --workspace apps/api
```

Creates (or updates) two accounts directly in the database, already hashed the way Better
Auth expects, so they sign in immediately — no promotion step needed:
- `user@gmail.com` / `12345` (role: `user`)
- `admin@gmail.com` / `12345` (role: `admin`)

These passwords deliberately bypass the app's own 8-character minimum, which is only
enforced at the public sign-up API — fine for local dev/demo, not something to do for a
real account. See `apps/api/prisma/seed.ts`.

## What's implemented

- Email/password **and** Google OAuth sign-in (Better Auth), session-gated navigation via
  Expo Router's `Stack.Protected` / `Tabs.Protected`. No email verification or
  password-reset emails are sent — there's no email provider wired up, so sign-up/sign-in
  complete immediately without a "check your inbox" step.
- **User**: Today screen (mark doses taken/skipped), add/edit/pause/delete medicines with
  multiple reminder times + day-of-week repeats, local push reminders, 30-day adherence
  history, profile.
- **Admin**: total/new users, active/total medicines, overall adherence, recently-joined
  list, and a user management screen (search, promote/demote admin, ban/unban) built on
  Better Auth's `admin` plugin.
- **Notification sounds**: admins upload "default" sounds (visible to everyone); any user
  can also upload their own (max 10MB, `apps/api/src/lib/uploads.ts`), then pick one per
  medicine in the sound picker on the add/edit screen. Important caveat: neither iOS nor
  Android lets an app register a runtime-uploaded file as the actual OS notification
  sound — both require it bundled into the binary at build time. So the chosen sound
  plays as a **looping in-app alarm** (`useDoseAlarm`, polling every 20s while the app is
  open) for as long as a dose is due; the real background/OS-level local notification
  always uses the platform default sound. Files live on local disk
  (`apps/api/uploads/sounds/`, gitignored) — fine for local dev, but swap for real object
  storage (S3/R2/etc.) before deploying anywhere without a persistent disk.
- **Loud, alarm-like background reminders** (`apps/mobile/src/lib/notifications.ts`): on
  Android, the reminder channel is configured with `audioAttributes.usage = ALARM` and
  `bypassDnd: true` — real capabilities `expo-notifications` exposes directly, no custom
  native module or EAS dev-client build needed. That routes the sound through the phone's
  dedicated **Alarm volume** slider (the one people rarely mute, unlike Notification
  volume) and lets it ring through Do Not Disturb once the user grants DND-access from
  Profile → "Ring through Do Not Disturb". iOS has no equivalent third-party alarm-volume
  API from Apple, so notifications set `interruptionLevel: 'timeSensitive'` as the closest
  available lever — it only takes effect in a real custom build with the Time Sensitive
  Notifications capability enabled, not under Expo Go.
- Rate limiting on the API: a strict limiter on `/api/auth/*` (20 req/15min per IP, slows
  down credential stuffing), a general limiter on the rest of `/api` (120 req/min), and a
  tighter one on `/api/sounds` (30 uploads/hour) given file uploads are heavier.
- Smoother/faster UI: spring press animations + haptics on every tappable surface,
  skeleton loaders instead of "Loading…" text, `FlatList`/`SectionList` (virtualized,
  not `.map()` in a `ScrollView`) for medicines/history/admin-users, staggered list-item
  entrance animations, and toast feedback (via Redux) on save/delete/dose actions.

## State management

`apps/mobile/src/store/` holds the Redux Toolkit store:
- `api.ts` — a single RTK Query slice (`createApi`) that owns every server request
  (medicines, logs, admin stats), including cache invalidation and — via
  `onQueryStarted` — side effects like (re)scheduling local notifications after a
  medicine is saved and firing the toast on success/failure.
- `uiSlice.ts` — small cross-cutting UI state (currently just the toast queue).
- `hooks.ts` — typed `useAppDispatch`/`useAppSelector`.

Screens don't call the RTK Query hooks directly; `src/hooks/use-medicines.ts`,
`use-logs.ts`, `use-admin-stats.ts`, and `use-sounds.ts` wrap them behind the same shape
screens already used (`{ data, isLoading, refetch }`, `{ mutate, mutateAsync, isPending }`),
so if you add a new field or endpoint, extend `store/api.ts` first and the screens mostly
don't change. `use-dose-alarm.ts` and `use-preview-player.ts` are the two places that talk
to `expo-audio` directly (looping in-app alarm, and tap-to-preview in the sound pickers).

## Notes & next steps

- **Performance**: `useDoseAlarm` (mounted app-wide for the sound-alarm feature) used to poll
  medicines + logs every 20s regardless of screen or whether it was even possible for an
  alarm to fire — that's real, continuous background work behind every screen in the app.
  It now stays fully idle unless at least one active medicine actually has a sound
  assigned, and only then polls (at 30s) the same shared query other screens already use.
  `DoseRow`/`MedicineCard`/`StatTile` are memoized and their list entrance-animation delay
  is capped, and the three `FlatList`/`SectionList` screens (Medicines, History, Admin
  Users) got standard virtualization tuning (`removeClippedSubviews`,
  `maxToRenderPerBatch`, `windowSize`). One thing no code change fixes: a lot of perceived
  slowness testing through Expo Go is **dev-mode overhead** (unminified JS, dev-mode React,
  live-reload bookkeeping) — a real EAS production build will feel meaningfully snappier
  than anything in Expo Go, dev client or not.
- The app targets **Expo SDK 54** specifically (not the latest SDK) because Expo Go's
  Play Store build on many devices hasn't caught up past SDK 54 yet — check your installed
  Expo Go version (long-press its icon → App info) before bumping the SDK, or you'll get
  an "Incompatible SDK version" error with no other symptoms.
- The database layer is Prisma: `apps/api/prisma/schema.prisma` is the source of truth,
  `npm run db:generate --workspace apps/api` (aliased to `prisma generate`, also runs
  automatically on `npm install`) regenerates the client after a schema edit, and
  `npm run db:migrate --workspace apps/api` (aliased to `prisma migrate dev`) creates and
  applies a migration.
- Email verification and password-reset emails are intentionally not implemented — no
  email-sending provider is configured, and `requireEmailVerification` is explicitly
  `false` in `apps/api/src/auth.ts`. If you add real email sending later, that's the file
  to revisit.
- Notifications are scheduled **on-device** (no server push infra needed), so they work
  offline; they're rescheduled automatically whenever a medicine is created/edited/deleted.
- App icon/splash currently use the default Expo placeholder art
  (`apps/mobile/assets/images/`) — swap those files for real MediTime branding whenever
  you're ready.
- `packages/shared` holds the Zod validation + TypeScript types both apps import from —
  extend it there first when adding fields so client and server stay in sync.
- If you deploy the API behind a reverse proxy/load balancer, set `TRUST_PROXY` in
  `apps/api/.env` (see the comment in `.env.example`) so rate limiting keys off the real
  client IP instead of the proxy's.
