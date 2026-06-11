/* ── Notification storage/helper (frontend-only) ──────────────────
 * Thông báo lưu theo user key (email hoặc "guest") trong localStorage.
 * Type: system | library | premium | social — dùng để phân loại icon
 * và cho phép bật/tắt từng nhóm trong Settings.
 */

const STORE_KEY = "melodies_notifications";
const MAX_PER_USER = 30;

export const NOTIFICATION_TYPES = {
  system: { label: "Hệ thống" },
  library: { label: "Thư viện & phát nhạc" },
  premium: { label: "Premium" },
  social: { label: "Nghệ sĩ & xã hội" },
};

function readStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); }
  catch (err) { void err; }
}

function seedNotifications() {
  const now = Date.now();
  return [
    {
      id: "seed-mix",
      type: "library",
      title: "Mix hằng ngày của bạn đã sẵn sàng",
      body: "Gợi ý mới dựa trên những bài bạn vừa nghe.",
      time: now - 4 * 3600_000,
      read: false,
    },
    {
      id: "seed-newmusic",
      type: "social",
      title: "Nhạc mới dành cho bạn",
      body: "Gợi ý US-UK và V-Pop vừa được cập nhật.",
      time: now - 9 * 3600_000,
      read: false,
    },
    {
      id: "seed-welcome",
      type: "system",
      title: "Chào mừng đến Melodies",
      body: "Khám phá trang chủ, tìm kiếm và thư viện của bạn.",
      time: now - 26 * 3600_000,
      read: true,
    },
  ];
}

export function loadNotifications(userKey) {
  const store = readStore();
  if (!Array.isArray(store[userKey])) {
    const seeded = seedNotifications();
    store[userKey] = seeded;
    writeStore(store);
    return seeded;
  }
  return store[userKey];
}

export function saveNotifications(userKey, list) {
  const store = readStore();
  store[userKey] = list.slice(0, MAX_PER_USER);
  writeStore(store);
}

let counter = 0;
export function createNotification(type, title, body) {
  counter += 1;
  return {
    id: `n-${Date.now()}-${counter}`,
    type: NOTIFICATION_TYPES[type] ? type : "system",
    title,
    body,
    time: Date.now(),
    read: false,
  };
}

export function formatNotificationTime(time) {
  const diff = Date.now() - time;
  if (diff < 60_000) return "Vừa xong";
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(time).toLocaleDateString("vi-VN");
}
