import { syncPlayCountsFromSupabase } from "./playLog";
import { syncFollowsFromSupabase } from "./followerIndex";
import { syncUpgradeRequestsFromSupabase } from "./upgradeRequests";
import { syncNotificationsFromSupabase } from "./notifications";

export async function syncFromSupabase(userEmail) {
  await Promise.allSettled([
    syncPlayCountsFromSupabase(),
    syncFollowsFromSupabase(),
    syncUpgradeRequestsFromSupabase(),
    syncNotificationsFromSupabase(userEmail),
  ]);
}
