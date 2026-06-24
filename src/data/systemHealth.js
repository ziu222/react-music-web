/* ── System health (ảo, deterministic) ─────────────────────────────
 * Sinh số liệu "sức khỏe hệ thống" cho màn admin (KPI + biểu đồ 30 ngày +
 * dung lượng lưu trữ + trạng thái dịch vụ). Toàn bộ là số MÔ PHỎNG, không
 * gọi hạ tầng thật — dùng để demo dashboard vận hành.
 *
 * NGUYÊN TẮC (giống dashboardStats.js nhưng FILE ĐỘC LẬP, không import lẫn):
 *  - Deterministic theo NGÀY: seed gốc = YYYYMMDD theo new Date(). Cùng ngày
 *    → cùng kết quả; sang hôm sau mới đổi. Mỗi metric dùng sub-seed cố định
 *    (seed + offset) nên các chỉ số khác nhau nhưng vẫn ổn định trong ngày.
 *  - Lai số THẬT: vài chỉ số suy từ tham số thật (activeUsers, songCount) rồi
 *    CLAMP về dải hợp lý để không mâu thuẫn UI (vd kết nối realtime ~ scale
 *    theo người dùng hoạt động; dung lượng ~ scale theo số bài hát).
 *  - Mọi giá trị Math.max(0, ...) → không âm, không NaN; uptime/error_rate
 *    bị kẹp trong dải thực tế.
 */

/* PRNG: mulberry32 — số nguyên seed → hàm trả [0,1). Cùng seed cho cùng
 * chuỗi số. (Cùng họ với bộ sinh trong dashboardStats.js, viết lại tại đây
 * để file độc lập, không phụ thuộc module khác.) */
