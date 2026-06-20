import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTicket, faPlus, faBan, faCopy } from "@fortawesome/free-solid-svg-icons";
import { TEXT, BORDER, BG } from "../../constants/theme";
import { createPromoCode, loadPromoCodes, deactivatePromoCode, GRANT_DURATIONS } from "../../lib/user/premiumGrants";
import { logAdminAction } from "../../lib/user/auditLog";
import { FilterPills } from "../../components/console/ConsoleUi";

export default function AdminPromo({ authUser }) {
  const [codes, setCodes] = useState([]);
  const [duration, setDuration] = useState("1m");
  const [maxUses, setMaxUses] = useState(1);
  const [customCode, setCustomCode] = useState("");
  const [copied, setCopied] = useState(null);

  useEffect(() => { loadPromoCodes().then(setCodes); }, []);

  const create = async () => {
    const promo = await createPromoCode(authUser?.email, { durationKey: duration, maxUses, code: customCode.trim() || undefined });
    logAdminAction(authUser, "create_promo", promo.code, GRANT_DURATIONS.find(d=>d.key===duration)?.label + " × " + maxUses);
    loadPromoCodes().then(setCodes);
    setCustomCode("");
  };

  const deactivate = async (code) => {
    await deactivatePromoCode(code);
    logAdminAction(authUser, "deactivate_promo", code, "");
    loadPromoCodes().then(setCodes);
  };

  const copy = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <div style={{ background: BG.card, border: "1px solid " + BORDER, borderRadius: 10, padding: 18, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 14 }}>
          Tạo mã khuyến mãi
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <FilterPills options={GRANT_DURATIONS} active={duration} onSelect={setDuration} />
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
          <label style={{ fontSize: 12, color: TEXT.secondary, flexShrink: 0 }}>Số lần dùng tối đa:</label>
          <input type="number" min={1} max={1000} value={maxUses} onChange={(e) => setMaxUses(Number(e.target.value))}
            style={{ width: 70, background: "var(--overlay-1)", border: "1px solid " + BORDER, borderRadius: 6,
              padding: "6px 10px", color: TEXT.primary, fontSize: 12, outline: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
          <label style={{ fontSize: 12, color: TEXT.secondary, flexShrink: 0 }}>Mã tùy chỉnh:</label>
          <input value={customCode} onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
            placeholder="Để trống = tự động"
            style={{ flex: 1, background: "var(--overlay-1)", border: "1px solid " + BORDER, borderRadius: 6,
              padding: "6px 10px", color: TEXT.primary, fontSize: 12, outline: "none", fontFamily: "monospace" }} />
        </div>
        <button onClick={create} style={{
          background: "#f97316", border: "none", color: "#fff", borderRadius: 9999,
          padding: "8px 20px", fontSize: 12, fontWeight: 700, cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 6,
        }}>
          <FontAwesomeIcon icon={faPlus} style={{ fontSize: 11 }} />
          Tạo mã
        </button>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.mid, marginBottom: 12 }}>
        Danh sách mã ({codes.length})
      </div>
      {codes.length === 0 && (
        <div style={{ fontSize: 13, color: TEXT.tertiary, padding: 20, textAlign: "center" }}>
          Chưa có mã nào
        </div>
      )}
      {codes.map((p) => (
        <div key={p.code} style={{
          display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
          background: BG.card, border: "1px solid " + BORDER, borderRadius: 8, marginBottom: 8,
          opacity: p.active ? 1 : 0.45,
        }}>
          <FontAwesomeIcon icon={faTicket} style={{ color: "#f97316", fontSize: 14, flexShrink: 0 }} />
          <div style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: TEXT.strong, letterSpacing: "0.12em", flex: 1 }}>
            {p.code}
          </div>
          <div style={{ fontSize: 11, color: TEXT.secondary }}>{p.durationLabel}</div>
          <div style={{ fontSize: 11, color: TEXT.tertiary }}>{p.usedCount}/{p.maxUses} lần</div>
          {!p.active && <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 700 }}>HẾT HẠN</span>}
          <button onClick={() => copy(p.code)} title="Sao chép" style={{
            background: "transparent", border: "none", color: copied === p.code ? "#34d399" : TEXT.tertiary,
            cursor: "pointer", fontSize: 13, padding: "2px 6px",
          }}>
            <FontAwesomeIcon icon={faCopy} />
          </button>
          {p.active && (
            <button onClick={() => deactivate(p.code)} title="Vô hiệu hóa" style={{
              background: "transparent", border: "1px solid #ef4444", color: "#ef4444",
              borderRadius: 9999, padding: "4px 10px", fontSize: 11, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              <FontAwesomeIcon icon={faBan} style={{ fontSize: 10 }} />
              Vô hiệu
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
