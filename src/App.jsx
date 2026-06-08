import { useState, useEffect, useCallback } from "react";
import songs from "./data/songs";
import playlists from "./data/playlists";
import Splash from "./components/Splash";
import Loader from "./components/Loader";
import Player from "./components/Player";
import PageHome from "./pages/PageHome";
import { C, G, R, BG, TEXT, BORDER } from "./constants/theme";

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [page, setPage] = useState("home");
  const [loading, setLoading] = useState(false);
  const [cur, setCur] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  const [likedIds, setLikedIds] = useState(new Set());
  const [list] = useState(songs);
  const [search, setSearch] = useState("");

  const done = useCallback(() => setScreen("app"), []);

  const nav = (p) => {
    if (loading || p === page) return;
    setLoading(true);
    setTimeout(() => { setPage(p); setLoading(false); }, 500 + Math.random() * 300);
  };

  const play = (s) => { setCur(s); setPlaying(true); setProg(0); };

  const toggleLike = (id) => {
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  useEffect(() => {
    if (!playing || !cur) return;
    const t = setInterval(() => {
      setProg(p => {
        if (p >= cur.durationSecs) { setPlaying(false); return 0; }
        return p + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing, cur]);

  if (screen === "splash") return <Splash onDone={done} />;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: BG.base,
        color: TEXT.primary,
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ── Top navbar ── */}
      <div
        style={{
          height: 60,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 16px",
          background: BG.base,
          borderBottom: `0.5px solid ${BORDER}`,
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C[500]}, ${G[400]})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 500,
            color: "#fff",
            flexShrink: 0,
            cursor: "pointer",
          }}
        >
          M
        </div>

        {/* Home button */}
        <div
          onClick={() => nav("home")}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: page === "home" ? `${C[500]}20` : "rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 17,
            color: page === "home" ? C[400] : "rgba(255,255,255,0.7)",
            flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          ⌂
        </div>

        {/* Search bar */}
        <div style={{ flex: 1, maxWidth: 440, position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              pointerEvents: "none",
            }}
          >
            ⌕
          </span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Bạn muốn phát nội dung gì?"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.08)",
              border: "1.5px solid transparent",
              borderRadius: 24,
              padding: "9px 16px 9px 38px",
              color: TEXT.primary,
              fontSize: 13,
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={e => { e.target.style.borderColor = `${C[500]}80`; }}
            onBlur={e => { e.target.style.borderColor = "transparent"; }}
          />
        </div>

        {/* Right links */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          {["Premium", "Hỗ trợ"].map(l => (
            <span
              key={l}
              style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: "0 6px", fontWeight: 500 }}
            >
              {l}
            </span>
          ))}
          <div style={{ width: 1, height: 20, background: BORDER, margin: "0 4px" }} />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: "0 6px" }}>
            Cài đặt
          </span>
          <button
            style={{
              background: "transparent",
              border: `1.5px solid rgba(255,255,255,0.5)`,
              borderRadius: 9999,
              padding: "6px 16px",
              fontSize: 13,
              color: TEXT.primary,
              cursor: "pointer",
              fontWeight: 500,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.target.style.borderColor = "#fff"; e.target.style.transform = "scale(1.02)"; }}
            onMouseLeave={e => { e.target.style.borderColor = "rgba(255,255,255,0.5)"; e.target.style.transform = "scale(1)"; }}
          >
            Đăng ký
          </button>
          <button
            style={{
              background: "#fff",
              border: "none",
              borderRadius: 9999,
              padding: "7px 18px",
              fontSize: 13,
              color: "#141010",
              cursor: "pointer",
              fontWeight: 500,
              transition: "transform 0.15s",
            }}
            onMouseEnter={e => { e.target.style.transform = "scale(1.02)"; }}
            onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
          >
            Đăng nhập
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Library sidebar */}
        <div
          style={{
            width: 300,
            background: BG.card,
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            borderRight: `0.5px solid ${BORDER}`,
            overflow: "hidden",
          }}
        >
          {/* Sidebar header */}
          <div
            style={{
              padding: "16px 16px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500, color: TEXT.primary }}>Thư viện</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 9999,
                padding: "5px 12px",
                cursor: "pointer",
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                transition: "background 0.15s",
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Tạo
            </div>
          </div>

          {/* Scrollable sidebar content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 16px" }}>
            {/* Promo card 1 */}
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: 16,
                marginBottom: 10,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 5 }}>
                Tạo danh sách phát đầu tiên của bạn
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 14, lineHeight: 1.5 }}>
                Rất dễ! Chúng tôi sẽ giúp bạn
              </div>
              <button
                style={{
                  background: "#fff",
                  border: "none",
                  borderRadius: 9999,
                  padding: "7px 16px",
                  fontSize: 12,
                  color: "#141010",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Tạo danh sách phát
              </button>
            </div>

            {/* Promo card 2 */}
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: 16,
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 5 }}>
                Hãy cùng tìm và theo dõi nghệ sĩ yêu thích
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 14, lineHeight: 1.5 }}>
                Luôn cập nhật bài mới từ nghệ sĩ bạn thích
              </div>
              <button
                style={{
                  background: "#fff",
                  border: "none",
                  borderRadius: 9999,
                  padding: "7px 16px",
                  fontSize: 12,
                  color: "#141010",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Khám phá nghệ sĩ
              </button>
            </div>

            {/* Playlists */}
            <div
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                color: "rgba(255,255,255,0.25)",
                padding: "4px 8px 8px",
                fontWeight: 500,
              }}
            >
              Danh sách phát
            </div>
            {playlists.map((pl, i) => (
              <div
                key={pl.id}
                style={{
                  padding: "8px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 6,
                    background: pl.bg,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {i === 0 ? "♥" : "♪"}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{pl.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                    {i === 0 ? `${likedIds.size} bài hát` : "Danh sách phát"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: `0.5px solid ${BORDER}`,
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", marginBottom: 10 }}>
              {["Pháp lý", "Quyền riêng tư", "Cookie", "Hỗ trợ"].map(l => (
                <span key={l} style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
                  {l}
                </span>
              ))}
            </div>
            <button
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 9999,
                padding: "5px 12px",
                fontSize: 11,
                color: TEXT.primary,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span>⊕</span> Tiếng Việt
            </button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", background: BG.base }}>
          {loading ? (
            <Loader text={`Đang tải ${page}...`} />
          ) : (
            <>
              {page === "home" && (
                <PageHome
                  list={list}
                  cur={cur}
                  onPlay={play}
                  likedIds={likedIds}
                  onLike={toggleLike}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Player ── */}
      <Player
        s={cur}
        playing={playing}
        prog={prog}
        onToggle={() => setPlaying(p => !p)}
        likedIds={likedIds}
        onLike={toggleLike}
      />

      {/* ── Bottom promo banner (when not logged in) ── */}
      {!cur && (
        <div
          style={{
            background: `linear-gradient(90deg, ${C[700]}, #7c3aed)`,
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Xem trước Melodies</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>
              Đăng ký để nghe không giới hạn, không quảng cáo
            </div>
          </div>
          <button
            style={{
              background: "#fff",
              border: "none",
              borderRadius: 9999,
              padding: "10px 24px",
              fontSize: 13,
              fontWeight: 500,
              color: "#141010",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Đăng ký miễn phí
          </button>
        </div>
      )}
    </div>
  );
}
