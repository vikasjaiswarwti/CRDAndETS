// src/features/routeManagement/components/RoutePlanningPanel.tsx
import React, {
  memo,
  useCallback,
  useMemo,
  useState,
  useRef,
  type CSSProperties,
} from "react";
import { StickyTableFooter } from "./StickyTableFooter";
import { useTableSelection } from "../hooks/useTableSelection";
import type { RoutePlanningRow, RouteDropdownItem } from "../types/RouteTypes";
import type { UseRouteModals } from "../hooks/useRouteModals";
import {
  RM_COLOR,
  RM_FONT,
  RM_RADIUS,
  RM_SPACE,
  LIGHT_POPOVER,
} from "../Routeuiconfig";
import {
  HEADER_ROW_H,
  ROW_STYLE,
  CELL_PAD,
  CHECKBOX_CELL_PAD,
  TABLE_BASE,
} from "../constants/Routetablelayout";
import {
  CellStack,
  LoginBadge,
  RouteStatusBadge,
} from "../components/Tablecellwrappers";
import { EmployeeDetailsModal } from "../Modals/EmployeeDetailsModal";
import { TableShimmer } from "./TableShimmer";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setRouteMakerParams } from "../slice/Routemanagementslice";

import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";

import {
  ShiftHeaderPopover,
  EmployeesHeaderPopover,
  VehicleVendorRoutePlanningHeaderPopover,
} from "./Tableheaderpopovers";

const ROW_H = 52;
const VISIBLE_ROWS = 4;
const BODY_MAX_H = ROW_H * VISIBLE_ROWS;

interface RoutePlanningPanelProps {
  rows: RoutePlanningRow[];
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
  fontWeight: 700,
  color: RM_COLOR.gray400,
  padding: RM_SPACE.checkboxPad,
  whiteSpace: "nowrap",
  userSelect: "none",
  height: HEADER_ROW_H,
  overflow: "hidden",
};

const colgroup = (
  <colgroup>
    <col style={{ width: 24 }} />
    <col style={{ width: "20%" }} />
    <col style={{ width: "36%" }} />
    <col style={{ width: "40%" }} />
  </colgroup>
);

interface PlanningRowProps {
  row: RoutePlanningRow;
  isSelected: boolean;
  onToggle: (id: string) => void;
  onEmployeeClick: (row: RoutePlanningRow) => void;
  onRouteClick: (row: RoutePlanningRow) => void;
  index: number;
  isHovered?: boolean;
  onHover?: (index: number | null) => void;
  isSyncHighlighted?: boolean;
}

