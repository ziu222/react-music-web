import { useState, useEffect, useCallback } from "react";
import { can, loadRolePermissions } from "../lib/user/permissions";

/* ── usePermissions ──
 * Nạp danh sách quyền theo authUser.admin_role và trả { can, permissions, ready }.
 * can(perm) → boolean; '*' trong permissions = full quyền (super_admin).
 */
export default function usePermissions(authUser) {
  const [permissions, setPermissions] = useState([]);
  const [ready, setReady] = useState(false);

  const adminRole = authUser?.admin_role;

  useEffect(() => {
    let active = true;
    setReady(false);
    loadRolePermissions(adminRole)
      .then((perms) => {
        if (!active) return;
        setPermissions(perms);
        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        setPermissions([]);
        setReady(true);
      });
    return () => { active = false; };
  }, [adminRole]);

  const canFn = useCallback((perm) => can(permissions, perm), [permissions]);

  return { can: canFn, permissions, ready };
}
