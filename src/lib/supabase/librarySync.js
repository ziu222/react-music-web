import { supabase } from "./supabase";

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

let _pendingArgs = null;
let _saveTimer = null;

/* Debounced upsert — collapses rapid saves (playlist rename, like toggle) */
export function saveLibraryToSupabase(userEmail, { likedIds, playlists }) {
  if (!supabase || !userEmail) return;
  _pendingArgs = { userEmail, likedIds, playlists };
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    flushLibrarySave();
  }, 1200);
}

function flushLibrarySave() {
  if (!_pendingArgs) return;
  const { userEmail, likedIds, playlists } = _pendingArgs;
  _pendingArgs = null;
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
}

// Flush khi đóng tab để tránh mất data debounce chưa kịp gửi
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", flushLibrarySave);
}
