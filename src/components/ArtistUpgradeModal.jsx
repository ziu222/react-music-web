import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faMicrophone,
  faChevronLeft,
  faChevronRight,
  faCheck,
  faLink,
  faPlus,
  faTrash,
  faFileAudio,
  faCloudArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { C, BG, TEXT, BORDER } from "../constants/theme";
import { saveMediaBlob, deleteMediaBlob } from "../lib/mediaStore";
import { submitUpgradeRequest } from "../lib/upgradeRequests";
import { createNotification, loadNotifications, saveNotifications } from "../lib/notifications";

const GENRES = ["V-Pop", "Pop", "R&B", "Ballad", "EDM", "Hip-Hop", "Indie", "Acoustic", "Rock", "Khác"];
const ADMIN_KEY = "linh@melodies.local";
const STEP_LABELS = ["Thông tin", "Portfolio", "Xác nhận"];

function StepDot({ index, active, done }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          width: 26, height: 26, borderRadius: "50%",
          background: active ? C[500] : done ? C[700] : "var(--overlay-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700,
          color: active || done ? "#fff" : TEXT.tertiary,
          transition: "background 0.2s",
        }}
      >
        {done ? <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10 }} /> : index + 1}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: active ? TEXT.strong : TEXT.tertiary }}>
        {STEP_LABELS[index]}
      </span>
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 600, color: TEXT.mid, marginBottom: 6 }}>
      {children}
    </div>
  );
}

