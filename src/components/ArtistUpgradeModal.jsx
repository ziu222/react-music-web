import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faMicrophone,
  faChevronRight,
  faCheck,
  faLink,
  faPlus,
  faTrash,
  faFileAudio,
  faCloudArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import { saveMediaBlob, deleteMediaBlob } from "../lib/mediaStore";
import { submitUpgradeRequest } from "../lib/upgradeRequests";
import { createNotification, loadNotifications, saveNotifications } from "../lib/notifications";

const DS = {
  bg:        "#141111",
  surface:   "#1c1919",
  elevated:  "#282828",
  primary:   "#f97316",
  primaryDim:"#ea580c",
  border:    "rgba(255,255,255,0.10)",
  textPrimary:   "#ede5dd",
  textSecondary: "#b3b3b3",
  textMuted:     "#7a7070",
  radius:    "10px",
  radiusSm:  "7px",
  radiusPill:"9999px",
  font: "'Be Vietnam Pro', system-ui, sans-serif",
};

const GENRES = ["V-Pop","Pop","R&B","Ballad","EDM","Hip-Hop","Indie","Acoustic","Rock","Khác"];
const ADMIN_KEY = "linh@melodies.local";
const STEPS = ["Thông tin","Portfolio","Xác nhận"];

function StepBar({ current }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, paddingBottom:18 }}>
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", flex: i < STEPS.length-1 ? 1 : "unset" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
              <div style={{
                width:28, height:28, borderRadius:"50%",
                background: active ? DS.primary : done ? DS.primaryDim : "rgba(255,255,255,0.08)",
                border: `2px solid ${active ? DS.primary : done ? DS.primaryDim : "rgba(255,255,255,0.12)"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.2s",
                boxShadow: active ? `0 0 12px ${DS.primary}55` : "none",
              }}>
                {done
                  ? <FontAwesomeIcon icon={faCheck} style={{ fontSize:11, color:"#fff" }} />
                  : <span style={{ fontSize:11, fontWeight:700, color: active ? "#fff" : DS.textMuted }}>{i+1}</span>
                }
              </div>
              <span style={{
                fontSize:11, fontWeight: active ? 700 : 500,
                color: active ? DS.textPrimary : DS.textMuted,
                whiteSpace:"nowrap",
              }}>
                {label}
              </span>
            </div>
            {i < STEPS.length-1 && (
              <div style={{
                flex:1, height:1,
                background: done ? DS.primaryDim : "rgba(255,255,255,0.10)",
                marginBottom:23, marginLeft:6, marginRight:6,
                transition:"background 0.2s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <div style={{ fontSize:12, fontWeight:600, color:DS.textSecondary, marginBottom:8, letterSpacing:"0.02em" }}>
      {children}
    </div>
  );
}

export default function ArtistUpgradeModal({ open, onClose, authUser }) {
  const [step, setStep]         = useState(0);
  const [busy, setBusy]         = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [artistName, setArtistName] = useState("");
  const [genre, setGenre]           = useState("V-Pop");
  const [bio, setBio]               = useState("");

  const [sampleFiles, setSampleFiles] = useState([]);
  const [sampleLinks, setSampleLinks] = useState([""]);
  const [uploading, setUploading]     = useState(false);
  const [dragOver, setDragOver]       = useState(false);
  const audioInputRef = useRef();

  const [terms, setTerms] = useState(false);

  if (!open) return null;

  const ok0 = artistName.trim().length >= 2 && bio.trim().length >= 20;
  const ok1 = sampleFiles.length > 0 || sampleLinks.some(l => l.trim().length > 5);
  const ok2 = terms;

  const handleAudio = async (file) => {
    if (!file || !file.type.startsWith("audio/") || sampleFiles.length >= 2) return;
    setUploading(true);
    try {
      const meta = await saveMediaBlob(file, "audio");
      setSampleFiles(p => [...p, { blobId: meta.blobId, name: file.name }]);
    } finally { setUploading(false); }
  };

  const removeFile = async (blobId) => {
    await deleteMediaBlob(blobId).catch(()=>{});
    setSampleFiles(p => p.filter(f => f.blobId !== blobId));
  };

  const handleSubmit = async () => {
    if (!ok2 || busy || !authUser) return;
    setBusy(true);
    try {
      const validLinks = sampleLinks.filter(l => l.trim().length > 5);
      submitUpgradeRequest(authUser.email, {
        artistName: artistName.trim(), genre, bio: bio.trim(),
        sampleBlobIds: sampleFiles.map(f => f.blobId),
        sampleLinks: validLinks,
      });
      const notif = createNotification("system", "Đơn đăng ký nghệ sĩ mới",
        `${authUser.name} muốn trở thành nghệ sĩ — "${artistName.trim()}" · ${genre}`);
      saveNotifications(ADMIN_KEY, [notif, ...loadNotifications(ADMIN_KEY)]);
      setSubmitted(true);
    } finally { setBusy(false); }
  };

  const handleClose = () => {
    if (submitted) {
      setStep(0); setArtistName(""); setGenre("V-Pop"); setBio("");
      setSampleFiles([]); setSampleLinks([""]); setTerms(false); setSubmitted(false);
    }
    onClose();
  };

  const inputStyle = {
    width:"100%", boxSizing:"border-box",
    padding:"10px 14px",
    background: DS.surface,
    border:`1px solid ${DS.border}`,
    borderRadius: DS.radiusSm,
    color: DS.textPrimary,
    fontSize:13,
    fontFamily: DS.font,
    outline:"none",
    transition:"border-color 0.15s",
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && handleClose()}
      style={{
        position:"fixed", inset:0, zIndex:9000,
        background:"rgba(0,0,0,0.72)",
        backdropFilter:"blur(6px)",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}
    >
      <div style={{
        width:520, maxWidth:"94vw", maxHeight:"90vh",
        background: DS.bg,
        border:"1px solid rgba(255,255,255,0.08)",
        borderRadius:14,
        boxShadow:"0 24px 80px rgba(0,0,0,0.72)",
        display:"flex", flexDirection:"column",
        overflow:"hidden",
        fontFamily: DS.font,
      }}>

        {/* Header */}
        <div style={{
          position:"relative",
          padding:"28px 24px 22px",
          background:`linear-gradient(135deg, #1a0e08 0%, #251209 60%, #1c1919 100%)`,
          borderBottom:"1px solid rgba(249,115,22,0.18)",
          flexShrink:0,
          overflow:"hidden",
        }}>
          {/* background glow */}
          <div style={{
            position:"absolute", top:-40, left:-40, width:200, height:200,
            borderRadius:"50%",
            background:`radial-gradient(circle, ${DS.primary}18 0%, transparent 70%)`,
            pointerEvents:"none",
          }} />
          {/* close button */}
          <button onClick={handleClose} style={{
            position:"absolute", top:12, right:12,
            background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.10)",
            cursor:"pointer", color:DS.textMuted, fontSize:14,
            width:28, height:28, borderRadius:6,
            display:"flex", alignItems:"center", justifyContent:"center",
            transition:"all 0.15s",
          }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.12)";e.currentTarget.style.color=DS.textPrimary;}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color=DS.textMuted;}}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{
              width:52, height:52, borderRadius:14, flexShrink:0,
              background:`linear-gradient(135deg, ${DS.primaryDim}, ${DS.primary})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:`0 6px 20px ${DS.primary}55`,
            }}>
              <FontAwesomeIcon icon={faMicrophone} style={{ color:"#fff", fontSize:20 }} />
            </div>
            <div>
              <div style={{ fontSize:17, fontWeight:800, color:DS.textPrimary, lineHeight:1.2, letterSpacing:"-0.01em" }}>
                Đăng ký Nghệ sĩ
              </div>
              <div style={{ fontSize:12, color:DS.textMuted, marginTop:4 }}>
                Upload nhạc · Analytics · Fan base riêng của bạn
              </div>
            </div>
          </div>
        </div>

        {/* Step bar */}
        {!submitted && (
          <div style={{ padding:"18px 24px 0", flexShrink:0 }}>
            <StepBar current={step} />
          </div>
        )}

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:"0 24px 24px" }}>

          {/* Success */}
          {submitted && (
            <div style={{ textAlign:"center", padding:"52px 0 40px" }}>
              <div style={{
                width:60, height:60, borderRadius:"50%", margin:"0 auto 18px",
                background:`${DS.primary}18`, border:`1px solid ${DS.primary}44`,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <FontAwesomeIcon icon={faCheck} style={{ fontSize:24, color:DS.primary }} />
              </div>
              <div style={{ fontSize:17, fontWeight:700, color:DS.textPrimary, marginBottom:10 }}>
                Đơn đăng ký đã gửi!
              </div>
              <div style={{ fontSize:13, color:DS.textSecondary, lineHeight:1.7, maxWidth:300, margin:"0 auto 28px" }}>
                Admin sẽ xét duyệt trong vòng 1–3 ngày làm việc. Bạn sẽ nhận thông báo khi có kết quả.
              </div>
              <button onClick={handleClose} style={{
                background:`linear-gradient(90deg, ${DS.primaryDim}, ${DS.primary})`,
                color:"#fff", border:"none", borderRadius:DS.radiusPill,
                padding:"9px 32px", fontSize:13, fontWeight:700, cursor:"pointer",
              }}>
                Đóng
              </button>
            </div>
          )}

          {/* Step 0 */}
          {!submitted && step === 0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div>
                <FieldLabel>Tên nghệ sĩ *</FieldLabel>
                <input
                  value={artistName}
                  onChange={e => setArtistName(e.target.value)}
                  maxLength={50}
                  placeholder="Tên bạn muốn xuất hiện trên Melodies"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = DS.primary; }}
                  onBlur={e  => { e.target.style.borderColor = DS.border; }}
                />
              </div>

              <div>
                <FieldLabel>Thể loại chính *</FieldLabel>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {GENRES.map(g => {
                    const sel = genre === g;
                    return (
                      <button key={g} onClick={() => setGenre(g)} style={{
                        padding:"5px 15px", borderRadius:DS.radiusPill,
                        fontSize:12, fontWeight: sel ? 700 : 500,
                        border:`1px solid ${sel ? DS.primary : "rgba(255,255,255,0.12)"}`,
                        background: sel ? `${DS.primary}18` : "transparent",
                        color: sel ? DS.primary : DS.textSecondary,
                        cursor:"pointer", fontFamily:DS.font,
                        transition:"all 0.15s",
                        boxShadow: sel ? `0 0 8px ${DS.primary}33` : "none",
                      }}>
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <FieldLabel>Giới thiệu bản thân * ({bio.length}/500)</FieldLabel>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  maxLength={500}
                  placeholder="Bạn là ai? Phong cách âm nhạc của bạn? Điều gì truyền cảm hứng? (ít nhất 20 ký tự)"
                  rows={4}
                  style={{ ...inputStyle, resize:"vertical", lineHeight:1.6 }}
                  onFocus={e => { e.target.style.borderColor = DS.primary; }}
                  onBlur={e  => { e.target.style.borderColor = DS.border; }}
                />
              </div>
            </div>
          )}

          {/* Step 1 */}
          {!submitted && step === 1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <p style={{ fontSize:13, color:DS.textSecondary, lineHeight:1.65, margin:0 }}>
                Giúp admin nghe nhạc của bạn. Upload file audio hoặc dán link ngoài — ít nhất 1 mẫu.
              </p>

              <div>
                <FieldLabel>File audio (mp3 / wav · tối đa 2)</FieldLabel>
                <input ref={audioInputRef} type="file" accept="audio/*" style={{ display:"none" }}
                  onChange={e => handleAudio(e.target.files?.[0])} />
                <div
                  onClick={() => !uploading && sampleFiles.length < 2 && audioInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleAudio(e.dataTransfer.files?.[0]); }}
                  style={{
                    border:`1.5px dashed ${dragOver ? DS.primary : "rgba(255,255,255,0.14)"}`,
                    borderRadius:DS.radius, padding:"18px 16px", textAlign:"center",
                    cursor: sampleFiles.length >= 2 ? "not-allowed" : "pointer",
                    opacity: sampleFiles.length >= 2 ? 0.45 : 1,
                    color:DS.textMuted, fontSize:13, transition:"border-color 0.15s",
                    background: dragOver ? `${DS.primary}08` : "transparent",
                  }}
                >
                  {uploading ? "Đang upload..."
                    : sampleFiles.length >= 2 ? "Đã đủ 2 file"
                    : <><FontAwesomeIcon icon={faCloudArrowUp} style={{ marginRight:8, color:DS.textMuted }} />
                        Kéo thả hoặc click để chọn file</>
                  }
                </div>
                {sampleFiles.map(f => (
                  <div key={f.blobId} style={{
                    display:"flex", alignItems:"center", gap:10, marginTop:8,
                    padding:"8px 12px", borderRadius:DS.radiusSm,
                    background:DS.surface, border:`1px solid ${DS.border}`,
                  }}>
                    <FontAwesomeIcon icon={faFileAudio} style={{ color:DS.primary, fontSize:13, flexShrink:0 }} />
                    <span style={{ flex:1, fontSize:12, color:DS.textPrimary,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {f.name}
                    </span>
                    <button onClick={() => removeFile(f.blobId)} style={{
                      background:"none", border:"none", cursor:"pointer",
                      color:DS.textMuted, fontSize:13, padding:4,
                    }}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <FieldLabel>Hoặc dán link (SoundCloud · YouTube · Spotify)</FieldLabel>
                {sampleLinks.map((link, i) => (
                  <div key={i} style={{ display:"flex", gap:8, marginBottom:8 }}>
                    <div style={{ position:"relative", flex:1 }}>
                      <FontAwesomeIcon icon={faLink} style={{
                        position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
                        color:DS.textMuted, fontSize:12, pointerEvents:"none",
                      }} />
                      <input
                        value={link}
                        onChange={e => setSampleLinks(p => p.map((l,idx) => idx===i ? e.target.value : l))}
                        placeholder="https://soundcloud.com/..."
                        style={{ ...inputStyle, paddingLeft:32 }}
                        onFocus={e => { e.target.style.borderColor=DS.primary; }}
                        onBlur={e  => { e.target.style.borderColor=DS.border; }}
                      />
                    </div>
                    {sampleLinks.length > 1 && (
                      <button onClick={() => setSampleLinks(p=>p.filter((_,idx)=>idx!==i))} style={{
                        background:"none", border:"none", cursor:"pointer",
                        color:DS.textMuted, fontSize:14, padding:"0 4px",
                      }}>
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    )}
                  </div>
                ))}
                {sampleLinks.length < 2 && (
                  <button onClick={() => setSampleLinks(p=>[...p,""])} style={{
                    background:"none", border:"none", cursor:"pointer",
                    color:DS.primary, fontSize:12, fontWeight:600,
                    fontFamily:DS.font, padding:0,
                    display:"flex", alignItems:"center", gap:5,
                  }}>
                    <FontAwesomeIcon icon={faPlus} style={{ fontSize:10 }} />
                    Thêm link
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {!submitted && step === 2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:DS.textPrimary, marginBottom:4 }}>
                Xem lại thông tin
              </div>

              <div style={{
                background:DS.surface, border:`1px solid ${DS.border}`,
                borderRadius:DS.radius, padding:"14px 16px",
                display:"flex", flexDirection:"column", gap:10,
              }}>
                {[
                  ["Tên nghệ sĩ", artistName],
                  ["Thể loại", genre],
                  ["Mẫu âm nhạc", sampleFiles.length > 0
                    ? `${sampleFiles.length} file audio`
                    : sampleLinks.filter(l=>l.trim().length>5).join(", ") || "Không có"],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", gap:12, fontSize:12 }}>
                    <span style={{ width:88, flexShrink:0, color:DS.textMuted }}>{k}</span>
                    <span style={{ color:DS.textPrimary, fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:"flex", gap:12, fontSize:12 }}>
                  <span style={{ width:88, flexShrink:0, color:DS.textMuted }}>Giới thiệu</span>
                  <span style={{ color:DS.textPrimary, lineHeight:1.6, wordBreak:"break-word" }}>{bio}</span>
                </div>
              </div>

              <div style={{
                background:DS.surface, border:`1px solid ${DS.border}`,
                borderRadius:DS.radius, padding:"14px 16px",
                fontSize:12, color:DS.textSecondary, lineHeight:1.7,
              }}>
                <div style={{ fontWeight:700, color:DS.textPrimary, marginBottom:6 }}>
                  Điều khoản Nghệ sĩ Melodies
                </div>
                Bằng cách gửi đơn, bạn cam kết: (1) Nội dung là tác phẩm gốc hoặc bạn có đủ quyền phân phối;
                (2) Không vi phạm bản quyền bên thứ ba; (3) Tuân thủ Chính sách Nội dung của Melodies.
              </div>

              <label style={{ display:"flex", gap:10, alignItems:"flex-start", cursor:"pointer" }}>
                <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}
                  style={{ marginTop:2, accentColor:DS.primary, width:14, height:14 }} />
                <span style={{ fontSize:12, color:DS.textSecondary, lineHeight:1.65 }}>
                  Tôi đã đọc và đồng ý với Điều khoản Nghệ sĩ Melodies
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"14px 24px",
            borderTop:"1px solid rgba(255,255,255,0.07)",
            flexShrink:0,
          }}>
            <button
              onClick={() => step > 0 ? setStep(s=>s-1) : handleClose()}
              style={{
                background:"transparent",
                border:"1px solid rgba(255,255,255,0.14)",
                borderRadius:DS.radiusPill,
                padding:"7px 20px", fontSize:12, fontWeight:600,
                color:DS.textSecondary, cursor:"pointer", fontFamily:DS.font,
                transition:"all 0.15s",
              }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.28)";e.currentTarget.style.color=DS.textPrimary;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.14)";e.currentTarget.style.color=DS.textSecondary;}}
            >
              {step === 0 ? "Hủy" : "Quay lại"}
            </button>

            {step < 2 ? (
              <button
                onClick={() => setStep(s=>s+1)}
                disabled={(step===0&&!ok0)||(step===1&&!ok1)}
                style={{
                  background:`linear-gradient(90deg, ${DS.primaryDim}, ${DS.primary})`,
                  color:"#fff", border:"none", borderRadius:DS.radiusPill,
                  padding:"7px 22px", fontSize:12, fontWeight:700,
                  cursor:"pointer", fontFamily:DS.font,
                  display:"flex", alignItems:"center", gap:6,
                  opacity:((step===0&&!ok0)||(step===1&&!ok1))?0.4:1,
                  transition:"opacity 0.15s",
                  boxShadow:`0 4px 14px ${DS.primary}44`,
                }}
              >
                Tiếp theo
                <FontAwesomeIcon icon={faChevronRight} style={{ fontSize:10 }} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!ok2||busy}
                style={{
                  background:`linear-gradient(90deg, ${DS.primaryDim}, ${DS.primary})`,
                  color:"#fff", border:"none", borderRadius:DS.radiusPill,
                  padding:"7px 26px", fontSize:12, fontWeight:700,
                  cursor:(!ok2||busy)?"not-allowed":"pointer", fontFamily:DS.font,
                  opacity:(!ok2||busy)?0.4:1, transition:"opacity 0.15s",
                  boxShadow:`0 4px 14px ${DS.primary}44`,
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
