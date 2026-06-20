import { useCallback, useEffect, useState } from "react";
import {
  faShieldHalved,
  faChartPie,
  faUsers,
  faListCheck,
  faCompactDisc,
  faBullhorn,
  faClockRotateLeft,
  faTicket,
  faFlag,
} from "@fortawesome/free-solid-svg-icons";
import ConsoleShell from "../../components/console/ConsoleShell";
import { ConsoleHeader } from "../../components/console/ConsoleUi";
import UserDetailModal from "../../components/modals/UserDetailModal";
import { fetchSubmissions } from "../../lib/artist/submissions";
import { getAllUsersWithOverrides } from "../../lib/user/userOverrides";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminReview from "./AdminReview";
import AdminContent from "./AdminContent";
import AdminBroadcast from "./AdminBroadcast";
import AdminPromo from "./AdminPromo";
import AdminReports from "./AdminReports";
import AdminAudit from "./AdminAudit";
import TableSkeleton from "../../components/ui/skeleton/TableSkeleton";
import useDelayedVisible from "../../hooks/useDelayedVisible";

const HEADERS = {
  dashboard: { title: "Dashboard", subtitle: "Tổng quan hệ thống Melodies" },
  users: { title: "Người dùng", subtitle: "Quản lý toàn bộ tài khoản" },
  review: { title: "Duyệt bài hát", subtitle: "Phê duyệt bài hát do nghệ sĩ gửi lên" },
  content: { title: "Nội dung", subtitle: "Quản lý catalog bài hát" },
  broadcast: { title: "Thông báo hệ thống", subtitle: "Gửi thông báo đến toàn bộ người dùng" },
  promo: { title: "Mã khuyến mãi", subtitle: "Tạo và quản lý mã premium" },
  reports: { title: "Báo cáo vi phạm", subtitle: "Xử lý nội dung bị người dùng báo cáo" },
  audit: { title: "Nhật ký", subtitle: "Lịch sử hành động quản trị" },
};

export default function PageAdmin({ authUser, songs, onExit, onImpersonate }) {
  const [adminTab, setAdminTab] = useState("dashboard");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [subs, setSubs] = useState([]);
  useEffect(() => { fetchSubmissions().then(setSubs).catch(() => {}); }, []);
  const [allUsers, setAllUsers] = useState([]);
  const [usersStatus, setUsersStatus] = useState("loading");
  const refreshUsers = useCallback(() => {
    getAllUsersWithOverrides()
      .then(users => { setAllUsers(users); setUsersStatus("success"); })
      .catch(() => setUsersStatus("error"));
  }, []);
  const retryUsers = () => {
    setUsersStatus("loading");
    refreshUsers();
  };

  // onChanged({email, patch}) → optimistic update tức thì; onChanged() → refetch reconcile
  const handleUserChanged = (opt) => {
    if (opt?.email && opt?.patch) {
      setAllUsers((prev) => prev.map((u) => (u.email === opt.email ? { ...u, ...opt.patch } : u)));
    } else {
      retryUsers();
    }
  };

  useEffect(() => { refreshUsers(); }, [refreshUsers]);
  const showUsersSkeleton = useDelayedVisible(usersStatus === "loading" && allUsers.length === 0);
  const holdUsersSkeleton = (usersStatus === "loading" && allUsers.length === 0) || showUsersSkeleton;

  const pendingCount = subs.filter((s) => s.status === "pending").length;

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: faChartPie },
    { key: "users", label: "Người dùng", icon: faUsers },
    { key: "review", label: "Duyệt bài hát", icon: faListCheck, badge: pendingCount },
    { key: "content", label: "Nội dung", icon: faCompactDisc },
    { key: "broadcast", label: "Thông báo", icon: faBullhorn },
    { key: "promo", label: "Mã KM", icon: faTicket },
    { key: "reports", label: "Báo cáo", icon: faFlag },
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

      {(adminTab === "dashboard" || adminTab === "users") && holdUsersSkeleton && (
        <TableSkeleton cards={adminTab === "dashboard"} visible={showUsersSkeleton} />
      )}
      {(adminTab === "dashboard" || adminTab === "users") && usersStatus === "error" && allUsers.length === 0 && (
        <div style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)", fontSize: 13 }}>
          Không thể tải dữ liệu người dùng.{" "}
          <button type="button" onClick={retryUsers} style={{ border: 0, background: "transparent", color: "#fb923c", font: "inherit", fontWeight: 700, cursor: "pointer" }}>
            Thử lại
          </button>
        </div>
      )}
      {adminTab === "dashboard" && !holdUsersSkeleton && !(usersStatus === "error" && allUsers.length === 0) && (
        <AdminDashboard
          songs={songs}
          pendingCount={pendingCount}
          allUsers={allUsers}
          onNavigateUsers={() => setAdminTab("users")}
        />
      )}
      {adminTab === "users" && !holdUsersSkeleton && !(usersStatus === "error" && allUsers.length === 0) && (
        <AdminUsers users={allUsers} onOpenUser={(u) => setSelectedUserId(u.id)} authUser={authUser} onRefresh={retryUsers} />
      )}
      {adminTab === "review" && (
        <AdminReview subs={subs} setSubs={setSubs} authUser={authUser} />
      )}
      {adminTab === "content" && <AdminContent songs={songs} authUser={authUser} />}
      {adminTab === "broadcast" && <AdminBroadcast authUser={authUser} allUsers={allUsers} />}
      {adminTab === "promo" && <AdminPromo authUser={authUser} />}
      {adminTab === "reports" && <AdminReports authUser={authUser} />}
      {adminTab === "audit" && <AdminAudit />}

      <UserDetailModal
        user={
          selectedUserId != null
            ? allUsers.find((u) => u.id === selectedUserId) ?? null
            : null
        }
        currentAdmin={authUser}
        onClose={() => setSelectedUserId(null)}
        onChanged={handleUserChanged}
        onImpersonate={onImpersonate}
      />
    </ConsoleShell>
  );
}
