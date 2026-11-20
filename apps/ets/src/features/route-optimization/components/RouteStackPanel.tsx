// src/features/route-maker/components/RouteStackPanel.tsx
//
// Overflow contract
// ─────────────────
// • Panel shell      overflow: hidden  — no scroll at panel level, ever
// • Header rows      overflowX: hidden — clips any stray wide child
// • Route list       overflowY: auto, overflowX: hidden
//                    scrollbar hidden via scrollbarWidth:none + webkit style
// • Toolbar          NO overflowX: hidden here — SortDropdown and
//                    ActionDropdown use position:fixed so they must NOT be
//                    clipped. The panel shell's overflow:hidden prevents
//                    the toolbar itself from creating a scrollbar.
// • All inputs/cards box-sizing: border-box + width: 100% + minWidth: 0

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { T } from "../constants/designTokens";
import type { VehicleRoute, RouteFilters } from "../types/Routemaker.types";
import RouteStackCard from "./RouteStackCard";
import SortDropdown, {
  type SortField,
  type SortDir,
} from "../DropDowns/Sortdropdown";
import ActiveFilterChips from "./Activefilterchips";
// import ActionDropdown from "../DropDowns/Actiondropdown";
import { useSelector, useDispatch } from "react-redux";
import { togglePin, selectPinnedIds } from "../slice/pinnedRoutesSlice";
import type { RootState } from "../../../app/store/index";
import Icon from "./Icon";
import Pinned from "../assets/icons/pinned.svg";
import PinnedEmpty from "../assets/icons/pinEmpty.svg";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { Printer } from "lucide-react";
import { ShimmerRouteCard } from "./Shimmer";
import type { DragPassenger } from "../hooks/useDragAndDrop";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { AdhocModal } from "../../routing/Modals/AdhocModal";

// ---------------------------------------------------------------------------
// API sort-field map (used by callers to build RTK Query params)
// ---------------------------------------------------------------------------

export const SORT_FIELD_TO_API: Partial<
  Record<SortField, "extraKm" | "employeeCount" | "distance">
> = {
  distance: "distance",
  passengers: "employeeCount",
  efficiency: "extraKm",
};

// ---------------------------------------------------------------------------
// Shared toolbar-button style
// ---------------------------------------------------------------------------

