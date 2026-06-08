import { useState } from "react";
import playlists from "../data/playlists";
import { C, BORDER } from "../constants/theme";

const EASE = "cubic-bezier(0.2, 0, 0, 1)";
const RAIL_W = 64;
const PANEL_W = 300;

/* ── tiny helpers ─────────────────────────────────────────────────── */
function railVis(open) {
  return {
    opacity: open ? 0 : 1,
    pointerEvents: open ? "none" : "auto",
    transition: open ? "opacity 80ms ease 0ms" : "opacity 120ms ease 100ms",
  };
}

function panelVis(open) {
  return {
    opacity: open ? 1 : 0,
    pointerEvents: open ? "auto" : "none",
    transition: open ? "opacity 100ms ease 80ms" : "opacity 60ms ease 0ms",
  };
}

function slideIn(open, delay = 0) {
  return {
    opacity: open ? 1 : 0,
    transform: open ? "translateX(0)" : "translateX(-10px)",
    transition: open
      ? `opacity 130ms ease ${100 + delay}ms, transform 130ms ease ${100 + delay}ms`
      : "opacity 80ms ease 0ms, transform 80ms ease 0ms",
    pointerEvents: open ? "auto" : "none",
  };
}

/* ── Rail icon button ─────────────────────────────────────────────── */
function RailItem({ bg, icon, tooltip, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 48, height: 48,
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 8,
        background: hov ? "rgba(255,255,255,0.08)" : "transparent",
        cursor: "pointer",
        flexShrink: 0,
        position: "relative",
        transition: "background 0.15s",
      }}
    >
      <div style={{
        width: 36, height: 36,
        borderRadius: 5,
        background: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 15,
        color: "rgba(255,255,255,0.9)",
      }}>
        {icon}
      </div>
      {hov && tooltip && (
        <div style={{
          position: "absolute",
          left: "calc(100% + 10px)",
          top: "50%",
          transform: "translateY(-50%)",
          background: "#282828",
          color: "#fff",
          fontSize: 11,
          fontWeight: 600,
          padding: "5px 10px",
          borderRadius: 4,
          whiteSpace: "nowrap",
          boxShadow: "rgba(0,0,0,0.5) 0px 8px 24px",
          zIndex: 300,
          pointerEvents: "none",
          letterSpacing: 0.1,
        }}>
          {tooltip}
        </div>
      )}
    </div>
  );
}

/* ── Panel playlist row ───────────────────────────────────────────── */
function PanelRow({ icon, iconBg, name, meta, open, index, onClick }) {
  const [hov, setHov] = useState(false);
  const enterDelay = 80 + index * 40;
  const exitDelay  = index * 10;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "7px 8px",
        borderRadius: 6,
        cursor: "pointer",
        background: hov ? "rgba(255,255,255,0.08)" : "transparent",
        opacity: open ? 1 : 0,
        transform: open ? "translateX(0)" : "translateX(-8px)",
        transition: open
          ? `background 0.15s, opacity 120ms ease ${enterDelay}ms, transform 120ms ease ${enterDelay}ms`
          : `background 0.15s, opacity 80ms ease ${exitDelay}ms,  transform 80ms ease ${exitDelay}ms`,
      }}
    >
      <div style={{
        width: 40, height: 40,
        borderRadius: 5,
        background: iconBg,
        flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, color: "rgba(255,255,255,0.85)",
        boxShadow: "rgba(0,0,0,0.35) 0px 4px 12px",
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: "#ede5dd",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {name}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
          {meta}
        </div>
      </div>
    </div>
  );
}

