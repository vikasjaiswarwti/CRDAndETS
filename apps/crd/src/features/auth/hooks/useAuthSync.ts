import { useEffect } from "react";
import { clearApps, getLoginUrl, onTokenChange } from "@commutr/shared";
import { resetAllState, useAppDispatch } from "../../../app/store";
import { logout, setTokens } from "../slices/authSlice";
import { crdStorage } from "../../../shared/lib/storage";

// Cross-tab / cross-app sync. The `storage` event fires only in OTHER tabs:
//   • token removed  -> logout elsewhere (ETS, launcher, another CRD tab)
//   • token replaced -> refresh or switch-app elsewhere; keep Redux in step
export const useAuthSync = (): void => {
  const dispatch = useAppDispatch();

  useEffect(
    () =>
      onTokenChange((newToken) => {
        if (newToken === null) {
          dispatch(logout());
          dispatch(resetAllState());
          clearApps();
          crdStorage.clear();
          window.location.replace(getLoginUrl());
        } else {
          dispatch(setTokens(newToken));
        }
      }),
    [dispatch],
  );
};
