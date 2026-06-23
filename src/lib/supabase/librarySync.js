import { supabase } from "./supabase";

/* ── Supabase sync ─────────────────────────────────────────────── */

export async function loadLibraryFromSupabase(userEmail) {
  if (!supabase || !userEmail) return null;
  const { data } = await supabase
    .from("user_library")
    .select("liked_ids, playlists, followed_artists, saved_albums")
    .eq("user_email", userEmail.toLowerCase())
    .maybeSingle();
  return data ?? null;
}

const toArray = (v) => [...(v instanceof Set ? v : new Set(v ?? []))];

let _pendingArgs = null;
let _saveTimer = null;

/* Debounced upsert — collapses rapid saves (playlist rename, like toggle,
   follow/save toggles). Every caller passes the FULL library snapshot so the
   debounced last-write-wins upsert never clobbers a field it didn't change. */
export function saveLibraryToSupabase(userEmail, { likedIds, playlists, followedArtists, savedAlbums }) {
  if (!supabase || !userEmail) return;
  _pendingArgs = { userEmail, likedIds, playlists, followedArtists, savedAlbums };
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    flushLibrarySave();
  }, 1200);
}

function flushLibrarySave() {
  if (!_pendingArgs) return;
  const { userEmail, likedIds, playlists, followedArtists, savedAlbums } = _pendingArgs;
  _pendingArgs = null;
  const personalPlaylists = (playlists ?? []).filter((pl) => pl.isPersonal);
  supabase
    .from("user_library")
    .upsert({
      user_email:       userEmail.toLowerCase(),
      liked_ids:        toArray(likedIds),
      playlists:        personalPlaylists,
      followed_artists: toArray(followedArtists),
      saved_albums:     toArray(savedAlbums),
      updated_at:       new Date().toISOString(),
    })
    .then()
    .catch(() => {});
}

// Flush khi đóng tab để tránh mất data debounce chưa kịp gửi
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", flushLibrarySave);
}
