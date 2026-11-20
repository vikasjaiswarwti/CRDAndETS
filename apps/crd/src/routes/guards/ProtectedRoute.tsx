// Guard for every CRD route. Login lives in the launcher (/), so "not signed in"
// is a full-page redirect there, carrying ?redirectUrl so the user returns here.
import type { ReactNode } from "react";
import { APP_IDS, getLoginUrl, lacksAppAccess } from "@commutr/shared";
import { useAppSelector } from "../../app/store";
import { selectIsAuthenticated } from "../../features/auth/slices/authSlice";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    window.location.replace(getLoginUrl(true));
    return null;
  }

  // Frontend gating only — the backend must enforce app access too.
  if (lacksAppAccess(APP_IDS.CRD)) {
    window.location.replace("/");
    return null;
  }

  return <>{children}</>;
};
