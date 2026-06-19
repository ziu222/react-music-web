# Melodies Design Brief for Stitch

## Product Summary

Melodies is a Spotify-inspired dark music web app for browsing songs, playlists, albums, artists, and a personal library. The interface should feel like a real music player, not a marketing landing page. The first screen is the usable app: top navigation, collapsible library sidebar, main content, and bottom player.

The app is frontend-only. Data comes from local JavaScript files:

- `src/data/songs.js`: song metadata, cover source lookup, artist, album, genre, duration, plays.
- `src/data/playlists.js`: seeded playlists with `songIds`.
- Local playlists can be created and stored locally.

Design direction: dark, dense, content-first, music-product UI. Album art and playlist covers provide most of the color. The shell should stay restrained.

## Core Layout

### App Frame

- Full viewport app shell.
- Top navbar height: about `60px`.
- Main body: horizontal split between sidebar and page content.
- Bottom player: persistent music control bar.
- Background: near black, not pure black.
- No landing hero, no marketing page, no explanatory blocks.

### Top Navbar

Elements from left to right:

1. Circular Melodies logo image.
2. Round home button.
3. Search input pill with search icon.
4. Right-side links/actions such as Premium, support/settings, signup/login.

Rules:

- Search is a dark rounded pill.
- Active home state uses warm orange accent.
- Keep nav compact and utility-focused.
- Logo should use the custom asset, not the old letter `M` placeholder.

### Left Sidebar

The sidebar is the main library surface.

States:

- Collapsed rail: narrow, icon-only shortcuts.
- Expanded panel: full library controls and playlist list.

Expanded sidebar sections:

1. Header row: library icon/title, create button.
2. Filter pills: Playlists, Album, Artists.
3. Search/sort row.
4. View mode switcher inside sort dropdown.
5. Scrollable library list.
6. Footer links/language button.

Important behavior:

- Sidebar scroll is independent from main content.
- The scrollbar belongs only to the playlist list area.
- When sidebar collapses, the playlist scrollbar must disappear with the panel.
- Header/filter/search/sort should not scroll with playlist items.
- Footer must not cover playlist content.

## Visual Language

### Color Palette

Base:

- App background: `#0f0c0c` to `#121212`.
- Sidebar/card surface: `#121212`, `#181818`, `#1f1f1f`.
- Elevated menu: `#282828`.
- Hover surface: `rgba(255,255,255,0.06)` to `rgba(255,255,255,0.12)`.
- Border/divider: `rgba(255,255,255,0.08)` to `rgba(255,255,255,0.14)`.

Accent:

- Primary app accent: warm orange (`#f97316`) for Melodies brand actions.
- Spotify-like play green: `#1ed760` only for play buttons inside playlist/card contexts.
- Liked/heart accent: rose/pink.

Text:

- Primary: off-white `#ede5dd` or `#ffffff`.
- Secondary: `rgba(255,255,255,0.55)` / `#b3b3b3`.
- Tertiary: `rgba(255,255,255,0.35)`.

### Typography

Use a compact product UI typography system:

- Font stack: `Be Vietnam Pro`, `Noto Sans`, system sans-serif.
- Section title: 20-24px, 600-700.
- Card title: 13-15px, 600.
- Track title: 13px, 600.
- Metadata: 11-12px, regular/medium.
- Controls: 11-13px, medium/semibold.

Rules:

- Do not use oversized marketing typography.
- No negative letter spacing.
- Text must truncate cleanly in cards and rows.
- Vietnamese labels must fit without overflow.

### Shape and Elevation

- App cards: 6-8px radius.
- Album/playlist art: 5-8px radius.
- Pills: 9999px radius.
- Circular play buttons: 50% radius.
- Context menus/dropdowns: 7-8px radius.
- Elevated menus use heavy dark shadow: `rgba(0,0,0,0.6) 0px 16px 48px`.

## Main Screens

### Home

Home is a scrollable discovery page with horizontal shelves.

Sections:

- Trending songs.
- Made for you.
- Top US-UK.
- V-Pop highlights.
- Popular albums.
- Popular artists.
- Recently played.

Cards:

- Song cards show cover art, title, artist.
- Album cards group songs by `song.album`.
- Artist cards use circular/rounded artist image.
- Hover reveals play button with fade/slide/scale.

Important data rule:

- Album data is derived from `song.album`.
- If a song is a single and does not belong to a real album, its `album` value should be the song title.
- Do not show fake albums like generic artist names or unrelated tour names.

### Search

Search page supports:

- Query search by title, artist, album.
- Genre filter chips.
- Track results as rows.

Design:

- Dense list layout.
- Genre chips can be colorful but restrained.
- No oversized search landing page.

### Library Page

Library page has a two-column layout:

Left:

- Library title.
- Filter pills: Playlists, Album, Artists.
- Playlist cards/list.

Right:

