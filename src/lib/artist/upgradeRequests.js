import { supabase } from "../supabase/supabase";

const KEY = "melodies_upgrade_requests";

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}

function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); }
  catch {}
}

function pushToSupabase(email, row) {
  if (!supabase) return;
  supabase
    .from("upgrade_requests")
    .upsert({
      email,
      artist_name:    row.artistName,
      genre:          row.genre,
      bio:            row.bio,
      sample_blob_ids: row.sampleBlobIds ?? [],
      sample_links:   row.sampleLinks ?? [],
      status:         row.status,
      admin_note:     row.adminNote ?? null,
      reject_reason:  row.rejectReason ?? null,
      listener_reply: row.listenerReply ?? null,
      requested_at:   row.requestedAt,
      resolved_at:    row.resolvedAt ?? null,
    })
    .then()
    .catch(() => {});
}

export function submitUpgradeRequest(email, { artistName, genre, bio, sampleBlobIds = [], sampleLinks = [] }) {
  const data = load();
  const row = {
    artistName, genre, bio, sampleBlobIds, sampleLinks,
    termsConfirmed: true,
    requestedAt: new Date().toISOString(),
    status: "pending",
    adminNote: null, rejectReason: null, listenerReply: null, resolvedAt: null,
  };
  data[email] = row;
  save(data);
  pushToSupabase(email, row);
}

export function replyToInfoRequest(email, reply) {
  const data = load();
  if (!data[email]) return;
  data[email] = { ...data[email], listenerReply: reply, status: "pending" };
  save(data);
  pushToSupabase(email, data[email]);
}

export function requestMoreInfo(email, adminNote) {
  const data = load();
  if (!data[email]) return;
  data[email] = { ...data[email], status: "info_requested", adminNote, listenerReply: null };
  save(data);
  pushToSupabase(email, data[email]);
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
  pushToSupabase(email, data[email]);
}

export function withdrawUpgradeRequest(email) {
  const data = load();
  delete data[email];
  save(data);
  if (supabase) {
    supabase.from("upgrade_requests").delete().eq("email", email).then().catch(() => {});
  }
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

export async function syncUpgradeRequestsFromSupabase() {
  if (!supabase) return;
  const { data } = await supabase.from("upgrade_requests").select("*");
  if (!data?.length) return;
  const map = {};
  data.forEach((r) => {
    map[r.email] = {
      artistName:    r.artist_name,
      genre:         r.genre,
      bio:           r.bio,
      sampleBlobIds: r.sample_blob_ids ?? [],
      sampleLinks:   r.sample_links ?? [],
      termsConfirmed: true,
      status:        r.status,
      adminNote:     r.admin_note,
      rejectReason:  r.reject_reason,
      listenerReply: r.listener_reply,
      requestedAt:   r.requested_at,
      resolvedAt:    r.resolved_at,
    };
  });
  save(map);
}
