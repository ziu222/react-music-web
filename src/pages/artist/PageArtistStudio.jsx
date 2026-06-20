import { useEffect, useMemo, useState } from "react";
import {
  faMicrophone,
  faChartPie,
  faChartSimple,
  faMusic,
  faCloudArrowUp,
  faUserPen,
} from "@fortawesome/free-solid-svg-icons";
import ConsoleShell from "../../components/console/ConsoleShell";
import { ConsoleHeader } from "../../components/console/ConsoleUi";
import { fetchSubmissions, resubmit, deleteSubmission } from "../../lib/artist/submissions";
import { deleteMediaBlob, getMediaBlobUrl, revokeMediaBlobUrl } from "../../lib/music/mediaStore";
import { loadArtistProfile } from "../../lib/artist/artistProfile";
import StudioOverview from "./StudioOverview";
import StudioAnalytics from "./StudioAnalytics";
import StudioSongs from "./StudioSongs";
import StudioSubmit from "./StudioSubmit";
import StudioProfile from "./StudioProfile";

export default function PageArtistStudio({ authUser, onExit }) {
  const [studioTab, setStudioTab] = useState("overview");
  const [subs, setSubs] = useState([]);
  useEffect(() => {
    if (authUser?.email) fetchSubmissions(authUser.email).then(setSubs).catch(() => {});
  }, [authUser?.email]);
  const [toast, setToast] = useState(null);
  const [editingDraft, setEditingDraft] = useState(null);
  const [profileVersion, setProfileVersion] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const profile = useMemo(
    () => loadArtistProfile(authUser?.email ?? ""),
    [authUser?.email, profileVersion]
  );

  useEffect(() => {
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
  }, [profile.avatarBlobId]);

  // Nhận dạng nghệ sĩ (nghệ danh + ảnh + màu chủ đề) áp toàn studio
  const studioUser = useMemo(
    () =>
      authUser && {
        ...authUser,
        name: profile.displayName?.trim() || authUser.name,
        color: profile.themeColor || authUser.color,
        avatarUrl,
      },
    [authUser, profile.displayName, profile.themeColor, avatarUrl]
  );

  const mySubs = subs.filter(
    (s) => s.artistEmail === authUser?.email?.toLowerCase()
  );

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const headers = {
    overview: { title: "Tổng quan", subtitle: "Không gian nghệ sĩ của bạn" },
    analytics: { title: "Thống kê", subtitle: "Hiệu suất âm nhạc của bạn theo thời gian" },
    songs: { title: "Bài hát của tôi", subtitle: mySubs.length + " bài hát" },
    submit: {
      title: "Đăng bài mới",
      subtitle: "Bài hát sẽ được quản trị viên phê duyệt trước khi phát hành",
    },
    profile: {
      title: "Hồ sơ nghệ sĩ",
      subtitle: "Cách bạn xuất hiện trước người hâm mộ",
    },
  };

  const navItems = [
    { key: "overview", label: "Tổng quan", icon: faChartPie },
    { key: "analytics", label: "Thống kê", icon: faChartSimple },
    { key: "songs", label: "Bài hát của tôi", icon: faMusic },
    { key: "submit", label: "Đăng bài mới", icon: faCloudArrowUp },
    { key: "profile", label: "Hồ sơ nghệ sĩ", icon: faUserPen },
  ];

  return (
    <ConsoleShell
      brandIcon={faMicrophone}
      brandLabel="Melodies Studio"
      navItems={navItems}
      activeTab={studioTab}
      onSelectTab={setStudioTab}
      user={studioUser}
      userRoleLabel="Nghệ sĩ"
      onExit={onExit}
    >
      <ConsoleHeader
        title={headers[studioTab].title}
        subtitle={headers[studioTab].subtitle}
      />

      {studioTab === "overview" && (
        <StudioOverview
          authUser={studioUser}
          mySubs={mySubs}
          onGoSubmit={() => setStudioTab("submit")}
        />
      )}
      {studioTab === "analytics" && (
        <StudioAnalytics authUser={authUser} mySubs={mySubs} />
      )}
      {studioTab === "songs" && (
        <StudioSongs
          authUser={authUser}
          mySubs={mySubs}
          onGoSubmit={() => setStudioTab("submit")}
          onResubmit={(id) => {
            resubmit(id).then(setSubs);
            showToast("Đã gửi lại để duyệt");
          }}
          onEditDraft={(sub) => {
            setEditingDraft(sub);
            setStudioTab("submit");
          }}
          onDeleteDraft={(sub) => {
            deleteMediaBlob(sub.audioBlobId);
            deleteMediaBlob(sub.coverBlobId);
            deleteSubmission(sub.id).then(setSubs);
            showToast("Đã xóa bản nháp");
          }}
        />
      )}
      {studioTab === "submit" && (
        <StudioSubmit
          key={editingDraft?.id ?? "new"}
          authUser={studioUser}
          draft={editingDraft}
          onSubmitted={() => {
            fetchSubmissions(authUser?.email).then(setSubs).catch(() => {});
            setEditingDraft(null);
            setStudioTab("songs");
            showToast("Đã gửi bài hát, chờ phê duyệt");
          }}
          onDraftSaved={() => {
            fetchSubmissions(authUser?.email).then(setSubs).catch(() => {});
            setEditingDraft(null);
            setStudioTab("songs");
            showToast("Đã lưu bản nháp");
          }}
        />
      )}

      {studioTab === "profile" && (
        <StudioProfile
          authUser={authUser}
          mySubs={mySubs}
          onSaved={() => {
            setProfileVersion((v) => v + 1);
            showToast("Đã lưu hồ sơ nghệ sĩ");
          }}
          onChanged={() => setProfileVersion((v) => v + 1)}
        />
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#333",
            color: "#fff",
            borderRadius: 9999,
            padding: "8px 18px",
            fontSize: 12,
            fontWeight: 600,
            zIndex: 400,
            animation: "fadeIn 200ms ease",
          }}
        >
          {toast}
        </div>
      )}
    </ConsoleShell>
  );
}
