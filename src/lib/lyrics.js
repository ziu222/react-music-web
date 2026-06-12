const CACHE_KEY = "melodies_lyrics_cache_v1";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const MISS_TTL_MS = 1000 * 60 * 60 * 12;
const LRCLIB_BASE_URL = "https://lrclib.net";

const EMPTY_LYRICS = {
  source: "none",
  type: "unavailable",
  language: null,
  syncedLines: [],
  plainText: "",
  confidence: 0,
  updatedAt: null,
};

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); }
  catch (err) { void err; }
}

function isFresh(entry) {
  if (!entry?.updatedAt) return false;
  const ttl = entry.type === "unavailable" ? MISS_TTL_MS : CACHE_TTL_MS;
  return Date.now() - entry.updatedAt < ttl;
}

export function normalizeLyricsQuery(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\((?:feat|ft|with|remaster|remastered|official|audio|video|lyrics)[^)]+\)/gi, "")
    .replace(/\[(?:feat|ft|with|remaster|remastered|official|audio|video|lyrics)[^\]]+\]/gi, "")
    .replace(/\b(?:feat|ft)\.?\s+.+$/i, "")
    .replace(/[^\w\s&'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function queryArtist(artist = "") {
  return String(artist)
    .replace(/\s+(?:feat\.?|ft\.?|featuring)\s+.+$/i, "")
    .trim();
}

function buildSongQuery(song) {
  return {
    track_name: song.title,
    artist_name: queryArtist(song.artist),
    album_name: song.album || song.title,
    duration: Math.round(song.durationSecs || 0),
  };
}

function toUrl(path, params) {
  const url = new URL(path, LRCLIB_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url;
}

async function fetchJson(url, signal) {
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Lyrics request failed: ${response.status}`);
  return response.json();
}

export function parseSyncedLyrics(lrc = "") {
  const lines = [];
  String(lrc).split(/\r?\n/).forEach(rawLine => {
    const matches = [...rawLine.matchAll(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g)];
    if (matches.length === 0) return;
    const text = rawLine.replace(/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]/g, "").trim();
    matches.forEach(match => {
      const minutes = Number(match[1] || 0);
      const seconds = Number(match[2] || 0);
      const fractionRaw = match[3] || "0";
      const fraction = Number(fractionRaw.padEnd(3, "0").slice(0, 3)) / 1000;
      lines.push({ time: minutes * 60 + seconds + fraction, text });
    });
  });
  return lines
    .filter(line => Number.isFinite(line.time))
    .sort((a, b) => a.time - b.time);
}

function scoreCandidate(song, candidate) {
  const songTitle = normalizeLyricsQuery(song.title);
  const songArtist = normalizeLyricsQuery(queryArtist(song.artist));
  const candidateTitle = normalizeLyricsQuery(candidate.trackName || candidate.name);
  const candidateArtist = normalizeLyricsQuery(candidate.artistName);
  const durationDiff = Math.abs(Number(candidate.duration || 0) - Number(song.durationSecs || 0));

  let score = 0;
  if (candidateTitle === songTitle) score += 0.45;
  else if (candidateTitle.includes(songTitle) || songTitle.includes(candidateTitle)) score += 0.25;

  if (candidateArtist === songArtist) score += 0.35;
  else if (candidateArtist.includes(songArtist) || songArtist.includes(candidateArtist)) score += 0.18;

  if (durationDiff <= 2) score += 0.2;
  else if (durationDiff <= 4) score += 0.12;
  else if (durationDiff <= 8) score += 0.04;

  return Number(score.toFixed(2));
}

function toLyricsResult(song, data, confidence = 1) {
  if (!data) {
    return { ...EMPTY_LYRICS, trackId: song.id, updatedAt: Date.now() };
  }

  const syncedLines = parseSyncedLyrics(data.syncedLyrics);
  const plainText = String(data.plainLyrics || "").trim();
  const type = data.instrumental
    ? "instrumental"
    : syncedLines.length > 0
      ? "synced"
      : plainText
        ? "plain"
        : "unavailable";

  return {
    trackId: song.id,
    source: "lrclib",
    type,
    language: null,
    syncedLines,
    plainText,
    providerId: data.id ?? null,
    confidence,
    updatedAt: Date.now(),
    meta: {
      trackName: data.trackName || data.name || null,
      artistName: data.artistName || null,
      albumName: data.albumName || null,
      duration: data.duration ?? null,
    },
  };
}

async function findFromLrclib(song, signal) {
  const query = buildSongQuery(song);
  const direct = await fetchJson(toUrl("/api/get", query), signal);
  if (direct) return toLyricsResult(song, direct, scoreCandidate(song, direct));

  const search = await fetchJson(toUrl("/api/search", {
    track_name: query.track_name,
    artist_name: query.artist_name,
  }), signal);

  const candidates = Array.isArray(search) ? search : [];
  const ranked = candidates
    .map(candidate => ({ candidate, score: scoreCandidate(song, candidate) }))
    .filter(item => item.score >= 0.62)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) return null;
  return toLyricsResult(song, ranked[0].candidate, ranked[0].score);
}

export async function loadLyricsForSong(song, options = {}) {
  if (!song?.id) return { ...EMPTY_LYRICS, updatedAt: Date.now() };

  const cache = readCache();
  const cached = cache[song.id];
  if (isFresh(cached)) return { ...cached, fromCache: true };

  let result;
  try {
    result = await findFromLrclib(song, options.signal);
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    result = null;
  }

  const normalized = result ?? { ...EMPTY_LYRICS, trackId: song.id, updatedAt: Date.now() };
  cache[song.id] = normalized;
  writeCache(cache);
  return normalized;
}
