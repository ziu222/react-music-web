import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlag, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { TEXT, BORDER, BG } from "../../constants/theme";
import { overlayVariants, modalVariants } from "../../lib/ui/consoleMotion";
import { loadReports, fetchReports, resolveReport, dismissReport } from "../../lib/social/reports";
import { logAdminAction } from "../../lib/user/auditLog";
import { StatusBadge, FilterPills } from "../../components/console/ConsoleUi";
import TableSkeleton from "../../components/ui/skeleton/TableSkeleton";
import useDelayedVisible from "../../hooks/useDelayedVisible";

export default function AdminReports({ authUser }) {
  const [reports, setReports] = useState(() => loadReports());
  const [reportsStatus, setReportsStatus] = useState("loading");
  const [filter, setFilter] = useState("pending");

  // Đồng bộ từ Supabase để thấy report của mọi user (không chỉ localStorage)
  useEffect(() => {
    fetchReports()
      .then(items => { setReports(items); setReportsStatus("success"); })
      .catch(() => setReportsStatus("error"));
  }, []);
  const [noteTarget, setNoteTarget] = useState(null);
  const [note, setNote] = useState("");

  const filtered = reports.filter((r) => filter === "all" || r.status === filter);
  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const showReportsSkeleton = useDelayedVisible(reportsStatus === "loading" && reports.length === 0);
  const holdReportsSkeleton = (reportsStatus === "loading" && reports.length === 0) || showReportsSkeleton;
  const FILTER_PILLS = [
    { key: "pending", label: pendingCount ? `Chờ xử lý (${pendingCount})` : "Chờ xử lý" },
    { key: "resolved", label: "Đã xử lý" },
    { key: "dismissed", label: "Bỏ qua" },
    { key: "all", label: "Tất cả" },
  ];

  const resolve = (r) => {
    const n = note.trim() || "Đã xử lý";
    setReports(resolveReport(r.id, n));
    logAdminAction(authUser, "resolve_report", r.songTitle, n);
    setNoteTarget(null);
    setNote("");
  };

  const dismiss = (r) => {
    setReports(dismissReport(r.id));
    logAdminAction(authUser, "dismiss_report", r.songTitle, "");
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <FilterPills options={FILTER_PILLS} active={filter} onSelect={setFilter} />
      </div>

      {holdReportsSkeleton && <TableSkeleton rows={5} visible={showReportsSkeleton} />}

      {!holdReportsSkeleton && reportsStatus === "error" && reports.length === 0 && (
        <div style={{ padding: 32, textAlign: "center", color: TEXT.tertiary, fontSize: 13 }}>
          Không thể tải báo cáo
        </div>
      )}

      {!holdReportsSkeleton && reportsStatus !== "error" && filtered.length === 0 && (
        <div style={{ padding: 32, textAlign: "center", color: TEXT.tertiary, fontSize: 13 }}>
          Không có báo cáo nào
        </div>
      )}

      {!holdReportsSkeleton && filtered.map((r) => (
        <div key={r.id} style={{
          background: BG.card, border: "1px solid " + BORDER, borderRadius: 10,
          padding: "14px 16px", marginBottom: 10,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <FontAwesomeIcon icon={faFlag} style={{ color: r.status === "pending" ? "#ef4444" : TEXT.tertiary, fontSize: 14, marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.strong }}>{r.songTitle}</div>
              <div style={{ fontSize: 11, color: TEXT.tertiary, marginTop: 2 }}>
                Lý do: <span style={{ color: TEXT.secondary }}>{r.reason}</span>
                {" · "}Người báo: <span style={{ color: TEXT.secondary }}>{r.reporterEmail}</span>
              </div>
              <div style={{ fontSize: 11, color: TEXT.tertiary, marginTop: 2 }}>
                {new Date(r.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
              {r.adminNote && (
                <div style={{ fontSize: 11, color: "#34d399", marginTop: 4 }}>Ghi chú: {r.adminNote}</div>
              )}
            </div>
            <StatusBadge status={r.status} />
            {r.status === "pending" && (
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => { setNoteTarget(r); setNote(""); }} style={{
                  background: "#34d399", border: "none", color: "#08110d",
                  borderRadius: 9999, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}>
                  <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10 }} />
                  Xử lý
                </button>
                <button onClick={() => dismiss(r)} style={{
                  background: "transparent", border: "1px solid var(--border)", color: TEXT.tertiary,
                  borderRadius: 9999, padding: "5px 12px", fontSize: 11, cursor: "pointer",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}>
                  <FontAwesomeIcon icon={faXmark} style={{ fontSize: 10 }} />
                  Bỏ qua
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      <AnimatePresence>
        {noteTarget && [
          <motion.div key="nt-bg" variants={overlayVariants} initial="initial" animate="animate" exit="exit" onClick={() => setNoteTarget(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1100 }} />,
          <motion.div key="nt-modal" variants={modalVariants} initial="initial" animate="animate" exit="exit" style={{ position: "fixed", top: "50%", left: "50%",
            width: 340, background: "var(--island-menu)", borderRadius: 10, padding: 22,
            zIndex: 1101, boxShadow: "var(--shadow-modal)", boxSizing: "border-box" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--island-text)", marginBottom: 12 }}>
              Xử lý báo cáo — {noteTarget.songTitle}
            </div>
            <textarea value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú hành động đã thực hiện..."
              style={{ width: "100%", minHeight: 80, background: "rgba(255,255,255,0.06)",
                border: "1px solid var(--island-border)", borderRadius: 8, padding: 10,
                color: "var(--island-text)", fontSize: 13, resize: "vertical",
                outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
              <button onClick={() => setNoteTarget(null)} style={{ background: "transparent", border: "1px solid var(--island-border)",
                color: "var(--island-muted)", borderRadius: 9999, padding: "7px 16px", fontSize: 12, cursor: "pointer" }}>Hủy</button>
              <button onClick={() => resolve(noteTarget)} style={{ background: "#34d399", border: "none",
                color: "#08110d", borderRadius: 9999, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Xác nhận</button>
            </div>
          </motion.div>,
        ]}
      </AnimatePresence>
    </div>
  );
}
