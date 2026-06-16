# Melodies

Melodies is a Spotify-inspired music web app built with React and Vite. It is a product-style application surface with listener playback, personal library state, profile/settings flows, an artist studio, and an admin console.

The app can run in a localStorage-first mode for UI development. When Supabase environment variables are present, it also syncs auth, catalog, library, notifications, artist submissions, upgrade requests, and approved community songs.

## Product Scope

- Listener app with home discovery shelves, search, artist pages, album pages, library browsing, profile, settings, notifications, and support.
- Playback experience with persistent bottom player, queue management, shuffle/repeat, progress seeking, volume/mute, lyrics, expanded player, recent plays, and save-to-playlist flows.
- Library features for liked songs, playlists, saved albums, followed artists, recent plays, local playlist edits, filtering, sorting, and view modes.
- Authentication gates for listener actions that require a signed-in user.
- Premium entitlement preview for ad-free/high-quality/offline-style affordances.
- Artist upgrade request flow from listener profile/support surfaces.
- Artist Studio for overview, analytics, song submission, draft editing, submitted-song status, and artist profile customization.
- Admin Console for dashboard metrics, user management, artist/song review, catalog moderation, broadcast notifications, audit history, and impersonation.
- In-app navigation history with back/forward restore across search, library, playlist, artist, album, and profile pages.

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4 through `@tailwindcss/vite`
- Supabase JS 2
- Font Awesome React icons
- Lucide React icons
- Framer Motion dependency available for motion work


## Architecture

Key directories:

- `src/App.jsx`: main app shell, routing state, playback state, auth/session wiring, Supabase hydration, and modal orchestration.
- `src/pages/`: listener pages plus admin and artist console pages.
- `src/components/`: reusable UI, navigation, player, console, and modal components.
- `src/data/`: seeded playlists/media helpers and local static data.
- `src/lib/supabase/`: Supabase client, catalog fetch, realtime subscriptions, storage upload, and library sync.
- `src/lib/music/`: playback-adjacent persistence such as play logs, lyrics, media blobs, and song overrides.
- `src/lib/user/`: user settings, admin overrides, and audit logging.
- `src/lib/artist/`: artist profile, submissions, stats, and upgrade requests.
- `src/lib/social/`: notifications and follower indexing.
- `src/constants/theme.js`: shared color/theme constants.

Design notes live in [DESIGN.md](./DESIGN.md) and [DESIGN_STITCH.md](./DESIGN_STITCH.md).

## Data And Persistence

Melodies uses layered persistence:

- `localStorage` is the offline/dev fallback for sessions, likes, playlists, follows, saved albums, notifications, settings, artist drafts, submissions, media blobs, admin overrides, and audit logs.
- Supabase Auth is used when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured.
- Supabase tables used by the app include `users`, `songs`, `user_library`, `submissions`, `notifications`, and `upgrade_requests`.
- Supabase Storage buckets used for artist uploads are `artist-audio` and `artist-covers`.
- Supabase realtime subscriptions update notifications and newly inserted community songs.

If Supabase is not configured, the app logs a warning and continues in localStorage-only mode. Some catalog-backed screens may be empty until a Supabase `songs` table is available.

## Environment

Create `.env.local` for local Supabase-backed development:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit `.env`, `.env.local`, production env files, or key material. They are already ignored by `.gitignore`.

## Development

Install dependencies:

```bash
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

Build the production bundle:

```bash
npm run build
```

Preview the production bundle:

```bash
npm run preview
```

## End-To-End Tests

Playwright tests live under `e2e/` when present in the working tree. The Playwright config starts the Vite dev server at `http://localhost:5173`.

Run them from the `e2e` directory:

```bash
npx playwright test
```

The local E2E environment expects test credentials in `e2e/.env.test`:

```bash
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
ARTIST_EMAIL=...
ARTIST_PASSWORD=...
LISTENER_EMAIL=...
LISTENER_PASSWORD=...
```

## QA Checklist

Before closing a change:

- `npm run lint` passes.
- `npm run build` passes.
- Localhost loads successfully.
- Auth/login/logout still restore the expected user state.
- Listener navigation restores correctly with back/forward.
- Player controls still work after navigation.
- Queue selection does not rebuild the current queue unexpectedly.
- Save-to-playlist can add/remove Liked Songs and user playlists.
- Library filters, search, sort, and view mode do not reset unrelated state.
- Artist submissions can be saved as drafts and submitted for review.
- Admin review actions update submission state and approved content as expected.
- Notification and settings changes persist for the active user.
- Entity and playlist hero backgrounds remain neutral dark and do not inherit strong artwork colors.
- Hover-only buttons are not keyboard-focusable while hidden.

## Repository Workflow

The active working branch is usually `nghiaa`.

Recommended close-out after each implementation step:

```bash
npm run lint
npm run build
git status --short --branch
git add <changed-files>
git commit -m "<type(scope): summary>"
git push origin nghiaa
```