- Selected playlist detail.
- Large playlist cover collage.
- Playlist metadata and track count.
- Action row with play button.
- Track toolbar with search and sort dropdown.
- Track table.

Track toolbar:

- Search icon toggles inline search input.
- Sort dropdown label starts as `Custom order`.
- Sort options: Custom order, Title, Artist, Album, Date added, Duration.
- Track search/sort applies only to songs inside the selected playlist, not the sidebar library filter.

Track table columns:

- Number/play indicator.
- Title + artist + thumbnail.
- Album.
- Date added.
- Duration.
- Like button.

Empty states:

- Liked Songs with no liked tracks: show empty liked message.
- New local playlist: show empty playlist message.
- Album/Artist library tabs may show empty state until real data exists.

## Sidebar Detail

### View Modes

Sidebar library supports four view modes:

1. Compact: text-only rows.
2. List: cover + title + subtitle.
3. Grid: square image tiles.
4. Card: 2-column card with image, title, metadata.

View mode control:

- Lives inside the sort dropdown under "View as".
- Segmented switcher with sliding active indicator.
- Icons only, with title/tooltips.
- Indicator animates horizontally.

### Filter Pills

Filters:

- Playlists.
- Album.
- Artists.

Behavior:

- Filter pills only filter library item types.
- Do not use this filter to sort or filter songs inside a playlist.
- Active pill background should slide/morph between tabs.
- Changing filter should not reset search/sort state unexpectedly.

### Sort Dropdown

Sort options:

- Recents.
- Recently added.
- Alphabetical.
- Creator.

Dropdown behavior:

- Opens near trigger.
- Uses fade + slide + subtle scale.
- Click outside closes.
- Create menu and sort menu close each other.

### Playlist Cards and Hover Play

In grid/card view:

- Hovering a playlist card brightens the surface slightly.
- A green circular play button appears at lower-right of cover.
- Animation: opacity `0 -> 1`, translateY `6px -> 0`, scale `0.92 -> 1`.
- Mouse leave reverses animation.
- Clicking play should not select/open the playlist unless intended.
- Empty playlists should not crash.

### Right-Click Context Menu

Right-clicking a playlist/card opens a custom menu near the cursor.

Menu visual:

- Background: `#282828`.
- Width around 298px.
- Radius: 7-8px.
- Heavy shadow.
- Items: 36px height.
- FontAwesome-style icons, not text glyph placeholders.
- Disabled items are muted.
- Divider lines separate groups.
- Hover row background: `rgba(255,255,255,0.1)`.

Menu items:

- Add to queue.
- Add to profile.
- Edit details.
- Delete.
- Download (disabled if unsupported).
- Create playlist.
- Create folder.
- Make private.
- Invite collaborators.
- Exclude from your taste profile.
- Move to folder > submenu.
- Add to other playlist > submenu.
- Pin/Unpin playlist.
- Share > submenu.

Submenu behavior:

- Opens on hover.
- Appears to the right.
- Flips left if near viewport edge.
- Closes on outside click or Escape.

## Playlist Data Rules

Seed playlists:

- Each default playlist must have its own `songIds`.
- Do not use `list.slice(0, 8)` for all playlists.
- Avoid duplicate songs across seeded playlists where possible.
- Liked Songs uses `likedIds`, not `songIds`.
- User-created local playlists start empty.

Playlist examples:

- Sunset Lounge: relaxed pop, R&B, indie, soft rock.
- Chill Vibes: ballad, acoustic, mellow, lower energy.
- V-Pop Hits: Vietnamese pop hits.
- Tam Trang: emotional ballads and sad songs.

Helper logic:

- If playlist is Liked Songs: show liked songs.
- If playlist id is local string: show empty.
- If playlist has `songIds`: map ids to songs.
- No fallback to random global songs.

## Album Data Rules

Album is currently a field on each song, not a separate `albums.js` collection.

Rules:

- If a song belongs to a real album, set `album` to the real album title.
- If a song is a standalone single/MV, set `album` to the song title.
- Do not assign unrelated albums just to group content.
- Do not use tour names unless the track is specifically from a live/tour release.

Album section:

- Home album shelf groups songs by `song.album`.
- Representative cover is the most-played song in that album group.
- Album tab in library can later be powered by this grouping or by a future album collection.

## Bottom Player

Player is persistent at the bottom.

Elements:

- Current song artwork/title/artist.
- Like button.
- Center playback controls.
- Progress bar and time.
- Right-side utility controls.

Behavior:

- Shows current song when playing.
- Progress updates over time.
- Play/pause button toggles state.
- Keep controls compact and aligned.

## Animation Rules

Use subtle product animations:

