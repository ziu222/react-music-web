# Melodies

Melodies is a Spotify-inspired dark music web app built with React and Vite. It is currently a frontend-only listener experience using local JavaScript data for songs, playlists, albums, artists, authentication preview state, and local library state.

The app is designed as a real product surface, not a landing page: top navigation, collapsible library sidebar, searchable catalog, artist and album pages, queue-aware player, playlist save flows, and a persistent bottom player.

## Current Scope

- Listener home with discovery shelves, quick picks, popular albums, artists, and recently played content.
- Search with top result, grouped songs/artists/albums/playlists, and genre browsing.
- Artist detail pages with popular tracks, follow state, albums/singles, and all songs.
- Album detail pages with save state, track list, artist navigation, and more-from-artist shelf.
- Library with playlists, albums, followed artists, saved albums, recent plays, local playlist editing, track search, and track sort.
- Bottom player with playback controls, progress, volume, shuffle/repeat, queue panel, recently played panel, lyrics/expanded player surfaces, and Spotify-like save-to-playlist popover.
- Auth gate and auth preview modals for listener actions that require login.
- In-app back/forward navigation with state restore for search, library filters, playlists, artists, and albums.

## Design Direction

The canonical design brief is [DESIGN.md](./DESIGN.md).

Core rules:

- App shell stays dark and restrained: `#0f0c0c`, `#181818`, `#1f1f1f`, `#282828`.
- Primary Melodies accent is warm orange: `#f97316`.
- Spotify green `#1ed760` is reserved for play/save affordances where Spotify-like behavior is expected.
- Liked/heart state uses rose.
- Album art and artist imagery may carry color, but page backgrounds should not inherit strong artwork colors.
- Use dense product UI patterns over marketing layout.
- Use icon components instead of Unicode glyphs for actionable controls.

Theme tokens live in [src/constants/theme.js](./src/constants/theme.js).

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4
- Font Awesome React icons
- Lucide React for selected player/save popover icons
- Framer Motion dependency available for motion work

## Data

Local data is stored under [src/data](./src/data):

- `songs.js`: song metadata, duration, plays, genre, artist, album, cover/audio references.
- `playlists.js`: seeded playlists.
- `derived.js`: derived album/artist helpers and formatting.
- `media.js`: cover and artist image resolution.

Albums and artists are derived from song metadata. Standalone singles should use the song title as their album value.

## Development

Install dependencies:

```bash
npm install
```

Start local development:

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

Build production bundle:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## QA Checklist

Before closing a listener/player phase:

- `npm run lint` passes.
- `npm run build` passes.
- Localhost responds successfully.
- Player controls still work after navigation.
- Queue selection does not rebuild the existing queue unexpectedly.
- Search, artist, album, and library navigation restore correctly with back/forward.
- Save-to-playlist popover can add/remove Liked Songs and user playlists.
- Library tabs do not reset unrelated sidebar search/sort state unexpectedly.
- Artist/album/library hero backgrounds remain neutral dark and do not inherit strong artwork colors.
- Hover-only buttons are not keyboard-focusable while hidden.

## Recent Listener Phase Notes

Recent updates closed the listener foundation phase:

- Added artist and album detail pages.
- Added grouped search and top result card.
- Added saved albums and followed artists.
- Added playlist editing permission rules.
- Polished save-to-playlist popover.
- Added in-app history stack.
- Replaced actionable Unicode glyphs with icon components on listener surfaces.
- Aligned listener colors with the Melodies design brief.
- Neutralized entity and playlist hero backgrounds so artwork color does not override the app theme.

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
