import { supabase } from "../supabase/supabase";

export const REPORT_REASONS = [
  "Vi phạm bản quyền",
  "Nội dung không phù hợp",
  "Thông tin sai lệch",
  "Nội dung gây hại",
  "Khác",
];

function fromRow(r) {
  return {
    id: r.id,
    reporterEmail: r.reporter_email,
    songId: r.song_id,
    songTitle: r.song_title,
    reason: r.reason,
    status: r.status,
    adminNote: r.admin_note ?? null,
    createdAt: r.created_at,
    resolvedAt: r.resolved_at ?? null,
  };
}

export async function fetchReports() {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(fromRow);
}

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

export async function resolveReport(id, adminNote) {
  const resolvedAt = new Date().toISOString();
  if (supabase) {
    await supabase
      .from("reports")
      .update({ status: "resolved", admin_note: adminNote, resolved_at: resolvedAt })
      .eq("id", id);
  }
  return { id, status: "resolved", adminNote, resolvedAt };
}

export async function dismissReport(id) {
  const resolvedAt = new Date().toISOString();
  if (supabase) {
    await supabase
      .from("reports")
      .update({ status: "dismissed", resolved_at: resolvedAt })
      .eq("id", id);
  }
  return { id, status: "dismissed", resolvedAt };
}
