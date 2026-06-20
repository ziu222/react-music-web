const CACHE_KEY = "melodies_lyrics_cache_v2";
const OFFSET_KEY = "melodies_lyrics_offsets_v1";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const MISS_TTL_MS = 1000 * 60 * 60 * 12;
const LRCLIB_BASE_URL = "https://lrclib.net";
const MIN_SYNC_CONFIDENCE = 0.82;
const MAX_SYNC_DURATION_DIFF = 4;
const REQUEST_TIMEOUT_MS = 8000;
const memoryCache = new Map();
const inFlightRequests = new Map();

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

function readOffsets() {
  try {
    const raw = localStorage.getItem(OFFSET_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function loadLyricsOffsetMs(trackId) {
  if (!trackId) return 0;
  const value = readOffsets()[trackId];
  return Number.isFinite(value) ? value : 0;
}

export function saveLyricsOffsetMs(trackId, offsetMs) {
  if (!trackId) return;
  const offsets = readOffsets();
  const clamped = Math.max(-10000, Math.min(10000, Math.round(offsetMs)));
  if (clamped === 0) delete offsets[trackId];
  else offsets[trackId] = clamped;
  try { localStorage.setItem(OFFSET_KEY, JSON.stringify(offsets)); }
  catch (err) { void err; }
}

function isFresh(entry) {
  if (!entry?.updatedAt) return false;
  const ttl = entry.type === "unavailable" ? MISS_TTL_MS : CACHE_TTL_MS;
  return Date.now() - entry.updatedAt < ttl;
}

function localLyricsForSong(song) {
  const text = String(song?.lyricsText || "").trim();
  if (!text) return null;

  const syncedLines = parseSyncedLyrics(text);
  return {
    ...EMPTY_LYRICS,
    trackId: song.id,
    source: "catalog",
    type: syncedLines.length > 0 ? "synced" : "plain",
    syncedLines,
    plainText: syncedLines.length > 0 ? "" : text,
    confidence: 1,
    updatedAt: Date.now(),
  };
}

export function getCachedLyricsForSong(song) {
  if (!song?.id) return null;
  const local = localLyricsForSong(song);
  if (local) return local;

  const memoryEntry = memoryCache.get(song.id);
  if (isFresh(memoryEntry)) return memoryEntry;

  const storedEntry = readCache()[song.id];
  if (!isFresh(storedEntry)) return null;
  memoryCache.set(song.id, storedEntry);
  return storedEntry;
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
  const duration = song.actualDurationSecs || song.durationSecs || 0;
  return {
    track_name: song.title,
    artist_name: queryArtist(song.artist),
    album_name: song.album || song.title,
    duration: Math.round(duration),
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

function waitForRequest(request, signal) {
  if (!signal) return request;
  if (signal.aborted) return Promise.reject(new DOMException("Aborted", "AbortError"));

  return Promise.race([
    request,
    new Promise((_, reject) => {
      signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
    }),
  ]);
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
  const expectedDuration = Number(song.actualDurationSecs || song.durationSecs || 0);
  const durationDiff = Math.abs(Number(candidate.duration || 0) - expectedDuration);

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
  const expectedDuration = Number(song.actualDurationSecs || song.durationSecs || 0);
  const durationDiff = Math.abs(Number(data.duration || 0) - expectedDuration);
  const canTrustSynced = syncedLines.length > 0
    && confidence >= MIN_SYNC_CONFIDENCE
    && durationDiff <= MAX_SYNC_DURATION_DIFF;
  const type = data.instrumental
    ? "instrumental"
    : canTrustSynced
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
      durationDiff: Number.isFinite(durationDiff) ? Number(durationDiff.toFixed(2)) : null,
      syncedRejected: syncedLines.length > 0 && !canTrustSynced,
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
    .filter(item => item.score >= 0.74)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) return null;
  return toLyricsResult(song, ranked[0].candidate, ranked[0].score);
}

export async function loadLyricsForSong(song, options = {}) {
  if (!song?.id) return { ...EMPTY_LYRICS, updatedAt: Date.now() };

  const cached = getCachedLyricsForSong(song);
  if (cached) return { ...cached, fromCache: true };

  let request = inFlightRequests.get(song.id);
  if (!request) {
    request = (async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const result = await findFromLrclib(song, controller.signal);
        const normalized = result ?? { ...EMPTY_LYRICS, trackId: song.id, updatedAt: Date.now() };
        const cache = readCache();
        cache[song.id] = normalized;
        memoryCache.set(song.id, normalized);
        writeCache(cache);
        return normalized;
      } catch (err) {
        if (err?.name === "AbortError") throw new Error("Lyrics request timed out", { cause: err });
        throw err;
      } finally {
        clearTimeout(timeoutId);
        inFlightRequests.delete(song.id);
      }
    })();
    inFlightRequests.set(song.id, request);
  }

  return waitForRequest(request, options.signal);
}

export function prefetchLyricsForSong(song) {
  if (!song?.id || getCachedLyricsForSong(song)) return;
  loadLyricsForSong(song).catch(() => {});
}
