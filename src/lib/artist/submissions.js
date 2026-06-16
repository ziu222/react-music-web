import { supabase } from "../supabase/supabase";

const STORE_KEY = "melodies_submissions";

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

const SEED_SUBMISSIONS = [
  {
    id: "sub-seed-1",
    artistEmail: "myanh@melodies.local",
    artistName: "Mỹ Anh",
    title: "Pillow Talk",
    album: "Em Bé EP",
    genre: "R&B",
    duration: "3:42",
    durationSecs: 222,
    bg: "linear-gradient(135deg,#7c3aed,#a78bfa)",
    status: "pending",
    submittedAt: "2026-06-10T09:00:00.000Z",
    createdAt: "2026-06-10T09:00:00.000Z",
    updatedAt: "2026-06-10T09:00:00.000Z",
  },
  {
    id: "sub-seed-2",
    artistEmail: "myanh@melodies.local",
    artistName: "Mỹ Anh",
    title: "Midnight Garden",
    album: "Single",
    genre: "Pop",
    duration: "4:05",
    durationSecs: 245,
    bg: "linear-gradient(135deg,#0369a1,#38bdf8)",
    status: "approved",
    submittedAt: "2026-05-28T10:00:00.000Z",
    reviewedAt: "2026-05-29T08:30:00.000Z",
    approvedAt: "2026-05-29T08:30:00.000Z",
    createdAt: "2026-05-28T10:00:00.000Z",
    updatedAt: "2026-05-29T08:30:00.000Z",
  },
  {
    id: "sub-seed-3",
    artistEmail: "myanh@melodies.local",
    artistName: "Mỹ Anh",
    title: "Loop",
    album: "Single",
    genre: "EDM",
    duration: "2:58",
    durationSecs: 178,
    bg: "linear-gradient(135deg,#be123c,#fb7185)",
    status: "rejected",
    rejectReason: "Chất lượng bản thu chưa đạt chuẩn phát hành. Vui lòng mix lại phần vocal.",
    submittedAt: "2026-05-20T14:00:00.000Z",
    reviewedAt: "2026-05-21T11:00:00.000Z",
    createdAt: "2026-05-20T14:00:00.000Z",
    updatedAt: "2026-05-21T11:00:00.000Z",
  },
];

function normalize(sub) {
  return {
    ...SUBMISSION_DEFAULTS,
    createdAt: sub.submittedAt ?? null,
    updatedAt: sub.reviewedAt ?? sub.submittedAt ?? null,
    ...sub,
  };
}

// ── localStorage (cache + offline fallback) ───────────────────

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveStore(list) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); }
  catch { /* quota exceeded */ }
}

// ── Supabase sync helpers ─────────────────────────────────────

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

// Suppress unused warning — fromRow used by future Supabase read path
void fromRow;

function upsertToSupabase(sub) {
  if (!supabase) return;
  supabase
    .from("submissions")
    .upsert(toRow(sub))
    .then()
    .catch(() => {});
}

// ── Public API ────────────────────────────────────────────────

export function loadSubmissions() {
  const stored = readStore();
  if (stored && stored.length) return stored.map(normalize);
  const seeds = SEED_SUBMISSIONS.map(normalize);
  saveStore(seeds);
  return seeds;
}

export function addSubmission(data, opts = {}) {
  const now = new Date().toISOString();
  const submission = normalize({
    ...data,
    id: "sub-" + Date.now(),
    status: opts.draft ? "draft" : "pending",
    submittedAt: opts.draft ? null : now,
    createdAt: now,
    updatedAt: now,
  });
  const list = [submission, ...loadSubmissions()];
  saveStore(list);
  upsertToSupabase(submission);
  return submission;
}

export function updateSubmission(id, patch) {
  const list = loadSubmissions().map((s) =>
    s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s
  );
  saveStore(list);
  const updated = list.find((s) => s.id === id);
  if (updated) upsertToSupabase(updated);
  return list;
}

export function submitDraft(id) {
  const now = new Date().toISOString();
  return updateSubmission(id, {
    status: "pending",
    submittedAt: now,
    rejectReason: null,
    reviewedAt: null,
  });
}

export function reviewSubmission(id, status, reason) {
  const now = new Date().toISOString();
  return updateSubmission(id, {
    status,
    rejectReason: reason ?? null,
    reviewedAt: now,
    approvedAt: status === "approved" ? now : null,
  });
}

/* Hoàn tác từ chối — đưa bài rejected về lại pending để admin re-review */
export function undoRejectSubmission(id) {
  return updateSubmission(id, {
    status: "pending",
    rejectReason: null,
    reviewedAt: null,
    submittedAt: new Date().toISOString(),
  });
}

export function resubmit(id) {
  return updateSubmission(id, {
    status: "pending",
    rejectReason: null,
    reviewedAt: null,
    submittedAt: new Date().toISOString(),
  });
}

export function deleteSubmission(id) {
  const list = loadSubmissions().filter((s) => s.id !== id);
  saveStore(list);
  if (supabase) {
    supabase.from("submissions").delete().eq("id", id).then().catch(() => {});
  }
  return list;
}

export function getApprovedSubmissions() {
  return loadSubmissions().filter((s) => s.status === "approved");
}
