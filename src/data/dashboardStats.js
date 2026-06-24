/* ── Dashboard stats (ảo, deterministic) ───────────────────────────
 * Sinh số liệu biểu đồ cho AdminDashboard: 30 ngày kết thúc HÔM NAY,
 * 5 series (người nghe, đăng ký, lượt nghe, doanh thu, nâng Premium).
 *
 * NGUYÊN TẮC:
 *  - Deterministic theo NGÀY: seed gốc = số ngày (YYYYMMDD). Cùng ngày →
 *    cùng kết quả; sang hôm sau mới đổi. Mỗi series dùng sub-seed cố định
 *    (seed + offset theo index) để các đường khác nhau nhưng vẫn ổn định.
 *  - Lai số THẬT: base của mỗi series suy từ tham số thật (activeUsers,
 *    totalPlays, premiumCount...) rồi CLAMP để không mâu thuẫn với UI
 *    (vd người nghe/ngày ≤ tổng người dùng hoạt động; chưa có Premium thì
 *    doanh thu & lượt nâng cấp giữ ~0).
 *  - Mọi giá trị Math.max(0, Math.round(...)) → không âm, không NaN.
 */

/* PRNG: mulberry32 — số nguyên seed → hàm trả [0,1). Cùng seed cho cùng
 * chuỗi số. (Cùng họ với bộ sinh trong listenerStats.js.) */
function mulberry32(seed) {
  let a = seed >>> 0; // ép về uint32 để seed âm/thực vẫn chạy ổn định
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Doanh thu VND gọn: 1.2M₫ / 350K₫ / 980₫. */
export function formatVnd(n) {
  const v = Math.max(0, Math.round(n || 0));
  if (v >= 1e9) return (v / 1e9).toFixed(1) + "B₫";
  if (v >= 1e6) return (v / 1e6).toFixed(1) + "M₫";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K₫";
  return v + "₫";
}

/* Số gọn K/M/B (đồng bộ với compactNum trong AdminDashboard). */
export function compactNum(n) {
  const v = n ?? 0;
  if (v >= 1e9) return (v / 1e9).toFixed(1) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return String(v);
}

/* Tổng mảng số. */
function sum(arr) {
  return arr.reduce((s, n) => s + n, 0);
}

/* KPI delta: so 7 ngày cuối với 7 ngày liền trước.
 * deltaPct làm tròn 1 chữ số; prev7=0 → 0 để tránh chia 0 / vô cực. */
function kpiDelta(series) {
  const n = series.length;
  const last7 = sum(series.slice(n - 7));
  const prev7 = sum(series.slice(n - 14, n - 7));
  const deltaPct = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 1000) / 10 : 0;
  return { last7, prev7, deltaPct, trend: deltaPct >= 0 ? "up" : "down" };
}

/**
 * Sinh toàn bộ số liệu dashboard.
 * @param totalUsers   tổng người dùng (thật)
 * @param activeUsers  người dùng hoạt động (thật) — trần cho người nghe/ngày
 * @param premiumCount số tài khoản Premium (thật) — quyết định có doanh thu hay không
 * @param totalPlays   tổng lượt nghe tích luỹ (thật) — suy ra lượt nghe/ngày
 * @param songCount    số bài hát (thật) — dự phòng suy lượt nghe khi totalPlays=0
 */
