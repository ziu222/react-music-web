import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faLink,
  faCircleCheck,
  faUsers,
  faCamera,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";
import { loadArtistProfile, saveArtistProfile } from "../../lib/artist/artistProfile";
import { getArtistAnalytics, formatCompact } from "../../lib/artist/artistStats";
import {
  saveMediaBlob,
  deleteMediaBlob,
  getMediaBlobUrl,
  revokeMediaBlobUrl,
} from "../../lib/music/mediaStore";

const THEME_COLORS = ["#f97316", "#a78bfa", "#38bdf8", "#fb7185", "#34d399", "#fbbf24"];

const BIO_MAX = 300;
const GENRE_OPTIONS = ["V-Pop", "Pop", "R&B", "Ballad", "EDM", "Dance", "Hip-Hop", "Indie", "Acoustic", "Rock"];

const LINK_FIELDS = [
  { key: "website", label: "Website", icon: faGlobe, placeholder: "https://..." },
  { key: "facebook", label: "Facebook", icon: faLink, placeholder: "facebook.com/..." },
  { key: "instagram", label: "Instagram", icon: faLink, placeholder: "instagram.com/..." },
  { key: "youtube", label: "YouTube", icon: faLink, placeholder: "youtube.com/@..." },
];

const inputStyle = {
  background: BG.el,
  border: "1px solid " + BORDER,
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13,
  color: "var(--text-primary)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export default function StudioProfile({ authUser, mySubs, onSaved, onChanged }) {
  const [profile, setProfile] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    loadArtistProfile(authUser?.email ?? "").then(setProfile);
  }, [authUser?.email]);

  useEffect(() => {
    if (!profile) return;
    let alive = true;
    let url = null;
    getMediaBlobUrl(profile.avatarBlobId).then((u) => {
      if (alive) {
        url = u;
        setAvatarUrl(u);
      } else {
        revokeMediaBlobUrl(u);
      }
    });
    return () => {
      alive = false;
      revokeMediaBlobUrl(url);
    };
  }, [profile?.avatarBlobId]);

  const analytics = getArtistAnalytics(authUser?.email ?? "", mySubs);
  if (!profile) return null;
  const themeColor = profile.themeColor || authUser?.color || C[500];
  const stageName = profile.displayName?.trim() || authUser?.name;

  const update = (patch) => {
    setProfile((p) => ({ ...p, ...patch }));
    setDirty(true);
  };

  // Ảnh đại diện áp dụng ngay (như platform thật), không cần bấm Lưu
  const changeAvatar = async (file) => {
    if (!file || !file.type.startsWith("image/") || !profile) return;
    const oldId = profile.avatarBlobId;
    const meta = await saveMediaBlob(file, "avatar");
    const next = { ...profile, avatarBlobId: meta.id };
    setProfile(next);
    saveArtistProfile(authUser.email, next);
    if (oldId) deleteMediaBlob(oldId);
    onChanged();
  };

  const removeAvatar = async () => {
    if (!profile) return;
    if (profile.avatarBlobId) deleteMediaBlob(profile.avatarBlobId);
    const next = { ...profile, avatarBlobId: null };
    setProfile(next);
    saveArtistProfile(authUser.email, next);
    onChanged();
  };

  const toggleGenre = (g) => {
    if (!profile) return;
    update({
      genres: profile.genres.includes(g)
        ? profile.genres.filter((x) => x !== g)
        : [...profile.genres, g].slice(0, 4),
    });
  };

  const save = () => {
    if (profile) saveArtistProfile(authUser.email, profile);
    setDirty(false);
    onSaved();
  };

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
      {/* ── Editor ── */}
      <div
        style={{
          flex: 1,
          minWidth: 320,
          maxWidth: 540,
          background: BG.card,
          border: "1px solid " + BORDER,
          borderRadius: 12,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          boxSizing: "border-box",
        }}
      >
        {/* ── Ảnh đại diện ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            onClick={() => avatarInputRef.current?.click()}
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: avatarUrl ? `url(${avatarUrl}) center/cover` : themeColor,
              color: "#fff",
              fontSize: 30,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.04)";
              e.currentTarget.querySelector("[data-overlay]").style.opacity = 1;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.querySelector("[data-overlay]").style.opacity = 0;
            }}
          >
            {!avatarUrl && authUser?.initial}
            <div
              data-overlay
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0,
                transition: "opacity 0.15s",
              }}
            >
              <FontAwesomeIcon icon={faCamera} style={{ fontSize: 18 }} />
            </div>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => changeAvatar(e.target.files?.[0])}
          />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT.mid, marginBottom: 4 }}>
              Ảnh đại diện
            </div>
            <div style={{ fontSize: 11, color: TEXT.tertiary, lineHeight: 1.5, marginBottom: 8 }}>
              JPG, PNG — hiển thị khắp Studio và hồ sơ công khai. Áp dụng ngay khi chọn.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => avatarInputRef.current?.click()}
                style={{
                  background: "transparent",
                  border: "1px solid " + BORDER,
                  color: TEXT.mid,
                  borderRadius: 9999,
                  padding: "5px 14px",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <FontAwesomeIcon icon={faCamera} style={{ fontSize: 9, marginRight: 6 }} />
                Đổi ảnh
              </button>
              {avatarUrl && (
                <button
                  onClick={removeAvatar}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(239,68,68,0.4)",
                    color: "#f87171",
                    borderRadius: 9999,
                    padding: "5px 14px",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} style={{ fontSize: 9, marginRight: 6 }} />
                  Gỡ ảnh
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Nghệ danh ── */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: TEXT.mid, marginBottom: 6 }}>
            Nghệ danh
          </div>
          <input
            value={profile.displayName}
            onChange={(e) => update({ displayName: e.target.value.slice(0, 40) })}
            placeholder={authUser?.name}
            onFocus={(e) => (e.target.style.borderColor = C[500])}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            style={inputStyle}
          />
          <div style={{ fontSize: 10, color: TEXT.tertiary, marginTop: 5 }}>
            Tên hiển thị với người nghe — bài đăng mới sẽ dùng nghệ danh này.
          </div>
        </div>

        {/* ── Màu chủ đề ── */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: TEXT.mid, marginBottom: 8 }}>
            Màu chủ đề hồ sơ
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => update({ themeColor: "" })}
              title="Màu mặc định tài khoản"
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: authUser?.color,
                border: "none",
                cursor: "pointer",
                outline: !profile.themeColor ? "2px solid #fff" : "none",
                outlineOffset: 2,
                transform: !profile.themeColor ? "scale(1.12)" : "scale(1)",
                transition: "transform 0.15s",
              }}
            />
            {THEME_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => update({ themeColor: color })}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: color,
                  border: "none",
                  cursor: "pointer",
                  outline: profile.themeColor === color ? "2px solid #fff" : "none",
                  outlineOffset: 2,
                  transform: profile.themeColor === color ? "scale(1.12)" : "scale(1)",
                  transition: "transform 0.15s",
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 6,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT.mid }}>Giới thiệu</div>
            <div style={{ fontSize: 10, color: TEXT.tertiary }}>
              {profile.bio.length}/{BIO_MAX}
            </div>
          </div>
          <textarea
            value={profile.bio}
            onChange={(e) => update({ bio: e.target.value.slice(0, BIO_MAX) })}
            placeholder="Kể câu chuyện âm nhạc của bạn cho người hâm mộ..."
            onFocus={(e) => (e.target.style.borderColor = C[500])}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            style={{
              ...inputStyle,
              minHeight: 100,
              resize: "vertical",
              fontFamily: "inherit",
              lineHeight: 1.6,
            }}
          />
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 8,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT.mid }}>Thể loại chính</div>
            <div style={{ fontSize: 10, color: TEXT.tertiary }}>tối đa 4</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {GENRE_OPTIONS.map((g) => {
              const active = profile.genres.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggleGenre(g)}
                  style={{
                    background: active ? C[500] + "22" : "transparent",
                    border: active ? `1px solid ${C[500]}` : "1px solid " + BORDER,
                    color: active ? C[400] : TEXT.secondary,
                    borderRadius: 9999,
                    padding: "5px 14px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: TEXT.mid, marginBottom: 8 }}>
            Liên kết
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {LINK_FIELDS.map((f) => (
              <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "var(--overlay-1)",
                    color: TEXT.tertiary,
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FontAwesomeIcon icon={f.icon} />
                </div>
                <input
                  value={profile.links[f.key]}
                  onChange={(e) =>
                    update({ links: { ...profile.links, [f.key]: e.target.value } })
                  }
                  placeholder={f.placeholder}
                  onFocus={(e) => (e.target.style.borderColor = C[500])}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={save}
          disabled={!dirty}
          style={{
            width: "100%",
            background: dirty
              ? `linear-gradient(90deg, ${C[600]}, ${C[500]})`
              : "var(--overlay-1)",
            color: dirty ? "#fff" : TEXT.tertiary,
            border: "none",
            borderRadius: 9999,
            padding: 11,
            fontSize: 13,
            fontWeight: 700,
            cursor: dirty ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          {dirty ? "Lưu hồ sơ" : "Đã lưu"}
        </button>
      </div>

      {/* ── Public preview ── */}
      <div style={{ width: 280, flexShrink: 0 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: TEXT.tertiary,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Hồ sơ công khai
        </div>
        <div
          style={{
            background: BG.card,
            border: "1px solid " + BORDER,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: `linear-gradient(160deg, ${themeColor}55 0%, ${themeColor}1a 65%, transparent 100%)`,
              padding: "24px 18px 16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                background: avatarUrl ? `url(${avatarUrl}) center/cover` : themeColor,
                color: "#fff",
                fontSize: 28,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                boxShadow: `0 6px 22px ${themeColor}66`,
              }}
            >
              {!avatarUrl && authUser?.initial}
            </div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: TEXT.strong,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {stageName}
              <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 12, color: "#60a5fa" }} />
            </div>
            <div
              style={{
                fontSize: 11,
                color: TEXT.secondary,
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <FontAwesomeIcon icon={faUsers} style={{ fontSize: 9 }} />
              {formatCompact(analytics.followers)} người theo dõi
            </div>
          </div>

          <div style={{ padding: "12px 18px 18px" }}>
            <div
              style={{
                fontSize: 12,
                color: profile.bio ? TEXT.secondary : TEXT.tertiary,
                lineHeight: 1.6,
                marginBottom: 12,
                fontStyle: profile.bio ? "normal" : "italic",
              }}
            >
              {profile.bio || "Chưa có giới thiệu — hãy kể câu chuyện của bạn."}
            </div>
            {profile.genres.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {profile.genres.map((g) => (
                  <span
                    key={g}
                    style={{
                      borderRadius: 9999,
                      padding: "3px 10px",
                      fontSize: 10,
                      fontWeight: 600,
                      color: TEXT.mid,
                      background: "var(--overlay-1)",
                      border: "1px solid " + BORDER,
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
            {Object.entries(profile.links).filter(([, v]) => v.trim()).length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(profile.links)
                  .filter(([, v]) => v.trim())
                  .map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 11,
                        color: C[400],
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <FontAwesomeIcon icon={faLink} style={{ fontSize: 9, flexShrink: 0 }} />
                      {v}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ fontSize: 11, color: TEXT.tertiary, marginTop: 10, lineHeight: 1.6 }}>
          Người nghe sẽ thấy hồ sơ này trên trang nghệ sĩ của bạn.
        </div>
      </div>
    </div>
  );
}
