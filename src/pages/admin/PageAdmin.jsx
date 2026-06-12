import { useState } from "react";
import {
  faShieldHalved,
  faChartPie,
  faUsers,
  faListCheck,
} from "@fortawesome/free-solid-svg-icons";
import ConsoleShell from "../../components/console/ConsoleShell";
import { ConsoleHeader } from "../../components/console/ConsoleUi";
import ListenerProfileModal from "../../components/ListenerProfileModal";
import { loadSubmissions } from "../../lib/submissions";
import AdminDashboard from "./AdminDashboard";
import AdminListeners from "./AdminListeners";
import AdminReview from "./AdminReview";

const HEADERS = {
  dashboard: { title: "Dashboard", subtitle: "Tổng quan hệ thống Melodies" },
  listeners: { title: "Listeners", subtitle: "Quản lý người nghe" },
  review: { title: "Duyệt bài hát", subtitle: "Phê duyệt bài hát do nghệ sĩ gửi lên" },
};

export default function PageAdmin({ authUser, songs, onExit }) {
  const [adminTab, setAdminTab] = useState("dashboard");
  const [selectedListener, setSelectedListener] = useState(null);
  const [subs, setSubs] = useState(() => loadSubmissions());

  const pendingCount = subs.filter((s) => s.status === "pending").length;

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: faChartPie },
    { key: "listeners", label: "Listeners", icon: faUsers },
    { key: "review", label: "Duyệt bài hát", icon: faListCheck, badge: pendingCount },
  ];

  return (
    <ConsoleShell
      brandIcon={faShieldHalved}
      brandLabel="Melodies Admin"
      navItems={navItems}
      activeTab={adminTab}
      onSelectTab={setAdminTab}
      user={authUser}
      userRoleLabel="Quản trị viên"
      onExit={onExit}
    >
      <ConsoleHeader title={HEADERS[adminTab].title} subtitle={HEADERS[adminTab].subtitle} />

      {adminTab === "dashboard" && (
        <AdminDashboard songs={songs} pendingCount={pendingCount} />
      )}
      {adminTab === "listeners" && (
        <AdminListeners onOpenProfile={setSelectedListener} />
      )}
      {adminTab === "review" && (
        <AdminReview subs={subs} setSubs={setSubs} authUser={authUser} />
      )}

      <ListenerProfileModal
        user={selectedListener}
        onClose={() => setSelectedListener(null)}
      />
    </ConsoleShell>
  );
}
