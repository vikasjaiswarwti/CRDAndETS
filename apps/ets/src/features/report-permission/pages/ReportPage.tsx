import React, { useMemo } from "react";
import type { Report, ReportCategory } from "../types/reports.types";
import {  useGetMyReportsQuery } from "../services/reportPermissionApi";
import ReportListView from "../components/ReportListView";

// ── Colour tokens ─────────────────────────────────────────────────────────────
export const C = {
  white: "#ffffff",
  pageBg: "#F9FAFB",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  gray100: "#F3F4F6",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray700: "#374151",
  gray900: "#111827",
  green: "#3E9B73",
  greenLight: "#ECFDF5",
  errorRed: "#EF4444",
  errorBg: "#FEF2F2",
};

// ── Derived data helpers (operate on API data, not static import) ─────────────
function buildCategoryOrder(groups: ReportCategory[]): string[] {
  return groups.map((g) => g.category);
}

function buildGrouped(groups: ReportCategory[]): Record<string, Report[]> {
  return Object.fromEntries(
    groups.map((g) => [g.category, g.reports.filter((r) => r.isActive)]),
  );
}

const ReportPage: React.FC = () => {
  const { data: apiGroups, isLoading, isError, refetch } = useGetMyReportsQuery();
  const categoryOrder = useMemo(
    () => buildCategoryOrder(apiGroups ?? []),
    [apiGroups],
  );

  const grouped = useMemo(() => buildGrouped(apiGroups ?? []), [apiGroups]);
  const totalVisible = useMemo(
      () => apiGroups?.reduce((sum, { reports }) => sum + reports.length, 0),
      [apiGroups],
    );
  // ── Loading state ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        style={{
          background: C.pageBg,
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.gray400,
          fontSize: 14,
        }}
      >
        Loading reports…
      </div>
    );
  }
  // ── Error state ─────────────────────────────────────────────────────────────
  if (isError || !apiGroups) {
    return (
      <div
        style={{
          background: C.pageBg,
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: C.errorRed,
          fontSize: 14,
        }}
      >
        Failed to load reports. Please try again.
      </div>
    );
  }
  // ── List view ───────────────────────────────────────────────────────────────
  return <ReportListView categoryOrder={categoryOrder} grouped={grouped} totalReports={totalVisible} refetch={refetch} />;
};

export default ReportPage;