/* ── Main Sidebar ─────────────────────────────────────────────────── */
export default function Sidebar({ isOpen, onToggle, likedIds, onNav }) {
  const [libHov, setLibHov] = useState(false);
  const dur = isOpen ? "280ms" : "220ms";

  return (
    <div
      style={{
        width: isOpen ? PANEL_W : RAIL_W,
        flexShrink: 0,
        position: "relative",
        transition: `width ${dur} ${EASE}`,
        overflow: "hidden",
        borderRadius: 8,
        marginRight: 8,
        background: "#121212",
      }}
    >
      {/* ══ RAIL (collapsed icon view) ══════════════════════════════ */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, bottom: 0,
        width: RAIL_W,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "10px 0 16px",
        gap: 2,
        zIndex: 2,
        ...railVis(isOpen),
      }}>
        {/* Library toggle */}
        <div
          onClick={onToggle}
          onMouseEnter={() => setLibHov(true)}
          onMouseLeave={() => setLibHov(false)}
          style={{
            width: 48, height: 48,
            borderRadius: 8,
            background: libHov ? "rgba(255,255,255,0.08)" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            fontSize: 17,
            color: libHov ? "#fff" : "rgba(255,255,255,0.6)",
            transition: "background 0.15s, color 0.15s",
            flexShrink: 0,
            position: "relative",
          }}
        >
          ☰
          {libHov && (
            <div style={{
              position: "absolute",
              left: "calc(100% + 10px)",
              top: "50%",
              transform: "translateY(-50%)",
              background: "#282828",
              color: "#fff",
              fontSize: 11, fontWeight: 600,
              padding: "5px 10px",
              borderRadius: 4,
              whiteSpace: "nowrap",
              boxShadow: "rgba(0,0,0,0.5) 0px 8px 24px",
              zIndex: 300,
              pointerEvents: "none",
              letterSpacing: 0.1,
            }}>
              Open Your Library
            </div>
          )}
        </div>

        {/* Add button */}
        <div
          style={{
            width: 48, height: 40,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            fontSize: 22, fontWeight: 300,
            color: "rgba(255,255,255,0.5)",
            borderRadius: 8,
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }}
        >
          +
        </div>

        {/* Liked Songs */}
        <RailItem
          bg="linear-gradient(135deg,#4c1d95,#7c3aed)"
          icon="♥"
          tooltip="Bài hát đã thích"
          onClick={() => onNav("library")}
        />

        {/* Playlist thumbnails */}
        {playlists.filter(p => p.type !== "liked").map(pl => (
          <RailItem
            key={pl.id}
            bg={pl.bg}
            icon="♪"
            tooltip={pl.name}
            onClick={() => onNav("library")}
          />
        ))}
      </div>

      {/* ══ PANEL (expanded view) ═══════════════════════════════════ */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, bottom: 0,
        width: PANEL_W,
        display: "flex",
        flexDirection: "column",
        zIndex: 1,
        ...panelVis(isOpen),
      }}>
        {/* Header row */}
        <div style={{
          display: "flex", alignItems: "center",
          padding: "12px 8px 8px 10px",
          gap: 6, flexShrink: 0,
          ...slideIn(isOpen, 0),
        }}>
          {/* Library toggle (mirrors rail icon — keeps it in place) */}
          <div
            onClick={onToggle}
            style={{
              width: 44, height: 44,
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              fontSize: 17, color: "#fff",
              transition: "background 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            ☰
          </div>

          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", flex: 1 }}>
            Thư viện
          </span>

          <div
            style={{
              display: "flex", alignItems: "center", gap: 4,
              background: "rgba(255,255,255,0.07)",
              borderRadius: 9999,
              padding: "5px 12px",
              cursor: "pointer",
              fontSize: 12, color: "rgba(255,255,255,0.7)",
              flexShrink: 0, whiteSpace: "nowrap",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
          >
            + Tạo
          </div>
        </div>

        {/* Filter pills */}
        <div style={{
          display: "flex", gap: 6,
          padding: "0 8px 8px",
          flexShrink: 0,
          ...slideIn(isOpen, 20),
        }}>
          {["Danh sách phát", "Album", "Nghệ sĩ"].map((t, i) => (
            <button key={t} style={{
              background: i === 0 ? "rgba(255,255,255,0.15)" : "transparent",
              border: "none",
              borderRadius: 9999,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: i === 0 ? 600 : 400,
              color: i === 0 ? "#fff" : "rgba(255,255,255,0.6)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* Search / recent sort row */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "0 14px 8px",
          flexShrink: 0,
          ...slideIn(isOpen, 40),
        }}>
          <span style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#fff"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
          >
            ⌕
          </span>
          <span style={{
            fontSize: 11, color: "rgba(255,255,255,0.45)",
            display: "flex", alignItems: "center", gap: 4,
            cursor: "pointer",
            transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#fff"}
          onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
          >
            Gần đây <span style={{ fontSize: 9 }}>▼</span>
          </span>
        </div>

        {/* Scrollable playlist list */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "0 4px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.1) transparent",
        }}>
          {/* Liked Songs */}
          <PanelRow
            icon="♥"
            iconBg="linear-gradient(135deg,#4c1d95,#7c3aed)"
            name="Bài hát đã thích"
            meta={`${likedIds.size} bài hát`}
            open={isOpen}
            index={0}
            onClick={() => onNav("library")}
          />

          {/* Other playlists */}
          {playlists.filter(p => p.type !== "liked").map((pl, i) => (
            <PanelRow
              key={pl.id}
              icon="♪"
              iconBg={pl.bg}
              name={pl.name}
              meta="Danh sách phát"
              open={isOpen}
              index={i + 1}
              onClick={() => onNav("library")}
            />
          ))}

          {/* Promo card */}
          <div style={{
            background: "rgba(255,255,255,0.06)",
            borderRadius: 8,
            padding: 16,
            margin: "10px 4px 4px",
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? "translateY(0) scale(1)" : "translateY(8px) scale(0.98)",
            transition: isOpen
              ? "opacity 200ms ease 280ms, transform 200ms ease 280ms"
              : "opacity 60ms ease 0ms, transform 60ms ease 0ms",
            pointerEvents: isOpen ? "auto" : "none",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>
              Tạo danh sách phát đầu tiên
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12, lineHeight: 1.5 }}>
              Rất dễ! Chúng tôi sẽ giúp bạn
            </div>
            <button style={{
              background: "#fff", border: "none",
              borderRadius: 9999, padding: "7px 16px",
              fontSize: 12, color: "#141010", fontWeight: 600,
              cursor: "pointer",
            }}>
              Tạo danh sách phát
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "10px 16px",
          borderTop: `0.5px solid ${BORDER}`,
          flexShrink: 0,
          opacity: isOpen ? 1 : 0,
          transition: isOpen ? "opacity 100ms ease 80ms" : "opacity 60ms ease 0ms",
          pointerEvents: isOpen ? "auto" : "none",
        }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px", marginBottom: 8 }}>
            {["Pháp lý", "Quyền riêng tư", "Cookie", "Hỗ trợ"].map(l => (
              <span key={l} style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
                {l}
              </span>
            ))}
          </div>
          <button style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 9999, padding: "5px 12px",
            fontSize: 11, color: "#ede5dd",
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            ⊕ Tiếng Việt
          </button>
        </div>
      </div>
    </div>
  );
}
