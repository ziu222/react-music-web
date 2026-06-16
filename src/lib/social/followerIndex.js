import { supabase } from "../supabase/supabase";

const KEY = "melodies_follower_index";

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}

function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); }
  catch {}
}

export function addFollower(artistName, email) {
  if (!artistName || !email) return;
  const data = load();
  const list = data[artistName] ?? [];
  if (!list.includes(email)) {
    data[artistName] = [...list, email];
    save(data);
  }
  if (supabase) {
    supabase
      .from("follows")
      .upsert({ artist_name: artistName, follower_email: email })
      .then()
      .catch(() => {});
  }
}

export function removeFollower(artistName, email) {
  if (!artistName || !email) return;
  const data = load();
  data[artistName] = (data[artistName] ?? []).filter((e) => e !== email);
  save(data);
  if (supabase) {
    supabase
      .from("follows")
      .delete()
      .eq("artist_name", artistName)
      .eq("follower_email", email)
      .then()
      .catch(() => {});
  }
}

export function getFollowers(artistName) {
  if (!artistName) return [];
  return load()[artistName] ?? [];
}

export async function syncFollowsFromSupabase() {
  if (!supabase) return;
  const { data } = await supabase.from("follows").select("artist_name,follower_email");
  if (!data?.length) return;
  const index = {};
  data.forEach(({ artist_name, follower_email }) => {
    if (!index[artist_name]) index[artist_name] = [];
    index[artist_name].push(follower_email);
  });
  save(index);
}
