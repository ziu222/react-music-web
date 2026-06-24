import { supabase } from "../supabase/supabase";

function mapRow(r) {
  return {
    id: r.id,
    artistEmail: r.artist_email,
    title: r.title,
    body: r.body,
    coverUrl: r.cover_url ?? null,
    published: r.published ?? false,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function getPublishedPosts(artistEmail, limit = 20) {
  if (!supabase || !artistEmail) return [];
  const { data } = await supabase.from("artist_posts")
    .select("*")
    .eq("artist_email", artistEmail.toLowerCase())
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map(mapRow);
}

export async function getAllPosts(artistEmail) {
  if (!supabase || !artistEmail) return [];
  const { data } = await supabase.from("artist_posts")
    .select("*")
    .eq("artist_email", artistEmail.toLowerCase())
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapRow);
}

export async function createPost({ artistEmail, title, body, coverUrl = null }) {
  if (!supabase) throw new Error("no supabase");
  const { data, error } = await supabase.from("artist_posts").insert({
    artist_email: artistEmail.toLowerCase(),
    title: title.slice(0, 100),
    body,
    cover_url: coverUrl,
    published: false,
  }).select("*").single();
  if (error) throw error;
  return mapRow(data);
}

export async function updatePost(id, artistEmail, patch) {
  if (!supabase) return;
  const dbPatch = {};
  if (patch.title !== undefined) dbPatch.title = patch.title.slice(0, 100);
  if (patch.body !== undefined) dbPatch.body = patch.body;
  if (patch.coverUrl !== undefined) dbPatch.cover_url = patch.coverUrl;
  dbPatch.updated_at = new Date().toISOString();
  await supabase.from("artist_posts").update(dbPatch)
    .eq("id", id).eq("artist_email", artistEmail.toLowerCase());
}

export async function publishPost(id, artistEmail) {
  if (!supabase) return;
  await supabase.from("artist_posts")
    .update({ published: true, updated_at: new Date().toISOString() })
    .eq("id", id).eq("artist_email", artistEmail.toLowerCase());
}

export async function unpublishPost(id, artistEmail) {
  if (!supabase) return;
  await supabase.from("artist_posts")
    .update({ published: false, updated_at: new Date().toISOString() })
    .eq("id", id).eq("artist_email", artistEmail.toLowerCase());
}

export async function deletePost(id, artistEmail) {
  if (!supabase) return;
  await supabase.from("artist_posts")
    .delete().eq("id", id).eq("artist_email", artistEmail.toLowerCase());
}

export async function uploadPostCover(file, postId) {
  if (!supabase) return null;
  const ext = file.name.split(".").pop() || "jpg";
  const path = postId + "." + ext;
  const { data, error } = await supabase.storage
    .from("artist-posts")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from("artist-posts").getPublicUrl(data.path);
  return publicUrl;
}
