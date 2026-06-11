import { C, G, GRADIENTS } from "../constants/theme";
import { getSongImage } from "../data/media";

const COPY = {
  play: {
    title: "Bắt đầu nghe với Melodies miễn phí",
    body: "Tạo tài khoản miễn phí để phát nhạc, nghe tiếp danh sách phát và lưu lịch sử nghe của bạn.",
    primary: "Đăng ký miễn phí",
  },
  like: {
    title: "Lưu bài hát này vào thư viện",
    body: "Đăng nhập để thích bài hát và giữ chúng trong thư viện Melodies của bạn.",
    primary: "Đăng ký miễn phí",
  },
  createPlaylist: {
    title: "Tạo danh sách phát bằng tài khoản",
    body: "Đăng nhập để tạo, chỉnh sửa và giữ danh sách phát cá nhân trong thanh bên.",
    primary: "Đăng ký miễn phí",
  },
  follow: {
    title: "Theo dõi nghệ sĩ yêu thích",
    body: "Đăng nhập để theo dõi nghệ sĩ và xem họ trong thư viện Melodies của bạn.",
    primary: "Đăng ký miễn phí",
  },
  saveAlbum: {
    title: "Lưu album vào thư viện",
    body: "Đăng nhập để lưu album và nghe lại bất cứ lúc nào từ thư viện của bạn.",
    primary: "Đăng ký miễn phí",
  },
  premium: {
    title: "Đăng nhập để nâng cấp Premium",
    body: "Tạo tài khoản miễn phí trước, sau đó nâng cấp để mở khóa tải xuống và âm thanh chất lượng cao.",
    primary: "Đăng ký miễn phí",
  },
  download: {
    title: "Tải xuống là tính năng Premium",
    body: "Đăng nhập và nâng cấp Premium để tải danh sách phát và nghe offline.",
    primary: "Đăng ký miễn phí",
  },
};

export default function AuthGateModal({ gate, onClose, onLogin, onRegister }) {
  if (!gate) return null;

  const copy = COPY[gate.reason] ?? COPY.play;
  const song = gate.song;
  const cover = song ? getSongImage(song) : null;
  const title = song?.title ?? gate.playlist?.name ?? gate.entityName ?? "Melodies";
  const artist = song?.artist ?? "Xem trước danh sách phát";

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
          // Gate hero giữ dark island bất kể theme — chữ trắng literal bên dưới
          background: "linear-gradient(135deg, #1f1f1f, #181818 58%, #0f0c0c)",
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
            background: `radial-gradient(circle at 78% 22%, ${C[500]}24, transparent 32%), radial-gradient(circle at 20% 90%, ${G[500]}1f, transparent 28%)`,
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
              background: song?.bg ?? gate.playlist?.bg ?? GRADIENTS.hero,
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
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
            Đã có tài khoản?{" "}
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
              Đăng nhập
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
        Đóng
      </button>
    </div>
  );
}
