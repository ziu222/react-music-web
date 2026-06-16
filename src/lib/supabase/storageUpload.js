import { supabase } from "./supabase";

async function uploadToStorage(file, bucket, path) {
  if (!supabase) return null;
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
}

export async function uploadAudio(file, submissionId) {
  const ext = file.name.split(".").pop() || "mp3";
  return uploadToStorage(file, "artist-audio", `${submissionId}.${ext}`);
}

export async function uploadCover(file, submissionId) {
  const ext = file.name.split(".").pop() || "jpg";
  return uploadToStorage(file, "artist-covers", `${submissionId}.${ext}`);
}

export async function insertApprovedSong(sub) {
  if (!supabase) return null;
  const { data, error } = await supabase.from("songs").insert({
    title:        sub.title,
    artist:       sub.artistName,
    artist_email: sub.artistEmail,
    album:        sub.album || "Single",
    genre:        sub.genre,
    duration:     sub.duration,
    duration_secs: sub.durationSecs || 0,
    explicit:     sub.explicit ?? false,
    language:     sub.language || "Tiếng Việt",
    lyrics_text:  sub.lyricsText || null,
    audio_url:    sub.audioStorageUrl || null,
    cover_url:    sub.coverStorageUrl || null,
    bg:           sub.bg,
    community:    true,
    plays:        0,
  }).select("id").single();
  if (error) throw error;
  return data;
}
