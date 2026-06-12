import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMusic,
  faCircleCheck,
  faClock,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";
import { StatCard, StatusBadge } from "../../components/console/ConsoleUi";

export default function StudioOverview({ mySubs, onGoSubmit }) {
  const counts = {
    approved: mySubs.filter((s) => s.status === "approved").length,
    pending: mySubs.filter((s) => s.status === "pending").length,
    rejected: mySubs.filter((s) => s.status === "rejected").length,
  };

  const recent = [...mySubs]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 3);

  if (!mySubs.length) {
    return (
      <div
        style={{
          padding: "60px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <FontAwesomeIcon icon={faMusic} style={{ fontSize: 28, color: TEXT.tertiary }} />
        <div style={{ fontSize: 14, color: TEXT.secondary }}>
          Chưa có bài hát nào — hãy đăng bài đầu tiên!
        </div>
        <button
          onClick={onGoSubmit}
          style={{
            background: `linear-gradient(90deg, ${C[600]}, ${C[500]})`,
            color: "#fff",
            border: "none",
            borderRadius: 9999,
            padding: "9px 22px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Đăng bài mới
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard icon={faMusic} accent={C[500]} number={mySubs.length} label="Tổng bài đăng" />
        <StatCard icon={faCircleCheck} accent="#34d399" number={counts.approved} label="Đã duyệt" />
        <StatCard icon={faClock} accent="#fbbf24" number={counts.pending} label="Chờ duyệt" />
        <StatCard icon={faCircleXmark} accent="#fb7185" number={counts.rejected} label="Từ chối" />
      </div>

      <div
        style={{
          background: BG.card,
          border: "1px solid " + BORDER,
          borderRadius: 10,
          padding: 18,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 12 }}>
          Hoạt động gần đây
        </div>
        {recent.map((sub) => (
          <div
            key={sub.id}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: sub.bg,
                flexShrink: 0,
              }}
            />
            <div
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: 13,
                fontWeight: 600,
                color: TEXT.strong,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {sub.title}
            </div>
            <StatusBadge status={sub.status} />
            <div style={{ fontSize: 11, color: TEXT.tertiary, flexShrink: 0, width: 76, textAlign: "right" }}>
              {new Date(sub.submittedAt).toLocaleDateString("vi-VN")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
