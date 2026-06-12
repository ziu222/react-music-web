import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMusic,
  faFileAudio,
  faXmark,
  faCloudArrowUp,
  faImage,
  faPlus,
  faCheck,
  faChevronLeft,
  faChevronRight,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../../constants/theme";
import { addSubmission, updateSubmission, submitDraft } from "../../lib/submissions";
import {
  saveMediaBlob,
  deleteMediaBlob,
  getMediaBlobUrl,
  revokeMediaBlobUrl,
  readAudioDuration,
} from "../../lib/mediaStore";
import {
  loadNotifications,
  saveNotifications,
  createNotification,
} from "../../lib/notifications";

const GENRES = ["V-Pop", "Pop", "R&B", "Ballad", "EDM", "Dance", "Hip-Hop", "Indie", "Acoustic", "Rock"];
const LANGUAGES = ["Tiếng Việt", "Tiếng Anh", "Tiếng Hàn", "Tiếng Nhật", "Không lời", "Khác"];
const CONTRIBUTOR_ROLES = ["Sáng tác", "Sản xuất", "Featuring", "Mix/Master", "Hòa âm"];

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

const STEPS = [
  { key: 0, label: "Tải lên" },
  { key: 1, label: "Chi tiết" },
  { key: 2, label: "Bản quyền & gửi" },
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
  if (!bytes && bytes !== 0) return "";
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + " MB";
  return Math.round(bytes / 1e3) + " KB";
}

function formatDuration(secs) {
  if (!secs) return "0:00";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m + ":" + String(s).padStart(2, "0");
}

