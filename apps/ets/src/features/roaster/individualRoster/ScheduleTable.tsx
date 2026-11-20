// src/features/individualRoster/components/ScheduleTable.tsx

import React, { useMemo } from "react";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import type { ScheduleHomepageEntry } from "../services/IndividualRosterApi";
import type { Tab, RowStatus } from "../types/scheduleView.types";

import StatusBadge from "./StatusBadge";
import ShiftTimeBadge from "./ShiftTimeBadge";
import RowActions from "./RowActions";

dayjs.extend(customParseFormat);

// ── Helpers ────────────────────────────────────────────────────────────────────

export function fmtDate(s?: string): string {
  if (!s) return "—";
  const d = dayjs(s, ["DD-MMM-YYYY", "YYYY-MM-DD"], true);
  return d.isValid() ? d.format("DD MMM YYYY") : s;
}

/** Priority: Noshow > Cancelled > Scheduled */
export function getRowStatus(
  entry: ScheduleHomepageEntry,
  tab: Tab,
): RowStatus {
  if (tab === "LOGIN") {
    if (entry.LoginNoshow === "Noshow") return "Noshow";
    if (entry.LoginCancelled === "Cancelled") return "Cancelled";
  } else {
    if (entry.LogoutNoshow === "Noshow") return "Noshow";
    if (entry.LogoutCancelled === "Cancelled") return "Cancelled";
  }
  return "Scheduled";
}

// ── Component ──────────────────────────────────────────────────────────────────

export interface ScheduleTableProps {
  data: ScheduleHomepageEntry[];
  isLoading: boolean;
  isFetching: boolean;
  error: unknown;
  activeTab: Tab;
  tatCheckingId: string | null;
  onCancel: (entry: ScheduleHomepageEntry) => void;
  onNoShow: (entry: ScheduleHomepageEntry) => void;
  onRetry: () => void;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({
  data,
  isLoading,
  isFetching,
  activeTab,
  tatCheckingId,
  onCancel,
  onNoShow,
  onRetry,
}) => {
  const columns = useMemo(
    () => [
      {
        title: "Date",
        key: "date",
        width: 130,
        render: (_: unknown, entry: ScheduleHomepageEntry) =>
          fmtDate(
            activeTab === "LOGIN"
              ? entry.LoginScheduleDate
              : entry.LogoutScheduleDate,
          ),
      },
      {
        title: "Shift Time",
        key: "shiftTime",
        width: 120,
        render: (_: unknown, entry: ScheduleHomepageEntry) => (
          <ShiftTimeBadge
            time={
              activeTab === "LOGIN"
                ? entry.LoginShiftTime
                : entry.LogoutShiftTime
            }
            tab={activeTab}
          />
        ),
      },
      {
        title: "Status",
        key: "status",
        width: 120,
        align: "center" as const,
        render: (_: unknown, entry: ScheduleHomepageEntry) => (
          <StatusBadge status={getRowStatus(entry, activeTab)} />
        ),
      },
      {
        title: "Pickup Address",
        key: "userAddress",
        width: 240,
        ellipsis: true,
        render: (_: unknown, entry: ScheduleHomepageEntry) =>
          entry.UserAddress || "—",
      },
      {
        title: "Office Address",
        key: "officeAddress",
        width: 240,
        ellipsis: true,
        render: (_: unknown, entry: ScheduleHomepageEntry) =>
          entry.OfficeAddress || "—",
      },
      {
        title: "Actions",
        key: "actions",
        width: 160,
        align: "center" as const,
        render: (_: unknown, entry: ScheduleHomepageEntry) => (
          <RowActions
            entry={entry}
            tab={activeTab}
            isChecking={tatCheckingId === entry.id}
            onCancel={onCancel}
            onNoShow={onNoShow}
          />
        ),
      },
    ],
    [activeTab, tatCheckingId, onCancel, onNoShow],
  );

  return (
    <DataTableWrapper showSearch={false}>
      <ApiStateWrapper
        isLoading={isLoading && !isFetching}
        isEmpty={!isLoading && !isFetching && data.length === 0}
        onRetry={onRetry}
        emptyMessage={`No ${activeTab === "LOGIN" ? "login" : "logout"} schedules found.`}
      >
        <AppTable
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={data}
          rowKey="id"
          total={data.length}
          tableState={{ page: 1, pageSize: 50 }}
          onTableChange={() => {}}
          scroll={{ x: 1010, y: 430 }}
        />

        <div style={{ marginBottom: "10px" }}></div>
      </ApiStateWrapper>
    </DataTableWrapper>
  );
};

export default ScheduleTable;
