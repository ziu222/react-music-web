import { C, TEXT } from "../constants/theme";
import { getSongImage } from "../data/media";

const COPY = {
  play: {
    title: "Start listening with Melodies Free",
    body: "Create a free account to play tracks, continue playlists, and keep your listening history.",
    primary: "Register free",
  },
  like: {
    title: "Save this song to your library",
    body: "Log in to like songs and keep them available across your Melodies library.",
    primary: "Register free",
  },
  createPlaylist: {
    title: "Create playlists with an account",
    body: "Log in to create, edit, and keep personal playlists in your sidebar.",
    primary: "Register free",
  },
};

export default function AuthGateModal({ gate, onClose, onLogin, onRegister }) {
  if (!gate) return null;

  const copy = COPY[gate.reason] ?? COPY.play;
  const song = gate.song;
  const cover = song ? getSongImage(song) : null;
  const title = song?.title ?? gate.playlist?.name ?? "Melodies";
  const artist = song?.artist ?? "Playlist preview";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1900,
        background: "rgba(0,0,0,0.76)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        animation: "fadeIn 140ms ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "min(980px, calc(100vw - 48px))",
          minHeight: 470,
          borderRadius: 8,
          background: "linear-gradient(135deg,#29313a,#1f2328 58%,#171717)",
          boxShadow: "rgba(0,0,0,0.72) 0px 28px 80px",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "grid",
          gridTemplateColumns: "minmax(260px, 0.95fr) minmax(320px, 1fr)",
          gap: 48,
          padding: "70px 88px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 78% 22%, ${C[500]}22, transparent 32%), radial-gradient(circle at 20% 90%, rgba(30,215,96,0.14), transparent 28%)`,
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              width: "min(376px, 100%)",
              aspectRatio: "1 / 1",
              borderRadius: 8,
              overflow: "hidden",
              background: song?.bg ?? gate.playlist?.bg ?? "linear-gradient(135deg,#334155,#64748b)",
              boxShadow: "rgba(0,0,0,0.48) 0px 18px 48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {cover ? (
              <img
                src={cover}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <span style={{ fontSize: 54, color: "rgba(255,255,255,0.72)" }}>♪</span>
            )}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: 16,
                background: "linear-gradient(transparent, rgba(0,0,0,0.72))",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: TEXT.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {title}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.64)", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {artist}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 38, lineHeight: 1.14, color: "#fff", fontWeight: 900, maxWidth: 420, letterSpacing: 0 }}>
            {copy.title}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,0.62)", maxWidth: 390, marginTop: 16 }}>
            {copy.body}
          </div>

          <button
            type="button"
            onClick={onRegister}
            style={{
              marginTop: 34,
              width: 240,
              height: 58,
              border: "none",
              borderRadius: 9999,
              background: C[500],
              color: "#fff",
              fontSize: 15,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "rgba(249,115,22,0.24) 0px 12px 28px",
            }}
          >
            {copy.primary}
          </button>

          <div style={{ marginTop: 24, fontSize: 14, color: "rgba(255,255,255,0.56)", fontWeight: 700 }}>
            Already have an account?{" "}
            <button
              type="button"
              onClick={onLogin}
              style={{
                border: "none",
                background: "transparent",
                color: "#fff",
                fontSize: 14,
                fontWeight: 900,
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              Log in
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        style={{
          position: "fixed",
          left: "50%",
          bottom: 34,
          transform: "translateX(-50%)",
          border: "none",
          background: "transparent",
          color: "rgba(255,255,255,0.72)",
          cursor: "pointer",
          fontSize: 16,
          fontWeight: 800,
          zIndex: 1901,
        }}
      >
        Close
      </button>
    </div>
  );
}
