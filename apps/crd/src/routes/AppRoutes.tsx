import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./guards/ProtectedRoute";
import { MainLayout } from "../shared/components/layouts/MainLayout";
import { ROUTES } from "../shared/constants/app.constants";

// One lazy chunk per feature page (same pattern as ETS).
const DashboardPage = lazy(() => import("../features/dashboard/pages/DashboardPage"));
const AllBookingsPage = lazy(() => import("../features/bookings/pages/AllBookingsPage"));
const CreateBookingPage = lazy(() => import("../features/bookings/pages/CreateBookingPage"));

export const AppRoutes = () => (
  <Suspense fallback={null}>
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.CREATE_BOOKING} element={<CreateBookingPage />} />
        <Route path={ROUTES.BOOKINGS} element={<AllBookingsPage />} />
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Route>
    </Routes>
  </Suspense>
);
