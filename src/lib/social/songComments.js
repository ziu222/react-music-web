import { supabase } from "../supabase/supabase";

function mapRow(r) {
  return {
    id: r.id,
    songId: r.song_id,
    userEmail: r.user_email,
    userName: r.user_name,
    userColor: r.user_color ?? '#f97316',
    body: r.body,
    parentId: r.parent_id ?? null,
    isArtistReply: r.is_artist_reply ?? false,
    createdAt: r.created_at,
  };
}

export async function getComments(songId, limit = 60) {
  if (!supabase || !songId) return [];
  const { data } = await supabase.from("song_comments")
    .select("*")
    .eq("song_id", songId)
    .order("created_at", { ascending: true })
    .limit(limit);
  return (data ?? []).map(mapRow);
}

export async function addComment({ songId, userEmail, userName, userColor, body, parentId = null, isArtistReply = false }) {
  if (!supabase) throw new Error("no supabase");
  const { data, error } = await supabase.from("song_comments").insert({
    song_id: songId,
    user_email: userEmail.toLowerCase(),
    user_name: userName,
    user_color: userColor ?? '#f97316',
    body: body.slice(0, 500),
    parent_id: parentId ?? null,
    is_artist_reply: isArtistReply,
  }).select("*").single();
  if (error) throw error;
  return mapRow(data);
}

export async function deleteComment(commentId, userEmail) {
  if (!supabase) return;
  await supabase.from("song_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_email", userEmail.toLowerCase());
}

let _seq = 0;
export function subscribeToComments(songId, onChange) {
  if (!supabase || !songId) return () => {};
  const channel = supabase
    .channel("song_comments:" + songId + ":" + (++_seq))
    .on("postgres_changes", {
      event: "*", schema: "public", table: "song_comments",
      filter: "song_id=eq." + songId,
    }, (payload) => {
      if (payload.new && payload.new.id) onChange(mapRow(payload.new), payload.eventType);
    })
    .subscribe();
  return () => supabase.removeChannel(channel);
}