const PlanningRow = memo(function PlanningRow({
  row,
  isSelected,
  onToggle,
  onEmployeeClick,
  onRouteClick,
  index,
  isHovered,
  onHover,
  isSyncHighlighted,
}: PlanningRowProps) {
  console.log("row logs from PlanningRow", row);

  // const isLocked = row?.isLocked;

  const { Popover } = useUILibrary();

  const cellRef = useRef<HTMLTableCellElement>(null);

  const handleRowClick = useCallback(
    () => onToggle(row.id),
    [onToggle, row.id],
  );

  const handleEmpClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEmployeeClick(row);
    },
    [onEmployeeClick, row],
  );

  const handleRouteClick = useCallback(
    // ← ADD
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRouteClick(row);
    },
    [onRouteClick, row],
  );

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
          // disabled={isLocked}
          style={checkboxStyle}
        />
      </td>

      <td style={CELL_PAD}>
        <CellStack
          primary={
            <span
              style={{
                fontSize: RM_FONT.md,
                fontWeight: 600,
                color: RM_COLOR.gray900,
              }}
            >
              {row.shiftTime}
            </span>
          }
          secondary={<LoginBadge type={row.loginType} />}
        />
      </td>

      <td ref={cellRef} style={{ ...CELL_PAD, position: "relative" }}>
        <CellStack
          primary={
            <Popover
              {...LIGHT_POPOVER}
              content={
                <span
                  style={{
                    // color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Click to view employee details for this shift
                </span>
              }
              title={null}
              trigger="hover"
              placement="topLeft"
            >
              <button
                type="button"
                onClick={handleEmpClick}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    fontSize: RM_FONT.md,
                    fontWeight: 600,
                    color:
                      row.status === "Routes Generated"
                        ? "#065F46"
                        : RM_COLOR.gray700,
                    textDecoration: "underline",
                    // textDecorationStyle: "dotted",
                    textUnderlineOffset: 3,
                  }}
                >
                  {row.employeeCount} Employees
                </span>
              </button>
            </Popover>
          }
          secondary={<RouteStatusBadge status={row.status} />}
        />
      </td>

      {/* <td style={CELL_PAD}>
        <Popover
          {...LIGHT_POPOVER}
          content={
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Open Route Maker page in new tab for this shift ↗
            </span>
          }
          placement="topLeft" // ← aligns arrow with left edge of the button
        >
          <button
            type="button"
            onClick={handleRouteClick}
            title="Open Route Maker — Vehicle / Vendor / Routes"
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: RM_FONT.md,
                fontWeight: 600,
                color: "#2563EB",
                textDecoration: "underline",
                // textDecorationStyle: "dotted",
                textUnderlineOffset: 3,
              }}
            >
              {row.vehicleVendorRouteText}

              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 3h7v7" />
                <path d="M10 14L21 3" />
                <path d="M21 14v7h-7" opacity="0" />
                <path d="M5 5v14h14" />
              </svg>
            </span>
          </button>
        </Popover>
      </td> */}

      <td style={CELL_PAD}>
        {row.isRouteGenerated ? (
          /* ── Routes exist → clickable blue link ── */
          <Popover
            {...LIGHT_POPOVER}
            content={
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                Open Route Maker page in new tab for this shift ↗
              </span>
            }
            placement="topLeft"
          >
            {/* <button
              type="button"
              onClick={handleRouteClick}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "inline-flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: RM_FONT.md,
                  fontWeight: 600,
                  color: "#2563EB",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                {row.vehicleVendorRouteText}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 3h7v7" />
                  <path d="M10 14L21 3" />
                  <path d="M5 5v14h14" />
                </svg>
              </span>

              
            </button> */}
            <button
              type="button"
              onClick={handleRouteClick}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "inline-flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: RM_FONT.md,
                  fontWeight: 600,
                  color: "#2563EB",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                {row.vehicleVendorRouteText}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 3h7v7" />
                  <path d="M10 14L21 3" />
                  <path d="M5 5v14h14" />
                </svg>
              </span>

              {/* Published badge — only when status is Published */}
              {row.routeStatus === "Published" && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#15803D",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle cx="12" cy="12" r="10" fill="#22C55E" />
                    <path
                      d="M8 12.5L10.8 15.3L16.5 9.6"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Published
                </span>
              )}
            </button>
          </Popover>
        ) : (
          /* ── No routes yet → grey, disabled, informational popover ── */
          <Popover
            {...LIGHT_POPOVER}
            content={
              <div style={{ maxWidth: 240 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Routes not generated
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: "#6B7280",
                    marginBottom: 8,
                    lineHeight: 1.5,
                  }}
                >
                  <strong style={{ color: "#374151" }}>
                    {row.shiftTime} · {row.loginType}
                  </strong>{" "}
                  has no routes yet. Follow these steps:
                </div>

                {[
                  "Select this shift's checkbox on the left",
                  `Choose "Generate Routes" from the action bar`,
                  "Hit Generate — routes will be created",
                ].map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 7,
                      marginBottom: 5,
                    }}
                  >
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: "#0F766E",
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#374151",
                        lineHeight: 1.45,
                      }}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            }
            placement="topLeft"
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: RM_FONT.md,
                fontWeight: 500,
                color: "#9CA3AF", // ← muted gray, not clickable-looking
                cursor: "default",
                userSelect: "none",
              }}
            >
              {row.vehicleVendorRouteText}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#D1D5DB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </span>
          </Popover>
        )}
      </td>
    </tr>
  );
});

