import { useCallback, useEffect } from "react";
import {
  APP_IDS,
  clearApps,
  clearToken,
  getApps,
  getAppRoute,
  getLoginUrl,
  setToken,
} from "@commutr/shared";
import { resetAllState, useAppDispatch, useAppSelector } from "../../../app/store";
import { crdStorage } from "../../../shared/lib/storage";
import {
  logout,
  selectAccessToken,
  selectCurrentUser,
  selectIsAuthenticated,
  setUser,
} from "../slices/authSlice";
import {
  useGetCurrentUserQuery,
  useLogoutMutation,
  useSwitchAppMutation,
} from "../services/authApi";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const accessToken = useAppSelector(selectAccessToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [logoutMutation] = useLogoutMutation();
  const [switchAppMutation] = useSwitchAppMutation();

  // Re-hydrate the user after a page reload (token is already in the slice).
  const { data: me, isLoading: isUserLoading } = useGetCurrentUserQuery(
    undefined,
    { skip: !accessToken || !!user },
  );
  useEffect(() => {
    if (me) dispatch(setUser(me));
  }, [me, dispatch]);

  const handleLogout = useCallback(async () => {
    logoutMutation().catch(() => {});
    dispatch(logout());
    dispatch(resetAllState());
    clearToken(); // shared -> logs out of every app
    clearApps();
    crdStorage.clear(); // wipe CRD-private persisted state
    window.location.replace(getLoginUrl());
  }, [dispatch, logoutMutation]);

  const handleSwitchApp = useCallback(
    async (appId: number) => {
      const res = await switchAppMutation({ appId }).unwrap();
      if (res?.accessToken) setToken(res.accessToken);
      window.location.assign(getAppRoute(appId)); // separate build -> full load
    },
    [switchAppMutation],
  );

  const otherApps = getApps().filter((a) => a.appId !== APP_IDS.CRD);

  return {
    user,
    isAuthenticated,
    isUserLoading,
    otherApps,
    handleLogout,
    handleSwitchApp,
  };
};
