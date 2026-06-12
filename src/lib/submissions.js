/* ── Artist song submissions storage (frontend-only) ──────────────
 * Lưu trong localStorage key `melodies_submissions`, mảng global
 * dùng chung: artist upload bài lên nền tảng, admin duyệt / từ chối,
 * bài approved được merge vào catalog cho listener nghe.
 *
 * Blob audio/artwork KHÔNG nằm ở đây — lưu trong IndexedDB qua
 * src/lib/mediaStore.js, submission chỉ giữ blobId + metadata nhẹ.
 */

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

/* Submission cũ (trước khi mở rộng model) được bổ sung field mặc định
 * để UI mới không phải null-check từng field. */
function normalize(sub) {
  return {
    ...SUBMISSION_DEFAULTS,
    createdAt: sub.submittedAt ?? null,
    updatedAt: sub.reviewedAt ?? sub.submittedAt ?? null,
    ...sub,
  };
}

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
  catch (err) { void err; }
}

export function loadSubmissions() {
  const stored = readStore();
  if (stored && stored.length) return stored.map(normalize);
  const seeds = SEED_SUBMISSIONS.map(normalize);
  saveStore(seeds);
  return seeds;
}

/* Tạo submission mới. opts.draft = true → lưu nháp, chưa gửi duyệt. */
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
  return submission;
}

export function updateSubmission(id, patch) {
  const list = loadSubmissions().map((s) =>
    s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s
  );
  saveStore(list);
  return list;
}

/* Nháp → gửi duyệt. */
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

export function resubmit(id) {
  return updateSubmission(id, {
    status: "pending",
    rejectReason: null,
    reviewedAt: null,
    submittedAt: new Date().toISOString(),
  });
}

/* Xóa submission (dùng cho nháp). Blob trong IndexedDB do caller xóa
 * qua deleteMediaBlob vì store này không đụng tới media. */
export function deleteSubmission(id) {
  const list = loadSubmissions().filter((s) => s.id !== id);
  saveStore(list);
  return list;
}

/* Bài approved của mọi nghệ sĩ — nguồn merge vào catalog listener. */
export function getApprovedSubmissions() {
  return loadSubmissions().filter((s) => s.status === "approved");
}
