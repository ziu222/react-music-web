/* ── Artist Upgrade Requests (frontend-only) ───────────────────────
 * Listener gửi đơn xin trở thành artist. Admin xét duyệt.
 *
 * Key: melodies_upgrade_requests
 * Schema: { [email]: RequestObject }
 */

const KEY = "melodies_upgrade_requests";

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

export function submitUpgradeRequest(email, { artistName, genre, bio, sampleBlobIds = [], sampleLinks = [] }) {
  const data = load();
  data[email] = {
    artistName,
    genre,
    bio,
    sampleBlobIds,
    sampleLinks,
    termsConfirmed: true,
    requestedAt: new Date().toISOString(),
    status: "pending",
    adminNote: null,
    rejectReason: null,
    listenerReply: null,
    resolvedAt: null,
  };
  save(data);
}

export function replyToInfoRequest(email, reply) {
  const data = load();
  if (!data[email]) return;
  data[email] = { ...data[email], listenerReply: reply, status: "pending" };
  save(data);
}

export function requestMoreInfo(email, adminNote) {
  const data = load();
  if (!data[email]) return;
  data[email] = { ...data[email], status: "info_requested", adminNote, listenerReply: null };
  save(data);
}

export function resolveUpgradeRequest(email, approved, noteOrReason) {
  const data = load();
  if (!data[email]) return;
  data[email] = {
    ...data[email],
    status: approved ? "approved" : "rejected",
    rejectReason: approved ? null : (noteOrReason ?? null),
    resolvedAt: new Date().toISOString(),
  };
  save(data);
}

export function withdrawUpgradeRequest(email) {
  const data = load();
  delete data[email];
  save(data);
}

export function getRequest(email) {
  return load()[email] ?? null;
}

export function getPendingRequests() {
  const data = load();
  return Object.entries(data)
    .filter(([, r]) => r.status === "pending" || r.status === "info_requested")
    .map(([email, r]) => ({ email, ...r }));
}
