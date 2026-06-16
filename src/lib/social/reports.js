import { supabase } from "../supabase/supabase";

const STORE_KEY = "melodies_reports";

function readStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); }
  catch { return []; }
}
function saveStore(list) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); }
  catch {}
}

export const REPORT_REASONS = [
  "Vi phạm bản quyền",
  "Nội dung không phù hợp",
  "Thông tin sai lệch",
  "Nội dung gây hại",
  "Khác",
];

export function submitReport(reporterEmail, song, reason) {
  const report = {
    id: "rpt-" + Date.now(),
    reporterEmail: reporterEmail.toLowerCase(),
    songId: song.id,
    songTitle: song.title,
    songArtist: song.artist,
    reason,
    status: "pending",
    adminNote: null,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };
  saveStore([report, ...readStore()]);
  if (supabase) {
    supabase.from("reports").insert({
      id: report.id,
      reporter_email: report.reporterEmail,
      song_id: report.songId,
      song_title: report.songTitle,
      reason: report.reason,
      status: report.status,
    }).then().catch(() => {});
  }
  return report;
}

export function loadReports() {
  return readStore();
}

export function resolveReport(id, adminNote) {
  const list = readStore().map((r) =>
    r.id === id ? { ...r, status: "resolved", adminNote, resolvedAt: new Date().toISOString() } : r
  );
  saveStore(list);
  if (supabase) {
    supabase.from("reports").update({ status: "resolved", admin_note: adminNote, resolved_at: new Date().toISOString() })
      .eq("id", id).then().catch(() => {});
  }
  return list;
}

export function dismissReport(id) {
  const list = readStore().map((r) =>
    r.id === id ? { ...r, status: "dismissed", resolvedAt: new Date().toISOString() } : r
  );
  saveStore(list);
  if (supabase) {
    supabase.from("reports").update({ status: "dismissed", resolved_at: new Date().toISOString() })
      .eq("id", id).then().catch(() => {});
  }
  return list;
}
