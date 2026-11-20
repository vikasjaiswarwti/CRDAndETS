// RouteGenerator.tsx — full replacement

import { useMemo, Suspense } from "react";
import { useRoutes, type RouteObject } from "react-router-dom";
import { useAppSelector } from "../app/store";
import { useSelector } from "react-redux";
import { staticRoutes } from "./config/routeConfig";
import { generateDynamicRoutes } from "./utils/routeUtils";
import { FEATURE_REGISTRY } from "./registry/Featureregistry";
import {
  selectMenus,
  selectIsHydrated,
} from "../features/navigation/slices/navigationSlice";
import { selectIsAuthenticated } from "../features/auth/slices/authSlice";
import { LoadingSpinner } from "../shared/components/ui/LoadingSpinner";

const SHELL_PATHS = [
  "/dashboard",
  "/lookup",
  "/account",
  "/fleet",
  "/user",
  "/users",
  "/schedule",
  "/routing",
  "/compliance",
  "/billing",
  "/reports",
  "/trip-management",
  "/escort",
  "/feedback",
];

const mergeRoutesIntoShells = (
  base: RouteObject[],
  dynamic: RouteObject[],
): RouteObject[] => {
  if (!dynamic.length) return base;
  const cloned: RouteObject[] = base.map((r) => ({ ...r }));
  const authShell = cloned.find((r) => r.id === "auth-shell");
  if (!authShell) return [...cloned, ...dynamic];

  const shellChildren: RouteObject[] = (authShell.children ?? []).map((c) => ({
    ...c,
  }));
  for (const dynRoute of dynamic) {
    if (!dynRoute.path) continue;
    const shellPath = SHELL_PATHS.filter((s) =>
      dynRoute.path!.startsWith(s + "/"),
    ).sort((a, b) => b.length - a.length)[0];

    if (shellPath) {
      const shellRoute = shellChildren.find((c) => c.path === shellPath);
      if (shellRoute) {
        shellRoute.children = [...(shellRoute.children ?? []), dynRoute];
        continue;
      }
    }
    shellChildren.push(dynRoute);
  }
  authShell.children = shellChildren;
  return cloned;
};

// ── Outer shell: guards hydration BEFORE useRoutes runs ──────────────────────
export const RouteGenerator = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isHydrated = useAppSelector(selectIsHydrated);

  // Authenticated but menus not loaded yet →
  // show spinner, never let useRoutes run with empty dynamic routes
  if (isAuthenticated && !isHydrated) {
    return <LoadingSpinner fullScreen={true} variant="fullscreen" />;
  }

  return <RouteGeneratorInner />;
};

// ── Inner shell: only mounts after hydration is confirmed ─────────────────────
const RouteGeneratorInner = () => {
  const menus = useAppSelector(selectMenus);
  const isHydrated = useAppSelector(selectIsHydrated);

  const dynamicRoutes = useMemo(
    () => (isHydrated ? generateDynamicRoutes(menus, FEATURE_REGISTRY) : []),
    [menus, isHydrated],
  );

  const allRoutes = useMemo(
    () => mergeRoutesIntoShells(staticRoutes, dynamicRoutes),
    [dynamicRoutes],
  );

  // if (import.meta.env.DEV) {
  //     const authShell = allRoutes.find((r) => r.id === 'auth-shell');
  //     // console.log('[RouteGenerator] auth shell children:', authShell?.children);
  // }

  const element = useRoutes(allRoutes);
  // return <Suspense fallback={null}>{element}</Suspense>;
  return (
    <Suspense
      fallback={<LoadingSpinner fullScreen={true} variant="fullscreen" />}
    >
      {element}
    </Suspense>
  );
};
