import { supabase } from "./supabase";

/* Subscribe to notifications table changes for a specific userKey.
 * Returns an unsubscribe function. */
export function subscribeToNotifications(userKey, onUpdate) {
  if (!supabase || !userKey) return () => {};

  const channel = supabase
    .channel(`notifications:${userKey}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications", filter: `user_key=eq.${userKey}` },
      (payload) => {
        const items = payload.new?.items;
        if (Array.isArray(items)) onUpdate(items);
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

/* Subscribe to new community songs (INSERT on songs table).
 * Calls onInsert(row) when admin approves a new artist song.
 * Returns an unsubscribe function. */
export function subscribeToSongs(onInsert) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel("songs:community")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "songs" },
      (payload) => { if (payload.new) onInsert(payload.new); }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

/* Subscribe to new admin audit log rows (INSERT on admin_logs table).
 * Calls onInsert(row) khi có hành động admin mới được ghi nhận.
 * Trả về hàm unsubscribe. */
export function subscribeToAuditLog(onInsert) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel("admin_logs:live")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "admin_logs" },
      (payload) => { if (payload.new) onInsert(payload.new); }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
