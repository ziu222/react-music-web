import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faScrewdriverWrench } from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT } from "../constants/theme";

// Màn full-screen hiển thị khi cờ maintenance_mode bật.
// Admin được bypass (xử lý ở App.jsx) để còn tắt được chế độ bảo trì.
export default function MaintenanceScreen() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 18,
        padding: "0 24px",
        background: BG.base,
        color: TEXT.primary,
        fontFamily: "'Be Vietnam Pro', 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Icon cờ-lê tua-vít trong vòng tròn nền cam mờ */}
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          background: `${C[500]}1a`,
          border: `1px solid ${C[500]}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FontAwesomeIcon icon={faScrewdriverWrench} style={{ fontSize: 36, color: C[500] }} />
      </div>

      <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.01em" }}>
        Đang bảo trì hệ thống
      </div>

      <div style={{ fontSize: 14, color: TEXT.secondary, lineHeight: 1.7, maxWidth: 360 }}>
        Melodies sẽ quay lại sớm. Cảm ơn bạn đã kiên nhẫn!
      </div>
    </div>
  );
}
