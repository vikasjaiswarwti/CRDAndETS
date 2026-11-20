// src/routes/guards/ProtectedRoute.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Two-layer guard for every authenticated route:
//
//   Layer 1 — Authentication
//     Reads auth token from your auth slice / localStorage.
//     If not authenticated → redirect to /login, preserving the intended URL
//     in location.state so you can redirect back after login.
//
//   Layer 2 — Menu assignment (optional, only when requiredMenuId is passed)
//     Walks the live menu tree from the store.
//     If the user's menu doesn't include this menuId with isAssigned=true
//     → redirect to /unauthorized.
//     Skipped while menus are still loading (isHydrated = false) to avoid
//     a false 403 before the API has responded.
//
// Usage:
//   <ProtectedRoute>                        ← auth check only
//   <ProtectedRoute requiredMenuId="uuid">  ← auth + menu access check
// ─────────────────────────────────────────────────────────────────────────────

import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/store';
import {
    selectMenus,
    selectIsHydrated,
} from '../../features/navigation/slices/navigationSlice';
import { ROUTES } from '../../shared/constants/app.constants';
import type { MenuItem } from '../../shared/types/menu.types';

import { selectIsAuthenticated } from '../../features/auth/slices/authSlice';
import { LoadingSpinner } from '../../shared/components/ui';
import {
    isSubPathApp,
    getLoginUrl,
    lacksAppAccess,
    APP_IDS,
    APP_ROUTES,
} from '../../shared/auth-core';


// ── Menu access helper ────────────────────────────────────────────────────────
/** Recursively searches the menu tree for a matching assigned menuId. */
const isMenuAssigned = (items: MenuItem[], targetId: string): boolean => {
    for (const item of items) {
        if (item.menuId === targetId && item.isAssigned) return true;
        if (item.children?.length && isMenuAssigned(item.children, targetId)) return true;
    }
    return false;
};

interface Props {
    children: ReactNode;
    /**
     * UUID of the backend menu item this route corresponds to.
     * When provided, the guard verifies the user's menu includes this item.
     * Omit for routes that any authenticated user can access (e.g. /dashboard).
     */
    requiredMenuId?: string;
}

export const ProtectedRoute = ({ children, requiredMenuId }: Props) => {
    const location = useLocation();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const menus = useAppSelector(selectMenus);
    const isHydrated = useAppSelector(selectIsHydrated);

    // console.log('isAuthenticated from protected route 222', isAuthenticated);

    if (isAuthenticated && !isHydrated) {
        return <LoadingSpinner variant="content" />;
    }

    // Layer 1: not logged in → go to login, remember where they were headed
    if (!isAuthenticated) {
        // Served under /ets/: login is owned by the launcher (separate build),
        // so a full-page navigation is required, not a router redirect.
        if (isSubPathApp()) {
            window.location.replace(getLoginUrl(true));
            return null;
        }
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    // App access: a user whose stored apps list lacks ETS goes back to the
    // launcher (frontend gating only — the backend must enforce this too).
    if (isSubPathApp() && lacksAppAccess(APP_IDS.ETS)) {
        window.location.replace(APP_ROUTES.launcher);
        return null;
    }

    // Layer 2: menu access check — only after menus have loaded
    // (avoids false 403 while the API call is still in-flight)
    if (requiredMenuId && isHydrated && menus.length) {
        if (!isMenuAssigned(menus, requiredMenuId)) {
            return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
        }
    }

    return <>{children}</>;
};