/* ── Artist song submissions storage (frontend-only) ──────────────
 * Lưu trong localStorage key `melodies_submissions`, mảng global
 * dùng chung: artist gửi bài, admin duyệt / từ chối.
 */

const STORE_KEY = "melodies_submissions";

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
    rejectReason: null,
    submittedAt: "2026-06-10T09:00:00.000Z",
    reviewedAt: null,
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
    rejectReason: null,
    submittedAt: "2026-05-28T10:00:00.000Z",
    reviewedAt: "2026-05-29T08:30:00.000Z",
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
  },
];

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
  if (stored && stored.length) return stored;
  saveStore(SEED_SUBMISSIONS);
  return SEED_SUBMISSIONS;
}

export function addSubmission(data) {
  const submission = {
    ...data,
    id: "sub-" + Date.now(),
    status: "pending",
    rejectReason: null,
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
  };
  const list = [submission, ...loadSubmissions()];
  saveStore(list);
  return submission;
}

export function reviewSubmission(id, status, reason) {
  const list = loadSubmissions().map((s) =>
    s.id === id
      ? { ...s, status, rejectReason: reason ?? null, reviewedAt: new Date().toISOString() }
      : s
  );
  saveStore(list);
  return list;
}

export function resubmit(id) {
  const list = loadSubmissions().map((s) =>
    s.id === id
      ? { ...s, status: "pending", rejectReason: null, reviewedAt: null, submittedAt: new Date().toISOString() }
      : s
  );
  saveStore(list);
  return list;
}