export default function ArtistUpgradeModal({ open, onClose, authUser, prefill = null }) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  // Step 0 fields
  const [artistName, setArtistName] = useState(prefill?.artistName ?? "");
  const [genre, setGenre] = useState(prefill?.genre ?? GENRES[0]);
  const [bio, setBio] = useState(prefill?.bio ?? "");

  // Step 1 fields
  const [sampleFiles, setSampleFiles] = useState([]); // [{ blobId, name }]
  const [sampleLinks, setSampleLinks] = useState(prefill?.sampleLinks ?? [""]);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const audioRef = useRef();

  // Step 2
  const [terms, setTerms] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const canStep0 = artistName.trim().length >= 2 && bio.trim().length >= 20;
  const canStep1 = sampleFiles.length > 0 || sampleLinks.some((l) => l.trim().length > 5);
  const canStep2 = terms;

  const handleAudioUpload = async (file) => {
    if (!file || !file.type.startsWith("audio/")) return;
    if (sampleFiles.length >= 2) return;
    setUploadProgress(true);
    try {
      const meta = await saveMediaBlob(file, "audio");
      setSampleFiles((prev) => [...prev, { blobId: meta.blobId, name: file.name }]);
    } finally {
      setUploadProgress(false);
    }
  };

  const removeFile = async (blobId) => {
    await deleteMediaBlob(blobId).catch(() => {});
    setSampleFiles((prev) => prev.filter((f) => f.blobId !== blobId));
  };

  const addLink = () => {
    if (sampleLinks.length < 2) setSampleLinks((prev) => [...prev, ""]);
  };

  const updateLink = (i, val) => {
    setSampleLinks((prev) => prev.map((l, idx) => (idx === i ? val : l)));
  };

  const removeLink = (i) => {
    setSampleLinks((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    if (!canStep2 || busy) return;
    setBusy(true);
    try {
      const validLinks = sampleLinks.filter((l) => l.trim().length > 5);
      submitUpgradeRequest(authUser.email, {
        artistName: artistName.trim(),
        genre,
        bio: bio.trim(),
        sampleBlobIds: sampleFiles.map((f) => f.blobId),
        sampleLinks: validLinks,
      });
      // Notify admin
      const notif = createNotification(
        "system",
        "Đơn đăng ký nghệ sĩ mới",
        `${authUser.name} muốn trở thành nghệ sĩ với tên "${artistName.trim()}" — ${genre}`
      );
      saveNotifications(ADMIN_KEY, [notif, ...loadNotifications(ADMIN_KEY)]);
      setDone(true);
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    if (done) {
      // reset state for next open
      setStep(0); setArtistName(""); setGenre(GENRES[0]); setBio("");
      setSampleFiles([]); setSampleLinks([""]); setTerms(false); setDone(false);
    }
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.65)", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        style={{
          width: 520, maxWidth: "96vw", maxHeight: "92vh",
          background: BG.page, border: "1px solid " + BORDER,
          borderRadius: 14, display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "18px 24px", borderBottom: "1px solid " + BORDER, flexShrink: 0,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: `linear-gradient(135deg, ${C[600]}, ${C[400]})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FontAwesomeIcon icon={faMicrophone} style={{ color: "#fff", fontSize: 14 }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: TEXT.strong }}>Đăng ký Nghệ sĩ</div>
            <div style={{ fontSize: 11, color: TEXT.tertiary }}>Melodies Studio</div>
          </div>
          <button
            onClick={handleClose}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: TEXT.tertiary, fontSize: 16 }}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Step indicators */}
        {!done && (
          <div style={{
            display: "flex", gap: 20, padding: "14px 24px",
            borderBottom: "1px solid " + BORDER, flexShrink: 0,
          }}>
            {STEP_LABELS.map((_, i) => (
              <StepDot key={i} index={i} active={step === i} done={step > i} />
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

          {/* === DONE STATE === */}
          {done && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: `${C[500]}22`, margin: "0 auto 16px",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FontAwesomeIcon icon={faCheck} style={{ fontSize: 22, color: C[400] }} />
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: TEXT.strong, marginBottom: 8 }}>
                Đơn đăng ký đã gửi!
              </div>
              <div style={{ fontSize: 13, color: TEXT.secondary, lineHeight: 1.6, maxWidth: 320, margin: "0 auto 24px" }}>
                Admin sẽ xét duyệt đơn của bạn. Bạn sẽ nhận thông báo khi có kết quả.
              </div>
              <button
                onClick={handleClose}
                style={{
                  background: `linear-gradient(90deg, ${C[600]}, ${C[500]})`,
                  color: "#fff", border: "none", borderRadius: 9999,
                  padding: "9px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                Đóng
              </button>
            </div>
          )}

          {/* === STEP 0 — Thông tin nghệ sĩ === */}
          {!done && step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <FieldLabel>Tên nghệ sĩ *</FieldLabel>
              <input
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                maxLength={50}
                placeholder="Tên bạn muốn xuất hiện trên Melodies"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 8, boxSizing: "border-box",
                  background: "var(--overlay-1)", border: "1px solid " + BORDER,
                  color: TEXT.strong, fontSize: 13, outline: "none",
                }}
              />

              <FieldLabel>Thể loại chính *</FieldLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGenre(g)}
                    style={{
                      padding: "5px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 600,
                      border: `1px solid ${genre === g ? C[500] : BORDER}`,
                      background: genre === g ? `${C[500]}22` : "transparent",
                      color: genre === g ? C[400] : TEXT.secondary,
                      cursor: "pointer",
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>

              <div>
                <FieldLabel>Giới thiệu bản thân * ({bio.length}/500)</FieldLabel>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 500))}
                  placeholder="Bạn là ai? Bạn làm nhạc như thế nào? Điều gì truyền cảm hứng cho bạn? (tối thiểu 20 ký tự)"
                  rows={4}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 8, boxSizing: "border-box",
                    background: "var(--overlay-1)", border: "1px solid " + BORDER,
                    color: TEXT.strong, fontSize: 13, resize: "vertical", outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>
            </div>
          )}

          {/* === STEP 1 — Portfolio === */}
          {!done && step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ fontSize: 13, color: TEXT.secondary, lineHeight: 1.6 }}>
                Hãy cho admin nghe nhạc của bạn. Upload tối đa 2 file audio hoặc cung cấp link ngoài.
              </div>

              {/* Upload files */}
              <div>
                <FieldLabel>Upload file mẫu (mp3/wav — tối đa 2 file)</FieldLabel>
                <input
                  ref={audioRef}
                  type="file"
                  accept="audio/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleAudioUpload(e.target.files?.[0])}
                />
                <div
                  onClick={() => !uploadProgress && sampleFiles.length < 2 && audioRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault(); setDragOver(false);
                    handleAudioUpload(e.dataTransfer.files?.[0]);
                  }}
                  style={{
                    border: `1.5px dashed ${dragOver ? C[500] : BORDER}`,
                    borderRadius: 8, padding: "16px", textAlign: "center",
                    cursor: sampleFiles.length >= 2 ? "not-allowed" : "pointer",
                    opacity: sampleFiles.length >= 2 ? 0.45 : 1,
                    color: TEXT.tertiary, fontSize: 12,
                  }}
                >
                  {uploadProgress
                    ? "Đang upload..."
                    : sampleFiles.length >= 2
                    ? "Đã đủ 2 file"
                    : <><FontAwesomeIcon icon={faCloudArrowUp} style={{ marginRight: 6 }} />Kéo thả hoặc click để chọn file</>
                  }
                </div>

                {sampleFiles.map((f) => (
                  <div key={f.blobId} style={{
                    display: "flex", alignItems: "center", gap: 8, marginTop: 8,
                    padding: "8px 12px", borderRadius: 7, background: "var(--overlay-1)",
                  }}>
                    <FontAwesomeIcon icon={faFileAudio} style={{ color: C[400], fontSize: 13 }} />
                    <span style={{ flex: 1, fontSize: 12, color: TEXT.strong, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.name}
                    </span>
                    <button
                      onClick={() => removeFile(f.blobId)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: TEXT.tertiary, fontSize: 13 }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Links */}
              <div>
                <FieldLabel>Hoặc nhập link (SoundCloud / YouTube / Spotify)</FieldLabel>
                {sampleLinks.map((link, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <FontAwesomeIcon icon={faLink} style={{
                        position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
                        color: TEXT.tertiary, fontSize: 12,
                      }} />
                      <input
                        value={link}
                        onChange={(e) => updateLink(i, e.target.value)}
                        placeholder="https://soundcloud.com/..."
                        style={{
                          width: "100%", boxSizing: "border-box",
                          padding: "9px 12px 9px 28px", borderRadius: 8,
                          background: "var(--overlay-1)", border: "1px solid " + BORDER,
                          color: TEXT.strong, fontSize: 12, outline: "none",
                        }}
                      />
                    </div>
                    {sampleLinks.length > 1 && (
                      <button
                        onClick={() => removeLink(i)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: TEXT.tertiary }}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    )}
                  </div>
                ))}
                {sampleLinks.length < 2 && (
                  <button
                    onClick={addLink}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: C[400], fontSize: 12, fontWeight: 600,
                      display: "flex", alignItems: "center", gap: 5,
                    }}
                  >
                    <FontAwesomeIcon icon={faPlus} style={{ fontSize: 10 }} />
                    Thêm link
                  </button>
                )}
              </div>
            </div>
          )}

          {/* === STEP 2 — Xác nhận === */}
          {!done && step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT.strong }}>Xem lại thông tin</div>

              {[
                ["Tên nghệ sĩ", artistName],
                ["Thể loại", genre],
                ["Giới thiệu", bio],
                ["File mẫu", sampleFiles.length > 0 ? `${sampleFiles.length} file` : "Không có"],
                ["Link ngoài", sampleLinks.filter((l) => l.trim().length > 5).join(", ") || "Không có"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", gap: 12, fontSize: 12 }}>
                  <span style={{ width: 90, flexShrink: 0, color: TEXT.tertiary }}>{label}</span>
                  <span style={{ color: TEXT.strong, flex: 1, wordBreak: "break-word" }}>{value}</span>
                </div>
              ))}

              <div
                style={{
                  marginTop: 8, padding: "14px 16px", borderRadius: 8,
                  background: "var(--overlay-1)", border: "1px solid " + BORDER,
                  fontSize: 12, color: TEXT.secondary, lineHeight: 1.7,
                }}
              >
                <strong style={{ color: TEXT.strong }}>Điều khoản Nghệ sĩ Melodies</strong>
                <br />
                Bằng cách gửi đơn, bạn cam kết: (1) Nội dung là tác phẩm gốc hoặc bạn có quyền phân phối;
                (2) Không vi phạm bản quyền của bên thứ ba; (3) Tuân thủ Chính sách nội dung của Melodies.
              </div>

              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  style={{ marginTop: 2, accentColor: C[500] }}
                />
                <span style={{ fontSize: 12, color: TEXT.secondary }}>
                  Tôi đã đọc và đồng ý với Điều khoản Nghệ sĩ Melodies
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {!done && (
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 24px", borderTop: "1px solid " + BORDER, flexShrink: 0,
          }}>
            <button
              onClick={() => step > 0 ? setStep(step - 1) : handleClose()}
              style={{
                background: "transparent", border: "1px solid " + BORDER,
                borderRadius: 9999, padding: "7px 18px", fontSize: 12,
                fontWeight: 600, color: TEXT.secondary, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {step > 0 && <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 10 }} />}
              {step === 0 ? "Hủy" : "Quay lại"}
            </button>

            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={(step === 0 && !canStep0) || (step === 1 && !canStep1)}
                style={{
                  background: `linear-gradient(90deg, ${C[600]}, ${C[500]})`,
                  color: "#fff", border: "none", borderRadius: 9999,
                  padding: "7px 22px", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  opacity: ((step === 0 && !canStep0) || (step === 1 && !canStep1)) ? 0.45 : 1,
                }}
              >
                Tiếp theo
                <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 10 }} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canStep2 || busy}
                style={{
                  background: `linear-gradient(90deg, ${C[600]}, ${C[500]})`,
                  color: "#fff", border: "none", borderRadius: 9999,
                  padding: "7px 22px", fontSize: 12, fontWeight: 700,
                  cursor: busy || !canStep2 ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 6,
                  opacity: !canStep2 || busy ? 0.45 : 1,
                }}
              >
                {busy ? "Đang gửi..." : "Gửi đơn đăng ký"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
