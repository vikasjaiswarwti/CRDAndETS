import React, { useMemo } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { useTokens } from "../../../shared/constants/tokens";
import { useComplaintTable } from "../hooks/useComplaintTable";
import type { ComplaintReply } from "../types/complaint.types";

interface Props {
  items: ComplaintReply[];
  total: number;
  page: number;
  pageSize: number;
  onChangePage: (page: number, pageSize: number) => void;
  /** True only before the very first page of data has ever loaded. */
  isLoading: boolean;
  /** True on every request — tab/office/employee/page change, row select.
   *  Drives the table's inline skeleton without tearing down Pagination. */
  isFetching: boolean;
  error: unknown;
  onRetry: () => void;
  selectedReference: number | null;
  onReview: (referenceNo: number) => void;
  /** Lets the parent (ComplaintResolutionPage) explain *why* the table is
   *  empty — e.g. no office picked yet — instead of a generic message. */
  emptyMessage?: string;
}

export const ComplaintListPanel: React.FC<Props> = ({
  items,
  total,
  page,
  pageSize,
  onChangePage,
  isLoading,
  isFetching,
  // error,
  onRetry,
  selectedReference,
  onReview,
  emptyMessage = "No complaints found",
}) => {
  const { Pagination } = useUILibrary();
  const { color, spacing, radius, shadow } = useTokens();

  // Table itself doesn't drive paging (pagination is disabled inside AppTable
  // and handled by the Pagination control below), so tableState here is just
  // used for the sort/skeleton contract AppTable expects.
  const tableState = useMemo(() => ({ page, pageSize }), [page, pageSize]);

  // Columns now live in useComplaintTable (mirrors useBookingTable) — every
  // column carries an explicit width instead of leaving some to shrink-wrap.
  const { columns } = useComplaintTable({ onReview });

  return (
    // Card wrapper now matches ApprovalDashboardPage's table card exactly —
    // no forced height/flex-1/minHeight:0. The page scrolls normally (see
    // ComplaintResolutionPage), so this card just grows to fit its content
    // instead of being locked to fill a fixed-height parent.
    <div
      style={{
        background: color.surface,
        borderRadius: radius.xl,
        border: `1px solid ${color.border}`,
        boxShadow: shadow.card,
        overflow: "hidden",
      }}
    >
      <ApiStateWrapper
        isLoading={isLoading}
        // Don't collapse to the empty state mid-refetch — a page/tab/filter
        // change briefly reports 0 items (new cache key = no data yet), and
        // ApiStateWrapper's empty state was swallowing the table AND the
        // Pagination footer with it. Only treat it as truly empty once a
        // fetch has actually settled.
        isEmpty={!isFetching && !items.length}
        onRetry={onRetry}
        emptyMessage={emptyMessage}
      >
        <AppTable<ComplaintReply>
          columns={columns}
          dataSource={items}
          rowKey="referenceNo"
          tableState={tableState}
          // isFetching (not isLoading) so every tab/office/employee/page
          // change and every row select shows the busy skeleton, not just
          // the very first load.
          loading={isFetching}
          scroll={{ x: 700 }}
          // Clicking anywhere on a row opens that complaint's review panel —
          // the eye icon in the Action column does the same thing, it's
          // just an explicit affordance for the same click target.
          onRowClick={(record) => onReview(record.referenceNo)}
          activeRowKey={
            selectedReference != null ? String(selectedReference) : undefined
          }
          style={{ borderTop: `1px solid ${color.border}` }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: `${spacing.sm}px ${spacing.lg}px`,
            borderTop: `1px solid ${color.border}`,
          }}
        >
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            disabled={isFetching}
            showTotal={(t: number) => `Total ${t} items`}
            onChange={(p: number, ps: number) => onChangePage(p, ps)}
          />
        </div>
      </ApiStateWrapper>
    </div>
  );
};
