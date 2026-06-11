import { artistImages, getPrimaryArtist, getSongImage } from "./media";

/* ── Albums (derived from song.album) ──────────────────────────── */
export function deriveAlbums(list) {
  const albumMap = new Map();
  list.forEach(s => {
    if (!albumMap.has(s.album)) albumMap.set(s.album, []);
    albumMap.get(s.album).push(s);
  });
  return [...albumMap.entries()].map(([name, songs]) => {
    const representative = [...songs].sort((a, b) => b.plays - a.plays)[0];
    return {
      id: `album:${name}`,
      name,
      artist: getPrimaryArtist(representative.artist),
      representative,
      songs,
      songCount: songs.length,
      totalPlays: songs.reduce((acc, s) => acc + s.plays, 0),
      latestSongId: Math.max(...songs.map(s => s.id)),
    };
  });
}

export function getAlbum(list, name) {
  if (!name) return null;
  return deriveAlbums(list).find(al => al.name === name) ?? null;
}

/* ── Artists (derived from song.artist) ────────────────────────── */
export function deriveArtists(list) {
  const artistMap = new Map();
  list.forEach(s => {
    const name = getPrimaryArtist(s.artist);
    if (!artistMap.has(name)) artistMap.set(name, []);
    artistMap.get(name).push(s);
  });
  return [...artistMap.entries()].map(([name, songs]) => {
    const sorted = [...songs].sort((a, b) => b.plays - a.plays);
    return {
      id: name,
      name,
      image: artistImages[name] ?? getSongImage(sorted[0]),
      songs: sorted,
      topSong: sorted[0],
      totalPlays: songs.reduce((acc, s) => acc + s.plays, 0),
      albums: [...new Set(songs.map(s => s.album))],
    };
  });
}

export function getArtist(list, name) {
  if (!name) return null;
  return deriveArtists(list).find(a => a.name === name) ?? null;
}

/* ── Formatting ────────────────────────────────────────────────── */
export function formatPlays(n) {
  return (n ?? 0).toLocaleString("vi-VN");
}

export function formatTotalDuration(songs) {
  const total = songs.reduce((acc, s) => acc + (s.durationSecs || 0), 0);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  if (h > 0) return `${h} giờ ${m} phút`;
  if (m > 0) return sec > 0 ? `${m} phút ${sec} giây` : `${m} phút`;
  return `${sec} giây`;
}
