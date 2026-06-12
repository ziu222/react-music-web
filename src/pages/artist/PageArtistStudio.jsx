import { useState } from "react";
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
import { loadSubmissions, resubmit } from "../../lib/submissions";
import StudioOverview from "./StudioOverview";
import StudioAnalytics from "./StudioAnalytics";
import StudioSongs from "./StudioSongs";
import StudioSubmit from "./StudioSubmit";
import StudioProfile from "./StudioProfile";

export default function PageArtistStudio({ authUser, onExit }) {
  const [studioTab, setStudioTab] = useState("overview");
  const [subs, setSubs] = useState(() => loadSubmissions());
  const [toast, setToast] = useState(null);

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
      user={authUser}
      userRoleLabel="Nghệ sĩ"
      onExit={onExit}
    >
      <ConsoleHeader
        title={headers[studioTab].title}
        subtitle={headers[studioTab].subtitle}
      />

      {studioTab === "overview" && (
        <StudioOverview
          authUser={authUser}
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
            setSubs(resubmit(id));
            showToast("Đã gửi lại để duyệt");
          }}
        />
      )}
      {studioTab === "submit" && (
        <StudioSubmit
          authUser={authUser}
          onSubmitted={() => {
            setSubs(loadSubmissions());
            setStudioTab("songs");
            showToast("Đã gửi bài hát, chờ phê duyệt");
          }}
        />
      )}

      {studioTab === "profile" && (
        <StudioProfile
          authUser={authUser}
          mySubs={mySubs}
          onSaved={() => showToast("Đã lưu hồ sơ nghệ sĩ")}
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
