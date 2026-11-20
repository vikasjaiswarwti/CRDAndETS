// src/features/routeManagement/components/RouteManagementTables.tsx
import { memo, useState } from "react";
import { RoutePlanningPanel } from "./RoutePlanningPanel";
import { TripPublishingPanel } from "./TripPublishingPanel";
import { useSyncedScroll } from "../hooks/useSyncedScroll";
import type {
  RoutePlanningRow,
  TripPublishingRow,
  RouteDropdownItem,
} from "../types/RouteTypes";
import type { UseRouteModals } from "../hooks/useRouteModals";
import { RM_SPACE } from "../Routeuiconfig";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

interface RouteManagementTablesProps {
  routePlanningRows: RoutePlanningRow[];
  tripPublishingRows: TripPublishingRow[];
  loading: boolean;
  modals: UseRouteModals;
  currentDate: string;
  currentShiftId: string;
  /** From /route-edit-dropdown */
  planningDropdownActions?: RouteDropdownItem[];
  publishingDropdownActions?: RouteDropdownItem[];
  locCode: number;
}

type Tab = "planning" | "publishing";

// ── Pill toggle shared between mobile and (optionally) desktop ────────────────
function TabToggle({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  const tabStyle = (t: Tab): React.CSSProperties => ({
    flex: 1,
    height: 38,
    borderRadius: 999,
    border: "none",
    background: active === t ? "#fff" : "transparent",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
    color: active === t ? "#16A34A" : "#64748B",
    boxShadow: active === t ? "0 1px 4px rgba(0,0,0,.10)" : "none",
    transition: "background .18s, color .18s, box-shadow .18s",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  });

  return (
    <div
      style={{
        display: "flex",
        background: "#F1F5F9",
        borderRadius: 999,
        padding: 3,
        flexShrink: 0,
      }}
    >
      <button style={tabStyle("planning")} onClick={() => onChange("planning")}>
        Route Planning
      </button>
      <button
        style={tabStyle("publishing")}
        onClick={() => onChange("publishing")}
      >
        Trip Publishing
      </button>
    </div>
  );
}

export const RouteManagementTables = memo(function RouteManagementTables({
  routePlanningRows,
  tripPublishingRows,
  loading,
  modals,
  currentDate,
  currentShiftId,
  planningDropdownActions = [],
  publishingDropdownActions = [],
  locCode,
}: RouteManagementTablesProps) {
  const {
    leftRef,
    rightRef,
    onScrollLeft,
    onScrollRight,
    hoveredIndex,
    setHoveredIndex,
  } = useSyncedScroll();

  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<Tab>("planning");
  // ── ADD THIS ──────────────────────────────────────────────────────────────
  const [syncedSelectedIndexes, setSyncedSelectedIndexes] = useState<
    Set<number>
  >(new Set());
  // ── MOBILE: tab-switched single panel ────────────────────────────────────
  if (isMobile) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 0,
          gap: 10,
        }}
      >
        <TabToggle active={activeTab} onChange={setActiveTab} />

        <div style={{ flex: 1, minHeight: 0 }}>
          {activeTab === "planning" ? (
            <RoutePlanningPanel
              rows={routePlanningRows}
              scrollRef={leftRef}
              onScroll={onScrollLeft}
              loading={loading}
              modals={modals}
              currentDate={currentDate}
              currentShiftId={currentShiftId}
              dropdownActions={planningDropdownActions}
              locCode={locCode}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
              syncedSelectedIndexes={syncedSelectedIndexes} // ← ADD
              onSyncedSelect={setSyncedSelectedIndexes}
            />
          ) : (
            <TripPublishingPanel
              rows={tripPublishingRows}
              scrollRef={rightRef}
              onScroll={onScrollRight}
              modals={modals}
              currentDate={currentDate}
              currentShiftId={currentShiftId}
              dropdownActions={publishingDropdownActions}
              locCode={locCode}
              loading={loading}
              hoveredIndex={hoveredIndex}
              onHover={setHoveredIndex}
              syncedSelectedIndexes={syncedSelectedIndexes} // ← ADD
              onSyncedSelect={setSyncedSelectedIndexes}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.8fr",
        gap: RM_SPACE.tablesGap,
        // height: "100%",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <RoutePlanningPanel
        rows={routePlanningRows}
        scrollRef={leftRef}
        onScroll={onScrollLeft}
        loading={loading}
        modals={modals}
        currentDate={currentDate}
        currentShiftId={currentShiftId}
        dropdownActions={planningDropdownActions}
        locCode={locCode}
        hoveredIndex={hoveredIndex}
        onHover={setHoveredIndex}
        syncedSelectedIndexes={syncedSelectedIndexes} // ← ADD
        onSyncedSelect={setSyncedSelectedIndexes}
      />
      <TripPublishingPanel
        rows={tripPublishingRows}
        scrollRef={rightRef}
        onScroll={onScrollRight}
        modals={modals}
        currentDate={currentDate}
        currentShiftId={currentShiftId}
        dropdownActions={publishingDropdownActions}
        locCode={locCode}
        loading={loading}
        hoveredIndex={hoveredIndex}
        onHover={setHoveredIndex}
        syncedSelectedIndexes={syncedSelectedIndexes} // ← ADD
        onSyncedSelect={setSyncedSelectedIndexes}
      />
    </div>
  );
});
