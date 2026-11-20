// src/features/routeManagement/components/TripPublishingPanel.tsx
import React, {
  memo,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type CSSProperties,
} from "react";
import { StickyTableFooter } from "./StickyTableFooter";
import { useTableSelection } from "../hooks/useTableSelection";
import type {
  TripPublishingRow,
  RouteDropdownItem,
  Notification,
  NotificationSummaryResponse,
  Batch,
  Summary,
} from "../types/RouteTypes";
import type { UseRouteModals } from "../hooks/useRouteModals";
import { RM_COLOR, RM_FONT, RM_RADIUS, RM_SPACE } from "../Routeuiconfig";
import {
  HEADER_ROW_H,
  ROW_STYLE,
  CELL_PAD,
  CHECKBOX_CELL_PAD,
  TABLE_BASE,
} from "../constants/Routetablelayout";
import {
  CellSingle,
  OccupancyCell,
  EmployeeCell,
  VehicleCell,
} from "../components/Tablecellwrappers";
import { useGetTripBatchNotificationQuery } from "../services/RouteManagementApi";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";

import {
  TotalEmpHeaderPopover,
  OccupancyHeaderPopover,
  VehicleVendorTripsheetHeaderPopover,
  GuardHeaderPopover,
} from "./Tableheaderpopovers";
import {
  Layers as LayersIcon,
  Users as UsersIcon,
  Send as SendIcon,
  XCircle as XCircleIcon,
  CheckCircle as CheckCircleIcon,
} from "lucide-react";
import { TableShimmer } from "./TableShimmer";

const ROW_H = 52;
const VISIBLE_ROWS = 4;
const BODY_MAX_H = ROW_H * VISIBLE_ROWS;

// ── Self-contained Communication Status Cell ──────────────────────────────────
interface CommStatusCellProps {
  notifications: Notification[];
  shiftId: number;
  tripType: number;
  locCode: number;
  dsDate: string;
}
type RecipientRow = Record<string, unknown>;

const CommStatusCell = memo(function CommStatusCell({
  notifications,
  shiftId,
  tripType,
  locCode,
  dsDate,
}: CommStatusCellProps) {
  const [open, setOpen] = useState(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);

  // Lazily import Modal from your UI library
  // Replace this with your actual useUILibrary hook
  const { Modal } = useUILibrary();

  const { data, isFetching } = useGetTripBatchNotificationQuery(
    { dsDate, locCode, tripType, shiftId },
    { skip: !open },
  );

  const response = data as NotificationSummaryResponse | undefined;
  const batches: Batch[] = response?.batches ?? [];
  const summary: Summary | undefined = response?.summary;

  // Derive active batch — default to first batch when data loads
  const resolvedActiveBatchId = useMemo(() => {
    if (activeBatchId && batches.some((b) => b.batchId === activeBatchId)) {
      return activeBatchId;
    }
    return batches[0]?.batchId ?? null;
  }, [activeBatchId, batches]);

  const activeBatch = useMemo(
    () => batches.find((b) => b.batchId === resolvedActiveBatchId) ?? null,
    [batches, resolvedActiveBatchId],
  );

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveBatchId(null); // reset to first tab on each open
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  return (
    <>
      {/* ── Trigger Button ── */}
      <button
        onClick={handleOpen}
        title="View communication status"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "3px 10px",
          borderRadius: 999,
          border: "1px solid #D1D5DB",
          background: "#F9FAFB",
          color: "#374151",
          fontSize: 11,
          fontWeight: 500,
          cursor: "pointer",
          transition: "background 0.1s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "#E5E7EB")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB")
        }
      >
        <span style={{ fontSize: 12 }}>📡</span>
        SMS Status
      </button>

      {/* ── Modal ── */}
      {/* Replace <Modal> with your actual Modal component */}
      <Modal
        open={open}
        onCancel={handleClose}
        footer={null}
        width={800}
        destroyOnClose
        title={
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
            Communication Status
            <span
              style={{
                marginLeft: 10,
                fontSize: 12,
                fontWeight: 400,
                color: "#6B7280",
              }}
            >
              Shift {shiftId} · {tripType === 1 ? "Login" : "Logout"}
            </span>
          </div>
        }
        styles={{
          header: { borderBottom: "1px solid #F3F4F6" },
          // body: { padding: "16px 20px 20px" },
        }}
        style={{ top: 10 }}
      >
        {isFetching ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              color: "#6B7280",
              fontSize: 13,
            }}
          >
            Loading…
          </div>
        ) : batches.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* 1. Summary bar */}
            {summary && <SummaryBar summary={summary} />}

            {/* 2. Batch tabs */}
            <BatchTabs
              batches={batches}
              notifications={notifications}
              activeBatchId={resolvedActiveBatchId ?? ""}
              onSelect={setActiveBatchId}
            />

            {/* 3. Active batch detail */}
            <div
              style={{
                maxHeight: 380,
                overflowY: "auto",
                scrollbarWidth: "thin",
              }}
            >
              {activeBatch && <BatchDetail batch={activeBatch} />}
            </div>
          </>
        )}
      </Modal>
    </>
  );
});

