import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  useLoginMutation,
  useGetCurrentUserQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useSwitchAppMutation,
} from "../services/authApi";

import {
  setCredentials,
  setError,
  initializeAuth,
  persistAccessToken,
  clearPersistedToken,
  readPersistedToken,
  selectIsAuthenticated,
  selectCurrentUser,
  selectAccessToken,
  selectAuthError,
  selectAuthLoading,
  logout,
} from "../slices/authSlice";

import { clearRefreshToken } from "../../../shared/lib/api/baseQueryWithReauth";
import {
  getLoginUrl,
  getApps,
  setApps,
  clearApps,
  getAppRoute,
  APP_IDS,
} from "../../../shared/auth-core";
import { useAppDispatch, resetAllState } from "../../../app/store";

import { ROUTES } from "../../../shared/constants/app.constants";

import type {
  LoginCredentials,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "../types/auth.types";

// import { menuApi, resetNavigation } from "../../navigation";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();

  const [logoutMutation] = useLogoutMutation();
  const [switchAppMutation] = useSwitchAppMutation();

  const [forgotPasswordMutation, { isLoading: isForgotLoading }] =
    useForgotPasswordMutation();
  const [resetPasswordMutation, { isLoading: isResetLoading }] =
    useResetPasswordMutation();

  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const accessToken = useSelector(selectAccessToken);
  const error = useSelector(selectAuthError);
  const isSliceLoading = useSelector(selectAuthLoading);

  // ── Bootstrap: hydrate accessToken from localStorage on first mount ───────
  useEffect(() => {
    const token = readPersistedToken();
    if (token) {
      dispatch(initializeAuth(token));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-hydrate user after page reload ────────────────────────────────────
  const { data: currentUserData, isLoading: isUserLoading } =
    useGetCurrentUserQuery(undefined, {
      skip: !accessToken || !!user,
    });

  useEffect(() => {
    if (currentUserData && accessToken) {
      dispatch(setCredentials({ user: currentUserData, accessToken }));
    }
  }, [currentUserData, accessToken, dispatch]);

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const response = await loginMutation(credentials).unwrap();
        dispatch(resetAllState());

        dispatch(
          setCredentials({
            user: response.user,
            accessToken: response.accessToken,
          }),
        );

        persistAccessToken(response.accessToken);
        setApps(response.apps);

        // ← ADD THIS: reset nav + menu cache so fresh fetch fires on next mount
        // dispatch(resetNavigation());
        // dispatch(menuApi.util.resetApiState());

        navigate(ROUTES.DASHBOARD);
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ||
          "Invalid username or password";
        dispatch(setError(message));
        throw err;
      }
    },
    [dispatch, loginMutation, navigate],
  );

  // ── Forgot Password ───────────────────────────────────────────────────────
  // Returns the success message so the page can display it.
  const handleForgotPassword = useCallback(
    async (payload: ForgotPasswordRequest): Promise<string> => {
      try {
        const response = await forgotPasswordMutation(payload).unwrap();
        return response.message;
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ||
          "Failed to send reset link. Please try again.";
        throw new Error(message);
      }
    },
    [forgotPasswordMutation],
  );

  // ── Reset Password ────────────────────────────────────────────────────────
  // Navigates to login on success so the page doesn't need to know the route.
  const handleResetPassword = useCallback(
    async (payload: ResetPasswordRequest): Promise<void> => {
      try {
        await resetPasswordMutation(payload).unwrap();
        // Give the success screen 2.5s to show, then redirect
        setTimeout(() => navigate(ROUTES.LOGIN), 2500);
      } catch (err: unknown) {
        const message =
          (err as { data?: { message?: string } })?.data?.message ||
          "Failed to reset password. The link may have expired.";
        throw new Error(message);
      }
    },
    [resetPasswordMutation, navigate],
  );

  // ── Logout (manual — no API call needed) ──────────────────────────────────
  // 1. Wipe Redux auth state
  // 2. Remove accessToken from localStorage
  // 3. HttpOnly refreshToken cookie expires on its own (browser-managed)
  //    → When it expires, backend will reject refresh → user stays logged out
  // 4. Redirect to login

  const handleLogout = useCallback(async () => {
    try {
      // 1. Call logout API (this should clear the HttpOnly refreshToken cookie on server)
      // await logoutMutation().unwrap();
      logoutMutation().catch(() => {});
    } catch (err) {
      // It's okay if logout fails (e.g. network issue or already logged out)
      console.warn(
        "Logout API call failed, proceeding with local cleanup",
        err,
      );
    } finally {
      // 2. Always do client-side cleanup
      dispatch(logout());
      // dispatch(resetNavigation());
      // dispatch(menuApi.util.resetApiState());

      clearPersistedToken();
      clearApps();
      clearRefreshToken();
      // dispatch(resetAllState());
      window.location.href = getLoginUrl();
      // navigate(ROUTES.LOGIN);
    }
  }, [dispatch, navigate, logoutMutation]);

  // ── Switch app (ETS <-> CRD) ──────────────────────────────────────────────
  // Calls switch-app, stores the new token if one is returned, then does a
  // full-page navigation (the target app is a separate build).
  const handleSwitchApp = useCallback(
    async (appId: number) => {
      const res = await switchAppMutation({ appId }).unwrap();
      if (res?.accessToken) persistAccessToken(res.accessToken);
      window.location.assign(getAppRoute(appId));
    },
    [switchAppMutation],
  );

  const apps = getApps();
  const otherApps = apps.filter((a) => a.appId !== APP_IDS.ETS);

  return {
    apps,
    otherApps,
    handleSwitchApp,
    user,
    isAuthenticated,
    isLoading: isLoginLoading || isUserLoading || isSliceLoading,
    isForgotLoading,
    isResetLoading,
    error,
    accessToken,
    handleLogin,
    handleForgotPassword,
    handleResetPassword,
    handleLogout,
  };
};