function mulberry32(seed) {
  let a = seed >>> 0; // ép về uint32 để seed luôn chạy ổn định
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Làm tròn về n chữ số thập phân (tránh sai số dấu phẩy động hiển thị xấu). */
function round(v, decimals = 0) {
  const p = Math.pow(10, decimals);
  return Math.round(v * p) / p;
}

/* Kẹp giá trị vào [min, max]. */
function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

/* Tính seed gốc theo NGÀY hôm nay (YYYYMMDD) — ổn định trong ngày. */
function daySeed() {
  const today = new Date();
  return (
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate()
  );
}

/* So 7 ngày cuối với 7 ngày liền trước → % thay đổi + xu hướng.
 * deltaPct làm tròn 1 chữ số; prev7=0 → 0 để tránh chia 0 / vô cực. */
function kpiDelta(series) {
  const n = series.length;
  const sum = (arr) => arr.reduce((s, x) => s + x, 0);
  const last7 = sum(series.slice(n - 7));
  const prev7 = sum(series.slice(n - 14, n - 7));
  const deltaPct = prev7 > 0 ? round(((last7 - prev7) / prev7) * 100, 1) : 0;
  return { deltaPct, trend: deltaPct >= 0 ? "up" : "down" };
}

const DAYS = 30;

/**
 * Sinh toàn bộ số liệu sức khỏe hệ thống (ảo, ổn định theo ngày).
 * @param activeUsers người dùng hoạt động (thật) — trần/scale cho kết nối realtime
 * @param songCount   số bài hát (thật) — scale cho dung lượng lưu trữ đã dùng
 * @returns { kpis, series, storage, services }
 */
export function getSystemHealth({ activeUsers = 0, songCount = 0 } = {}) {
  const seed = daySeed();

  // ── Series 30 ngày (kết thúc hôm nay) ──────────────────────────
  // Độ trễ API (ms): nền ~70–170ms, nhiễu nhẹ theo ngày, luôn dương.
  const latRand = mulberry32(seed + 11);
  const latency = [];
  for (let i = 0; i < DAYS; i++) {
    // Nền trườn nhẹ quanh ~110ms, biên độ ±40ms → ~70..150, thỉnh thoảng vọt.
    const base = 95 + latRand() * 50; // 95..145
    const jitter = (latRand() * 2 - 1) * 25; // ±25
    latency.push(Math.max(40, Math.round(base + jitter)));
  }

  // Lượt request/ngày: scale theo người dùng hoạt động (mỗi user ~ vài trăm
  // request/ngày). Tối thiểu một nền để biểu đồ không phẳng khi chưa có user.
  const reqRand = mulberry32(seed + 22);
  const reqBase = Math.max(800, activeUsers * 320);
  const requests = [];
  for (let i = 0; i < DAYS; i++) {
    const trend = 1 + (0.15 * i) / (DAYS - 1); // tăng nhẹ theo thời gian
    const jitter = 1 + (reqRand() * 2 - 1) * 0.12; // ±12%
    requests.push(Math.max(0, Math.round(reqBase * trend * jitter)));
  }

  // Số lỗi/ngày: rất nhỏ so với request (~0.1–1% số request ngày đó), >= 0.
  const errRand = mulberry32(seed + 33);
  const errors = [];
  for (let i = 0; i < DAYS; i++) {
    const rate = 0.001 + errRand() * 0.012; // 0.1%..1.3%
    errors.push(Math.max(0, Math.round(requests[i] * rate)));
  }

  const series = { latency, requests, errors };

  // ── KPI cards ──────────────────────────────────────────────────
  // Độ trễ API hôm nay = phần tử cuối của series latency; delta so tuần trước.
  const dLat = kpiDelta(latency);
  const latencyToday = latency[DAYS - 1];

  // Tỷ lệ lỗi (%) = tổng lỗi / tổng request của 7 ngày cuối, kẹp 0.1..1.4, 2 c/s.
  const sum = (arr, from, to) =>
    arr.slice(from, to).reduce((s, x) => s + x, 0);
  const err7 = sum(errors, DAYS - 7, DAYS);
  const req7 = sum(requests, DAYS - 7, DAYS);
  const errPrev7 = sum(errors, DAYS - 14, DAYS - 7);
  const reqPrev7 = sum(requests, DAYS - 14, DAYS - 7);
  const errRateNow = req7 > 0 ? clamp((err7 / req7) * 100, 0.1, 1.4) : 0.1;
  const errRatePrev =
    reqPrev7 > 0 ? clamp((errPrev7 / reqPrev7) * 100, 0.1, 1.4) : errRateNow;
  const errDeltaPct =
    errRatePrev > 0
      ? round(((errRateNow - errRatePrev) / errRatePrev) * 100, 1)
      : 0;

  // Uptime 30 ngày (%): ~99.9x — nền cao, trừ đi chút "downtime" PRNG. 2 c/s.
  const upRand = mulberry32(seed + 44);
  const uptime = clamp(round(99.9 + upRand() * 0.09, 2), 99.9, 99.99);

  // Kết nối realtime: scale theo người dùng hoạt động (~40% đang online),
  // tối thiểu vài chục để không trống khi ít user. Ổn định trong ngày.
  const rtRand = mulberry32(seed + 55);
  const rtBase = Math.max(24, Math.round(activeUsers * 0.4));
  const rtConn = Math.max(0, Math.round(rtBase * (0.85 + rtRand() * 0.3)));

  const kpis = [
    {
      key: "latency",
      label: "Độ trễ API",
      value: latencyToday,
      unit: "ms",
      deltaPct: dLat.deltaPct,
      // Độ trễ: tăng là XẤU → đảo nhãn trend để UI tô màu đúng ngữ nghĩa.
      trend: dLat.deltaPct <= 0 ? "up" : "down",
    },
    {
      key: "error_rate",
      label: "Tỷ lệ lỗi",
      value: round(errRateNow, 2),
      unit: "%",
      deltaPct: errDeltaPct,
      // Tỷ lệ lỗi: giảm là TỐT → trend "up" khi delta âm.
      trend: errDeltaPct <= 0 ? "up" : "down",
    },
    {
      key: "uptime",
      label: "Uptime 30 ngày",
      value: uptime,
      unit: "%",
    },
    {
      key: "rt_conn",
      label: "Kết nối realtime",
      value: rtConn,
    },
  ];

  // ── Dung lượng lưu trữ ─────────────────────────────────────────
  // Tổng kho 50GB (nếu thư viện lớn thì 100GB). Đã dùng ~ scale số bài hát
  // (giả định ~12MB/bài) + một nền hệ thống, kẹp không vượt tổng.
  const totalGb = songCount > 3000 ? 100 : 50;
  const stoRand = mulberry32(seed + 66);
  const rawUsedGb = 3 + songCount * 0.012 + stoRand() * 2; // nền 3GB + ~12MB/bài
  const usedGb = round(clamp(rawUsedGb, 0, totalGb), 1);
  const storage = {
    usedGb,
    totalGb,
    pct: clamp(Math.round((usedGb / totalGb) * 100), 0, 100),
  };

  // ── Trạng thái dịch vụ ─────────────────────────────────────────
  // Phần lớn 'operational'; PRNG hiếm khi (ngưỡng thấp) cho 'degraded' để
  // dashboard sinh động. Mỗi service một sub-seed → ổn định trong ngày.
  const serviceDefs = [
    { name: "Database", offset: 71 },
    { name: "Auth", offset: 72 },
    { name: "Storage", offset: 73 },
    { name: "Realtime", offset: 74 },
    { name: "Edge Functions", offset: 75 },
  ];
  const services = serviceDefs.map((s) => {
    const r = mulberry32(seed + s.offset)();
    // ~6% khả năng 'degraded' (hiếm), còn lại 'operational'.
    return { name: s.name, status: r < 0.06 ? "degraded" : "operational" };
  });

  return { kpis, series, storage, services };
}
