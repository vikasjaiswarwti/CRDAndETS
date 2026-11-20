// Shared building blocks for the audit log views (modal + full page).
// Both views show the same columns and use the same filter/query wiring — only
// the surrounding chrome differs.

import { useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { useGetAuditLogsQuery, type AuditLogItem } from "../services/auditApi";
import type { TableColumn } from "../../../shared/lib/ui-lib/ui-library-context";

export const DEFAULT_PAGE_SIZE = 10;

export function StatusPill({
  code,
  isSuccess,
}: {
  code: number;
  isSuccess: boolean;
}) {
  const ok = isSuccess ?? (code >= 200 && code < 300);
  return (
    <span
      style={{ padding: "2px 4px" }}
      className={`inline-flex items-center gap-1.5 rounded-full text-[11px] font-medium ${
        ok
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200"
          : "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200"
      }`}
    >
      {code}
    </span>
  );
}

export function formatTimestamp(ts: string | null | undefined) {
  if (!ts) return "—";
  try {
    return new Date(ts).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "medium",
    });
  } catch {
    return ts;
  }
}

export const auditLogColumns: TableColumn<AuditLogItem>[] = [
  {
    title: "Time",
    dataIndex: "timestamp",
    key: "timestamp",
    render: (value) => formatTimestamp(value),
    width: 140,
  },
  {
    title: "User",
    dataIndex: "userName",
    key: "userName",
    render: (_value, item) => item.userName || item.userId || "—",
    width: 160,
  },
  {
    title: "Action / Status Code",
    dataIndex: "action",
    key: "action",
    width: 200,
    render: (_value, item) => (
      <>
        {item.action}{" "}
        <StatusPill code={item.statusCode} isSuccess={item.isSuccess} />
      </>
    ),
  },
  {
    title: "Details",
    dataIndex: "detail",
    key: "details",
    width: 280,
    render: (value) => <>{value ?? "-"}</>,
  },
];

/**
 * Owns the audit log filter state (page / date range / success flag) and the
 * resulting query. Skips fetching until a module is chosen, so the full-page
 * view can render before the user picks one.
 */
export function useAuditLogData(
  module: string | undefined,
  pageSize: number,
  userId?: string,
) {
  const [page, setPage] = useState(1);
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(() => [
    dayjs().startOf("day"),
    dayjs().startOf("day"),
  ]);
  const [successOnly, setSuccessOnly] = useState(true);

  // A single selected day would otherwise give from === to, i.e. a zero-width
  // window — push `to` out by a day so the range always spans at least one day.
  const toDate = range?.[1]?.isSame(range[0], "day")
    ? range[1].add(1, "day")
    : range?.[1];

  const { data, isLoading, isFetching, error, refetch } = useGetAuditLogsQuery(
    {
      module: module ?? "",
      page,
      pageSize,
      userId: userId ?? "",
      from: range?.[0]?.format("YYYY-MM-DD"),
      to: toDate?.format("YYYY-MM-DD"),
      isSuccess: successOnly,
    },
    { skip: !module },
  );

  const handleRangeChange = (dates: [Dayjs, Dayjs] | null) => {
    setRange(dates && dates[0] && dates[1] ? dates : null);
    setPage(1);
  };

  const handleSuccessChange = (checked: boolean) => {
    setSuccessOnly(checked);
    setPage(1);
  };

  return {
    items: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    loading: isLoading || isFetching,
    isLoading,
    error,
    refetch,
    page,
    setPage,
    range,
    handleRangeChange,
    successOnly,
    handleSuccessChange,
  };
}
