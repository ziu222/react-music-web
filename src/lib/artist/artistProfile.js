import { supabase } from "../supabase/supabase";

export const DEFAULT_PROFILE = {
  bio: "",
  genres: [],
  links: { website: "", facebook: "", instagram: "", youtube: "" },
  avatarBlobId: null,
  displayName: "",
  themeColor: "",
};

function fromRow(r) {
  return {
    ...DEFAULT_PROFILE,
    bio:         r.bio ?? "",
    genres:      Array.isArray(r.genres) ? r.genres : [],
    links:       { ...DEFAULT_PROFILE.links, ...(r.links ?? {}) },
    displayName: r.display_name ?? "",
    themeColor:  r.theme_color ?? "",
    avatarBlobId: r.avatar_blob_id ?? null,
  };
}

const _cache = new Map();

export async function loadArtistProfile(email) {
  const key = String(email).toLowerCase();
  if (_cache.has(key)) return _cache.get(key);
  if (!supabase || !key) return { ...DEFAULT_PROFILE };

  const { data } = await supabase
    .from("artist_profiles")
    .select("*")
    .eq("email", key)
    .maybeSingle();

  const profile = data ? fromRow(data) : { ...DEFAULT_PROFILE };
  _cache.set(key, profile);
  return profile;
}

/* Tìm artist profile theo tên hiển thị (dùng cho listener view).
 * Thử khớp users.name trước, sau đó artist_profiles.display_name.
 * Trả về profile object hoặc null nếu không tìm thấy. */
export async function loadArtistProfileByName(name) {
  if (!supabase || !name) return null;
  const trimmed = name.trim();
  const [{ data: u }, { data: p }] = await Promise.all([
    supabase.from("users").select("email").eq("role", "artist").ilike("name", trimmed).maybeSingle(),
    supabase.from("artist_profiles").select("email").ilike("display_name", trimmed).maybeSingle(),
  ]);
  const email = u?.email ?? p?.email ?? null;
  if (!email) return null;
  return loadArtistProfile(email);
}

export async function saveArtistProfile(email, profile) {
  const key = String(email).toLowerCase();
  _cache.set(key, profile);
  if (!supabase) return;
  await supabase.from("artist_profiles").upsert({
    email:        key,
    bio:          profile.bio ?? "",
    genres:       profile.genres ?? [],
    links:        profile.links ?? DEFAULT_PROFILE.links,
    display_name: profile.displayName ?? "",
    theme_color:  profile.themeColor ?? "",
    avatar_blob_id: profile.avatarBlobId ?? null,
    updated_at:   new Date().toISOString(),
  }).catch(err => console.error("[saveArtistProfile]", err.message));
}
