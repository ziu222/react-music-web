import { useMemo, useState } from "react";
import {
  faShieldHalved,
  faChartPie,
  faUsers,
  faListCheck,
  faCompactDisc,
  faBullhorn,
  faClockRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import ConsoleShell from "../../components/console/ConsoleShell";
import { ConsoleHeader } from "../../components/console/ConsoleUi";
import UserDetailModal from "../../components/UserDetailModal";
import { loadSubmissions } from "../../lib/submissions";
import { getAllUsersWithOverrides } from "../../lib/userOverrides";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminReview from "./AdminReview";
import AdminContent from "./AdminContent";
import AdminBroadcast from "./AdminBroadcast";
import AdminAudit from "./AdminAudit";

const HEADERS = {
  dashboard: { title: "Dashboard", subtitle: "Tổng quan hệ thống Melodies" },
  users: { title: "Người dùng", subtitle: "Quản lý toàn bộ tài khoản" },
  review: { title: "Duyệt bài hát", subtitle: "Phê duyệt bài hát do nghệ sĩ gửi lên" },
  content: { title: "Nội dung", subtitle: "Quản lý catalog bài hát" },
  broadcast: { title: "Thông báo hệ thống", subtitle: "Gửi thông báo đến toàn bộ người dùng" },
  audit: { title: "Nhật ký", subtitle: "Lịch sử hành động quản trị" },
};

export default function PageAdmin({ authUser, songs, onExit, onImpersonate }) {
  const [adminTab, setAdminTab] = useState("dashboard");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [subs, setSubs] = useState(() => loadSubmissions());
  const [usersVersion, setUsersVersion] = useState(0);

  const allUsers = useMemo(() => getAllUsersWithOverrides(), [usersVersion]);
  const refreshUsers = () => setUsersVersion((v) => v + 1);

  const pendingCount = subs.filter((s) => s.status === "pending").length;

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: faChartPie },
    { key: "users", label: "Người dùng", icon: faUsers },
    { key: "review", label: "Duyệt bài hát", icon: faListCheck, badge: pendingCount },
    { key: "content", label: "Nội dung", icon: faCompactDisc },
    { key: "broadcast", label: "Thông báo", icon: faBullhorn },
    { key: "audit", label: "Nhật ký", icon: faClockRotateLeft },
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
        <AdminDashboard
          songs={songs}
          pendingCount={pendingCount}
          allUsers={allUsers}
          onNavigateUsers={() => setAdminTab("users")}
        />
      )}
      {adminTab === "users" && (
        <AdminUsers users={allUsers} onOpenUser={(u) => setSelectedUserId(u.id)} />
      )}
      {adminTab === "review" && (
        <AdminReview subs={subs} setSubs={setSubs} authUser={authUser} />
      )}
      {adminTab === "content" && <AdminContent songs={songs} authUser={authUser} />}
      {adminTab === "broadcast" && <AdminBroadcast authUser={authUser} />}
      {adminTab === "audit" && <AdminAudit />}

      <UserDetailModal
        user={
          selectedUserId != null
            ? allUsers.find((u) => u.id === selectedUserId) ?? null
            : null
        }
        currentAdmin={authUser}
        onClose={() => setSelectedUserId(null)}
        onChanged={refreshUsers}
        onImpersonate={onImpersonate}
      />
    </ConsoleShell>
  );
}
