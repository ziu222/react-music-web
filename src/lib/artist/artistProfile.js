import { supabase } from "../supabase/supabase";

export const DEFAULT_PROFILE = {
  email: "",
  bio: "",
  genres: [],
  links: { website: "", facebook: "", instagram: "", youtube: "" },
  displayName: "",
  themeColor: "",
};

function fromRow(r, email = "") {
  return {
    ...DEFAULT_PROFILE,
    email,
    bio:         r.artist_bio ?? "",
    genres:      Array.isArray(r.artist_genres) ? r.artist_genres : [],
    links:       { ...DEFAULT_PROFILE.links, ...(r.artist_links ?? {}) },
    displayName: r.artist_display_name ?? "",
    themeColor:  r.artist_theme_color ?? "",
  };
}

const _cache = new Map();

export async function loadArtistProfile(email) {
  const key = String(email).toLowerCase();
  if (_cache.has(key)) return _cache.get(key);
  if (!supabase || !key) return { ...DEFAULT_PROFILE };

  const { data } = await supabase
    .from("users")
    .select("artist_bio, artist_genres, artist_links, artist_display_name, artist_theme_color")
    .eq("email", key)
    .eq("role", "artist")
    .maybeSingle();

  const profile = data ? fromRow(data, key) : { ...DEFAULT_PROFILE, email: key };
  _cache.set(key, profile);
  return profile;
}

export async function loadArtistProfileByName(name) {
  if (!supabase || !name) return null;
  const trimmed = name.trim();

  // Tìm theo users.name hoặc users.artist_display_name
  const { data } = await supabase
    .from("users")
    .select("email, artist_bio, artist_genres, artist_links, artist_display_name, artist_theme_color")
    .eq("role", "artist")
    .or(`name.ilike.${trimmed},artist_display_name.ilike.${trimmed}`)
    .maybeSingle();

  if (!data?.email) return null;
  const profile = fromRow(data, data.email);
  _cache.set(data.email.toLowerCase(), profile);
  return profile;
}

export async function saveArtistProfile(email, profile) {
  const key = String(email).toLowerCase();
  _cache.set(key, profile);
  if (!supabase) return;
  await supabase
    .from("users")
    .update({
      artist_bio:          profile.bio ?? "",
      artist_genres:       profile.genres ?? [],
      artist_links:        profile.links ?? DEFAULT_PROFILE.links,
      artist_display_name: profile.displayName ?? "",
      artist_theme_color:  profile.themeColor ?? "",
    })
    .eq("email", key)
    .catch(err => console.error("[saveArtistProfile]", err.message));
}