export default function StudioSubmit({ authUser, draft = null, onSubmitted, onDraftSaved }) {
  const [step, setStep] = useState(0);

  const [title, setTitle] = useState(draft?.title ?? "");
  const [album, setAlbum] = useState(draft?.album === "Single" ? "" : draft?.album ?? "");
  const [genre, setGenre] = useState(draft?.genre ?? GENRES[0]);
  const [language, setLanguage] = useState(draft?.language ?? LANGUAGES[0]);
  const [explicit, setExplicit] = useState(draft?.explicit ?? false);
  const [lyricsText, setLyricsText] = useState(draft?.lyricsText ?? "");
  const [contributors, setContributors] = useState(draft?.contributors ?? []);
  const [copyrightOwner, setCopyrightOwner] = useState(
    draft?.copyrightOwner || authUser?.name || ""
  );
  const [rightsConfirmed, setRightsConfirmed] = useState(draft?.rightsConfirmed ?? false);
  const [bg, setBg] = useState(draft?.bg ?? COVER_GRADIENTS[0]);

  // Media: meta lưu submission, url chỉ để preview trong phiên này
  const [audioMeta, setAudioMeta] = useState(
    draft?.audioBlobId
      ? { id: draft.audioBlobId, name: draft.audioFileName, type: draft.audioFileType, size: draft.audioFileSize }
      : null
  );
  const [audioUrl, setAudioUrl] = useState(null);
  const [durationSecs, setDurationSecs] = useState(draft?.durationSecs ?? 0);
  const [coverMeta, setCoverMeta] = useState(
    draft?.coverBlobId
      ? { id: draft.coverBlobId, name: draft.coverFileName, type: draft.coverFileType, size: draft.coverFileSize }
      : null
  );
  const [coverUrl, setCoverUrl] = useState(null);

  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const audioInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Khôi phục preview cho draft đang sửa
  useEffect(() => {
    let alive = true;
    if (draft?.audioBlobId) {
      getMediaBlobUrl(draft.audioBlobId).then((url) => alive && setAudioUrl(url));
    }
    if (draft?.coverBlobId) {
      getMediaBlobUrl(draft.coverBlobId).then((url) => alive && setCoverUrl(url));
    }
    return () => {
      alive = false;
    };
  }, [draft?.audioBlobId, draft?.coverBlobId]);

  useEffect(
    () => () => {
      revokeMediaBlobUrl(audioUrl);
      revokeMediaBlobUrl(coverUrl);
    },
    [audioUrl, coverUrl]
  );

  const acceptAudio = async (file) => {
    if (!file || !file.type.startsWith("audio/")) return;
    setBusy(true);
    if (audioMeta?.id) await deleteMediaBlob(audioMeta.id);
    revokeMediaBlobUrl(audioUrl);
    const meta = await saveMediaBlob(file, "audio");
    const secs = await readAudioDuration(file);
    setAudioMeta(meta);
    setAudioUrl(URL.createObjectURL(file));
    if (secs) setDurationSecs(secs);
    setBusy(false);
  };

  const removeAudio = async () => {
    if (audioMeta?.id) await deleteMediaBlob(audioMeta.id);
    revokeMediaBlobUrl(audioUrl);
    setAudioMeta(null);
    setAudioUrl(null);
    setDurationSecs(0);
  };

  const acceptCover = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setBusy(true);
    if (coverMeta?.id) await deleteMediaBlob(coverMeta.id);
    revokeMediaBlobUrl(coverUrl);
    const meta = await saveMediaBlob(file, "cover");
    setCoverMeta(meta);
    setCoverUrl(URL.createObjectURL(file));
    setBusy(false);
  };

  const removeCover = async () => {
    if (coverMeta?.id) await deleteMediaBlob(coverMeta.id);
    revokeMediaBlobUrl(coverUrl);
    setCoverMeta(null);
    setCoverUrl(null);
  };

  const buildData = () => ({
    artistEmail: authUser.email.toLowerCase(),
    artistName: authUser.name,
    title: title.trim(),
    album: album.trim() || "Single",
    genre,
    duration: formatDuration(durationSecs),
    durationSecs,
    explicit,
    language,
    lyricsText: lyricsText.trim(),
    contributors: contributors.filter((c) => c.name.trim()),
    copyrightOwner: copyrightOwner.trim(),
    rightsConfirmed,
    audioBlobId: audioMeta?.id ?? null,
    audioFileName: audioMeta?.name ?? null,
    audioFileType: audioMeta?.type ?? null,
    audioFileSize: audioMeta?.size ?? null,
    coverBlobId: coverMeta?.id ?? null,
    coverFileName: coverMeta?.name ?? null,
    coverFileType: coverMeta?.type ?? null,
    coverFileSize: coverMeta?.size ?? null,
    bg,
  });

  const canStep1 = Boolean(audioMeta);
  const canStep2 = title.trim().length > 0;
  const canSubmit = canStep1 && canStep2 && copyrightOwner.trim() && rightsConfirmed;
  const canDraft = title.trim().length > 0 || Boolean(audioMeta);

  const handleSaveDraft = () => {
    if (!canDraft) return;
    if (draft) updateSubmission(draft.id, buildData());
    else addSubmission(buildData(), { draft: true });
    onDraftSaved();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (draft) {
      updateSubmission(draft.id, buildData());
      submitDraft(draft.id);
    } else {
      addSubmission(buildData());
    }
    saveNotifications(ADMIN_KEY, [
      createNotification(
        "system",
        "Bài hát mới chờ duyệt",
        `${authUser.name} đã tải lên "${title.trim()}" — vào tab Duyệt bài hát để nghe thử.`
      ),
      ...loadNotifications(ADMIN_KEY),
    ]);
    onSubmitted();
  };

  const stepDisabled = [false, !canStep1, !canStep2];

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 340, maxWidth: 560 }}>
        {/* ── Step indicator ── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {STEPS.map((s, i) => {
            const active = step === i;
            const done = step > i;
            return (
              <button
                key={s.key}
                onClick={() => !stepDisabled[i] && setStep(i)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  cursor: stepDisabled[i] ? "not-allowed" : "pointer",
                  padding: 0,
                  opacity: stepDisabled[i] ? 0.45 : 1,
                }}
              >
                <div
                  style={{
                    height: 4,
                    borderRadius: 9999,
                    background: active || done ? C[500] : "var(--overlay-2)",
                    marginBottom: 7,
                    transition: "background 0.25s",
                  }}
                />
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: active ? TEXT.strong : done ? C[400] : TEXT.tertiary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                  }}
                >
                  {done && <FontAwesomeIcon icon={faCheck} style={{ fontSize: 9 }} />}
                  {i + 1}. {s.label}
                </div>
              </button>
            );
          })}
        </div>

        <div
          key={step}
          style={{
            background: BG.card,
            border: "1px solid " + BORDER,
            borderRadius: 12,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            boxSizing: "border-box",
            animation: "slideUp 0.25s ease",
          }}
        >
          {/* ════ STEP 1: Upload ════ */}
          {step === 0 && (
            <>
              <Field label="File audio *" hint="MP3, WAV, FLAC">
                <div
                  onClick={() => !audioMeta && audioInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    acceptAudio(e.dataTransfer.files?.[0]);
                  }}
                  style={{
                    border: `1.5px dashed ${dragOver ? C[500] : "var(--border)"}`,
                    background: dragOver ? C[500] + "11" : "var(--overlay-1)",
                    borderRadius: 10,
                    padding: audioMeta ? "14px" : "26px 14px",
                    textAlign: "center",
                    cursor: audioMeta ? "default" : "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    style={{ display: "none" }}
                    onChange={(e) => acceptAudio(e.target.files?.[0])}
                  />
                  {audioMeta ? (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <FontAwesomeIcon icon={faFileAudio} style={{ fontSize: 17, color: C[400] }} />
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
                            {audioMeta.name}
                          </div>
                          <div style={{ fontSize: 10, color: TEXT.tertiary }}>
                            {formatSize(audioMeta.size)} · {formatDuration(durationSecs)}
                          </div>
                        </div>
                        <button
                          onClick={removeAudio}
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
                      {audioUrl && (
                        <audio controls src={audioUrl} style={{ width: "100%", height: 36 }} />
                      )}
                    </div>
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={faCloudArrowUp}
                        style={{ fontSize: 22, color: busy ? C[400] : TEXT.tertiary, marginBottom: 6 }}
                      />
                      <div style={{ fontSize: 12, color: TEXT.secondary }}>
                        {busy ? "Đang xử lý..." : "Kéo thả file audio hoặc bấm để chọn"}
                      </div>
                      <div style={{ fontSize: 10, color: TEXT.tertiary, marginTop: 2 }}>
                        Lưu trong trình duyệt (IndexedDB) — thời lượng tự nhận diện
                      </div>
                    </>
                  )}
                </div>
              </Field>

              <Field label="Ảnh bìa (tùy chọn)" hint="JPG, PNG — vuông đẹp nhất">
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: 10,
                      background: coverUrl ? `url(${coverUrl}) center/cover` : bg,
                      cursor: "pointer",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid " + BORDER,
                      transition: "transform 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    {!coverUrl && (
                      <FontAwesomeIcon
                        icon={faImage}
                        style={{ fontSize: 18, color: "rgba(255,255,255,0.6)" }}
                      />
                    )}
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => acceptCover(e.target.files?.[0])}
                  />
                  <div style={{ flex: 1 }}>
                    {coverMeta ? (
                      <div style={{ fontSize: 11, color: TEXT.secondary, display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 180,
                          }}
                        >
                          {coverMeta.name}
                        </span>
                        <button
                          onClick={removeCover}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: TEXT.tertiary,
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: TEXT.tertiary, lineHeight: 1.5 }}>
                        Chưa có ảnh — chọn màu gradient bên dưới làm bìa tạm.
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 7, marginTop: 8, flexWrap: "wrap" }}>
                      {COVER_GRADIENTS.map((g) => (
                        <button
                          key={g}
                          onClick={() => setBg(g)}
                          aria-label="Chọn màu bìa"
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 6,
                            background: g,
                            border: "none",
                            cursor: "pointer",
                            outline: bg === g ? "2px solid #fff" : "none",
                            outlineOffset: 1,
                            transform: bg === g ? "scale(1.12)" : "scale(1)",
                            transition: "transform 0.15s",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Field>
            </>
          )}

          {/* ════ STEP 2: Details ════ */}
          {step === 1 && (
            <>
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
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 140 }}>
                  <Field label="Ngôn ngữ">
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} style={inputStyle}>
                      {LANGUAGES.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div style={{ flex: 1, minWidth: 140, display: "flex", alignItems: "flex-end" }}>
                  <button
                    onClick={() => setExplicit((e) => !e)}
                    style={{
                      width: "100%",
                      background: explicit ? "rgba(239,68,68,0.12)" : "transparent",
                      border: explicit ? "1px solid rgba(239,68,68,0.5)" : "1px solid " + BORDER,
                      color: explicit ? "#f87171" : TEXT.secondary,
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {explicit ? "🅴 Nội dung Explicit" : "Đánh dấu Explicit"}
                  </button>
                </div>
              </div>

              <Field label="Nghệ sĩ tham gia (tùy chọn)">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {contributors.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        value={c.name}
                        onChange={(e) =>
                          setContributors((list) =>
                            list.map((x, j) => (j === i ? { ...x, name: e.target.value } : x))
                          )
                        }
                        placeholder="Tên nghệ sĩ..."
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <select
                        value={c.role}
                        onChange={(e) =>
                          setContributors((list) =>
                            list.map((x, j) => (j === i ? { ...x, role: e.target.value } : x))
                          )
                        }
                        style={{ ...inputStyle, width: 130 }}
                      >
                        {CONTRIBUTOR_ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setContributors((list) => list.filter((_, j) => j !== i))}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: TEXT.tertiary,
                          cursor: "pointer",
                          fontSize: 13,
                          padding: 6,
                        }}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setContributors((list) => [...list, { name: "", role: CONTRIBUTOR_ROLES[0] }])
                    }
                    style={{
                      alignSelf: "flex-start",
                      background: "transparent",
                      border: "1px dashed " + BORDER,
                      color: TEXT.secondary,
                      borderRadius: 9999,
                      padding: "6px 14px",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FontAwesomeIcon icon={faPlus} style={{ fontSize: 9 }} />
                    Thêm nghệ sĩ
                  </button>
                </div>
              </Field>

              <Field label="Lời bài hát (tùy chọn)" hint={`${lyricsText.length}/${LYRICS_MAX}`}>
                <textarea
                  value={lyricsText}
                  onChange={(e) => setLyricsText(e.target.value.slice(0, LYRICS_MAX))}
                  placeholder={"Verse 1...\nChorus..."}
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
              </Field>
            </>
          )}

          {/* ════ STEP 3: Rights & submit ════ */}
          {step === 2 && (
            <>
              <Field label="Chủ sở hữu bản quyền *">
                <input
                  value={copyrightOwner}
                  onChange={(e) => setCopyrightOwner(e.target.value)}
                  placeholder="Tên cá nhân hoặc đơn vị sở hữu..."
                  onFocus={(e) => (e.target.style.borderColor = C[500])}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  style={inputStyle}
                />
              </Field>

              <button
                onClick={() => setRightsConfirmed((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  background: rightsConfirmed ? C[500] + "14" : "var(--overlay-1)",
                  border: rightsConfirmed ? `1px solid ${C[500]}88` : "1px solid " + BORDER,
                  borderRadius: 10,
                  padding: "12px 14px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 5,
                    flexShrink: 0,
                    marginTop: 1,
                    background: rightsConfirmed ? C[500] : "transparent",
                    border: rightsConfirmed ? "none" : "1.5px solid " + BORDER,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                >
                  {rightsConfirmed && (
                    <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10, color: "#fff" }} />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: TEXT.strong, marginBottom: 3 }}>
                    Tôi xác nhận sở hữu toàn bộ quyền đối với bản thu này
                  </div>
                  <div style={{ fontSize: 11, color: TEXT.tertiary, lineHeight: 1.5 }}>
                    Bao gồm quyền tác giả, quyền liên quan và quyền cho phép Melodies phát hành
                    bản thu đến người nghe trên nền tảng.
                  </div>
                </div>
              </button>

              {/* Summary */}
              <div
                style={{
                  background: "var(--overlay-1)",
                  border: "1px solid " + BORDER,
                  borderRadius: 10,
                  padding: 14,
                }}
              >
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
                  Tóm tắt phát hành
                </div>
                {[
                  ["Bài hát", title.trim() || "—"],
                  ["Album", album.trim() || "Single"],
                  ["Thể loại", genre + " · " + language + (explicit ? " · Explicit" : "")],
                  ["Thời lượng", formatDuration(durationSecs)],
                  ["Audio", audioMeta ? audioMeta.name : "Chưa tải lên"],
                  ["Ảnh bìa", coverMeta ? coverMeta.name : "Gradient mặc định"],
                  [
                    "Tham gia",
                    contributors.filter((c) => c.name.trim()).map((c) => `${c.name} (${c.role})`).join(", ") || "—",
                  ],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 10, padding: "3px 0" }}>
                    <div style={{ width: 86, fontSize: 11, color: TEXT.tertiary, flexShrink: 0 }}>{k}</div>
                    <div
                      style={{
                        flex: 1,
                        fontSize: 12,
                        color: TEXT.strong,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {v}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11,
                  color: TEXT.tertiary,
                }}
              >
                <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: 10 }} />
                Bài hát sẽ được quản trị viên nghe thử và phê duyệt trước khi xuất hiện với người nghe.
              </div>
            </>
          )}

          {/* ── Wizard nav ── */}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                style={{
                  background: "transparent",
                  border: "1px solid " + BORDER,
                  color: TEXT.mid,
                  borderRadius: 9999,
                  padding: "9px 18px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 9 }} />
                Quay lại
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button
              onClick={handleSaveDraft}
              disabled={!canDraft}
              style={{
                background: "transparent",
                border: "1px solid " + BORDER,
                color: canDraft ? TEXT.mid : TEXT.tertiary,
                borderRadius: 9999,
                padding: "9px 18px",
                fontSize: 12,
                fontWeight: 600,
                cursor: canDraft ? "pointer" : "not-allowed",
                opacity: canDraft ? 1 : 0.5,
              }}
            >
              Lưu nháp
            </button>
            {step < 2 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 0 ? !canStep1 : !canStep2}
                style={{
                  background: `linear-gradient(90deg, ${C[600]}, ${C[500]})`,
                  color: "#fff",
                  border: "none",
                  borderRadius: 9999,
                  padding: "9px 22px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: (step === 0 ? canStep1 : canStep2) ? "pointer" : "not-allowed",
                  opacity: (step === 0 ? canStep1 : canStep2) ? 1 : 0.5,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Tiếp tục
                <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 9 }} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{
                  background: `linear-gradient(90deg, ${C[600]}, ${C[500]})`,
                  color: "#fff",
                  border: "none",
                  borderRadius: 9999,
                  padding: "9px 22px",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  opacity: canSubmit ? 1 : 0.5,
                }}
              >
                {draft ? "Gửi duyệt" : "Gửi bài hát chờ duyệt"}
              </button>
            )}
          </div>
        </div>
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
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "1",
              borderRadius: 8,
              background: coverUrl ? `url(${coverUrl}) center/cover` : bg,
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-cover)",
            }}
          >
            {!coverUrl && (
              <FontAwesomeIcon icon={faMusic} style={{ fontSize: 34, color: "rgba(255,255,255,0.55)" }} />
            )}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: TEXT.strong,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {explicit && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  background: "var(--overlay-2)",
                  color: TEXT.secondary,
                  borderRadius: 3,
                  padding: "1px 4px",
                  flexShrink: 0,
                }}
              >
                E
              </span>
            )}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {title.trim() || "Tên bài hát"}
            </span>
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
            {contributors.filter((c) => c.name.trim()).length > 0 &&
              " ft. " + contributors.filter((c) => c.name.trim()).map((c) => c.name).join(", ")}
          </div>
          <div style={{ fontSize: 11, color: TEXT.tertiary, marginTop: 3 }}>
            {(album.trim() || "Single") + " · " + genre + " · " + formatDuration(durationSecs)}
          </div>
        </div>
        <div style={{ fontSize: 11, color: TEXT.tertiary, marginTop: 10, lineHeight: 1.6 }}>
          Sau khi được duyệt, bài hát xuất hiện trong catalog Melodies và người nghe có thể tìm
          kiếm, phát trực tiếp.
        </div>
      </div>
    </div>
  );
}
