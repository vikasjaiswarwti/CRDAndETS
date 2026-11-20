// src/routes/config/routeConfig.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Static routes only: public pages + authenticated layout shells.
// Feature pages are NOT imported here — they come from the backend menu
// and are injected by RouteGenerator via generateDynamicRoutes().
//
// CHANGED from previous version:
//   ✅ Removed all direct feature page imports
//   ✅ Removed static feature children — all driven by backend menu now
//   ✅ Shell paths listed here so MainLayout renders on every sub-route
//   ✅ /dashboard index renders RoleDashboard (role-aware, no hardcoding)
// ─────────────────────────────────────────────────────────────────────────────

// import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";
import { PublicRoute } from "../guards/PublicRoute";
import { ProtectedRoute } from "../guards/ProtectedRoute";
import { ROUTES } from "../../shared/constants/app.constants";
import { MainLayout } from "../../shared/components/layouts/MainLayout/MainLayout";

import { RoleDashboard } from "../../features/dashboard/RoleDashboard";

import { lazyWithRetry } from "../utils/lazyWithRetry";

// Public pages — lazy loaded, not part of the auth bundle
// const LoginPage = lazy(() => import("../../features/auth/pages/LoginPage"));
// const ForgotPasswordPage = lazy(
//   () => import("../../features/auth/pages/ForgotPasswordPage"),
// );
// const SetNewPasswordPage = lazy(
//   () => import("../../features/auth/pages/SetNewPasswordPage"),
// );
// const PublicSignupPage = lazy(
//   () => import("../../features/employee/components/Publicemployeesignup"),
// );
// const UnauthorizedPage = lazy(
//   () => import("../../features/error/pages/UnauthorizedPage"),
// );
// const NotFoundPage = lazy(
//   () => import("../../features/error/pages/NotFoundPage"),
// );

const LoginPage = lazyWithRetry(
  () => import("../../features/auth/pages/LoginPage"),
);
const ForgotPasswordPage = lazyWithRetry(
  () => import("../../features/auth/pages/ForgotPasswordPage"),
);
const SetNewPasswordPage = lazyWithRetry(
  () => import("../../features/auth/pages/SetNewPasswordPage"),
);
const PublicSignupPage = lazyWithRetry(
  () => import("../../features/employee/components/Publicemployeesignup"),
);
const UnauthorizedPage = lazyWithRetry(
  () => import("../../features/error/pages/UnauthorizedPage"),
);
const NotFoundPage = lazyWithRetry(
  () => import("../../features/error/pages/NotFoundPage"),
);
const SharedCabPage = lazyWithRetry(
  () => import("../../features/SharedCab/pages/SharedCab"),
);

export const staticRoutes: RouteObject[] = [
  // ── Public (unauthenticated) ─────────────────────────────────────────────
  {
    element: <PublicRoute />,
    children: [
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <SetNewPasswordPage /> },
      { path: "/signup", element: <PublicSignupPage /> },
    ],
  },
  { path: "/shared-cab", element: <SharedCabPage /> },

  // ── Authenticated shell ──────────────────────────────────────────────────
  {
    id: "auth-shell",
    element: (
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    ),
    children: [
      // Redirect root → /dashboard
      { path: "/", element: <Navigate to={ROUTES.DASHBOARD} replace /> },

      // /dashboard — index shows role-specific dashboard via RoleDashboard.
      // Sub-routes (/dashboard/menu, etc.) injected by RouteGenerator.
      {
        path: "/dashboard",
        element: <MainLayout />,
        children: [{ index: true, element: <RoleDashboard /> }],
      },

      {
        id: "shell-lookup",
        path: "/lookup",
        element: <MainLayout />,
        children: [],
      },
      // Section shells — feature children are injected by RouteGenerator. //compliance
      // These must exist so MainLayout renders even before dynamic routes compute.
      // { path: "/account", element: <MainLayout /> },
      // { path: "/fleet", element: <MainLayout /> },
      // { path: "/user", element: <MainLayout /> },
      // { path: "/users", element: <MainLayout /> },
      // { path: "/schedule", element: <MainLayout /> },
      // { path: "/compliance", element: <MainLayout /> },
      //

      // Section shells — MUST have children: [] so RouteGenerator can append into them
      {
        id: "shell-account",
        path: "/account",
        element: <MainLayout />,
        children: [],
      },

      {
        id: "shell-lookup",
        path: "/lookup",
        element: <MainLayout />,
        children: [],
      },
      {
        id: "shell-fleet",
        path: "/fleet",
        element: <MainLayout />,
        children: [],
      },
      {
        id: "shell-user",
        path: "/user",
        element: <MainLayout />,
        children: [],
      },
      {
        id: "shell-users",
        path: "/users",
        element: <MainLayout />,
        children: [],
      },
      {
        id: "shell-schedule",
        path: "/schedule",
        element: <MainLayout />,
        children: [],
      },
      {
        id: "shell-compliance",
        path: "/compliance",
        element: <MainLayout />,
        children: [],
      },
      {
        id: "shell-routing",
        path: "/routing",
        element: <MainLayout />,
        children: [],
      },
      {
        id: "shell-billing",
        path: "/billing",
        element: <MainLayout />,
        children: [],
      },
      {
        id: "shell-trip-management",
        path: "/trip-management",
        element: <MainLayout />,
        children: [],
      },

      {
        id: "shell-reports",
        path: "/reports",
        element: <MainLayout />,
        children: [],
      },
      {
        id: "shell-escort",
        path: "/escort",
        element: <MainLayout />,
        children: [],
      },
      {
        id: "shell-feedback",
        path: "/feedback",
        element: <MainLayout />,
        children: [],
      },
    ],
  },

  // ── Error routes ─────────────────────────────────────────────────────────
  { path: ROUTES.UNAUTHORIZED, element: <UnauthorizedPage /> },
  { path: "*", element: <NotFoundPage /> },
];
