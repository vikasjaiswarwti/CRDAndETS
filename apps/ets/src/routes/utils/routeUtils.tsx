// src/routes/utils/routeUtils.ts
// ─────────────────────────────────────────────────────────────────────────────
// Converts the backend menu tree into React Router RouteObjects.
//
// Key rules:
//   • lazy() called ONCE per route via buildLazyComponentCache — never inside JSX
//   • routeUrls already have leading slash (normalised in menuApi transformResponse)
//   • Any path whose last segment is "dashboard" → RoleDashboard (role-aware)
//   • All other paths → FEATURE_REGISTRY lookup by full path, then last segment
//   • Deduplication: same path only registered once even if in multiple branches
//   • Warns in DEV when a routeUrl has no matching registry entry
//
// CHANGED from previous version:
//   ✅ No mock data references
//   ✅ routeUrls are already normalised by menuApi so no slash fixing needed here
//   ✅ Cleaner comments, same logic
// ─────────────────────────────────────────────────────────────────────────────

import { type ComponentType } from "react";
import type { RouteObject } from "react-router-dom";
import type { MenuItem } from "../../shared/types/menu.types";
import { ProtectedRoute } from "../guards/ProtectedRoute";
import { RoleDashboard } from "../../features/dashboard/RoleDashboard";
import { lazyWithRetry } from "./lazyWithRetry"; // add this

type FeatureRegistry = Record<
  string,
  () => Promise<{ default: ComponentType }>
>;

/**
 * Pre-builds one lazy component per registry entry.
 * Called ONCE per generateDynamicRoutes invocation (inside useMemo in RouteGenerator).
 * Guarantees lazy() is never called inside a render function or JSX expression,
 * which would create a new component reference on every render and cause remounts.
 */
const buildLazyComponentCache = (
  registry: FeatureRegistry,
): Record<string, ComponentType> => {
  const cache: Record<string, ComponentType> = {};
  for (const [key, importFn] of Object.entries(registry)) {
    // cache[key] = lazy(importFn);
    cache[key] = lazyWithRetry(importFn); // ← was lazy(importFn)
  }
  return cache;
};

export const generateDynamicRoutes = (
  menus: MenuItem[],
  featureRegistry: FeatureRegistry,
): RouteObject[] => {
  // Build lazy component map once before traversing the menu tree
  const lazyCache = buildLazyComponentCache(featureRegistry);
  const routes: RouteObject[] = [];
  const registeredPaths: Set<string> = new Set();

  const traverse = (items: MenuItem[]) => {
    // Respect the menu's intended display order
    const sorted = [...items].sort((a, b) => a.orderNo - b.orderNo);

    sorted.forEach((item) => {
      // Recurse into children first — a parent with empty routeUrl may still
      // have children with valid routes (e.g. "Fleet Management" group node)
      if (item.children?.length) {
        traverse(item.children);
      }

      // Skip items the backend hasn't assigned to this user
      if (!item.isAssigned) return;

      // Skip group/section nodes that have no route (empty routeUrl)
      if (!item.routeUrl?.trim()) return;

      const path = item.routeUrl.trim(); // already has leading slash from menuApi

      // Deduplicate — same routeUrl appears in both parent and child in some API responses
      if (registeredPaths.has(path)) return;
      registeredPaths.add(path);

      const lastSegment = path.split("/").filter(Boolean).pop() ?? "";

      // ── Dashboard routes ─────────────────────────────────────────────────
      // Any path ending in "dashboard" (e.g. /users/dashboard, /vendor/dashboard)
      // renders RoleDashboard which reads activeRole at render time.
      // This means role switches take effect without any route change.
      // if (lastSegment === 'dashboard') {
      if (lastSegment === "dashboard") {
        routes.push({
          path,
          element: (
            <ProtectedRoute requiredMenuId={item.menuId}>
              <RoleDashboard />
            </ProtectedRoute>
          ),
        });
        return;
      }

      // ── Feature routes ────────────────────────────────────────────────────
      // Try full path first ("/fleet/vendor"), then last segment ("vendor").
      // Full path is unambiguous and preferred; segment is a convenience fallback
      // for registries that use short keys.
      const LazyComponent = lazyCache[path] ?? lazyCache[lastSegment];

      if (!LazyComponent) {
        if (import.meta.env.DEV) {
          console.warn(
            `[routeUtils] No feature registered for "${path}". ` +
              `Add it to FEATURE_REGISTRY → src/routes/registry/featureRegistry.ts`,
          );
        }
        return; // Route silently skipped in production — sidebar link goes nowhere
      }

      routes.push({
        path,
        element: (
          <ProtectedRoute requiredMenuId={item.menuId}>
            <LazyComponent />
          </ProtectedRoute>
        ),
      });
    });
  };

  traverse(menus);
  return routes;
};
