/* ── Artist analytics (frontend-only) ─────────────────────────────
 * Seeded PRNG cho baseline ổn định. Real play/like từ playLog.js
 * được overlay lên trên — dữ liệu thực luôn thắng seeded.
 */
import { getPlayCounts } from "../music/playLog";

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

const LOCATIONS = [
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
  "Hải Phòng",
  "Seoul",
  "Tokyo",
  "Singapore",
];

export function getArtistAnalytics(email, subs = []) {
  const rand = mulberry32(hashStr(email || "artist"));

  const followers = 1200 + Math.round(rand() * 48000);
  const monthlyListeners = Math.round(followers * (2.6 + rand() * 3.4));

  const dailyPlays = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const base = 900 + rand() * 2400;
    const wave = 1 + 0.18 * Math.sin((27 - i) / 3.2);
    const trend = (27 - i) * (6 + rand() * 10);
    const plays = Math.round(base * wave * (isWeekend ? 1.22 : 1) + trend + rand() * 260);
    dailyPlays.push({
      date: d,
      label: d.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric" }),
      plays,
    });
  }

  const realCounts = getPlayCounts();
  const songStats = {};
  subs
    .filter((s) => s.status === "approved")
    .forEach((s) => {
      const r = mulberry32(hashStr(email + "::" + s.id));
      const seededPlays = 4000 + Math.round(r() * 260000);
      const seededLikes = Math.round(seededPlays * (0.035 + r() * 0.05));
      const realEntry = realCounts[s.id];
      const plays = realEntry ? seededPlays + realEntry.plays : seededPlays;
      const likes = realEntry ? seededLikes + realEntry.likes : seededLikes;
      songStats[s.id] = { plays, likes, saves: Math.round(likes * (0.5 + r() * 0.3)) };
    });

  const locPool = [...LOCATIONS];
  const topLocations = [];
  let remaining = 100;
  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(rand() * locPool.length);
    const name = locPool.splice(idx, 1)[0];
    const pct =
      i === 4 ? remaining : Math.max(4, Math.round(remaining * (0.32 + rand() * 0.18)));
    topLocations.push({ name, pct: Math.min(pct, remaining) });
    remaining -= Math.min(pct, remaining);
  }
  topLocations.sort((a, b) => b.pct - a.pct);

  const playlistPct = 30 + Math.round(rand() * 14);
  const searchPct = 20 + Math.round(rand() * 12);
  const profilePct = 10 + Math.round(rand() * 9);
  const sources = [
    { name: "Playlist", pct: playlistPct },
    { name: "Tìm kiếm", pct: searchPct },
    { name: "Trang nghệ sĩ", pct: profilePct },
    { name: "Khác", pct: 100 - playlistPct - searchPct - profilePct },
  ];

  return { followers, monthlyListeners, dailyPlays, songStats, topLocations, sources };
}

/* % thay đổi 7 ngày gần nhất so với 7 ngày liền trước. */
export function weeklyTrend(dailyPlays) {
  const last7 = dailyPlays.slice(-7).reduce((s, d) => s + d.plays, 0);
  const prev7 = dailyPlays.slice(-14, -7).reduce((s, d) => s + d.plays, 0);
  if (!prev7) return { last7, pct: 0 };
  return { last7, pct: Math.round(((last7 - prev7) / prev7) * 100) };
}

export function formatCompact(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
