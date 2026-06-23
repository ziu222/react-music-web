import { useEffect, useState } from "react";
import { TEXT, BORDER, BG } from "../../constants/theme";
import { loadAppConfig, setAppConfig } from "../../lib/admin/appConfig";
import { logAdminAction } from "../../lib/user/auditLog";

// Nhãn hiển thị cho từng nhóm cờ (category trong app_config)
const CATEGORY_LABELS = {
  access:  "Truy cập hệ thống",
  signup:  "Đăng ký",
  artist:  "Nghệ sĩ",
  content: "Nội dung",
  premium: "Premium",
};

// Các cờ nguy hiểm cần cảnh báo nhẹ khi bật (chặn / ảnh hưởng người dùng thường)
const WARN_FLAGS = {
  maintenance_mode: "Sẽ chặn người dùng thường truy cập",
};

// Toggle switch tự vẽ (không dùng icon lib): bật = cam, tắt = xám
function ToggleSwitch({ on, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="switch"
      aria-checked={on}
      style={{
        flexShrink: 0,
        width: 42,
        height: 24,
        borderRadius: 9999,
        border: "none",
        padding: 0,
        cursor: "pointer",
        background: on ? "#f97316" : "rgba(255,255,255,0.18)",
        position: "relative",
        transition: "background 0.18s ease",
      }}
    >
      {/* Núm tròn trượt trái/phải tùy trạng thái */}
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 21 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.18s ease",
          boxShadow: "0 1px 2px rgba(0,0,0,0.35)",
        }}
      />
    </button>
  );
}

export default function AdminConfig({ authUser, can = () => true }) {
  const [list, setList] = useState([]);
  const [status, setStatus] = useState("loading");

  // Mount: tải toàn bộ cờ cấu hình từ Supabase
  useEffect(() => {
    loadAppConfig()
      .then((items) => {
        setList(items);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  const editable = can("config.manage");

  // Bật/tắt 1 cờ: cập nhật optimistic -> ghi DB -> log; nếu lỗi thì revert
  const onToggle = async (flag) => {
    if (!editable) return;
    const next = !flag.enabled;
    // Optimistic: đổi state ngay cho mượt
    setList((prev) => prev.map((f) => (f.key === flag.key ? { ...f, enabled: next } : f)));
    const { error } = await setAppConfig(flag.key, next);
    if (error) {
      // Revert nếu DB lỗi
      setList((prev) => prev.map((f) => (f.key === flag.key ? { ...f, enabled: flag.enabled } : f)));
      return;
    }
    logAdminAction(authUser, "toggle_config", flag.label, next ? "bật" : "tắt");
  };

  // Nhóm các cờ theo category, giữ nguyên thứ tự sort đã có từ loadAppConfig
  const groups = list.reduce((acc, flag) => {
    const cat = flag.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(flag);
    return acc;
  }, {});
  const groupKeys = Object.keys(groups);

  if (status === "loading") {
    return (
      <div style={{ padding: 32, textAlign: "center", color: TEXT.tertiary, fontSize: 13 }}>
        Đang tải cấu hình…
      </div>
    );
  }

  if (status === "error" || list.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: TEXT.tertiary, fontSize: 13 }}>
        Chưa có cấu hình nào
      </div>
    );
  }

  return (
    <div>
      {groupKeys.map((cat) => (
        <div
          key={cat}
          style={{
            background: BG.card,
            border: "1px solid " + BORDER,
            borderRadius: 10,
            padding: 18,
            marginBottom: 16,
          }}
        >
          {/* Tiêu đề nhóm */}
          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 14 }}>
            {CATEGORY_LABELS[cat] || cat}
          </div>

          {groups[cat].map((flag, idx) => (
            <div
              key={flag.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 0",
                // Đường kẻ ngăn giữa các dòng trong cùng nhóm
                borderTop: idx === 0 ? "none" : "1px solid " + BORDER,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.strong }}>
                  {flag.label}
                </div>
                {flag.description && (
                  <div style={{ fontSize: 11, color: TEXT.tertiary, marginTop: 3 }}>
                    {flag.description}
                  </div>
                )}
                {/* Cảnh báo nhẹ cho cờ nguy hiểm khi đang bật */}
                {WARN_FLAGS[flag.key] && flag.enabled && (
                  <div style={{ fontSize: 11, color: "#ef4444", fontWeight: 600, marginTop: 4 }}>
                    {WARN_FLAGS[flag.key]}
                  </div>
                )}
              </div>
              <ToggleSwitch on={flag.enabled} onClick={() => onToggle(flag)} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
