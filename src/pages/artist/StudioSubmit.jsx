import { useState } from "react";
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

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: TEXT.mid, marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

export default function StudioSubmit({ authUser, onSubmitted }) {
  const [title, setTitle] = useState("");
  const [album, setAlbum] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);
  const [mins, setMins] = useState(3);
  const [secs, setSecs] = useState(30);
  const [cover, setCover] = useState(COVER_GRADIENTS[0]);

  const canSubmit = title.trim().length > 0;

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
    onSubmitted();
  };

  return (
    <div
      style={{
        maxWidth: 520,
        background: BG.card,
        border: "1px solid " + BORDER,
        borderRadius: 12,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
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

      <Field label="Thể loại">
        <select value={genre} onChange={(e) => setGenre(e.target.value)} style={inputStyle}>
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </Field>

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
    </div>
  );
}