// ── Panel types ───────────────────────────────────────────────────────────────

interface TripPublishingPanelProps {
  rows: TripPublishingRow[];
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
  modals: UseRouteModals;
  currentDate: string;
  currentShiftId: string;
  dropdownActions?: RouteDropdownItem[];
  locCode: number;
  loading: boolean;
  hoveredIndex?: number | null;
  onHover?: (index: number | null) => void;
  syncedSelectedIndexes?: Set<number>;
  onSyncedSelect?: (updater: (prev: Set<number>) => Set<number>) => void;
}

const checkboxStyle: CSSProperties = {
  width: 13,
  height: 13,
  cursor: "pointer",
  accentColor: RM_COLOR.green600,
  flexShrink: 0,
};

const thStyle: CSSProperties = {
  textAlign: "left",
  fontSize: RM_FONT.colHeader,
  fontWeight: 600,
  color: RM_COLOR.gray400,
  padding: RM_SPACE.checkboxPad,
  whiteSpace: "nowrap",
  userSelect: "none",
  height: HEADER_ROW_H,
  overflow: "hidden",
};

const MIN_TABLE_W = 520;

const colgroup = (
  <colgroup>
    <col style={{ width: 34 }} />
    <col style={{ width: "13%" }} />
    <col style={{ width: "13%" }} />
    <col style={{ width: "27%" }} />
    <col style={{ width: "19%" }} />
    <col style={{ width: 130 }} />
  </colgroup>
);

interface PublishingRowProps {
  row: TripPublishingRow;
  isSelected: boolean;
  onToggle: (id: string) => void;
  locCode: number; // ← ADD
  currentDate: string; // ← ADD
  index: number;
  isHovered?: boolean;
  onHover?: (index: number | null) => void;
  isSyncHighlighted?: boolean;
}

const PublishingRow = memo(function PublishingRow({
  row,
  isSelected,
  onToggle,
  locCode,
  currentDate,
  index,
  isHovered,
  onHover,
  isSyncHighlighted,
}: PublishingRowProps) {
  const handleRowClick = useCallback(
    () => onToggle(row.id),
    [onToggle, row.id],
  );
  // console.log(row, "row");
  return (
    <tr
      style={{
        ...ROW_STYLE,
        borderBottom: RM_COLOR.borderRow,
        background:
          isSelected || isSyncHighlighted
            ? RM_COLOR.selectedBg
            : isHovered
              ? RM_COLOR.gray200
              : RM_COLOR.white,
        transition: "background 0.1s",
      }}
      onMouseEnter={() => onHover?.(index)}
      onMouseLeave={() => onHover?.(null)}
    >
      <td style={CHECKBOX_CELL_PAD}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleRowClick}
          style={checkboxStyle}
        />
      </td>
      <td style={CELL_PAD}>
        <EmployeeCell
          totalEmployees={row.totalEmployees}
          adhocEmployees={row.adhocEmployees}
        />
      </td>
      <td style={CELL_PAD}>
        <OccupancyCell pct={row.occupancyPct} vehicleInfo={row.vehicleInfo} />
      </td>
      <td style={CELL_PAD}>
        <VehicleCell v={row.vehicle} ve={row.vendor} r={row.route} />
      </td>
      <td style={CELL_PAD}>
        <CellSingle>
          <span
            style={{
              fontSize: RM_FONT.md,
              fontWeight: 500,
              color: RM_COLOR.gray700,
            }}
          >
            {row.maleFemaleGuardText}
            {/* {row.maleGuard} / {row.femaleGuard} / 0 */}
          </span>
        </CellSingle>
      </td>
      <td style={CELL_PAD}>
        {/* ← Self-contained: fetches its own data when opened */}
        <CommStatusCell
          notifications={row.notifications as Notification[]}
          shiftId={row.shiftId}
          tripType={row.tripType}
          locCode={locCode}
          dsDate={currentDate}
        />
      </td>
    </tr>
  );
});

