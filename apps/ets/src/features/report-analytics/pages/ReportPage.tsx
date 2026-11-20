import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Report, ReportCategory } from "../types/reports.types";
import { useGetMyReportsQuery } from "../services/ReportApi";
import ReportNotFound from "../components/ReportNotFound";
import ReportDetailView from "../components/ReportDetailView";
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

function findReportWithCategory(
  groups: ReportCategory[],
  id: string,
): { report: Report; category: string } | null {
  for (const group of groups) {
    const report = group.reports.find((r) => r.id === id);
    if (report) return { report, category: group.category };
  }
  return null;
}

const ReportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("id");

  const { data: apiGroups, isLoading, isError } = useGetMyReportsQuery();
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

  // ── Detail view ─────────────────────────────────────────────────────────────
  if (reportId) {
    const match = findReportWithCategory(apiGroups, reportId);
    if (match) {
      return (
        <ReportDetailView report={match.report} category={match.category} />
      );
    }
    return <ReportNotFound reportId={reportId} />;
  }

  // ── List view ───────────────────────────────────────────────────────────────
  return <ReportListView categoryOrder={categoryOrder} grouped={grouped} totalReports={totalVisible} />;
};

export default ReportPage;