- Page transition: slide/fade up around 250-300ms.
- Dropdown: `menuIn`, fade + translateY(-6px) + scale(0.96 -> 1), 140-170ms.
- Hover card: background 150ms.
- Play button reveal: opacity + translateY + scale, 180-220ms.
- Sidebar width transition: 220-280ms cubic-bezier.
- Active filter pill: left/width transition around 180ms.
- View switcher indicator: transform 180-220ms.
- Discovery SongCard hover: coral glow ring added to base shadow — `0 0 0 6px color-mix(in srgb, #f97316 22%, transparent)`; transition `box-shadow 150ms, background 150ms, transform 200ms`. Coral only — do not tint the green/white play buttons. Respect `prefers-reduced-motion`.

Avoid:

- Large bouncy motion.
- Marketing-style reveal animations.
- Layout-shifting hover states.
- Long transitions over 300ms for common controls.

## Plan Badges & SongCard

Plan badge chip (navbar + profile):

- Shared chip sizing: `fontSize: 9`, `fontWeight: 800`, uppercase, `letterSpacing: 0.5`, `borderRadius: 9999`, `padding: "2px 8px"`.
- Premium: gradient `linear-gradient(90deg, ${C[600]}, ${G[500]})` (token `--grad-premium` if available), white text, crown icon.
- Free: `var(--overlay-2)` background, `var(--text-mid)` text, no crown, no border.
- Keep existing Vietnamese copy (`Premium` / `Free`).

Discovery SongCard (`Card.jsx`):

- Title may wrap to **2 lines** then ellipsis (`-webkit-box` + `WebkitLineClamp: 2`, `lineHeight: 1.4`, reserve `minHeight: calc(13px * 1.4 * 2)` to avoid layout shift). Keep `fontSize: 13`, `fontWeight: 600`.
- Artist subtitle stays single-line ellipsis. `TrackRow` is unchanged.

## Component Architecture

### Primitives (`src/components/primitives/`)
UI atoms with CSS Modules — no logic, no data fetching.

- **Badge** — chip with `variant="premium"` (gradient) or `variant="free"` (neutral flat).
- **PlanBadge** — wraps Badge with a `premium` boolean. Premium shows crown icon + gradient; Free is plain neutral chip with no crown, no border, no gradient.
- **PlayButton** — circular play/pause button. `variant="coral"` default. Hover adds `--glow-coral-play` ring. `tabIndex=-1` by default (overlay role inside a focusable card).

### Music Components (`src/components/music/`)
Domain components for music content.

- **SongCard** — discovery shelf card. Uses `PlayButton` internally. Title clamps 2 lines.
- **TrackRow** / **TrackList** — dense list view. Single-line title only — do NOT apply 2-line clamp to rows.

### Layout Helpers (`src/components/layout/`)
Shell/structure — no music domain knowledge.

- **HorizontalShelf** — scrollable row with arrow buttons. Relies on `.hscroll` + `.hs-arrow` global utilities.

### Component Rules
- **Plan badge** is the only gradient UI element across the app.
- **Free badge**: neutral `var(--overlay-2)` bg, `var(--text-mid)` text, no crown, no border.
- **SongCard title** clamps to 2 lines then ellipsis (`-webkit-line-clamp: 2`, `lineHeight 1.4`, `minHeight` reserves 2 lines to prevent layout shift).
- **TrackRow title** stays single-line ellipsis — do not apply 2-line clamp to list views.
- **Coral PlayButton** hover adds `--glow-coral-play` ring. Green/white play buttons (player bar) are unchanged.
- **Inline styles** only for dynamic values (width prop, playing-state color, `song.bg` fallback). Static visual style belongs in the CSS Module.

## Scrollbar Rules

Sidebar:

- Playlist list scrolls independently.
- Header/filter/search/sort stay fixed.
- Footer stays visible but must not cover content.
- Scrollbar is slim and dark.
- Scrollbar is subtle by default and clearer on hover.
- When sidebar collapses, scrollbar is hidden.

Main content:

- Main page scroll is independent from sidebar.
- Horizontal shelves hide scrollbar visually where possible.

## Accessibility and Interaction

- Buttons need clear hover and active states.
- Icon-only buttons need `title` or `aria-label`.
- Click targets should be at least 32px where possible.
- Menus close on outside click and Escape.
- Text truncates instead of wrapping awkwardly inside cards.
- Keyboard focus should not be invisible on inputs/buttons.

## Do Not Do

- Do not create a landing page.
- Do not use pastel/light backgrounds for the main app shell.
- Do not replace dense app UI with decorative cards.
- Do not use fake album data.
- Do not make every playlist show the same songs.
- Do not let sidebar scrollbar stay visible when collapsed.
- Do not use Unicode text glyphs as context menu icons when icon library is available.
- Do not use `libraryFilter` to filter playlist tracks.
- Do not add backend requirements.

## Stitch Output Target

Generate a polished dark music app UI matching the Melodies app structure:

- Top navbar.
- Collapsible library sidebar.
- Home discovery shelves.
- Search results.
- Library playlist detail with track table.
- Bottom player.

Prioritize realistic product behavior and dense Spotify-like ergonomics over decorative presentation.
