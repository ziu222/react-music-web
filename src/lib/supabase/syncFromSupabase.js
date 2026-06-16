import { syncPlayCountsFromSupabase } from "../music/playLog";
import { syncFollowsFromSupabase } from "../social/followerIndex";
import { syncUpgradeRequestsFromSupabase } from "../artist/upgradeRequests";
import { syncNotificationsFromSupabase } from "../social/notifications";

export async function syncFromSupabase(userEmail) {
  await Promise.allSettled([
    syncPlayCountsFromSupabase(),
    syncFollowsFromSupabase(),
    syncUpgradeRequestsFromSupabase(),
    syncNotificationsFromSupabase(userEmail),
  ]);
}
