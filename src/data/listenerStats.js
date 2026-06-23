/* ── Listener stats ────────────────────────────────────────────────
 * Deterministic per-user generator (seeded PRNG by email/id) so EVERY
 * account gets stable, plausible stats — the old static array only covered
 * userIds 1/2/3/5, leaving Supabase users (uuid ids) blank.
 *
 * NOTE: these are demo figures. True per-user listening stats would need a
 * per-user play-history table in Supabase (not tracked yet); topGenres /
 * topArtists could later be derived from the user's liked songs.
 */

const GENRES = [
  "Pop", "R&B", "Lo-fi", "K-Pop", "Indie", "Acoustic",
  "V-Pop", "Ballad", "EDM", "Hip-Hop", "Rap", "Bolero",
];

const ARTISTS = [
  "Sơn Tùng M-TP", "IU", "Taylor Swift", "BLACKPINK", "NewJeans",
  "Hòa Minzy", "Mỹ Tâm", "Đen Vâu", "HIEUTHUHAI", "The Weeknd",
  "Bích Phương", "Vũ", "Binz", "Dua Lipa",
];

function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickDistinct(rand, pool, n) {
  const copy = [...pool];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return out;
}

/**
 * Deterministic stats for a user. `likedSongs` (optional) overlays REAL taste:
 * when provided, topGenres/topArtists are derived from the user's liked songs.
 */
export function getListenerStats(user, likedSongs = []) {
  const seed = user?.email || String(user?.id ?? "guest");
  const rand = mulberry32(hashStr(seed));

  const songsListened = 40 + Math.round(rand() * 2400);
  const totalHours = Math.round(songsListened * (0.18 + rand() * 0.12));

  let topGenres = pickDistinct(rand, GENRES, 3);
  let topArtists = pickDistinct(rand, ARTISTS, 3);

  // Real overlay: rank the user's actual liked songs by genre / artist.
  if (likedSongs.length) {
    topGenres = rankBy(likedSongs, s => s.genre).slice(0, 3);
    topArtists = rankBy(likedSongs, s => s.artist).slice(0, 3);
  }

  return { songsListened, totalHours, topGenres, topArtists };
}

function rankBy(items, keyFn) {
  const counts = new Map();
  for (const it of items) {
    const k = keyFn(it);
    if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
}