const TB: React.CSSProperties = {
  height: 28,
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "0 9px",
  borderRadius: 6,
  border: `1px solid ${T.border}`,
  background: "#fff",
  color: T.muted,
  fontSize: T.fontSm,
  fontWeight: 500,
  cursor: "pointer",
  whiteSpace: "nowrap",
  flexShrink: 0,
  boxSizing: "border-box" as const,
  lineHeight: 1,
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  locationOptions: { value: string | number; label: string }[];
  routes: VehicleRoute[];
  colorMap: Record<number, string>;
  assignmentFilter: "all" | "assigned" | "unassigned";
  onAssignmentFilterChange: (value: "all" | "assigned" | "unassigned") => void;
  activeVehicleId: number | null;
  selectedVehicleIds?: number[];
  overZoneId: string | null;
  isFetching?: boolean;
  sortField: SortField;
  sortDir: SortDir;
  filters: RouteFilters;
  onSortChange: (f: SortField, d: SortDir) => void;
  onSelect: (vehicleId: number) => void;
  onDragOver: (e: React.DragEvent, zoneId: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDropOnRoute: (e: React.DragEvent, vehicleId: number) => void;
  onMobilePassengerDrop?: (
    passenger: DragPassenger,
    targetVehicleId: number,
  ) => void;
  onOpenFilter: () => void;
  onAssignVehicle: (routeId: string) => void;
  onRemoveFilter: (key: keyof RouteFilters | "sort") => void;
  onClearAllFilters: () => void;
  onClearSelection?: () => void;
  onBulkAssign?: () => void;
  onBulkMerge?: () => void;
  onExport?: (filteredRoutes: VehicleRoute[]) => void;

  tripActionLoading: Record<string, boolean>;
  onTripActionLoadingChange?: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  onFlagTrip: (dsId: number, current: boolean) => void;
  onApproveTrip: (dsId: number, current: boolean) => void;
  onDeallocateVehicle?: (dsId: number) => void;
  onSplit?: (vehicleId: number, employeeIds: number[]) => void;
  onAssignVendor?: () => void;
  onPublishTrips?: () => void;

  sessionParams: {
    locCode: number;
    shiftId: number;
    tripType: number;
    routeDate: string;
  };
  onRefetch?: () => void; // ← ADD
  flagFilter?: boolean;
  onToggleFlagFilter?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function RouteStackPanel({
  locationOptions,
  routes,
  colorMap,
  assignmentFilter,
  // onAssignmentFilterChange,
  // activeVehicleId,
  selectedVehicleIds = [],
  overZoneId,
  isFetching = false,
  sortField,
  sortDir,
  filters,
  onSortChange,
  onSelect,
  onDragOver,
  onDragLeave,
  onDropOnRoute,
  onMobilePassengerDrop,
  onOpenFilter,
  onAssignVehicle,
  onRemoveFilter,
  onClearAllFilters,
  onClearSelection,
  // onBulkAssign,
  onBulkMerge,
  // onExport,

  tripActionLoading,
  onTripActionLoadingChange,
  onFlagTrip,
  onApproveTrip,
  onDeallocateVehicle,
  onSplit,
  onAssignVendor,
  onPublishTrips,
  sessionParams,
  onRefetch,
  flagFilter = false,
  onToggleFlagFilter,
}: Props) {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [compactMode, setCompactMode] = useState(false);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<VehicleRoute | null>(null);

  // ── Scrollbar-hide: scoped webkit CSS via unique stable id ───────────────
  const listIdRef = useRef(
    `rsp-list-${Math.random().toString(36).slice(2, 7)}`,
  );
  const listId = listIdRef.current;

  const dispatch = useDispatch();

  const pinnedIds = useSelector((state: RootState) =>
    selectPinnedIds(state, sessionParams),
  );
  const pinnedSet = useMemo(() => new Set(pinnedIds), [pinnedIds]);

  const { Popover } = useUILibrary();

  const handleTogglePin = useCallback(
    (vehicleId: number) => {
      dispatch(togglePin({ ...sessionParams, vehicleId }));
    },
    [dispatch, sessionParams],
  );

  // ── Derived counts ───────────────────────────────────────────────────────
  const selectionCount = selectedVehicleIds.length;
  const firstSelectedCardRef = useRef<HTMLDivElement | null>(null);
  const [firstSelectedCardHeight, setFirstSelectedCardHeight] = useState(0);

  const activeFilterCount = useMemo(() => {
    if (!filters) return 0;
    const filterCount = [
      filters.guardTrip,
      filters.singleEmployee,
      filters.vendorAssigned != null,
      filters.vehicleAssigned != null,
      filters.femaleFilter === "single",
      filters.specialNeeds,
    ].filter(Boolean).length;
    const sortActive = sortField && sortField !== "radial" ? 1 : 0;
    return filterCount + sortActive;
  }, [filters, sortField]);

  // ── Filtered + sorted + pin-stratified route list ────────────────────────
  const displayedRoutes = useMemo(() => {
    let result = [...routes];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (r) =>
          String(r.VehicleId).includes(q) ||
          r.vehicleRegNo?.toLowerCase().includes(q) ||
          r.driverName?.toLowerCase().includes(q) ||
          r.driverMobile?.includes(q) ||
          r.Passengers?.some(
            (p) =>
              p.Firstname?.toLowerCase().includes(q) ||
              p.EmployeeID?.toLowerCase().includes(q),
          ),
      );
    }

    const compare = (a: VehicleRoute, b: VehicleRoute): number => {
      let va = 0,
        vb = 0;
      switch (sortField) {
        case "distance":
          va = a.RouteDistanceKm;
          vb = b.RouteDistanceKm;
          break;
        case "duration":
          va = a.RouteDurationMinutes;
          vb = b.RouteDurationMinutes;
          break;
        case "efficiency":
          va = a.EfficiencyPercentage;
          vb = b.EfficiencyPercentage;
          break;
        case "passengers":
          va = a.Passengers?.length || 0;
          vb = b.Passengers?.length || 0;
          break;
        default:
          va = a.VehicleId;
          vb = b.VehicleId;
          break;
      }
      return sortDir === "asc" ? va - vb : vb - va;
    };

    const pinned = result
      .filter((r) => pinnedSet.has(r.VehicleId))
      .sort(compare);
    const unpinned = result
      .filter((r) => !pinnedSet.has(r.VehicleId))
      .sort(compare);
    return [...pinned, ...unpinned];
  }, [routes, search, sortField, sortDir, pinnedSet]);

  useEffect(() => {
    const firstSelectedCard = firstSelectedCardRef.current;
    if (!isMobile || selectionCount < 2 || !firstSelectedCard) {
      setFirstSelectedCardHeight((current) => (current === 0 ? current : 0));
      return;
    }

    const updateHeight = () => {
      const height = firstSelectedCard.getBoundingClientRect().height;
      setFirstSelectedCardHeight((current) =>
        current === height ? current : height,
      );
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(firstSelectedCard);
    return () => observer.disconnect();
  }, [
    displayedRoutes,
    isMobile,
    selectionCount,
    selectedVehicleIds[0],
    compactMode,
  ]);

  // Cancelled trips can't take any action (vendor/driver assign, etc.) so
  // they're excluded from "select all" / bulk selection.
  const selectableRoutes = useMemo(
    () => displayedRoutes.filter((r) => r.tripStatusCode !== 9),
    [displayedRoutes],
  );

  const pinnedCount = displayedRoutes.filter((r) =>
    pinnedSet.has(r.VehicleId),
  ).length;
  const clearSearch = () => setSearch("");

  // ── CSV Export ────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    if (displayedRoutes.length === 0) return;
    const headers = [
      "Route ID",
      "Vendor",
      "Vehicle",
      "Driver",
      "Driver Mobile",
      "Passengers",
      "Distance (KM)",
      "Duration (Min)",
      "Extra Distance",
      "Efficiency %",
      "ETA",
      "First Stop",
      "Passenger Names",
      "Employee IDs",
      "Pinned",
    ];

    console.log("displayedRoutes", displayedRoutes);

    const rows = displayedRoutes.map((route) => [
      route.VehicleId,
      route.vendorName ?? "Unassigned",
      route.vehicleRegNo ?? "",
      route.driverName ?? "",
      route.driverMobile ?? "",
      route.Passengers?.length ?? 0,
      route.RouteDistanceKm ?? 0,
      route.RouteDurationMinutes ?? 0,
      route.ExtraDistanceKm ?? 0,
      route.EfficiencyPercentage ?? 0,
      route.Eta ?? "",
      route.Passengers?.[0]?.Address ?? "",
      route.Passengers?.map((p) => p.Firstname).join(", ") ?? "",
      route.Passengers?.map((p) => p.EmployeeID).join(", ") ?? "",
      pinnedSet.has(route.VehicleId) ? "Yes" : "No",
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `routes-${assignmentFilter}-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [displayedRoutes, assignmentFilter, pinnedSet]);
  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        background: "transparent",
        overflow: "hidden",
        minWidth: 0,
        position: "relative",
      }}
    >
      {/* Webkit scrollbar-hide for the route list */}
      {/* <style>{`#${listId}::-webkit-scrollbar{display:none}`}</style> */}

      <style>{`
        #${listId}::-webkit-scrollbar { width: 3px; }
        #${listId}::-webkit-scrollbar-track { background: ${T.border}; border-radius: 99px; }
        #${listId}::-webkit-scrollbar-thumb { background: ${T.muted}; border-radius: 99px; min-height: 40px; }
        #${listId}::-webkit-scrollbar-thumb:hover { background: ${T.text}; }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════
          HEADER  —  never scrolls, always flexShrink:0
      ══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          flexShrink: 0,
          background: T.panel,
          // borderBottom: `1px solid ${T.border}`,
          zIndex: 10,
          width: "100%",
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 6,
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <span
            style={{
              fontWeight: 700,
              fontSize: T.fontMd,
              color: T.text,
              flexShrink: 0,
            }}
          >
            Route Stack
          </span>

          {isFetching && (
            <span style={{ fontSize: 10, color: T.accent, fontWeight: 600 }}>
              Updating...
            </span>
          )}

          {/* Selected count — dark circle */}
          {selectionCount > 0 && (
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#1B4332",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {selectionCount}
            </span>
          )}

          {pinnedCount > 0 && (
            <Popover
              trigger="click"
              placement="bottomLeft"
              title={null}
              content={
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    minWidth: 80,
                  }}
                >
                  <div
                    style={{ fontSize: 10, color: T.muted, marginBottom: 1 }}
                  >
                    {pinnedCount} trips{pinnedCount !== 1 ? "s" : ""} pinned
                  </div>
                  <button
                    onClick={() =>
                      pinnedIds.forEach((id) => handleTogglePin(id))
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 10px",
                      borderRadius: T.radiusSm,
                      border: `1px solid ${T.border}`,
                      background: T.card,
                      color: T.text,
                      fontSize: 9,
                      fontWeight: 600,
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    <Icon src={PinnedEmpty} size={12} />
                    Unpin All
                  </button>
                </div>
              }
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "2px 7px",
                  borderRadius: 99,
                  background: "#FEF3C7",
                  border: "1px solid #FDE68A",
                  color: "#92400E",
                  fontSize: 11,
                  fontWeight: 600,
                  flexShrink: 0,
                  cursor: "pointer",
                }}
              >
                <Icon src={Pinned} size={11} />
                {pinnedCount}
              </span>
            </Popover>
          )}

          <div style={{ flex: 1, minWidth: 0 }} />

          {/* Bulk actions — triple-dot: Assign Vendor · Publish Trips */}
          <Popover
            trigger="click"
            placement="bottomRight"
            title={null}
            open={bulkMenuOpen}
            onOpenChange={setBulkMenuOpen}
            content={
              selectionCount === 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "2px 2px",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <circle
                      cx="12"
                      cy="17"
                      r="1"
                      fill="#F59E0B"
                      stroke="none"
                    />
                  </svg>
                  <span style={{ fontSize: 12, color: T.text }}>
                    Select at least one trip to continue.
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    minWidth: 160,
                  }}
                >
                  <button
                    onClick={() => {
                      setBulkMenuOpen(false);
                      onAssignVendor?.();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 8px",
                      border: "none",
                      background: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      color: T.text,
                      fontWeight: 500,
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Assign Vendor
                  </button>

                  <button
                    onClick={() => {
                      setBulkMenuOpen(false);
                      onPublishTrips?.();
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 8px",
                      border: "none",
                      background: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontSize: 12,
                      color: T.text,
                      fontWeight: 500,
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    <Printer size={13} />
                    Publish Trips
                  </button>
                </div>
              )
            }
          >
            <button
              title="Bulk actions"
              style={{
                height: 26,
                padding: "0 10px",
                borderRadius: T.radiusSm,
                border: `1px solid ${bulkMenuOpen ? T.accent : T.border}`,
                background: bulkMenuOpen ? T.accentBg : T.card,
                color: bulkMenuOpen ? T.accent : T.muted,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                flexShrink: 0,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
              >
                <circle cx="5" cy="12" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="19" cy="12" r="1.5" />
              </svg>
              Bulk Actions
            </button>
          </Popover>

          {/* Export */}
          <button
            onClick={handleExport}
            title="Export CSV"
            style={{
              ...TB,
              height: 26,
              width: 26,
              padding: 0,
              justifyContent: "center",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>

          {/* Compact toggle / hamburger */}
          <button
            type="button"
            onClick={() => setCompactMode((c) => !c)}
            title={compactMode ? "Expand" : "Compact"}
            style={{
              ...TB,
              height: 26,
              width: 26,
              padding: 0,
              justifyContent: "center",
              background: compactMode ? T.accentBg : T.card,
              color: compactMode ? T.accent : T.muted,
              border: `1px solid ${compactMode ? T.accent : T.border}`,
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {!compactMode && (
          <>
            {/* ── Row 2: checkbox | search | sort | filter | flag ── */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 12px 7px",
                boxSizing: "border-box",
              }}
            >
              {/* Select all checkbox */}
              <div
                onClick={() => {
                  if (
                    selectedVehicleIds.length === selectableRoutes.length &&
                    selectableRoutes.length > 0
                  ) {
                    selectableRoutes.forEach((r) => onSelect(r.VehicleId));
                  } else {
                    selectableRoutes
                      .filter((r) => !selectedVehicleIds.includes(r.VehicleId))
                      .forEach((r) => onSelect(r.VehicleId));
                  }
                }}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  flexShrink: 0,
                  border: `2px solid ${selectedVehicleIds.length > 0 ? T.accent : T.border}`,
                  background:
                    selectedVehicleIds.length === selectableRoutes.length &&
                    selectableRoutes.length > 0
                      ? T.accent
                      : selectedVehicleIds.length > 0
                        ? T.accentBg
                        : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selectedVehicleIds.length > 0 &&
                  selectedVehicleIds.length < selectableRoutes.length && (
                    <div
                      style={{
                        width: 8,
                        height: 2,
                        background: T.accent,
                        borderRadius: 1,
                      }}
                    />
                  )}
                {selectedVehicleIds.length === selectableRoutes.length &&
                  selectableRoutes.length > 0 && (
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
              </div>

              {/* Search — half width */}
              <div
                style={{ position: "relative", flex: "0 1 50%", minWidth: 0 }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={T.muted}
                  strokeWidth="2.5"
                  style={{
                    position: "absolute",
                    left: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tripId or employee..."
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: 28,
                    padding: "0 26px 0 27px",
                    border: `1px solid ${T.border}`,
                    borderRadius: 6,
                    fontSize: T.fontXs,
                    background: "#fff",
                    outline: "none",
                    color: T.text,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = T.accent;
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${T.accentBg}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                {search && (
                  <button
                    onClick={clearSearch}
                    style={{
                      position: "absolute",
                      right: 6,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: T.muted,
                      fontSize: 13,
                      padding: 0,
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort */}
              <SortDropdown
                sortField={sortField}
                sortDir={sortDir}
                onChange={onSortChange}
              />

              {/* Filters */}
              <button
                onClick={onOpenFilter}
                style={{
                  ...TB,
                  height: 28,
                  border:
                    activeFilterCount > 0
                      ? `1px solid ${T.accent}`
                      : `1px solid ${T.border}`,
                  color: activeFilterCount > 0 ? T.accent : T.muted,
                  background: activeFilterCount > 0 ? T.accentBg : "#fff",
                }}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span
                    style={{
                      minWidth: 15,
                      height: 15,
                      borderRadius: T.radiusFull,
                      background: T.accent,
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 800,
                      padding: "0 3px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Flag — static placeholder */}
              {/* <button
                title="Flag routes"
                style={{
                  ...TB,
                  height: 28,
                  width: 28,
                  padding: 0,
                  justifyContent: "center",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              </button> */}
              <button
                onClick={onToggleFlagFilter}
                title={
                  flagFilter ? "Clear flag filter" : "Show flagged trips only"
                }
                style={{
                  ...TB,
                  height: 28,
                  width: 28,
                  padding: 0,
                  justifyContent: "center",
                  background: flagFilter ? "#FEF3C7" : T.card,
                  color: flagFilter ? "#D97706" : T.muted,
                  border: `1px solid ${flagFilter ? "#F59E0B" : T.border}`,
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill={flagFilter ? "#D97706" : "none"}
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              </button>
            </div>

            {/* ── Filter chips ── */}
          </>
        )}
      </div>

      <ActiveFilterChips
        filters={filters}
        onRemove={onRemoveFilter}
        onClearAll={() => {
          onClearAllFilters();
          onSortChange("radial", "asc");
        }}
        sortField={sortField}
        sortDir={sortDir}
        onRemoveSort={() => onSortChange("radial", "asc")}
      />

      {/* ══════════════════════════════════════════════════════════════════
          ROUTE LIST — the only scrollable area in the panel
      ══════════════════════════════════════════════════════════════════ */}
      <div
        id={listId}
        style={
          {
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            // scrollbarWidth: "none",
            // msOverflowStyle: "none",
            scrollbarWidth: "thin",
            scrollbarColor: `${T.muted} ${T.border}`,
            padding: "10px 8px",
            paddingBottom:
              selectionCount === 2 && onBulkMerge && onClearSelection ? 76 : 10,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: compactMode ? 4 : 8,
            background: T.bg,
            width: "100%",
            minWidth: 0,
          } as React.CSSProperties
        }
      >
        {isFetching ? (
          <>
            {Array.from({
              length: Math.max(displayedRoutes.length, 4),
            }).map((_, i) => (
              <ShimmerRouteCard key={`route-shimmer-${i}`} />
            ))}
          </>
        ) : displayedRoutes.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "56px 16px",
              color: T.muted,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.22 }}>
              📭
            </div>
            <div style={{ fontSize: T.fontSm }}>
              No routes match current filters
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={onClearAllFilters}
                style={{
                  marginTop: 10,
                  color: "#10B981",
                  textDecoration: "underline",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: T.fontSm,
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            {displayedRoutes.map((route, idx) => {
              const zoneId = `route-card-${route.VehicleId}`;
              const isSelected = selectedVehicleIds.includes(route.VehicleId);
              const stickySelectionIndex = selectedVehicleIds.indexOf(
                route.VehicleId,
              );
              const isStickySelectedCard =
                isMobile && selectionCount <= 2 && stickySelectionIndex !== -1;
              const isPinned = pinnedSet.has(route.VehicleId);

              const showDivider =
                pinnedCount > 0 &&
                pinnedCount < displayedRoutes.length &&
                !isPinned &&
                idx > 0 &&
                pinnedSet.has(displayedRoutes[idx - 1].VehicleId);

              return (
                <div
                  key={route.VehicleId}
                  ref={
                    route.VehicleId === selectedVehicleIds[0]
                      ? firstSelectedCardRef
                      : undefined
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    minWidth: 0,
                    ...(isStickySelectedCard
                      ? {
                          position: "sticky",
                          top:
                            stickySelectionIndex === 1
                              ? 5 +
                                firstSelectedCardHeight +
                                (compactMode ? 4 : 8)
                              : 5,
                          zIndex: 5 - stickySelectionIndex,
                          background: T.bg,
                        }
                      : {}),
                  }}
                >
                  {showDivider && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        margin: "4px 0 6px",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{ flex: 1, height: 1, background: T.border }}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          color: T.text,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Unpinned
                      </span>
                      <div
                        style={{ flex: 1, height: 1, background: T.border }}
                      />
                    </div>
                  )}

                  <RouteStackCard
                    route={route}
                    color={colorMap[route.VehicleId] ?? T.accent}
                    isActive={isSelected}
                    isOverZone={overZoneId === zoneId}
                    isPinned={isPinned}
                    onSelect={() => onSelect(route.VehicleId)}
                    onDragOver={(e) => onDragOver(e, zoneId)}
                    onDragLeave={onDragLeave}
                    onDrop={(e) => onDropOnRoute(e, route.VehicleId)}
                    onMobilePassengerDrop={onMobilePassengerDrop}
                    onAssign={() => onAssignVehicle(String(route.VehicleId))}
                    onPin={() => handleTogglePin(route.VehicleId)}
                    isFlagLoading={
                      tripActionLoading[`${route.VehicleId}-flag`] ?? false
                    }
                    isApproveLoading={
                      tripActionLoading[`${route.VehicleId}-approve`] ?? false
                    }
                    isDeallocateLoading={
                      tripActionLoading[`${route.VehicleId}-deallocate`] ??
                      false
                    }
                    isAssigning={
                      tripActionLoading[`${route.VehicleId}-assigning`] ?? false
                    }
                    onFlag={() => onFlagTrip(route.VehicleId, route.IsFlagged)}
                    onApprove={() =>
                      onApproveTrip(route.VehicleId, route.IsApproved)
                    }
                    onDeallocate={() => onDeallocateVehicle?.(route.VehicleId)}
                    onEditTrip={setEditingRoute}
                    onSplit={onSplit}
                    isFlagged={route.IsFlagged}
                    isApproved={route.IsApproved}
                    locCode={sessionParams.locCode} // ← ADD
                    tripType={sessionParams.tripType} // ← ADD
                    shiftId={sessionParams.shiftId}
                    routeDate={sessionParams.routeDate}
                    onRefetch={onRefetch}
                    onTripActionLoadingChange={onTripActionLoadingChange}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>
      {isMobile && selectionCount === 2 && onBulkMerge && onClearSelection && (
        <div
          style={{
            position: "fixed",
            zIndex: 20,
            bottom: "5vh",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: 8,
            border: `1px solid ${T.border}`,
            borderRadius: T.radiusLg,
            background: T.card,
            boxShadow: T.shadowXl,
            whiteSpace: "nowrap",
          }}
        >
          <button
            type="button"
            onClick={onBulkMerge}
            style={{
              height: 36,
              padding: "0 14px",
              border: 0,
              borderRadius: T.radiusSm,
              background: T.accent,
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Merge Trips
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            style={{
              height: 36,
              padding: "0 14px",
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusSm,
              background: T.card,
              color: T.text,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
      )}
      {editingRoute && (
        <AdhocModal
          officeOptions={locationOptions}
          open
          onClose={() => setEditingRoute(null)}
          dsId={editingRoute.VehicleId}
          onSuccess={() => {
            setEditingRoute(null);
            onRefetch?.();
          }}
        />
      )}
    </div>
  );
}
