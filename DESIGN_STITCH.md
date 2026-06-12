---
name: Melodies
colors:
  surface: '#161313'
  surface-dim: '#161313'
  surface-bright: '#3c3838'
  surface-container-lowest: '#100d0d'
  surface-container-low: '#1e1b1b'
  surface-container: '#221f1f'
  surface-container-high: '#2d2929'
  surface-container-highest: '#383434'
  on-surface: '#e9e1e0'
  on-surface-variant: '#e0c0b1'
  inverse-surface: '#e9e1e0'
  inverse-on-surface: '#342f2f'
  outline: '#a78b7d'
  outline-variant: '#584237'
  surface-tint: '#ffb690'
  primary: '#ffb690'
  on-primary: '#552100'
  primary-container: '#f97316'
  on-primary-container: '#582200'
  inverse-primary: '#9d4300'
  secondary: '#3de96f'
  on-secondary: '#003913'
  secondary-container: '#00cc57'
  on-secondary-container: '#004f1d'
  tertiary: '#ffb3b6'
  on-tertiary: '#68001a'
  tertiary-container: '#ff6877'
  on-tertiary-container: '#6b001b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#ffb690'
  on-primary-fixed: '#341100'
  on-primary-fixed-variant: '#783200'
  secondary-fixed: '#69ff89'
  secondary-fixed-dim: '#34e36a'
  on-secondary-fixed: '#002108'
  on-secondary-fixed-variant: '#00531f'
  tertiary-fixed: '#ffdada'
  tertiary-fixed-dim: '#ffb3b6'
  on-tertiary-fixed: '#40000c'
  on-tertiary-fixed-variant: '#920028'
  background: '#161313'
  on-background: '#e9e1e0'
  surface-variant: '#383434'
  surface-sidebar: '#121212'
  surface-card: '#181818'
  surface-elevated: '#282828'
  text-primary: '#ede5dd'
  text-secondary: '#b3b3b3'
  border-subtle: rgba(255,255,255,0.08)

typography:
  section-title:
    fontFamily: Be Vietnam Pro
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: 0px
  card-title:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0px
  track-title:
    fontFamily: Be Vietnam Pro
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0px
  body-metadata:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0px
  label-compact:
    fontFamily: Be Vietnam Pro
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em

rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px

spacing:
  navbar-height: 60px
  sidebar-collapsed: 72px
  sidebar-expanded: 280px
  player-height: 90px
  gutter-dense: 12px
  margin-main: 24px
---

# Melodies Design System (Stitch)

## Brand & Style

**Product-First Minimalism** — High-density music streaming interface. Dark mode by default, with restrained UI allowing album artwork to provide visual energy.

Key attributes:
- **Dark Mode:** Near-black foundation (#0f0c0c recesses, makes media pop)
- **High Density:** Compact typography, tight vertical rhythms (professional audio software style)
- **Tactile Accents:** Orange #f97316 (brand + active states), Green #1ed760 (playback only), Rose #e11d48 (liked/heart)

## Colors

**Hierarchical dark palette for depth & clarity:**

- **Primary (Orange):** #f97316 — brand, active nav, primary actions
- **Secondary (Green):** #1ed760 — ONLY playback/play buttons (familiar mental model)
- **Tertiary (Rose):** #e11d48 — "Liked" states, heart icons
- **Neutrals:** Base #0f0c0c, Sidebar #121212, Cards #181818, Elevated #282828
- **Text:** Primary #ede5dd, Secondary #b3b3b3
- **Hover:** White alpha overlay `rgba(255,255,255,0.08)` instead of lighter solids

## Typography

**Be Vietnam Pro** — legible at small sizes, modern geometric, great for Vietnamese characters.

- **Scale:** Compressed, max 24px (avoids marketing/landing feel)
- **Hierarchy:** Via weight (600/700) + color (off-white vs muted) not size
- **Truncation:** Single-line ellipsis for all titles (track/album/artist)
- **Font sizes:**
  - Section Title: 22px 700
  - Card Title: 14px 600
  - Track Title: 13px 600
  - Body Metadata: 12px 400
  - Label Compact: 11px 500

## Layout & Spacing

**Fixed Shell + Fluid Content model:**

- **Navbar:** 60px (fixed top)
- **Sidebar Rail:** 72px (collapsed, icons only)
- **Sidebar Panel:** 280px (expanded, labels + content)
- **Player:** 90px (fixed bottom)
- **Gutter:** 12px (dense)
- **Main Margin:** 24px
- **12-column grid** in main content area (16px gutter)

Three independent scroll zones:
1. Sidebar Library List
2. Main Content Area
3. Playback Queue (if active)

**Scrollbars:** Ultra-slim, hover-only, minimal opacity

## Elevation & Depth

**Tonal Layering (no shadows on primary UI):**

- **Tier 0:** #0f0c0c (background)
- **Tier 1:** #121212 (sidebar, player)
- **Tier 2:** #181818 (cards)
- **Tier 3:** #282828 (floating menus) — ONLY tier with shadows: `rgba(0,0,0,0.6) 0px 16px 48px`

**Borders:** Subtle 1px at 8% white opacity for navbar/player edges

## Shapes

- **Base Radius:** 8px (cards, secondary containers)
- **Menu Radius:** 8px (context menus, dropdowns)
- **Functional Pills:** 9999px (search, filters, primary buttons)
- **Artist Images:** 50% circular (distinguish from album/playlist)

## Components

### Buttons & Pills
- **Primary Action:** Pill-shaped, orange #f97316, black text
- **Play Button:** Circular, green #1ed760, white/black icon; hover with `translateY` animation (180ms)
- **Filter Pills:** `rgba(255,255,255,0.1)` bg; active = white bg + black text

### Cards (Album/Playlist)
- **Image top, Title (bold), Subtitle (muted)**
- **Hover:** Brighten to #242424, Play button slides up from bottom-right

### Track Rows (List View)
- **Height:** 48px (dense)
- **Columns:** Number/Indicator | Title/Artist | Album | Date | Duration/Like
- **Hover:** Play icon over number, heart + three-dot icons appear

### Search Pill
- **Dark bg #242424, 9999px radius, inline magnifying glass**
- **No border unless focused**

### Context Menus
- **Width:** 298px fixed
- **Surface #282828, 8px radius, heavy shadow**
- **Items:** 36px height, 12px h-padding, icons for all actions

## Key Implementation Notes

✅ All component files use **Be Vietnam Pro** font stack  
✅ Orange #f97316 for interactive states & brand elements  
✅ Green #1ed760 ONLY for playback controls  
✅ Dark tones create depth hierarchy (no gradient/dropshadow dependency)  
✅ High density: 12px gutters, 11-14px body text  
✅ Truncate long titles single-line with ellipsis  
✅ Smooth 150-180ms transitions on hover/interactions  

---

**Project ID:** `projects/8522212082703610756`  
**Last Updated:** 2026-06-12  
**Source:** Stitch Design System API