export const RoutePlanningPanel = memo(function RoutePlanningPanel({
  rows,
  scrollRef,
  onScroll,
  modals,
  currentDate,
  currentShiftId,
  dropdownActions = [],
  locCode,
  loading,
  hoveredIndex,
  onHover,
  syncedSelectedIndexes,
  onSyncedSelect,
}: RoutePlanningPanelProps) {
  console.log("RoutePlanningPanel to rows", rows);

  // Inside RoutePlanningPanel — replace the navigate handler
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const allIds = useMemo(() => rows.map((r) => r.id), [rows]);

  const [selectedEmployeeRow, setSelectedEmployeeRow] =
    useState<RoutePlanningRow | null>(null);

  // ── All hooks first, in stable order ─────────────────────────────────────
  const {
    selectedCount,
    isAllSelected,
    toggleRow,
    toggleAll,
    clearSelection,
    selectedMap,
  } = useTableSelection(allIds);

  // ── Derived state after hooks ─────────────────────────────────────────────
  const selectedRows = useMemo(
    () => rows.filter((r) => !!selectedMap[r.id]),
    [rows, selectedMap],
  );

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

  // Keep selectedAction valid when options change
  useMemo(() => {
    if (
      actionOptions.length > 0 &&
      !actionOptions.find((a) => a.value === selectedAction)
    ) {
      setSelectedAction(actionOptions[0].value);
    }
  }, [actionOptions, selectedAction]);

  const handleToggleAll = useCallback(() => {
    // If currently all selected → deselecting all → clear synced indexes
    // If not all selected → selecting all → add all indexes
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
  const handleRouteClick = useCallback(
    (row: RoutePlanningRow) => {
      dispatch(
        setRouteMakerParams({
          locCode,
          shiftId: row.shiftId,
          tripType: row.loginType === "Login" ? 1 : 2, // 1 = Login, 2 = Logout — already correct from transformer
          routeDate: currentDate,
          shiftTime: row.shiftTime, // ← ADD
        }),
      );
      // navigate("/routing/route-maker");
      window.open("/routing/route-maker", "_blank");
    },
    [dispatch, navigate, locCode, currentDate],
  );
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
      {/* Panel Header */}
      {/* <div
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
          1. Route Planning{" "}
          <span style={{ color: "rgb(5, 150, 105)" }}>{rows.length} rows</span>
        </p>
        <p
          style={{
            fontSize: RM_FONT.xs,
            color: RM_COLOR.gray400,
            margin: "1px 0 0",
          }}
        >
          Generate, review &amp; manage routes for shifts
        </p>
      </div> */}

      <div
        style={{
          padding: RM_SPACE.panelHeaderPad,
          borderBottom: RM_COLOR.border,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              fontSize: RM_FONT.md,
              fontWeight: 600,
              color: RM_COLOR.gray900,
              margin: 0,
            }}
          >
            1. Route Planning
          </p>
          <p
            style={{
              fontSize: RM_FONT.xs,
              color: RM_COLOR.gray400,
              margin: "1px 0 0",
            }}
          >
            Generate, review &amp; manage routes for shifts
          </p>
        </div>

        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#065F46",
            background: "#DCFCE7",
            border: "1px solid #86EFAC",
            borderRadius: 999,
            padding: "2px 10px",
            whiteSpace: "nowrap",
          }}
        >
          {rows.length} shifts
        </span>
      </div>

      {/* Sticky Column Header */}
      <div
        style={{
          flexShrink: 0,
          background: RM_COLOR.gray50,
          borderBottom: RM_COLOR.border,
        }}
      >
        <table style={TABLE_BASE}>
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
                Shift <ShiftHeaderPopover />
              </th>
              <th style={thStyle}>
                Employees <EmployeesHeaderPopover />
              </th>

              <th style={thStyle}>
                Vehicle/Vendor/Route <VehicleVendorRoutePlanningHeaderPopover />
              </th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Scrollable Body */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarColor: `${RM_COLOR.gray300} transparent`,
          maxHeight: BODY_MAX_H,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <table style={TABLE_BASE}>
          {colgroup}
          <tbody>
            {loading ? (
              <TableShimmer rows={4} cols={4} />
            ) : (
              rows.map((row, index) => (
                <PlanningRow
                  key={row.id}
                  row={row}
                  isSelected={!!selectedMap[row.id]}
                  onEmployeeClick={setSelectedEmployeeRow}
                  onRouteClick={handleRouteClick}
                  index={index}
                  isHovered={hoveredIndex === index} // ← add
                  onHover={onHover} // ← add
                  onToggle={handleToggleWithSync}
                  isSyncHighlighted={
                    syncedSelectedIndexes?.has(index) && !selectedMap[row.id]
                  }
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <EmployeeDetailsModal
        open={!!selectedEmployeeRow}
        row={selectedEmployeeRow}
        onClose={() => setSelectedEmployeeRow(null)}
      />

      {/* Footer */}
      <StickyTableFooter
        selectedCount={selectedCount}
        selectedRows={selectedRows}
        onClearSelection={handleClearSelection}  // ← use wrapped version
        actions={actionOptions}
        selectedAction={selectedAction}
        onActionChange={setSelectedAction}
        modals={modals}
        currentDate={currentDate}
        currentShiftId={currentShiftId}
        locCode={locCode}
        panelType="planning"
      />
    </div>
  );
});
