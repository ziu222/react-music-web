import { supabase } from "./supabase";

const LS_LIKED = "melodies_liked_ids";
const LS_PLAYLISTS = "melodies_playlists";

/* ── localStorage persistence helpers ─────────────────────────── */

export function loadLikedIdsLocal() {
  try {
    const raw = localStorage.getItem(LS_LIKED);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

export function saveLikedIdsLocal(ids) {
  try { localStorage.setItem(LS_LIKED, JSON.stringify([...ids])); }
  catch {}
}

/* ── Supabase sync ─────────────────────────────────────────────── */

export async function loadLibraryFromSupabase(userEmail) {
  if (!supabase || !userEmail) return null;
  const { data } = await supabase
    .from("user_library")
    .select("liked_ids, playlists")
    .eq("user_email", userEmail.toLowerCase())
    .maybeSingle();
  return data ?? null;
}

let _saveTimer = null;

/* Debounced upsert — collapses rapid saves (playlist rename, like toggle) */
export function saveLibraryToSupabase(userEmail, { likedIds, playlists }) {
  if (!supabase || !userEmail) return;
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    const personalPlaylists = playlists.filter((pl) => pl.isPersonal);
    supabase
      .from("user_library")
      .upsert({
        user_email:  userEmail.toLowerCase(),
        liked_ids:   [...(likedIds instanceof Set ? likedIds : new Set(likedIds))],
        playlists:   personalPlaylists,
        updated_at:  new Date().toISOString(),
      })
      .then()
      .catch(() => {});
  }, 1200);
}