// ── Panel ─────────────────────────────────────────────────────────────────────

export const TripPublishingPanel = memo(function TripPublishingPanel({
  rows,
  scrollRef,
  onScroll,
  modals,
  currentDate,
  currentShiftId,
  dropdownActions = [],
  locCode,
  loading = false,
  hoveredIndex,
  onHover,
  syncedSelectedIndexes,
  onSyncedSelect,
}: TripPublishingPanelProps) {
  console.log("rows from trip publishing", rows);

  const allIds = useMemo(() => rows.map((r) => r.id), [rows]);
  const {
    selectedMap,
    selectedCount,
    isAllSelected,
    toggleRow,
    toggleAll,
    clearSelection,
  } = useTableSelection(allIds);

  const actionOptions = useMemo(
    () =>
      dropdownActions.map((d) => ({
        value: d.id,
        label: d.name,
        name: d.name,
      })),
    [dropdownActions],
  );

  const [selectedAction, setSelectedAction] = useState(
    actionOptions[0]?.value ?? "",
  );

  useEffect(() => {
    if (
      actionOptions.length > 0 &&
      !actionOptions.find((a) => a.value === selectedAction)
    ) {
      setSelectedAction(actionOptions[0].value);
    }
  }, [actionOptions, selectedAction]);
  const handleToggleAll = useCallback(() => {
    const willSelectAll = !isAllSelected;
    toggleAll(allIds);
    onSyncedSelect?.((prev) => {
      const next = new Set(prev);
      if (willSelectAll) {
        // Add all indexes of this panel's rows
        allIds.forEach((_, i) => next.add(i));
      } else {
        // Remove all indexes of this panel's rows
        allIds.forEach((_, i) => next.delete(i));
      }
      return next;
    });
  }, [toggleAll, allIds, isAllSelected, onSyncedSelect]);
  const handleClearSelection = useCallback(() => {
    clearSelection();
    onSyncedSelect?.(() => new Set());
  }, [clearSelection, onSyncedSelect]);
  const handleToggleWithSync = useCallback(
    (id: string) => {
      const index = rows.findIndex((r) => r.id === id);
      toggleRow(id);
      onSyncedSelect?.((prev) => {
        // ← updater form, same as setState
        const next = new Set(prev);
        if (selectedMap[id]) {
          next.delete(index);
        } else {
          next.add(index);
        }
        return next;
      });
    },
    [toggleRow, rows, selectedMap, onSyncedSelect],
  );
  return (
    <div
      style={{
        background: RM_COLOR.white,
        border: RM_COLOR.border,
        borderRadius: RM_RADIUS.card,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        minHeight: 0,
        height: "100%",
        boxShadow: RM_COLOR.shadow,
      }}
    >
      <div
        style={{
          padding: RM_SPACE.panelHeaderPad,
          borderBottom: RM_COLOR.border,
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: RM_FONT.md,
            fontWeight: 600,
            color: RM_COLOR.gray900,
            margin: 0,
          }}
        >
          2. Trip Publishing
        </p>
        <p
          style={{
            fontSize: RM_FONT.xs,
            color: RM_COLOR.gray400,
            margin: "1px 0 0",
          }}
        >
          Generate / Publish Trip sheet
        </p>
      </div>

      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          background: RM_COLOR.gray50,
          borderBottom: RM_COLOR.border,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        <table style={{ ...TABLE_BASE, minWidth: MIN_TABLE_W }}>
          {colgroup}
          <thead>
            <tr style={{ height: HEADER_ROW_H }}>
              <th style={{ ...thStyle, padding: "0 10px" }}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleToggleAll}
                  style={checkboxStyle}
                />
              </th>
              <th style={thStyle}>
                Total Emp. <TotalEmpHeaderPopover />
              </th>
              <th style={thStyle}>
                Occupancy <OccupancyHeaderPopover />
              </th>
              <th style={thStyle}>
                Vehicle/Vendor/Tripsheet <VehicleVendorTripsheetHeaderPopover />
              </th>
              <th style={thStyle}>
                Male/Female/Guard <GuardHeaderPopover />
              </th>
              <th style={thStyle}>Communication</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Body */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          overflowY: "auto",
          overflowX: "auto",
          scrollbarColor: `${RM_COLOR.gray300} transparent`,
          maxHeight: BODY_MAX_H,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <table style={{ ...TABLE_BASE, minWidth: MIN_TABLE_W }}>
          {colgroup}
          <tbody>
            {/* {rows.map((row) => (
              <PublishingRow
                key={row.id}
                row={row}
                isSelected={!!selectedMap[row.id]}
                onToggle={toggleRow}
                locCode={locCode} // ← pass down
                currentDate={currentDate} // ← pass down
              />
            ))} */}

            {loading ? (
              <TableShimmer rows={4} cols={6} />
            ) : (
              rows.map((row, index) => (
                <PublishingRow
                  key={row.id}
                  row={row}
                  isSelected={!!selectedMap[row.id]}
                  onToggle={handleToggleWithSync}
                  locCode={locCode}
                  currentDate={currentDate}
                  index={index}
                  isHovered={hoveredIndex === index} // ← add
                  onHover={onHover}
                  isSyncHighlighted={
                    syncedSelectedIndexes?.has(index) && !selectedMap[row.id]
                  }
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <StickyTableFooter
        selectedCount={selectedCount}
        selectedRows={rows.filter((r) => selectedMap[r.id])}
        // onClearSelection={clearSelection}
        onClearSelection={handleClearSelection} // ← use wrapped version
        actions={actionOptions}
        selectedAction={selectedAction}
        onActionChange={setSelectedAction}
        modals={modals}
        currentDate={currentDate}
        currentShiftId={currentShiftId}
        locCode={locCode}
        panelType="publishing"
      />
    </div>
  );
});

function EmptyState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "32px 16px",
        background: "#F9FAFB",
        borderRadius: 10,
        border: "1px dashed #D1D5DB",
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
        No notifications sent yet
      </div>
      <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>
        SMS notifications for this shift haven't been dispatched.
      </div>
    </div>
  );
}

function BatchDetail({ batch }: { batch: Batch }) {
  const scheduledDate = batch.scheduledAt
    ? new Date(batch.scheduledAt).toLocaleString()
    : "—";
  const notifiedDate = batch.notifiedAt
    ? new Date(batch.notifiedAt).toLocaleString()
    : "—";

  return (
    <div>
      {/* Batch meta grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4px 10px",
          padding: "6px 8px",
          background: "#FAFAFA",
          borderRadius: 8,
          border: "1px solid #E5E7EB",
          // marginBottom: 4,
        }}
      >
        <MetaRow label="Event Key" value={batch.eventKey} />
        <MetaRow label="Channels" value={batch.channels.join(", ")} />
        <MetaRow label="Scheduled" value={scheduledDate} />
        <MetaRow label="Notified" value={notifiedDate} />
        <MetaRow
          label="Completed"
          value={
            batch.completedAt
              ? new Date(batch.completedAt).toLocaleString()
              : "—"
          }
        />
        <MetaRow
          label="Recipients"
          value={`${batch.recipients.total} total · ${batch.recipients.sent} sent · ${batch.recipients.failed} failed`}
        />
      </div>
      {/* Delivered list */}
      <RecipientTable
        title="Delivered"
        color="#059669"
        icon="✅"
        recipients={(batch.delivered ?? []) as RecipientRow[]}
      />
      {/* Failed list */}
      <RecipientTable
        title="Failed"
        color="#DC2626"
        icon="❌"
        recipients={(batch.failed ?? []) as RecipientRow[]}
      />
      {/* Both empty */}
      {batch.delivered.length === 0 && batch.failed.length === 0 && (
        <div
          style={{
            marginTop: 12,
            textAlign: "center",
            padding: "16px",
            background: "#F9FAFB",
            borderRadius: 8,
            border: "1px dashed #D1D5DB",
            fontSize: 12,
            color: "#9CA3AF",
          }}
        >
          No delivery records available yet.
        </div>
      )}
    </div>
  );
}

function formatColumnHeader(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

// Renders a cell value safely — objects/arrays are JSON-stringified,
// primitives are rendered as-is, null/undefined fall back to "—".
function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function RecipientTable({
  title,
  color,
  icon,
  recipients,
}: {
  title: string;
  color: string;
  icon: string;
  recipients: RecipientRow[];
}) {
  if (recipients.length === 0) return null;

  // Derive columns dynamically from ALL rows (union of keys).
  // New fields added by the API appear automatically without any code change.
  const columns = useMemo<string[]>(() => {
    const keySet = new Set<string>();
    recipients.forEach((row) => Object.keys(row).forEach((k) => keySet.add(k)));
    return Array.from(keySet);
  }, [recipients]);

  // Equal-width columns: each column gets 1fr
  const gridTemplateColumns = columns.map(() => "1fr").join(" ");

  return (
    <div style={{ marginTop: 12 }}>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color }}>
          {title} ({recipients.length})
        </span>
      </div>

      {/* Table */}
      <div
        style={{
          borderRadius: 6,
          border: "1px solid #E5E7EB",
          overflowX: "auto", // ← horizontal scroll when columns overflow
          overflowY: "hidden",
        }}
      >
        {/* Header row — derived from column keys */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns,
            background: "#F9FAFB",
            padding: "6px 10px",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          {columns.map((col) => (
            <span
              key={col}
              style={{ fontSize: 11, fontWeight: 600, color: "#6B7280" }}
            >
              {formatColumnHeader(col)}
            </span>
          ))}
        </div>

        {/* Data rows — each cell rendered by column key */}
        {recipients.map((row, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns,
              padding: "6px 10px",
              borderBottom:
                i < recipients.length - 1 ? "1px solid #F3F4F6" : "none",
              background: i % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
            }}
          >
            {columns.map((col) => (
              <span
                key={col}
                title={formatCellValue(row[col])}
                style={{
                  fontSize: 10,
                  color: "#374151",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  paddingRight: 8,
                }}
              >
                {formatCellValue(row[col])}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <span style={{ color: "#6B7280", fontSize: 12 }}>{label}</span>
      <span style={{ color: "#111827", fontSize: 12, fontWeight: 500 }}>
        {value}
      </span>
    </>
  );
}
function SummaryBar({ summary }: { summary: Summary }) {
  const stats = [
    {
      label: "Batches",
      value: summary.totalBatches,
      icon: <LayersIcon size={14} color="#9CA3AF" />,
    },
    {
      label: "Recipients",
      value: summary.totalRecipients,
      icon: <UsersIcon size={14} color="#9CA3AF" />,
    },
    {
      label: "Sent",
      value: summary.totalSent,
      icon: <SendIcon size={14} color="#2563EB" />,
    },
    {
      label: "Failed",
      value: summary.totalFailed,
      icon: <XCircleIcon size={14} color="#DC2626" />,
    },
    {
      label: "Success",
      value: summary.successRate,
      icon: <CheckCircleIcon size={14} color="#059669" />,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        marginBottom: 8,
        background: "#F9FAFB",
        borderRadius: 8,
        border: "1px solid #E5E7EB",
        overflow: "hidden",
      }}
    >
      {stats.map(({ label, value, icon }, i) => (
        <div
          key={label}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            borderRight: i < stats.length - 1 ? "1px solid #E5E7EB" : "none",
          }}
        >
          {icon}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>
              {value}
            </span>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function BatchTabs({
  batches,
  notifications,
  activeBatchId,
  onSelect,
}: {
  batches: Batch[];
  notifications: Notification[];
  activeBatchId: string;
  onSelect: (id: string) => void;
}) {
  const notificationMap = useMemo(
    () => new Map(notifications.map((n) => [n.batchId, n])),
    [notifications],
  );
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        marginBottom: 8,
        paddingBottom: 8,
        borderBottom: "1px solid #F3F4F6",
      }}
    >
      {batches.map((batch) => {
        const isActive = batch.batchId === activeBatchId;
        const notification = notificationMap.get(batch.batchId);

        return (
          <button
            key={batch.batchId}
            onClick={() => onSelect(batch.batchId)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 8,
              border: isActive ? "1.5px solid #2563EB" : "1.5px solid #E5E7EB",
              background: isActive ? "#EFF6FF" : "#F9FAFB",
              color: isActive ? "#1D4ED8" : "#374151",
              fontSize: 12,
              fontWeight: isActive ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            {/* Notification label if matched, fallback to batch name */}
            <span>{notification?.label}</span>
          </button>
        );
      })}
    </div>
  );
}
