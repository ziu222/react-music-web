import { supabase } from "../supabase/supabase";

const SUBMISSION_DEFAULTS = {
  explicit: false,
  language: "Tiếng Việt",
  lyricsText: "",
  contributors: [],
  copyrightOwner: "",
  rightsConfirmed: false,
  audioBlobId: null,
  audioFileName: null,
  audioFileType: null,
  audioFileSize: null,
  coverBlobId: null,
  coverFileName: null,
  coverFileType: null,
  coverFileSize: null,
  rejectReason: null,
  submittedAt: null,
  reviewedAt: null,
  approvedAt: null,
};

function normalize(sub) {
  return {
    ...SUBMISSION_DEFAULTS,
    createdAt: sub.submittedAt ?? null,
    updatedAt: sub.reviewedAt ?? sub.submittedAt ?? null,
    ...sub,
  };
}

function toRow(sub) {
  return {
    id:               sub.id,
    artist_email:     sub.artistEmail,
    artist_name:      sub.artistName,
    title:            sub.title,
    album:            sub.album ?? null,
    genre:            sub.genre ?? null,
    duration:         sub.duration ?? null,
    duration_secs:    sub.durationSecs ?? null,
    bg:               sub.bg ?? null,
    status:           sub.status,
    explicit:         sub.explicit ?? false,
    language:         sub.language ?? "Tiếng Việt",
    lyrics_text:      sub.lyricsText ?? null,
    contributors:     sub.contributors ?? [],
    copyright_owner:  sub.copyrightOwner ?? null,
    rights_confirmed: sub.rightsConfirmed ?? false,
    audio_blob_id:    sub.audioBlobId ?? null,
    audio_file_name:  sub.audioFileName ?? null,
    audio_file_type:  sub.audioFileType ?? null,
    audio_file_size:  sub.audioFileSize ?? null,
    cover_blob_id:    sub.coverBlobId ?? null,
    cover_file_name:  sub.coverFileName ?? null,
    cover_file_type:  sub.coverFileType ?? null,
    cover_file_size:  sub.coverFileSize ?? null,
    reject_reason:    sub.rejectReason ?? null,
    submitted_at:     sub.submittedAt ?? null,
    reviewed_at:      sub.reviewedAt ?? null,
    approved_at:      sub.approvedAt ?? null,
    created_at:       sub.createdAt ?? new Date().toISOString(),
    updated_at:       sub.updatedAt ?? new Date().toISOString(),
  };
}

function patchToRow(patch) {
  const row = {};
  const map = {
    title: "title", album: "album", genre: "genre",
    duration: "duration", durationSecs: "duration_secs", bg: "bg",
    status: "status", explicit: "explicit", language: "language",
    lyricsText: "lyrics_text", contributors: "contributors",
    copyrightOwner: "copyright_owner", rightsConfirmed: "rights_confirmed",
    audioBlobId: "audio_blob_id", audioFileName: "audio_file_name",
    audioFileType: "audio_file_type", audioFileSize: "audio_file_size",
    coverBlobId: "cover_blob_id", coverFileName: "cover_file_name",
    coverFileType: "cover_file_type", coverFileSize: "cover_file_size",
    rejectReason: "reject_reason", submittedAt: "submitted_at",
    reviewedAt: "reviewed_at", approvedAt: "approved_at",
    updatedAt: "updated_at",
  };
  for (const [js, db] of Object.entries(map)) {
    if (patch[js] !== undefined) row[db] = patch[js];
  }
  return row;
}

function fromRow(row) {
  return normalize({
    id:              row.id,
    artistEmail:     row.artist_email,
    artistName:      row.artist_name,
    title:           row.title,
    album:           row.album,
    genre:           row.genre,
    duration:        row.duration,
    durationSecs:    row.duration_secs,
    bg:              row.bg,
    status:          row.status,
    explicit:        row.explicit,
    language:        row.language,
    lyricsText:      row.lyrics_text,
    contributors:    row.contributors ?? [],
    copyrightOwner:  row.copyright_owner,
    rightsConfirmed: row.rights_confirmed,
    audioBlobId:     row.audio_blob_id,
    audioFileName:   row.audio_file_name,
    audioFileType:   row.audio_file_type,
    audioFileSize:   row.audio_file_size,
    coverBlobId:     row.cover_blob_id,
    coverFileName:   row.cover_file_name,
    coverFileType:   row.cover_file_type,
    coverFileSize:   row.cover_file_size,
    rejectReason:    row.reject_reason,
    submittedAt:     row.submitted_at,
    reviewedAt:      row.reviewed_at,
    approvedAt:      row.approved_at,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  });
}

// ── In-memory cache ────────────────────────────────────────────
let _cache = null;

function applyToCache(fn) {
  if (_cache !== null) _cache = fn(_cache);
  return _cache ?? [];
}

// ── Public API ────────────────────────────────────────────────

export async function fetchSubmissions(artistEmail) {
  if (!supabase) return [];
  const q = supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (artistEmail) q.eq("artist_email", artistEmail.toLowerCase());
  const { data, error } = await q;
  if (error) throw error;
  _cache = (data || []).map(fromRow);
  return _cache;
}

export async function addSubmission(data, opts = {}) {
  const now = new Date().toISOString();
  const submission = normalize({
    ...data,
    id: "sub-" + Date.now(),
    status: opts.draft ? "draft" : "pending",
    submittedAt: opts.draft ? null : now,
    createdAt: now,
    updatedAt: now,
  });
  if (supabase) {
    const { error } = await supabase.from("submissions").insert(toRow(submission));
    if (error) console.error("[addSubmission]", error.message);
  }
  return applyToCache(prev => [submission, ...prev]);
}

export async function updateSubmission(id, patch) {
  const now = new Date().toISOString();
  const fullPatch = { ...patch, updatedAt: now };
  if (supabase) {
    const { error } = await supabase
      .from("submissions")
      .update({ ...patchToRow(fullPatch), updated_at: now })
      .eq("id", id);
    if (error) console.error("[updateSubmission]", error.message);
  }
  return applyToCache(prev => prev.map(s => s.id === id ? { ...s, ...fullPatch } : s));
}

export async function submitDraft(id) {
  const now = new Date().toISOString();
  return updateSubmission(id, {
    status: "pending",
    submittedAt: now,
    rejectReason: null,
    reviewedAt: null,
  });
}

export async function reviewSubmission(id, status, reason) {
  const now = new Date().toISOString();
  return updateSubmission(id, {
    status,
    rejectReason: reason ?? null,
    reviewedAt: now,
    approvedAt: status === "approved" ? now : null,
  });
}

export async function undoRejectSubmission(id) {
  return updateSubmission(id, {
    status: "pending",
    rejectReason: null,
    reviewedAt: null,
    submittedAt: new Date().toISOString(),
  });
}

export async function resubmit(id) {
  return updateSubmission(id, {
    status: "pending",
    rejectReason: null,
    reviewedAt: null,
    submittedAt: new Date().toISOString(),
  });
}

export async function deleteSubmission(id) {
  if (supabase) {
    supabase.from("submissions").delete().eq("id", id).then().catch(() => {});
  }
  return applyToCache(prev => prev.filter(s => s.id !== id));
}

export async function getApprovedSubmissions() {
  const list = _cache ?? await fetchSubmissions();
  return list.filter(s => s.status === "approved");
}
