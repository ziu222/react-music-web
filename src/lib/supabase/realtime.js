import { supabase } from "./supabase";

/* Subscribe to notifications table changes for a specific userKey.
 * Calls onUpdate(items) whenever another client writes new notifications.
 * Returns an unsubscribe function — call it in useEffect cleanup. */
export function subscribeToNotifications(userKey, onUpdate) {
  if (!supabase || !userKey) return () => {};

  const channel = supabase
    .channel(`notifications:${userKey}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_key=eq.${userKey}`,
      },
      (payload) => {
        const items = payload.new?.items;
        if (Array.isArray(items)) onUpdate(items);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
