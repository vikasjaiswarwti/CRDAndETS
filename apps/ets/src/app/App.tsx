// src/app/App.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Application bootstrap. Triggers the menu API call and renders RouteGenerator
// once the navigation state is ready.
//
// CHANGED from previous version:
//   ✅ Removed ALL mock data logic — no IS_DEV check, no USE_MOCK_API flag,
//      no mockMenuData import, no hydrateFromMock dispatch
//   ✅ useGetMenuQuery always fires — real backend, always
//   ✅ navigationSlice extraReducers handle the API lifecycle automatically
//   ✅ RouteGenerator blocks on isHydrated, not isLoading — so the spinner
//      is managed in one place (RouteGenerator) not two
//
// How it works:
//   1. useGetMenuQuery fires immediately on mount
//   2. matchPending  → navigationSlice sets isLoading = true
//   3. matchFulfilled → slice stores menus + roles, sets isHydrated = true
//   4. RouteGenerator sees isHydrated = true → generates routes → renders
// ─────────────────────────────────────────────────────────────────────────────
// App.tsx
import { useMenuBootstrap } from "../features/navigation/hooks/useMenuBootstrap";
import { useVendorBootstrap } from "../features/VendorSuperVisor/hooks/useVendorBootstrap";
import { RouteGenerator } from "../routes/RouteGenerator";
import { useAlertBootstrap } from "../features/security-dashboard/hooks/useAlertBootstrap"; // Added
import { useAuthSync } from "../features/auth/hooks/useAuthSync";

import { PageTitleManager } from "../routes/dynamicTitle/PageTitleManager";

// import { useVendorBootstrap } from "../features/vendorContext/hooks/useVendorBootstrap";

export const App = () => {
  useMenuBootstrap();
  useVendorBootstrap();
  useAlertBootstrap();
  useAuthSync();
  return (
    <>
      <PageTitleManager />
      <RouteGenerator />
    </>
  );
};
