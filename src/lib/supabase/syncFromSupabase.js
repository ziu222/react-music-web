import { syncPlayCountsFromSupabase } from "../music/playLog";
import { syncFollowsFromSupabase } from "../social/followerIndex";
import { syncUpgradeRequestsFromSupabase } from "../artist/upgradeRequests";
import { syncNotificationsFromSupabase } from "../social/notifications";
import { loadLibraryFromSupabase } from "./librarySync";

export async function syncFromSupabase(userEmail) {
  const [library] = await Promise.allSettled([
    loadLibraryFromSupabase(userEmail),
    syncPlayCountsFromSupabase(),
    syncFollowsFromSupabase(),
    syncUpgradeRequestsFromSupabase(),
    syncNotificationsFromSupabase(userEmail),
  ]);
  // Return library data so App.jsx can hydrate state
  return library.status === "fulfilled" ? library.value : null;
}
