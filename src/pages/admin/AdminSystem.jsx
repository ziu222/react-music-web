import { useMemo } from "react";
import { motion } from "framer-motion";
import { C, BG, TEXT, BORDER } from "../../constants/theme";
import { Sparkline } from "../../components/ui/Charts";
import { staggerContainer, cardVariants } from "../../lib/ui/consoleMotion";
import { getSystemHealth } from "../../data/systemHealth";

/* Số gọn K/M/B (đồng bộ với compactNum của AdminDashboard). */
function compactNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n ?? 0);
}

/* Bảng màu trạng thái dịch vụ → chấm tròn + nhãn tiếng Việt. */
const SERVICE_STATUS = {
  operational: { color: "#34d399", label: "Hoạt động" },
  degraded: { color: "#fbbf24", label: "Suy giảm" },
};

/**
 * Panel "Sức khỏe hệ thống" — giám sát vận hành (KPI + lưu lượng/độ trễ +
 * lưu trữ + trạng thái dịch vụ). Số liệu ảo deterministic theo ngày, lai số
 * thật (người dùng hoạt động, số bài hát) từ getSystemHealth.
 */
export default function AdminSystem({ authUser, can = () => true, users = [], songs = [] }) {
  // Lai số thật: người dùng còn hoạt động + số bài hát → scale realtime/lưu trữ.
  const health = useMemo(
    () =>
      getSystemHealth({
        activeUsers: (users || []).filter((u) => !u.deleted).length,
        songCount: (songs || []).length,
      }),
    [users, songs],
  );

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      {/* KPI strip — 4 chỉ số vận hành, kèm delta so 7 ngày trước nếu có */}
      <motion.div variants={staggerContainer} style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        {health.kpis.map((kpi) => {
          // Chỉ KPI có deltaPct/trend mới vẽ badge mũi tên (uptime/realtime không có).
          const hasDelta = typeof kpi.deltaPct === "number" && kpi.trend;
          const up = kpi.trend === "up";
          const deltaColor = up ? "#34d399" : "#fb7185"; // xanh tốt / đỏ xấu
          return (
            <motion.div
              key={kpi.key}
              variants={cardVariants}
              style={{
                flex: 1,
                minWidth: 180,
                background: BG.card,
                border: "1px solid " + BORDER,
                borderRadius: 10,
                padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 11, color: TEXT.tertiary, marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: TEXT.strong, lineHeight: 1.1 }}>
                {compactNum(kpi.value)}
                {kpi.unit && <span style={{ fontSize: 13, fontWeight: 600, color: TEXT.tertiary, marginLeft: 3 }}>{kpi.unit}</span>}
              </div>
              {hasDelta && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                      fontSize: 11,
                      fontWeight: 700,
                      color: deltaColor,
                      background: deltaColor + "1f",
                      borderRadius: 9999,
                      padding: "2px 7px",
                    }}
                  >
                    {/* mũi tên ký tự, không dùng icon lucide */}
                    <span style={{ fontSize: 10 }}>{up ? "▲" : "▼"}</span>
                    {Math.abs(kpi.deltaPct)}%
                  </span>
                  <span style={{ fontSize: 11, color: TEXT.tertiary }}>so với 7 ngày trước</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Lưu lượng & độ trễ — 2 ô Sparkline màu khác nhau */}
      <motion.div
        variants={cardVariants}
        style={{
          background: BG.card,
          border: "1px solid " + BORDER,
          borderRadius: 10,
          padding: 18,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 14 }}>
          Lưu lượng & độ trễ
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 12, color: TEXT.secondary, marginBottom: 2 }}>Lượt request/ngày</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT.strong, marginBottom: 6 }}>
              {compactNum(health.series.requests[health.series.requests.length - 1])}
            </div>
            <Sparkline data={health.series.requests} color={C[500]} height={70} />
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 12, color: TEXT.secondary, marginBottom: 2 }}>Độ trễ API (ms)</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT.strong, marginBottom: 6 }}>
              {health.series.latency[health.series.latency.length - 1]} ms
            </div>
            <Sparkline data={health.series.latency} color="#60a5fa" height={70} />
          </div>
        </div>
      </motion.div>

      {/* Lưu trữ — thanh bar tự vẽ inline theo storage.pct */}
      <motion.div
        variants={cardVariants}
        style={{
          background: BG.card,
          border: "1px solid " + BORDER,
          borderRadius: 10,
          padding: 18,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 14 }}>
          Lưu trữ
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: TEXT.strong }}>
            {health.storage.usedGb} GB
            <span style={{ fontSize: 13, fontWeight: 600, color: TEXT.tertiary }}> / {health.storage.totalGb} GB</span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid }}>{health.storage.pct}%</div>
        </div>
        {/* Thanh tiến trình: nền mờ + lớp fill theo % (cam dưới 80%, đỏ khi gần đầy) */}
        <div style={{ height: 10, background: "var(--overlay-1, rgba(255,255,255,0.07))", borderRadius: 9999, overflow: "hidden" }}>
          <div
            style={{
              width: health.storage.pct + "%",
              height: "100%",
              background: health.storage.pct >= 80 ? "#fb7185" : C[500],
              borderRadius: 9999,
              transition: "width 0.3s",
            }}
          />
        </div>
      </motion.div>

      {/* Trạng thái dịch vụ — list tên + chấm tròn màu + nhãn */}
      <motion.div
        variants={cardVariants}
        style={{
          background: BG.card,
          border: "1px solid " + BORDER,
          borderRadius: 10,
          padding: 18,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 12 }}>
          Trạng thái dịch vụ
        </div>
        {health.services.map((svc) => {
          const st = SERVICE_STATUS[svc.status] ?? SERVICE_STATUS.operational;
          return (
            <div
              key={svc.name}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid " + BORDER }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: st.color,
                  flexShrink: 0,
                  boxShadow: "0 0 0 3px " + st.color + "26",
                }}
              />
              <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: TEXT.strong }}>
                {svc.name}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: st.color, flexShrink: 0 }}>{st.label}</div>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
