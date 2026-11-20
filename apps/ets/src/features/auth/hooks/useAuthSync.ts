import { useEffect } from "react";

import { logout, setTokens } from "../slices/authSlice";
import { clearRefreshToken } from "../../../shared/lib/api/baseQueryWithReauth";
import { useAppDispatch } from "../../../app/store";
import { onTokenChange, getLoginUrl, clearApps } from "../../../shared/auth-core";

// ── Cross-tab auth sync ───────────────────────────────────────────────────
// The `storage` event only fires in OTHER tabs/windows, never the one that
// made the change.
//   • token removed  -> logout mirrored into this tab (also covers logout from
//                       another app on the same origin, e.g. /crd/)
//   • token replaced -> (refresh, or switch-app in another tab) keep this
//                       tab's in-memory Redux token in step with localStorage,
//                       otherwise it keeps sending the stale token.
//
// Mounted once from App.tsx (not from Header) so it's active even on
// fullscreen routes that skip the Header/MainLayout chrome.
export const useAuthSync = (): void => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    return onTokenChange((newToken) => {
      if (newToken === null) {
        dispatch(logout());
        clearApps();
        clearRefreshToken();
        window.location.href = getLoginUrl();
      } else {
        dispatch(setTokens(newToken));
      }
    });
  }, [dispatch]);
};
