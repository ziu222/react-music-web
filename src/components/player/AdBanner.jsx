import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRectangleAd } from "@fortawesome/free-solid-svg-icons";
import { C, TEXT, BG, BORDER } from "../../constants/theme";

export default function AdBanner({ onOpenPremium }) {
  return (
    <div
      style={{
        height: 40,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 16px',
        background: BG.el,
        borderTop: '0.5px solid ' + BORDER,
        borderBottom: '0.5px solid ' + BORDER,
      }}
    >
      <FontAwesomeIcon icon={faRectangleAd} style={{ fontSize: 14, color: TEXT.tertiary, flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 12, color: TEXT.secondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        Đây là quảng cáo · Muốn xóa? Mua Premium đi :D
      </span>
      <button
        type="button"
        onClick={onOpenPremium}
        style={{
          flexShrink: 0,
          background: C[500],
          border: 'none',
          borderRadius: 9999,
          padding: '4px 12px',
          fontSize: 11,
          fontWeight: 700,
          color: '#fff',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Mua Premium
      </button>
    </div>
  );
}
