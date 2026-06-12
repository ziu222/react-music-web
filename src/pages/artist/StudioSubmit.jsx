import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMusic,
  faFileAudio,
  faXmark,
  faCloudArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";
import { addSubmission } from "../../lib/submissions";
import {
  loadNotifications,
  saveNotifications,
  createNotification,
} from "../../lib/notifications";

const GENRES = ["V-Pop", "Pop", "R&B", "Ballad", "EDM", "Dance", "Hip-Hop", "Indie", "Acoustic", "Rock"];

const COVER_GRADIENTS = [
  "linear-gradient(135deg,#ea580c,#f97316)",
  "linear-gradient(135deg,#7c3aed,#a78bfa)",
  "linear-gradient(135deg,#0369a1,#38bdf8)",
  "linear-gradient(135deg,#be123c,#fb7185)",
  "linear-gradient(135deg,#047857,#34d399)",
  "linear-gradient(135deg,#b45309,#fbbf24)",
];

const ADMIN_KEY = "linh@melodies.local";
const LYRICS_MAX = 2000;

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

function Field({ label, hint, children }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, color: TEXT.mid }}>{label}</div>
        {hint && <div style={{ fontSize: 10, color: TEXT.tertiary }}>{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function formatSize(bytes) {
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + " MB";
  return Math.round(bytes / 1e3) + " KB";
}

export default function StudioSubmit({ authUser, onSubmitted }) {
  const [title, setTitle] = useState("");
  const [album, setAlbum] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);
  const [mins, setMins] = useState(3);
  const [secs, setSecs] = useState(30);
  const [cover, setCover] = useState(COVER_GRADIENTS[0]);
  const [lyrics, setLyrics] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const canSubmit = title.trim().length > 0;

  const acceptFile = (file) => {
    if (!file) return;
    setAudioFile({ name: file.name, size: file.size });
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const m = Math.max(0, Number(mins) || 0);
    const s = Math.min(59, Math.max(0, Number(secs) || 0));
    addSubmission({
      artistEmail: authUser.email.toLowerCase(),
      artistName: authUser.name,
      title: title.trim(),
      album: album.trim() || "Single",
      genre,
      duration: m + ":" + String(s).padStart(2, "0"),
      durationSecs: m * 60 + s,
      bg: cover,
      lyrics: lyrics.trim() || null,
      audioFileName: audioFile?.name ?? null,
    });
    saveNotifications(ADMIN_KEY, [
      createNotification(
        "system",
        "Bài hát mới chờ duyệt",
        `${authUser.name} đã gửi "${title.trim()}" — vào tab Duyệt bài hát để xem.`
      ),
      ...loadNotifications(ADMIN_KEY),
    ]);
    setTitle("");
    setAlbum("");
    setGenre(GENRES[0]);
    setMins(3);
    setSecs(30);
    setCover(COVER_GRADIENTS[0]);
    setLyrics("");
    setAudioFile(null);
    onSubmitted();
  };

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
      {/* ── Form ── */}
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
          gap: 16,
          boxSizing: "border-box",
        }}
      >
        <Field label="File audio (demo)">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              acceptFile(e.dataTransfer.files?.[0]);
            }}
            style={{
              border: `1.5px dashed ${dragOver ? C[500] : "var(--border)"}`,
              background: dragOver ? C[500] + "11" : "var(--overlay-1)",
              borderRadius: 10,
              padding: audioFile ? "12px 14px" : "22px 14px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              style={{ display: "none" }}
              onChange={(e) => acceptFile(e.target.files?.[0])}
            />
            {audioFile ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FontAwesomeIcon icon={faFileAudio} style={{ fontSize: 16, color: C[400] }} />
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: TEXT.strong,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {audioFile.name}
                  </div>
                  <div style={{ fontSize: 10, color: TEXT.tertiary }}>
                    {formatSize(audioFile.size)} · sẵn sàng gửi
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setAudioFile(null);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: TEXT.tertiary,
                    cursor: "pointer",
                    fontSize: 13,
                    padding: 4,
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            ) : (
              <>
                <FontAwesomeIcon
                  icon={faCloudArrowUp}
                  style={{ fontSize: 20, color: TEXT.tertiary, marginBottom: 6 }}
                />
                <div style={{ fontSize: 12, color: TEXT.secondary }}>
                  Kéo thả file audio hoặc bấm để chọn
                </div>
                <div style={{ fontSize: 10, color: TEXT.tertiary, marginTop: 2 }}>
                  MP3, WAV, FLAC — bản demo, không upload thật
                </div>
              </>
            )}
          </div>
        </Field>

        <Field label="Tên bài hát *">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tên bài hát..."
            onFocus={(e) => (e.target.style.borderColor = C[500])}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            style={inputStyle}
          />
        </Field>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <Field label="Album">
              <input
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Single"
                onFocus={(e) => (e.target.style.borderColor = C[500])}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                style={inputStyle}
              />
            </Field>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <Field label="Thể loại">
              <select value={genre} onChange={(e) => setGenre(e.target.value)} style={inputStyle}>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <Field label="Thời lượng (phút : giây)">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="number"
              min={0}
              max={20}
              value={mins}
              onChange={(e) => setMins(e.target.value)}
              style={{ ...inputStyle, width: 80 }}
            />
            <span style={{ color: TEXT.tertiary, fontWeight: 700 }}>:</span>
            <input
              type="number"
              min={0}
              max={59}
              value={secs}
              onChange={(e) => setSecs(e.target.value)}
              style={{ ...inputStyle, width: 80 }}
            />
          </div>
        </Field>

        <Field label="Ảnh bìa (gradient)">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {COVER_GRADIENTS.map((g) => (
              <button
                key={g}
                onClick={() => setCover(g)}
                aria-label="Chọn ảnh bìa"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: g,
                  border: "none",
                  cursor: "pointer",
                  outline: cover === g ? "2px solid #fff" : "none",
                  outlineOffset: 2,
                  transform: cover === g ? "scale(1.08)" : "scale(1)",
                  transition: "transform 0.15s",
                }}
              />
            ))}
          </div>
        </Field>

        <Field
          label="Lời bài hát (tùy chọn)"
          hint={`${lyrics.length}/${LYRICS_MAX}`}
        >
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value.slice(0, LYRICS_MAX))}
            placeholder={"Verse 1...\nChorus..."}
            onFocus={(e) => (e.target.style.borderColor = C[500])}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            style={{
              ...inputStyle,
              minHeight: 110,
              resize: "vertical",
              fontFamily: "inherit",
              lineHeight: 1.6,
            }}
          />
        </Field>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            width: "100%",
            background: `linear-gradient(90deg, ${C[600]}, ${C[500]})`,
            color: "#fff",
            border: "none",
            borderRadius: 9999,
            padding: 11,
            fontSize: 13,
            fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.5,
          }}
        >
          Gửi bài hát chờ duyệt
        </button>
        {!canSubmit && (
          <div style={{ fontSize: 11, color: TEXT.tertiary, textAlign: "center", marginTop: -8 }}>
            Nhập tên bài hát để gửi
          </div>
        )}
      </div>

      {/* ── Live preview ── */}
      <div style={{ width: 250, flexShrink: 0, position: "sticky", top: 0 }}>
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
          Xem trước
        </div>
        <div
          style={{
            background: BG.card,
            border: "1px solid " + BORDER,
            borderRadius: 12,
            padding: 16,
            transition: "all 0.2s",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "1",
              borderRadius: 8,
              background: cover,
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-cover)",
            }}
          >
            <FontAwesomeIcon
              icon={faMusic}
              style={{ fontSize: 34, color: "rgba(255,255,255,0.55)" }}
            />
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: TEXT.strong,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title.trim() || "Tên bài hát"}
          </div>
          <div
            style={{
              fontSize: 12,
              color: TEXT.secondary,
              marginTop: 3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {authUser?.name}
          </div>
          <div style={{ fontSize: 11, color: TEXT.tertiary, marginTop: 3 }}>
            {(album.trim() || "Single") + " · " + genre + " · " + (Number(mins) || 0) + ":" + String(Math.min(59, Number(secs) || 0)).padStart(2, "0")}
          </div>
        </div>
        <div style={{ fontSize: 11, color: TEXT.tertiary, marginTop: 10, lineHeight: 1.6 }}>
          Đây là cách bài hát hiển thị với người nghe sau khi được phê duyệt.
        </div>
      </div>
    </div>
  );
}
