import { useState } from "react";
import {
  faMicrophone,
  faChartPie,
  faMusic,
  faCloudArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import ConsoleShell from "../../components/console/ConsoleShell";
import { ConsoleHeader } from "../../components/console/ConsoleUi";
import { loadSubmissions, resubmit } from "../../lib/submissions";
import StudioOverview from "./StudioOverview";
import StudioSongs from "./StudioSongs";
import StudioSubmit from "./StudioSubmit";

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
    songs: { title: "Bài hát của tôi", subtitle: mySubs.length + " bài hát" },
    submit: {
      title: "Đăng bài mới",
      subtitle: "Bài hát sẽ được quản trị viên phê duyệt trước khi phát hành",
    },
  };

  const navItems = [
    { key: "overview", label: "Tổng quan", icon: faChartPie },
    { key: "songs", label: "Bài hát của tôi", icon: faMusic },
    { key: "submit", label: "Đăng bài mới", icon: faCloudArrowUp },
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
        <StudioOverview mySubs={mySubs} onGoSubmit={() => setStudioTab("submit")} />
      )}
      {studioTab === "songs" && (
        <StudioSongs
          mySubs={mySubs}
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
