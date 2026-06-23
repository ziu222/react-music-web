import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeadphones, faHeart, faMusic } from "@fortawesome/free-solid-svg-icons";
import { C, TEXT } from "../../constants/theme";
import { StatusBadge, SearchInput, FilterPills } from "../../components/console/ConsoleUi";
import { getArtistAnalytics, formatCompact } from "../../lib/artist/artistStats";
import { getMediaBlobUrl, revokeMediaBlobUrl } from "../../lib/music/mediaStore";

const STATUS_PILLS = [
  { key: "all", label: "Tất cả" },
  { key: "draft", label: "Nháp" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "approved", label: "Đã duyệt" },
  { key: "rejected", label: "Từ chối" },
];

export default function StudioSongs({
  authUser,
  mySubs,
  onResubmit,
  onGoSubmit,
  onEditDraft,
  onDeleteDraft,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [coverUrls, setCoverUrls] = useState({});

  const subsKey = mySubs.map((s) => s.id).join(",");
  useEffect(() => {
    let alive = true;
    const urls = {};
    Promise.all(
      mySubs.map(async (sub) => {
        if (sub.coverBlobId) urls[sub.id] = await getMediaBlobUrl(sub.coverBlobId);
      })
    ).then(() => { if (alive) setCoverUrls(urls); });
    return () => {
      alive = false;
      Object.values(urls).forEach((u) => revokeMediaBlobUrl(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subsKey]);

  const analytics = getArtistAnalytics(authUser?.email ?? "", mySubs, authUser?.name);

  if (!mySubs.length) {
    return (
      <div
        style={{
          padding: "60px 24px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        <FontAwesomeIcon icon={faMusic} style={{ fontSize: 28, color: TEXT.tertiary }} />
        <div style={{ fontSize: 14, color: TEXT.secondary }}>
          Chưa có bài hát nào — hãy đăng bài đầu tiên!
        </div>
        <button
          onClick={onGoSubmit}
          style={{
            background: `linear-gradient(90deg, ${C[600]}, ${C[500]})`,
            color: "#fff",
            border: "none",
            borderRadius: 9999,
            padding: "9px 22px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Đăng bài mới
        </button>
      </div>
    );
  }

  const q = search.trim().toLowerCase();
  const filtered = [...mySubs]
    .filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      return (
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q) ||
        s.genre.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo tên, album, thể loại..."
          width={250}
        />
        <FilterPills options={STATUS_PILLS} active={statusFilter} onSelect={setStatusFilter} />
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 12, color: TEXT.tertiary }}>{filtered.length} bài hát</div>
      </div>

      {filtered.map((sub) => {
        const stats = analytics.songStats[sub.id];
        return (
          <div key={sub.id}>
            <div
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--overlay-1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 8,
                transition: "background 0.12s",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 6,
                  background: sub.bg,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {coverUrls[sub.id] ? (
                  <img
                    src={coverUrls[sub.id]}
                    alt=""
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faMusic}
                    style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}
                  />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: TEXT.strong,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {sub.title}
                </div>
                <div style={{ fontSize: 11, color: TEXT.secondary }}>
                  {sub.album} · {sub.genre} · {sub.duration}
                </div>
              </div>

              {stats ? (
                <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: TEXT.secondary,
                    }}
                  >
                    <FontAwesomeIcon icon={faHeadphones} style={{ fontSize: 10, color: C[400] }} />
                    {formatCompact(stats.plays)}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: TEXT.secondary,
                    }}
                  >
                    <FontAwesomeIcon icon={faHeart} style={{ fontSize: 10, color: "#fb7185" }} />
                    {formatCompact(stats.likes)}
                  </span>
                </div>
              ) : (
                <div style={{ width: 90, flexShrink: 0 }} />
              )}

              <div
                style={{
                  width: 80,
                  fontSize: 11,
                  color: TEXT.tertiary,
                  flexShrink: 0,
                  textAlign: "right",
                }}
              >
                {new Date(sub.submittedAt).toLocaleDateString("vi-VN")}
              </div>
              <div style={{ width: 92, flexShrink: 0, textAlign: "right" }}>
                <StatusBadge status={sub.status} />
              </div>
            </div>

            {sub.status === "draft" && (
              <div
                style={{
                  marginLeft: 56,
                  marginTop: -4,
                  marginBottom: 8,
                  display: "flex",
                  gap: 8,
                }}
              >
                <button
                  onClick={() => onEditDraft(sub)}
                  style={{
                    background: "transparent",
                    border: `1px solid ${C[500]}`,
                    color: C[400],
                    borderRadius: 9999,
                    padding: "4px 14px",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Tiếp tục chỉnh sửa
                </button>
                <button
                  onClick={() => onDeleteDraft(sub)}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(239,68,68,0.5)",
                    color: "#f87171",
                    borderRadius: 9999,
                    padding: "4px 14px",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Xóa nháp
                </button>
              </div>
            )}

            {sub.status === "rejected" && sub.rejectReason && (
              <div
                style={{
                  marginLeft: 56,
                  marginTop: -4,
                  marginBottom: 8,
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 12,
                  color: "#fb7185",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ flex: 1, minWidth: 200 }}>Lý do: {sub.rejectReason}</span>
                <button
                  onClick={() => onResubmit(sub.id)}
                  style={{
                    background: "transparent",
                    border: `1px solid ${C[500]}`,
                    color: C[400],
                    borderRadius: 9999,
                    padding: "4px 14px",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  Gửi lại
                </button>
              </div>
            )}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ padding: 24, textAlign: "center", color: TEXT.tertiary, fontSize: 13 }}>
          Không tìm thấy bài hát phù hợp
        </div>
      )}
    </div>
  );
}
