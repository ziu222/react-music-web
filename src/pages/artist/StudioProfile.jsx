import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faLink,
  faCircleCheck,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";
import { loadArtistProfile, saveArtistProfile } from "../../lib/artistProfile";
import { getArtistAnalytics, formatCompact } from "../../lib/artistStats";

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

export default function StudioProfile({ authUser, mySubs, onSaved }) {
  const [profile, setProfile] = useState(() => loadArtistProfile(authUser?.email ?? ""));
  const [dirty, setDirty] = useState(false);

  const analytics = getArtistAnalytics(authUser?.email ?? "", mySubs);

  const update = (patch) => {
    setProfile((p) => ({ ...p, ...patch }));
    setDirty(true);
  };

  const toggleGenre = (g) => {
    update({
      genres: profile.genres.includes(g)
        ? profile.genres.filter((x) => x !== g)
        : [...profile.genres, g].slice(0, 4),
    });
  };

  const save = () => {
    saveArtistProfile(authUser.email, profile);
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
              background: `linear-gradient(160deg, ${authUser?.color ?? C[500]}55 0%, ${authUser?.color ?? C[500]}1a 65%, transparent 100%)`,
              padding: "24px 18px 16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                background: authUser?.color ?? C[500],
                color: "#fff",
                fontSize: 28,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                boxShadow: `0 6px 22px ${authUser?.color ?? C[500]}66`,
              }}
            >
              {authUser?.initial}
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
              {authUser?.name}
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
