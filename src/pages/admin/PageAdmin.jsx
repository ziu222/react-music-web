import { useState } from "react";
import { faShieldHalved, faChartPie, faUsers } from "@fortawesome/free-solid-svg-icons";
import ConsoleShell from "../../components/console/ConsoleShell";
import { ConsoleHeader } from "../../components/console/ConsoleUi";
import ListenerProfileModal from "../../components/ListenerProfileModal";
import AdminDashboard from "./AdminDashboard";
import AdminListeners from "./AdminListeners";

const HEADERS = {
  dashboard: { title: "Dashboard", subtitle: "Tổng quan hệ thống Melodies" },
  listeners: { title: "Listeners", subtitle: "Quản lý người nghe" },
};

export default function PageAdmin({ authUser, songs, onExit }) {
  const [adminTab, setAdminTab] = useState("dashboard");
  const [selectedListener, setSelectedListener] = useState(null);

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: faChartPie },
    { key: "listeners", label: "Listeners", icon: faUsers },
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

      {adminTab === "dashboard" && <AdminDashboard songs={songs} />}
      {adminTab === "listeners" && <AdminListeners onOpenProfile={setSelectedListener} />}

      <ListenerProfileModal
        user={selectedListener}
        onClose={() => setSelectedListener(null)}
      />
    </ConsoleShell>
  );
}
