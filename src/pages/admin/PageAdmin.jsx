import { useCallback, useEffect, useState } from "react";
import {
  faShieldHalved,
  faChartPie,
  faHeartPulse,
  faUsers,
  faListCheck,
  faCompactDisc,
  faBullhorn,
  faClockRotateLeft,
  faTicket,
  faFlag,
  faUserShield,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";
import ConsoleShell from "../../components/console/ConsoleShell";
import { ConsoleHeader } from "../../components/console/ConsoleUi";
import UserDetailModal from "../../components/modals/UserDetailModal";
import { fetchSubmissions } from "../../lib/artist/submissions";
import { getAllUsersWithOverrides, mapUserRow } from "../../lib/user/userOverrides";
import { subscribeToUsers } from "../../lib/supabase/realtime";
import AdminDashboard from "./AdminDashboard";
import AdminSystem from "./AdminSystem";
import AdminUsers from "./AdminUsers";
import AdminReview from "./AdminReview";
import AdminContent from "./AdminContent";
import AdminBroadcast from "./AdminBroadcast";
import AdminPromo from "./AdminPromo";
import AdminReports from "./AdminReports";
import AdminAudit from "./AdminAudit";
import AdminRoles from "./AdminRoles";
import AdminConfig from "./AdminConfig";
import AdminDashboardSkeleton from "../../components/ui/skeleton/AdminDashboardSkeleton";
import TableSkeleton from "../../components/ui/skeleton/TableSkeleton";
import useDelayedVisible from "../../hooks/useDelayedVisible";
import usePermissions from "../../hooks/usePermissions";

const HEADERS = {
  dashboard: { title: "Dashboard", subtitle: "Tổng quan hệ thống Melodies" },
  system: { title: "Sức khỏe hệ thống", subtitle: "Giám sát vận hành Melodies" },
  users: { title: "Người dùng", subtitle: "Quản lý toàn bộ tài khoản" },
  review: { title: "Duyệt bài hát", subtitle: "Phê duyệt bài hát do nghệ sĩ gửi lên" },
  content: { title: "Nội dung", subtitle: "Quản lý catalog bài hát" },
  broadcast: { title: "Thông báo hệ thống", subtitle: "Gửi thông báo đến toàn bộ người dùng" },
  promo: { title: "Mã khuyến mãi", subtitle: "Tạo và quản lý mã premium" },
  reports: { title: "Báo cáo vi phạm", subtitle: "Xử lý nội dung bị người dùng báo cáo" },
  audit: { title: "Nhật ký", subtitle: "Lịch sử hành động quản trị" },
  roles: { title: "Phân quyền", subtitle: "Gán vai trò & quyền cho quản trị viên" },
  config: { title: "Cấu hình", subtitle: "Bật/tắt tính năng hệ thống" },
};

export default function PageAdmin({ authUser, songs, onExit, onImpersonate }) {
  const { can } = usePermissions(authUser);
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

  // Realtime: listener tự nâng Premium / admin khác đổi plan-role-status -> cập nhật list trực tiếp.
  // Merge tại chỗ theo id; nếu là user mới (chưa có trong list) thì refetch để lấy đủ thứ tự.
  useEffect(() => {
    return subscribeToUsers((row) => {
      const mapped = mapUserRow(row);
      setAllUsers((prev) => {
        const idx = prev.findIndex((u) => u.id === mapped.id);
        if (idx === -1) { refreshUsers(); return prev; }
        const next = [...prev];
        next[idx] = { ...next[idx], ...mapped };
        return next;
      });
    });
  }, [refreshUsers]);

  const showUsersSkeleton = useDelayedVisible(usersStatus === "loading" && allUsers.length === 0);
  const holdUsersSkeleton = (usersStatus === "loading" && allUsers.length === 0) || showUsersSkeleton;

  const pendingCount = subs.filter((s) => s.status === "pending").length;

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: faChartPie, perm: "dashboard.view" },
    { key: "system", label: "Sức khỏe", icon: faHeartPulse, perm: "system.view" },
    { key: "users", label: "Người dùng", icon: faUsers, perm: "users.view" },
    { key: "review", label: "Duyệt bài hát", icon: faListCheck, badge: pendingCount, perm: "review.approve" },
    { key: "content", label: "Nội dung", icon: faCompactDisc, perm: "content.edit" },
    { key: "broadcast", label: "Thông báo", icon: faBullhorn, perm: "broadcast.send" },
    { key: "promo", label: "Mã KM", icon: faTicket, perm: "promo.manage" },
    { key: "reports", label: "Báo cáo", icon: faFlag, perm: "reports.resolve" },
    { key: "audit", label: "Nhật ký", icon: faClockRotateLeft, perm: "audit.view" },
    { key: "roles", label: "Phân quyền", icon: faUserShield, perm: "roles.manage" },
    { key: "config", label: "Cấu hình", icon: faSliders, perm: "config.manage" },
  ];

  // Chỉ giữ tab mà role hiện tại có quyền truy cập
  const visibleNavItems = navItems.filter((item) => can(item.perm));

  // Guard: nếu tab đang chọn không còn nằm trong danh sách hiển thị → nhảy về tab đầu
  useEffect(() => {
    if (visibleNavItems.length === 0) return;
    if (!visibleNavItems.some((item) => item.key === adminTab)) {
      setAdminTab(visibleNavItems[0]?.key);
    }
  }, [visibleNavItems, adminTab]);

  return (
    <ConsoleShell
      brandIcon={faShieldHalved}
      brandLabel="Melodies Admin"
      navItems={visibleNavItems}
      activeTab={adminTab}
      onSelectTab={setAdminTab}
      user={authUser}
      userRoleLabel="Quản trị viên"
      onExit={onExit}
    >
      <ConsoleHeader title={HEADERS[adminTab].title} subtitle={HEADERS[adminTab].subtitle} />

      {adminTab === "dashboard" && holdUsersSkeleton && (
        <AdminDashboardSkeleton visible={showUsersSkeleton} />
      )}
      {adminTab === "users" && holdUsersSkeleton && (
        <TableSkeleton visible={showUsersSkeleton} />
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
          can={can}
        />
      )}
      {adminTab === "system" && (
        <AdminSystem authUser={authUser} can={can} users={allUsers} songs={songs} />
      )}
      {adminTab === "users" && !holdUsersSkeleton && !(usersStatus === "error" && allUsers.length === 0) && (
        <AdminUsers users={allUsers} onOpenUser={(u) => setSelectedUserId(u.id)} authUser={authUser} onRefresh={retryUsers} can={can} />
      )}
      {adminTab === "review" && (
        <AdminReview subs={subs} setSubs={setSubs} authUser={authUser} can={can} />
      )}
      {adminTab === "content" && <AdminContent songs={songs} authUser={authUser} can={can} />}
      {adminTab === "broadcast" && <AdminBroadcast authUser={authUser} allUsers={allUsers} can={can} />}
      {adminTab === "promo" && <AdminPromo authUser={authUser} can={can} />}
      {adminTab === "reports" && <AdminReports authUser={authUser} can={can} />}
      {adminTab === "audit" && <AdminAudit can={can} />}
      {adminTab === "roles" && <AdminRoles authUser={authUser} users={allUsers} can={can} onRefresh={retryUsers} />}
      {adminTab === "config" && <AdminConfig authUser={authUser} can={can} />}

      <UserDetailModal
        user={
          selectedUserId != null
            ? allUsers.find((u) => u.id === selectedUserId) ?? null
            : null
        }
        currentAdmin={authUser}
        songs={songs}
        onClose={() => setSelectedUserId(null)}
        onChanged={handleUserChanged}
        onImpersonate={onImpersonate}
        can={can}
      />
    </ConsoleShell>
  );
}
