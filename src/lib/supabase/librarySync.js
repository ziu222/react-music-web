import { supabase } from "./supabase";

/* ── Supabase sync ─────────────────────────────────────────────── */

export async function loadLibraryFromSupabase(userEmail) {
  if (!supabase || !userEmail) return null;
  const key = userEmail.toLowerCase();

  // followed_artists đọc từ bảng follows (canonical) thay vì user_library JSONB
  const [libRes, followsRes] = await Promise.allSettled([
    supabase.from("user_library")
      .select("liked_ids, playlists, saved_albums")
      .eq("user_email", key)
      .maybeSingle(),
    supabase.from("follows")
      .select("artist_name")
      .eq("follower_email", key),
  ]);

  const lib = libRes.status === "fulfilled" ? libRes.value.data : null;
  const followRows = followsRes.status === "fulfilled" ? (followsRes.value.data ?? []) : [];
  const followed_artists = followRows.map(r => r.artist_name);

  if (!lib && !followed_artists.length) return null;
  return { ...(lib ?? {}), followed_artists };
}

const toArray = (v) => [...(v instanceof Set ? v : new Set(v ?? []))];

let _pendingArgs = null;
let _saveTimer = null;

/* Debounced upsert — collapses rapid saves (playlist rename, like toggle,
   follow/save toggles). Every caller passes the FULL library snapshot so the
   debounced last-write-wins upsert never clobbers a field it didn't change. */
// followedArtists không cần truyền nữa — follows table là canonical source
export function saveLibraryToSupabase(userEmail, { likedIds, playlists, savedAlbums }) {
  if (!supabase || !userEmail) return;
  _pendingArgs = { userEmail, likedIds, playlists, savedAlbums };
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    flushLibrarySave();
  }, 1200);
}

function flushLibrarySave() {
  if (!_pendingArgs) return;
  const { userEmail, likedIds, playlists, savedAlbums } = _pendingArgs;
  _pendingArgs = null;
  const personalPlaylists = (playlists ?? []).filter((pl) => pl.isPersonal);
  supabase
    .from("user_library")
    .upsert({
      user_email:  userEmail.toLowerCase(),
      liked_ids:   toArray(likedIds),
      playlists:   personalPlaylists,
      saved_albums: toArray(savedAlbums),
      updated_at:  new Date().toISOString(),
    })
    .then()
    .catch(() => {});
}

// Flush khi đóng tab để tránh mất data debounce chưa kịp gửi
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", flushLibrarySave);
}