export function getDashboardStats({
  totalUsers = 0,
  activeUsers = 0,
  premiumCount = 0,
  totalPlays = 0,
  songCount = 0,
} = {}) {
  // Seed gốc theo NGÀY hôm nay → ổn định trong ngày, đổi vào hôm sau.
  const today = new Date();
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();

  const DAYS = 30;

  // Mảng nhãn ['dd/mm'] tính lùi 29 ngày → hôm nay (phần tử cuối = hôm nay).
  const days = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    days.push(`${dd}/${mm}`);
  }
  // Thứ trong tuần của từng ngày (0=CN..6=T7) — phục vụ seasonal.
  const dows = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dows.push(d.getDay());
  }

  // ── Base suy từ số thật + CLAMP ────────────────────────────────
  // Trần người nghe/ngày: không vượt số người dùng hoạt động.
  const dauCap = Math.max(1, activeUsers);
  // Người nghe/ngày dao động ~55–80% số hoạt động (nhưng ≤ trần).
  const dauBase = Math.max(1, Math.min(dauCap, Math.round(dauCap * 0.7)));

  // Lượt nghe/ngày: ưu tiên suy từ tổng lượt nghe (chia ~400 ≈ phần ngày),
  // nếu chưa có thì ước theo người nghe × số bài trung bình nghe/người.
  let playsBase = totalPlays > 0 ? Math.round(totalPlays / 400) : 0;
  if (playsBase <= 0) playsBase = Math.max(20, dauBase * 8 || songCount * 3 || 50);

  // Đăng ký mới/ngày: phần nhỏ so với tổng người dùng (~0.6%), tối thiểu 1.
  const signupsBase = Math.max(1, Math.round(Math.max(totalUsers, dauCap) * 0.006));

  // Có Premium hay không quyết định doanh thu & lượt nâng cấp.
  const hasPremium = premiumCount > 0;
  // Lượt nâng Premium/ngày: số NHỎ (0..vài). Suy từ lượng Premium hiện có.
  const convBase = hasPremium ? Math.max(0.4, premiumCount / 30) : 0;
  // Doanh thu/ngày ≈ lượt nâng cấp × giá gói (giả định ~59.000₫/tháng).
  const PRICE = 59000;
  const revenueBase = hasPremium ? convBase * PRICE : 0;

  // Cấu hình từng series: base, độ tăng trưởng 30 ngày, biên độ nhiễu,
  // có nhạy mùa (cuối tuần) hay không, và offset seed riêng.
  const cfg = {
    dau: { base: dauBase, growth: 0.18, noise: 0.1, weekend: true, offset: 101 },
    signups: { base: signupsBase, growth: 0.25, noise: 0.12, weekend: false, offset: 202 },
    plays: { base: playsBase, growth: 0.2, noise: 0.1, weekend: true, offset: 303 },
    revenue: { base: revenueBase, growth: 0.3, noise: 0.08, weekend: false, offset: 404 },
    conversions: { base: convBase, growth: 0.28, noise: 0.12, weekend: false, offset: 505 },
  };

  // Hệ số mùa theo thứ: cuối tuần (T6/T7/CN) cao hơn cho series weekend.
  function seasonal(dow, weekend) {
    if (!weekend) return 1;
    if (dow === 0 || dow === 6) return 1.18; // CN, T7
    if (dow === 5) return 1.08; // T6
    return 0.96; // ngày thường thấp hơn chút để bù
  }

  // Sinh một series 30 số theo công thức:
  //   base * (1 + growth*i/29) [trend] * seasonal [mùa] * (1 ± noise) [nhiễu]
  function genSeries(c) {
    const rand = mulberry32(seed + c.offset); // sub-seed cố định/series
    const out = [];
    for (let i = 0; i < DAYS; i++) {
      const trend = 1 + (c.growth * i) / (DAYS - 1);
      const season = seasonal(dows[i], c.weekend);
      const jitter = 1 + (rand() * 2 - 1) * c.noise; // nhiễu ±noise
      out.push(Math.max(0, Math.round(c.base * trend * season * jitter)));
    }
    return out;
  }

  const dau = genSeries(cfg.dau).map((v) => Math.min(v, dauCap)); // CLAMP trần người nghe
  const signups = genSeries(cfg.signups);
  const plays = genSeries(cfg.plays);
  // Khi chưa có Premium: ép doanh thu & lượt nâng cấp về 0 (tránh số ảo vô lý).
  const revenue = hasPremium ? genSeries(cfg.revenue) : new Array(DAYS).fill(0);
  const conversions = hasPremium ? genSeries(cfg.conversions) : new Array(DAYS).fill(0);

  const series = { dau, signups, plays, revenue, conversions };

  // ── KPI cards ──────────────────────────────────────────────────
  const dDau = kpiDelta(dau);
  const dPlays = kpiDelta(plays);
  const dSignups = kpiDelta(signups);
  const dConv = kpiDelta(conversions);
  const dRevenue = kpiDelta(revenue);

  const kpis = [
    {
      key: "dau",
      label: "Người nghe/ngày",
      value: dau[DAYS - 1], // giá trị hôm nay
      deltaPct: dDau.deltaPct,
      trend: dDau.trend,
    },
    {
      key: "plays",
      label: "Lượt nghe (7 ngày)",
      value: dPlays.last7,
      valueLabel: compactNum(dPlays.last7),
      deltaPct: dPlays.deltaPct,
      trend: dPlays.trend,
    },
    {
      key: "signups",
      label: "Đăng ký mới (7 ngày)",
      value: dSignups.last7,
      deltaPct: dSignups.deltaPct,
      trend: dSignups.trend,
    },
    {
      key: "conversions",
      label: "Nâng Premium (7 ngày)",
      value: dConv.last7,
      deltaPct: dConv.deltaPct,
      trend: dConv.trend,
    },
    {
      key: "revenue",
      label: "Doanh thu (7 ngày)",
      value: dRevenue.last7,
      valueLabel: formatVnd(dRevenue.last7),
      deltaPct: dRevenue.deltaPct,
      trend: dRevenue.trend,
    },
  ];

  return { days, series, kpis };
}
