// src/features/route-maker/pages/RouteMakerPage.tsx

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import {
  useGetRouteAnalyticsQuery,
  useMoveEmployeeBetweenTripsMutation,
  useReorderTripMutation,
  // useAssignVendorMutation,
  useMergeTripsMutation,
  useUpdateTripFlagApprovalStatusMutation,
  useSplitTripMutation,
  useGetShuttleRouteAnalyticsQuery,
  useAddEmployeeToShuttleTripMutation, // ADD
  useGetAvailableEmployeesQuery,
  useGetShiftRouteInfoQuery,
  useUnassignVehicleMutation,
} from "../services/routeMakerApi";
import { useLookups } from "../../lookups/hooks/useLookups";
import {
  setRouteMakerParams,
  setOffice as setFilterOffice,
  setDate as setFilterDate,
  setShiftType as setFilterShiftType,
} from "../../routing/slice/Routemanagementslice";
import { adaptApiResponse } from "../utils/apiRouteAdapter";
import { buildColorMap, buildCabGroups } from "../utils/routeMakerHelpers";
import { invalidateAdapterCache } from "../utils/vehicleRouteAdapter";
import { useDragAndDrop } from "../hooks/useDragAndDrop";

import type { VehicleRoute, CabGroup } from "../types/Routemaker.types";
import type { DragPassenger, DropResult } from "../hooks/useDragAndDrop";
import type { SortField, SortDir } from "../DropDowns/Sortdropdown";
import { SORT_FIELD_TO_API } from "../components/RouteStackPanel";
import { DEFAULT_FILTERS, type RouteFilters } from "../types/Routemaker.types";
import type { RootState } from "../../../app/store";

import AppHeader from "../components/Appheader";
import KpiStatsBar from "../components/KpiStatsBar";
import LeftSidebar from "../components/LeftSidebar";
import CenterMapPanel from "../components/CenterMapPanel";
import RouteStackPanel from "../components/RouteStackPanel";
import FilterPanel from "../Modals/FilterPanel";
import DropConfirmModal from "../components/Dropconfirmmodal";

import MergeConfirmModal from "../Modals/MergeConfirmModal";
import GlobalOperationOverlay from "../components/GlobalOperationOverlay";
import SingleEmployeeWarningModal from "../Modals/SingleEmployeeWarningModal";
import RearrangeRouteDrawer from "../Modals/Rearrangeroutedrawer";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";

import type { DropConfirmPayload } from "../components/Dropconfirmmodal";
import TripDistributionModal from "../Modals/TripDistributionModal";

import { T } from "../constants/designTokens";

import CreateAdhocRouteModal from "../Modals/Createadhocroutemodal";
import AssignVendorModal from "../Modals/AssignVendorModal";
import PublishTripModal from "../Modals/PublishTripModal";
import AllocationOrchestrator from "../components/Allocationorchestrator";
import { ENABLE_ALLOCATION_ORCHESTRATOR } from "../constants/mapConstants";
import type { ShuttleStop, VehicleMode } from "../types/apiRouteTypes";
import LeftSidebarShuttle from "../components/LeftSidebarShuttle";

import {
  adaptToSidebarStops,
  adaptShuttleTripInfo,
} from "../utils/Shuttleadapter";

import ShuttleRouteStackPanel from "../components/Shuttle/Shuttleroutestackpanel";
import type { ShuttleAnalyticsResponse } from "../types/Shuttleapitypes";

import ShuttleMapPanel from "../components/Shuttle/Shuttlemappanel";
import AddEmployeeModal from "../components/Shuttle/AddEmployeeModal"; // ADD
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_PAD = 12;
const GRID_GAP = 10;

function contentColumns(hasSelection: boolean): string {
  const left = hasSelection ? `${T.sidebarW}px` : "0px";
  return `${left} minmax(0, 1fr) ${T.routeStackW}px`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RouteMakerPage() {
  const navigate = useNavigate();
  const [vehicleMode, setVehicleMode] = useState<VehicleMode>("cabs");

  const [selectedShuttleTripId, setSelectedShuttleTripId] = useState<
    number | null
  >(null);

  // ── Stop selection ────────────────────────────────────────────────────────
  const [selectedStopOrder, setSelectedStopOrder] = useState<number | null>(
    null,
  );

  const routeParams = useSelector(
    (s: RootState) => s.routeManagementUi.routeMakerParams,
  );

  const isMobile = useIsMobile();

  // ── Guard: no params → show redirect screen ───────────────────────────────
  if (!routeParams) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: T.bg,
          gap: 16,
        }}
      >
        <div style={{ fontSize: 15, color: T.muted }}>
          No shift selected. Please select a shift from Route Management.
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "8px 20px",
            borderRadius: 8,
            border: "none",
            background: T.accent,
            color: "#fff",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          ← Go Back
        </button>
      </div>
    );
  }

  // ── UI library ────────────────────────────────────────────────────────────
  const { message } = useUILibrary();

  const dispatch = useDispatch();

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [moveEmployee, { isLoading: isMoving }] =
    useMoveEmployeeBetweenTripsMutation();
  const [reorderTrip] = useReorderTripMutation();

  const [mergeTrips, { isLoading: isMerging }] = useMergeTripsMutation();
  const [unassignVehicle] = useUnassignVehicleMutation();

  // ── Header selectors: location / date / trip type / shift ────────────────
  // These drive the shift-info lookup and, once a shift is picked, commit
  // into routeMakerParams the same way RoutePlanningPanel's redirect does —
  // that existing flow is untouched.
  const [selLocCode, setSelLocCode] = useState<number>(routeParams.locCode);
  const [selDate, setSelDate] = useState<string>(routeParams.routeDate);
  const [selTripType, setSelTripType] = useState<number>(routeParams.tripType);
  const [selShiftId, setSelShiftId] = useState<number | undefined>(
    routeParams.shiftId,
  );

  // Reset the header drafts the instant routeParams identifies a DIFFERENT
  // session than what these drafts were last synced to. This covers a
  // redirect from Route Planning landing on an already-mounted RouteMakerPage
  // (React Router reuses the component instance for same-path navigations —
  // the useState() initializers above only run once, on the very first
  // mount, so without this they'd keep showing the previous shift's
  // location/date/trip-type/shift while routeParams — and therefore the
  // analytics being displayed — has already moved on).
  // Doing this during render (not in a useEffect) means the header never
  // paints with the stale values first; a self-commit (commitShift) is a
  // no-op here since it already dispatches the same values these drafts hold.
  const routeParamsKey = `${routeParams.locCode}-${routeParams.shiftId}-${routeParams.tripType}-${routeParams.routeDate}`;
  const syncedRouteParamsKeyRef = useRef(routeParamsKey);
  if (syncedRouteParamsKeyRef.current !== routeParamsKey) {
    syncedRouteParamsKeyRef.current = routeParamsKey;
    setSelLocCode(routeParams.locCode);
    setSelDate(routeParams.routeDate);
    setSelTripType(routeParams.tripType);
    setSelShiftId(routeParams.shiftId);
  }

  // Once the header has loaded those values (the block above — on mount,
  // or on a fresh redirect landing on an already-mounted page), explicitly
  // write them back into routeMakerParams. From here on the header owns
  // that redux slice — it isn't just a passive reader of whatever
  // RoutePlanningPanel dispatched before navigating; the page re-affirms
  // it once its own filters have loaded, so routeMakerParams is always a
  // product of "header loaded → then redux was set," not the other way
  // round. Gated on the same session key so this fires once per genuine
  // load, not on every render.
  const loadedRouteParamsKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (loadedRouteParamsKeyRef.current === routeParamsKey) return;
    loadedRouteParamsKeyRef.current = routeParamsKey;
    dispatch(
      setRouteMakerParams({
        locCode: routeParams.locCode,
        shiftId: routeParams.shiftId,
        tripType: routeParams.tripType,
        routeDate: routeParams.routeDate,
        shiftTime: routeParams.shiftTime,
      }),
    );
  }, [
    routeParamsKey,
    dispatch,
    routeParams.locCode,
    routeParams.shiftId,
    routeParams.tripType,
    routeParams.routeDate,
    routeParams.shiftTime,
  ]);

  const { locationOptions } = useLookups({ only: ["locationOptions"] });

  // Shift list depends on exactly 3 things — location, date, trip type —
  // and must re-fetch every time any of them changes (incl. re-mount).
  const {
    data: shiftInfoData,
    isFetching: isShiftsFetching,
    error: shiftInfoError,
  } = useGetShiftRouteInfoQuery(
    {
      locCode: selLocCode,
      tripType: selTripType,
      dsDate: selDate,
    },
    { refetchOnMountOrArgChange: true },
  );

  const shiftOptions = (shiftInfoData?.result?.shifts ?? []).map((s) => ({
    value: s.shiftId,
    label: s.shiftTime,
  }));

  // Surface the backend's RFC 9110 problem-details body (e.g. the 404
  // "No routing found for the given LocCode/TripType/DsDate.") instead of
  // just silently rendering an empty shift list with no explanation.
  const shiftInfoErrorMessage = shiftInfoError
    ? ((shiftInfoError as { data?: { title?: string } })?.data?.title ??
      "No shifts found for the selected location, date and trip type.")
    : undefined;

  // Commits a shift into routeMakerParams — this is what actually drives
  // route-analytics / shuttle-route-analytics (both keyed off routeParams).
  function commitShift(shiftId: number, shiftTime?: string) {
    setSelShiftId(shiftId);
    dispatch(
      setRouteMakerParams({
        locCode: selLocCode,
        shiftId,
        tripType: selTripType,
        routeDate: selDate,
        shiftTime,
      }),
    );
    setSelectedVehicleIds([]);
    setSelectedShuttleTripId(null);
  }

  function handleHeaderLocChange(locCode: number) {
    setSelLocCode(locCode);
    setSelShiftId(undefined);
  }

  function handleHeaderDateChange(date: string) {
    setSelDate(date);
    setSelShiftId(undefined);
  }

  function handleHeaderTripTypeChange(tt: number) {
    setSelTripType(tt);
    setSelShiftId(undefined);
  }

  function handleHeaderShiftChange(shiftId: number) {
    const shift = shiftInfoData?.result?.shifts.find(
      (s) => s.shiftId === shiftId,
    );
    commitShift(shiftId, shift?.shiftTime);
  }

  // Whenever the user actively changes location / date / trip type away
  // from what's currently committed, the shift list above refetches — once
  // the fresh list lands, auto-commit its first shift so cabs/shuttle
  // analytics update without an extra manual click on the shift dropdown.
  //
  // IMPORTANT: this must only run for a genuine draft edit, never for the
  // shift that just arrived via redirect from Route Planning. shift-info
  // is a DIFFERENT endpoint than the one that produced routeParams.shiftId
  // (RoutePlanningPanel's row data), so its returned ids are not guaranteed
  // to line up 1:1 with it. Gating on "has the draft actually diverged from
  // routeParams" — rather than "does shift-info's list happen to contain
  // this id" — means a mismatch there can never silently override the
  // shift you deliberately picked in Route Planning.
  useEffect(() => {
    const draftDivergedFromCommitted =
      selLocCode !== routeParams.locCode ||
      selDate !== routeParams.routeDate ||
      selTripType !== routeParams.tripType;

    // The shift currently "in effect" for this draft — the deliberately
    // picked routeParams.shiftId while the draft hasn't changed, or the
    // in-progress selection once the user has started editing it.
    const currentShiftId = draftDivergedFromCommitted
      ? selShiftId
      : routeParams.shiftId;

    if (!draftDivergedFromCommitted && selShiftId !== routeParams.shiftId) {
      // Draft matches what's committed (initial load, or the user changed
      // a filter and then changed it back) — restore the shift selector's
      // display without touching redux; it's already correct.
      setSelShiftId(routeParams.shiftId);
    }

    const shifts = shiftInfoData?.result?.shifts ?? [];
    if (shifts.length === 0) {
      if (selShiftId != null) setSelShiftId(undefined);
      return;
    }

    // Whatever shift is currently in effect — deliberately picked or
    // mid-edit — fall back to the first option in the list whenever it
    // isn't actually present there (e.g. a redirect-provided shiftId that
    // this office/date/trip-type combo doesn't offer, or the user
    // changing location/date/trip-type away from what's committed).
    const stillValid = shifts.some((s) => s.shiftId === currentShiftId);
    if (stillValid) return;

    const first = shifts[0];
    commitShift(first.shiftId, first.shiftTime);
    // Only re-run when the shift list itself changes or the draft diverges
    // — commitShift closes over the latest selLocCode/selDate/selTripType.
    // isShiftsFetching is included so this still fires when a refetch
    // completes with a result RTK Query's structural sharing considers
    // deeply equal to the previous one (e.g. two locations sharing the
    // same shift master data) — in that case shiftInfoData keeps the same
    // object reference, so it alone wouldn't re-trigger this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    shiftInfoData,
    isShiftsFetching,
    selLocCode,
    selDate,
    selTripType,
    routeParams.locCode,
    routeParams.routeDate,
    routeParams.tripType,
    routeParams.shiftId,
  ]);

  // Keep Route Management's filters (office/date/shiftType) in sync with
  // whatever is committed here. Without this, routeMakerParams and
  // routeManagementUi.filters drift apart — e.g. a fresh tab opened from
  // Route Planning only ever populates routeMakerParams, so clicking
  // "Back" (same-tab navigate) used to land on Route Management showing
  // stale/default filters instead of the office/date/shift you were just
  // looking at here.
  useEffect(() => {
    dispatch(setFilterOffice(String(routeParams.locCode)));
    dispatch(setFilterDate(routeParams.routeDate));
    dispatch(setFilterShiftType(routeParams.tripType));
  }, [
    dispatch,
    routeParams.locCode,
    routeParams.routeDate,
    routeParams.tripType,
  ]);

  // ── Filter / query state ──────────────────────────────────────────────────
  const [activeFilters, setActiveFilters] =
    useState<RouteFilters>(DEFAULT_FILTERS);

  const queryArgs = {
    locCode: routeParams.locCode,
    shiftId: routeParams.shiftId,
    tripType: routeParams.tripType,
    routeDate: routeParams.routeDate,
    ...(activeFilters.guardTrip && { guardTrip: true }),
    ...(activeFilters.singleEmployee && { singleEmployee: true }),
    // ...{ vendorAssigned: activeFilters.vendorAssigned },
    ...{ vehicleAssigned: activeFilters.vehicleAssigned },
    ...(activeFilters.femaleFilter && {
      femaleFilter: activeFilters.femaleFilter,
    }),
    ...(activeFilters.specialNeeds && { specialNeeds: true }),
    ...(activeFilters.flagTrip && { flagTrip: true }),
    ...(activeFilters.sortBy && {
      sortBy: activeFilters.sortBy,
      sortDir: activeFilters.sortDir,
    }),
  };

  const {
    data: apiData,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useGetRouteAnalyticsQuery(queryArgs, {
    refetchOnMountOrArgChange: true, // ← forces fetch on every arg change
  });
  // console.log(apiData, "data 144 main page")
  // ── Derived state ─────────────────────────────────────────────────────────

  const shuttleQueryArgs = {
    locCode: routeParams.locCode,
    shiftId: routeParams.shiftId,
    tripType: routeParams.tripType,
    routeDate: routeParams.routeDate,
  };

  const {
    data: rawShuttleData,
    isFetching: isShuttleFetching,
    refetch: refetchShuttle,
  } = useGetShuttleRouteAnalyticsQuery(shuttleQueryArgs, {
    skip: vehicleMode !== "shuttle",
  });

  const shuttleData = rawShuttleData as ShuttleAnalyticsResponse | undefined;

  const shuttleKpi = useMemo(() => {
    const trips = shuttleData?.trips ?? [];
    return {
      totalEmployees: trips.reduce((s, t) => s + t.totalPax, 0),
      totalTrips: trips.length,
      guardTrips: trips.filter((t) => t.isGuard).length,
      specialNeedsCount: trips.filter((t) => t.hasSpecialNeeds).length,
      totalDistanceKm: parseFloat(
        trips.reduce((s, t) => s + t.routeDistanceKm, 0).toFixed(1),
      ),
      totalExtraKm: 0,
      totalVendorsAllocated: trips.filter((t) => t.hasVehicleAssigned).length,
    };
  }, [shuttleData]);

  // AFTER:
  const activeShuttleTrip =
    selectedShuttleTripId !== null
      ? (shuttleData?.trips.find((t) => t.dsId === selectedShuttleTripId) ??
        null)
      : null;

  const [routes, setRoutes] = useState<VehicleRoute[]>([]);
  const [colorMap, setColorMap] = useState<Record<number, string>>({});
  const [cabGroups, setCabGroups] = useState<CabGroup[]>([]);
  const [stops, setStops] = useState<ShuttleStop[]>([]);

  // Add mutation hook (near other mutations):
  const [splitTrip] = useSplitTripMutation();

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [addEmployeeToShuttleTrip, { isLoading: isAddingEmployee }] =
    useAddEmployeeToShuttleTripMutation();

  const { data: availableEmployees = [], isFetching: isLoadingEmployees } =
    useGetAvailableEmployeesQuery(
      { dsId: selectedShuttleTripId! },
      { skip: !selectedShuttleTripId || !showAddEmployee },
    );

  const [office, setOffice] = useState<
    { lat: number; lng: number; name: string } | undefined
  >();

  // Add handler (near handleMergeAuto etc.):
  async function handleSplitTrip(vehicleId: number, empIds: number[]) {
    showOverlay(`Splitting Trip #${vehicleId}…`);
    try {
      await splitTrip({ dsId: vehicleId, empIds }).unwrap();
      hideOverlay();
      message.success(`Trip #${vehicleId} split successfully.`);
      refetch();
    } catch {
      hideOverlay();
      message.error("Failed to split trip. Please try again.");
    }
  }

  // Reset selected stop whenever the active trip changes
  useEffect(() => {
    setSelectedStopOrder(null);
  }, [selectedShuttleTripId]);

  useEffect(() => {
    if (vehicleMode === "shuttle" && activeShuttleTrip) {
      setStops(adaptToSidebarStops(activeShuttleTrip) as any);
    }
  }, [vehicleMode, activeShuttleTrip]);

  useEffect(() => {
    if (!apiData) return;
    const adapted = adaptApiResponse(
      apiData as Parameters<typeof adaptApiResponse>[0],
    );
    const cm = buildColorMap(adapted);
    setRoutes(adapted);
    setColorMap(cm);
    setCabGroups(buildCabGroups(adapted, cm));

    const raw = apiData as any;

    if (raw?.officeLat && raw?.officeLng) {
      setOffice({
        lat: raw.officeLat,
        lng: raw.officeLng,
        name: raw.officeName ?? "Office",
      });
    }
  }, [apiData]);

  // ── Multi-selection ───────────────────────────────────────────────────────
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>([]);
  // const hasSelection = selectedVehicleIds.length > 0;

  const hasSelection =
    vehicleMode === "shuttle"
      ? selectedShuttleTripId !== null
      : selectedVehicleIds.length > 0;

  function toggleVehicle(id: number) {
    setSelectedVehicleIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
    mapRef.current?.focusRoute(id);
  }

  function clearSelection() {
    setSelectedVehicleIds([]);
    mapRef.current?.fitAllRoutes();
  }

  const selectedCabGroups: CabGroup[] = cabGroups.filter((g) =>
    selectedVehicleIds.includes(g.vehicleId),
  );

  // ── Sort state ────────────────────────────────────────────────────────────
  const [sortField, setSortField] = useState<SortField>("radial");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSortChange(f: SortField, d: SortDir) {
    setSortField(f);
    setSortDir(d);
    const apiSortBy = SORT_FIELD_TO_API[f] ?? null;
    setActiveFilters((prev) => ({ ...prev, sortBy: apiSortBy, sortDir: d }));
  }

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showFilter, setShowFilter] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<DropResult | null>(null);
  const [mobileDropAction, setMobileDropAction] =
    useState<DropResult | null>(null);
  const [showAssignVendor, setShowAssignVendor] = useState(false);
  const [showPublishTrips, setShowPublishTrips] = useState(false);
  const [showOrchestrator, setShowOrchestrator] = useState(false);

  // ── Merge state ───────────────────────────────────────────────────────────
  const [showMergeConfirm, setShowMergeConfirm] = useState(false);
  const [mergeSelectedIds, setMergeSelectedIds] = useState<number[]>([]);

  const [updateTripFlag] = useUpdateTripFlagApprovalStatusMutation();

  const [showDistribution, setShowDistribution] = useState(false);

  const [showAdhocRoute, setShowAdhocRoute] = useState(false);

  const [orchestratorDsIds, setOrchestratorDsIds] = useState<number[]>([]);

  const [mapKey, setMapKey] = useState(0);

  // per-card loading: key = `${dsId}-flag` or `${dsId}-approve`
  const [tripActionLoading, setTripActionLoading] = useState<
    Record<string, boolean>
  >({});

  // Vendor/driver assignment happens inside modals deep in the card tree —
  // they flip "-assigning" on for their dsId while the mutation is in
  // flight, then this clears it once the resulting refetch (implicit tag
  // invalidation for vendor, explicit onRefetch() for driver) actually
  // lands, so the card's own loader stays up for the whole "stale until
  // fresh data arrives" window, not just the mutation call itself.
  const wasFetchingRef = useRef(isFetching);
  useEffect(() => {
    if (wasFetchingRef.current && !isFetching) {
      setTripActionLoading((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (key.endsWith("-assigning") && next[key]) {
            next[key] = false;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }
    wasFetchingRef.current = isFetching;
  }, [isFetching]);

  function handleToggleMergeSelect(vehicleId: number) {
    setMergeSelectedIds((prev) => {
      if (prev.includes(vehicleId))
        return prev.filter((id) => id !== vehicleId);
      if (prev.length >= 2) return [prev[1], vehicleId]; // keep latest 2
      return [...prev, vehicleId];
    });
  }

  const mergeGroups =
    showMergeConfirm && mergeSelectedIds.length === 2
      ? {
          groupA: cabGroups.find((g) => g.vehicleId === mergeSelectedIds[0]),
          groupB: cabGroups.find((g) => g.vehicleId === mergeSelectedIds[1]),
        }
      : null;

  // ── Overlay & drawer state ────────────────────────────────────────────────
  const [operationOverlay, setOperationOverlay] = useState<{
    visible: boolean;
    message: string;
  }>({
    visible: false,
    message: "",
  });
  const showOverlay = (msg: string) =>
    setOperationOverlay({ visible: true, message: msg });
  const hideOverlay = () =>
    setOperationOverlay({ visible: false, message: "" });

  const [singleEmpWarning, setSingleEmpWarning] = useState<DropResult | null>(
    null,
  );
  const [rearrangeTarget, setRearrangeTarget] = useState<{
    group: CabGroup;
    route?: VehicleRoute;
  } | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isMergingFromDrop, setIsMergingFromDrop] = useState(false);

  // ── Map ref ───────────────────────────────────────────────────────────────
  const mapRef = useRef<{
    renderRoutes: (r: VehicleRoute[], cm: Record<number, string>) => void;
    focusRoute: (id: number) => void;
    fitAllRoutes: () => void;
  } | null>(null);

  useEffect(() => {
    if (routes.length > 0 && mapRef.current) {
      mapRef.current.renderRoutes(routes, colorMap);
    }
  }, [routes, colorMap]);

  // Extract office from shuttle data when cabs data hasn't loaded yet
  useEffect(() => {
    if (!shuttleData) return;
    if (shuttleData.officeLat && shuttleData.officeLng) {
      setOffice({
        lat: shuttleData.officeLat,
        lng: shuttleData.officeLng,
        name: shuttleData.officeName ?? "Office",
      });
    }
  }, [shuttleData]);

  // Add near your other handlers
  const handleMapRouteSelect = useCallback((id: string) => {
    const numId = Number(id);
    if (!isNaN(numId)) {
      setSelectedVehicleIds([numId]);
    }
  }, []);

  // ── Drag-and-drop ─────────────────────────────────────────────────────────
  const dd = useDragAndDrop();

  function showDropConfirmation(drop: DropResult) {
    const sourceGroup = cabGroups.find(
      (group) => group.vehicleId === drop.passenger.sourceVehicleId,
    );

    if (sourceGroup?.passengers.length === 1) {
      setPendingDrop(null);
      setSingleEmpWarning(drop);
      return;
    }

    setSingleEmpWarning(null);
    setPendingDrop(drop);
  }

  function handleMobilePassengerDrop(
    passenger: DragPassenger,
    targetVehicleId: number,
  ) {
    if (passenger.sourceVehicleId === targetVehicleId) return;

    const drop: DropResult = {
      passenger,
      targetVehicleId,
      targetType: "ROUTE_CARD",
    };
    setPendingDrop(null);
    setSingleEmpWarning(null);
    setMobileDropAction(drop);
  }

  function handleOpenMobileDropConfirmation() {
    if (!mobileDropAction) return;
    const drop = mobileDropAction;
    setMobileDropAction(null);
    showDropConfirmation(drop);
  }

  function applyDropToCabGroup(result: DropResult) {
    setCabGroups((prev) => {
      const from = prev.find(
        (g) => g.vehicleId === result.passenger.sourceVehicleId,
      );
      const to = prev.find((g) => g.vehicleId === result.targetVehicleId);
      if (!from || !to) return prev;
      const moved = from.passengers.find(
        (p) => p.Id === result.passenger.passengerId,
      );
      if (!moved) return prev;
      return prev.map((g) => {
        if (g.vehicleId === from.vehicleId)
          return {
            ...g,
            passengers: g.passengers.filter((p) => p.Id !== moved.Id),
          };
        if (g.vehicleId === to.vehicleId)
          return {
            ...g,
            passengers: [
              ...g.passengers,
              { ...moved, PickupSequence: g.passengers.length + 1 },
            ],
          };
        return g;
      });
    });
    invalidateAdapterCache(routes);
  }

  function handleDropOnCab(e: React.DragEvent, vehicleId: number) {
    const r = dd.onDrop(e, vehicleId, "CAB_GROUP");
    if (!r) return;
    showDropConfirmation(r);
  }

  function handleDropOnRoute(e: React.DragEvent, vehicleId: number) {
    const r = dd.onDrop(e, vehicleId, "ROUTE_CARD");
    if (!r) return;
    showDropConfirmation(r);
  }

  // ── Move employee only ────────────────────────────────────────────────────

  async function handleMoveEmployeeOnly() {
    if (!pendingDrop) return;
    const drop = pendingDrop;
    applyDropToCabGroup(drop);
    setPendingDrop(null);
    try {
      await moveEmployee({
        sourceDsId: drop.passenger.sourceVehicleId,
        targetDsId: drop.targetVehicleId,
        employeeId: drop.passenger.passengerId,
      }).unwrap();
      message.success(
        `${drop.passenger.passengerName} moved to Trip #${drop.targetVehicleId} successfully.`,
      );
      refetch();
    } catch {
      message.error("Failed to move employee. Please try again.");
      refetch();
    }
  }

  // ── Merge from drop ───────────────────────────────────────────────────────

  async function handleMergeFromDrop() {
    if (!pendingDrop) return;
    const drop = pendingDrop;
    const src = drop.passenger.sourceVehicleId;
    const tgt = drop.targetVehicleId;
    setPendingDrop(null);
    setIsMergingFromDrop(true);
    showOverlay(`Merging Trip #${src} and Trip #${tgt}. Please wait...`);
    try {
      await mergeTrips({ dsId1: tgt, dsId2: src }).unwrap();
      const result = await refetch();
      hideOverlay();
      setIsMergingFromDrop(false);
      message.success("Trips merged. Please review the pickup order.");
      const freshData = result.data;
      if (freshData) {
        const adapted = adaptApiResponse(freshData as any);
        const cm = buildColorMap(adapted);
        const freshGroups = buildCabGroups(adapted, cm);
        const mergedGroup = freshGroups.find((g) => g.vehicleId === tgt);
        const mergedRoute = adapted.find((r) => r.VehicleId === tgt);
        if (mergedGroup)
          setRearrangeTarget({ group: mergedGroup, route: mergedRoute });
      }
    } catch {
      hideOverlay();
      setIsMergingFromDrop(false);
      message.error("Merge failed. Please try again.");
      refetch();
    }
  }

  // ── Single employee warning merge ─────────────────────────────────────────

  async function handleSingleEmpMerge() {
    if (!singleEmpWarning) return;
    const src = singleEmpWarning.passenger.sourceVehicleId;
    const tgt = singleEmpWarning.targetVehicleId;
    setSingleEmpWarning(null);
    showOverlay(`Merging Trip #${src} into Trip #${tgt}. Please wait...`);
    try {
      await mergeTrips({ dsId1: tgt, dsId2: src }).unwrap();
      const result = await refetch();
      hideOverlay();
      message.success("Trips merged. Please review the pickup order.");
      const freshData = result.data;
      if (freshData) {
        const adapted = adaptApiResponse(freshData as any);
        const cm = buildColorMap(adapted);
        const freshGroups = buildCabGroups(adapted, cm);
        const mergedGroup = freshGroups.find((g) => g.vehicleId === tgt);
        const mergedRoute = adapted.find((r) => r.VehicleId === tgt);
        if (mergedGroup)
          setRearrangeTarget({ group: mergedGroup, route: mergedRoute });
      }
    } catch {
      hideOverlay();
      message.error("Merge failed. Please try again.");
      refetch();
    }
  }

  // ── Cancel drop ───────────────────────────────────────────────────────────

  function handleCancelDrop() {
    setPendingDrop(null);
  }

  // ── Merge auto ────────────────────────────────────────────────────────────

  async function handleMergeAuto() {
    if (mergeSelectedIds.length !== 2) return;
    const [id1, id2] = mergeSelectedIds;
    setShowMergeConfirm(false);
    setMergeSelectedIds([]);
    setSelectedVehicleIds((prev) =>
      prev.filter((id) => id !== id1 && id !== id2),
    );
    // mergeSelectedIds cleared above
    showOverlay(`Merging Trip #${id1} and Trip #${id2}. Please wait...`);
    try {
      await mergeTrips({ dsId1: id1, dsId2: id2 }).unwrap();
      hideOverlay();
      message.success(`Trip #${id1} and Trip #${id2} merged successfully.`, 4);
      refetch();
    } catch {
      hideOverlay();
      message.error("Failed to merge trips. Please try again.", 6);
      refetch();
    }
  }

  // ── Merge and rearrange ───────────────────────────────────────────────────

  async function handleMergeAndRearrange() {
    if (mergeSelectedIds.length !== 2) return;
    const [id1, id2] = mergeSelectedIds;
    setShowMergeConfirm(false);
    setMergeSelectedIds([]);
    setSelectedVehicleIds((prev) =>
      prev.filter((id) => id !== id1 && id !== id2),
    );
    showOverlay(`Merging Trip #${id1} and Trip #${id2}. Please wait...`);
    try {
      await mergeTrips({ dsId1: id1, dsId2: id2 }).unwrap();
      const result = await refetch();
      hideOverlay();
      message.success("Trips merged. Please review the pickup order.", 4);
      const freshData = result.data;
      if (freshData) {
        const adapted = adaptApiResponse(freshData as any);
        const cm = buildColorMap(adapted);
        const freshGroups = buildCabGroups(adapted, cm);
        const mergedGroup = freshGroups.find((g) => g.vehicleId === id1);
        const mergedRoute = adapted.find((r) => r.VehicleId === id1);
        if (mergedGroup)
          setRearrangeTarget({ group: mergedGroup, route: mergedRoute });
      }
    } catch {
      hideOverlay();
      message.error("Merge failed. Cannot rearrange.", 6);
      refetch();
    }
  }

  // ── Reorder (inline quick reorder) ───────────────────────────────────────

  async function handleReorder(vehicleId: number, orderedIds: number[]) {
    setCabGroups((prev) =>
      prev.map((g) => {
        if (g.vehicleId !== vehicleId) return g;
        const reordered = orderedIds
          .map((id) => g.passengers.find((p) => p.Id === id))
          .filter((p): p is NonNullable<typeof p> => p !== undefined)
          .map((p, i) => ({ ...p, PickupSequence: i + 1 }));
        return { ...g, passengers: reordered };
      }),
    );
    try {
      await reorderTrip({
        dsId: vehicleId,
        employeeIdsInOrder: orderedIds,
      }).unwrap();
      message.success(`Pickup order updated for Trip #${vehicleId}.`, 3);
      refetch();
    } catch {
      message.error("Failed to update pickup order. Please retry.", 6);
      refetch();
    }
  }

  // ── Save order (from RearrangeRouteDrawer) ────────────────────────────────

  async function handleSaveOrder(vehicleId: number, orderedIds: number[]) {
    setIsSavingOrder(true);
    try {
      await reorderTrip({
        dsId: vehicleId,
        employeeIdsInOrder: orderedIds,
      }).unwrap();
      setRearrangeTarget(null);
      message.success(
        `Pickup order for Trip #${vehicleId} saved successfully.`,
        4,
      );
      invalidateAdapterCache(routes); // ← add this before refetch
      await refetch();
      setMapKey((k) => k + 1); // ← forces map remount with fresh data
    } catch {
      message.error("Failed to save pickup order. Please retry.", 6);
    } finally {
      setIsSavingOrder(false);
    }
  }

  // ── Vendor assign ─────────────────────────────────────────────────────────

  // function handleVendorAssigned() {
  //   refetch();
  //   // setShowAssignVendor(false);
  //   setShowOrchestrator(false);
  //   setSelectedVehicleIds([]);
  // }

  // ── Drop modal payload ────────────────────────────────────────────────────
  const dropModalPayload: DropConfirmPayload | null = pendingDrop
    ? {
        passenger: pendingDrop.passenger,
        targetVehicleId: pendingDrop.targetVehicleId,
        targetVehicleLabel:
          cabGroups.find((g) => g.vehicleId === pendingDrop.targetVehicleId)
            ?.label ?? `Vehicle #${pendingDrop.targetVehicleId}`,
        targetType: pendingDrop.targetType,
      }
    : null;
  // ── Filter handlers ───────────────────────────────────────────────────────
  function handleApplyFilters(filters: RouteFilters) {
    setActiveFilters(filters);
    if (filters.sortDir) setSortDir(filters.sortDir);
    setSelectedVehicleIds([]);
  }

  function handleRemoveFilter(key: keyof RouteFilters | "sort") {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (key === "sort") {
        next.sortBy = null;
        next.sortDir = "asc";
      } else {
        switch (key) {
          case "guardTrip":
          case "singleEmployee":
          case "specialNeeds":
            next[key] = false;
            break;
          case "femaleFilter":
            next[key] = null;
            break;
          case "sortBy":
            next.sortBy = null;
            break;
          case "sortDir":
            next.sortDir = "asc";
            break;
          case "flagTrip":
            next[key] = false;
            break;
        }
      }
      return next;
    });
    if (key === "sort") {
      setSortField("radial");
      setSortDir("asc");
    }
  }

  function handleClearAllFilters() {
    setActiveFilters(DEFAULT_FILTERS);
    setSortField("radial");
    setSortDir("asc");
    setSelectedVehicleIds([]);
  }

  async function handleFlagTrip(dsId: number, currentStatus: boolean) {
    const key = `${dsId}-flag`;
    setTripActionLoading((p) => ({ ...p, [key]: true }));
    try {
      await updateTripFlag({
        dsId,
        updateType: 1,
        status: !currentStatus,
      }).unwrap();
      message.success(
        `Trip #${dsId} ${!currentStatus ? "flagged" : "unflagged"} successfully.`,
      );
      refetch();
    } catch {
      message.error(`Failed to flag Trip #${dsId}. Please try again.`);
    } finally {
      setTripActionLoading((p) => ({ ...p, [key]: false }));
    }
  }

  async function handleApproveTrip(dsId: number, currentStatus: boolean) {
    const key = `${dsId}-approve`;
    setTripActionLoading((p) => ({ ...p, [key]: true }));
    try {
      await updateTripFlag({
        dsId,
        updateType: 2,
        status: !currentStatus,
      }).unwrap();
      message.success(
        `Trip #${dsId} ${!currentStatus ? "approved" : "unapproved"} successfully.`,
      );
      refetch();
    } catch {
      message.error(`Failed to approve Trip #${dsId}. Please try again.`);
    } finally {
      setTripActionLoading((p) => ({ ...p, [key]: false }));
    }
  }

  async function handleDeallocateVehicle(dsId: number) {
    const key = `${dsId}-deallocate`;
    setTripActionLoading((p) => ({ ...p, [key]: true }));
    try {
      await unassignVehicle({ dsId }).unwrap();
      message.success(`Vehicle deallocated from Trip #${dsId} successfully.`);
      refetch();
    } catch {
      message.error(
        `Failed to deallocate vehicle from Trip #${dsId}. Please try again.`,
      );
    } finally {
      setTripActionLoading((p) => ({ ...p, [key]: false }));
    }
  }

  const handleShuttleLocationClick = useCallback(
    (passenger: { name: string; id?: string; empId?: string }) => {
      const matchStop = stops.find(
        (
          s, // ← was shuttleSidebarStops, use stops
        ) =>
          s.passengers.some(
            (p) =>
              p.name === passenger.name ||
              (passenger.id && p.id === passenger.id) ||
              (passenger.empId && p.empId === passenger.empId),
          ),
      );
      if (matchStop) {
        setSelectedStopOrder((prev) =>
          prev === matchStop.stopNumber ? null : matchStop.stopNumber,
        );
      }
    },
    [stops], // ← was shuttleSidebarStops
  );

  async function handleAddEmployee(empId: number) {
    if (!selectedShuttleTripId) return;
    try {
      await addEmployeeToShuttleTrip({
        dsId: selectedShuttleTripId,
        empId,
      }).unwrap();
      message.success("Employee added to trip successfully.");
      setShowAddEmployee(false);
      refetchShuttle();
    } catch {
      message.error("Failed to add employee. Please try again.");
    }
  }

  // ── Loading / error screens ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: T.bg,
          color: T.muted,
          fontSize: 13,
        }}
      >
        Loading route data…
      </div>
    );
  }

  if (isError) {
    const msg = (error as { error?: string })?.error ?? "Unknown error";
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: T.bg,
          gap: 12,
        }}
      >
        <div style={{ fontSize: 20, color: T.danger }}>
          Failed to load routes
        </div>
        <div style={{ color: T.muted, fontSize: 13 }}>{msg}</div>
      </div>
    );
  }

  // ── Mobile layout — right stack panel only ────────────────────────────────
  if (isMobile) {
    return (
      <div
        style={{
          height: "100vh",
          overflow: "hidden",
          background: T.bg,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Mobile header ── */}
        <AppHeader
          variant="route-maker"
          title="Route Optimization"
          onBack={() => navigate("/routing/today-routing")}
          tripType={selTripType}
          isShuttleOn={true}
          vehicleMode={vehicleMode}
          onVehicleModeChange={setVehicleMode}
          shiftTime={routeParams.shiftTime}
          tripDate={selDate}
          locationOptions={locationOptions}
          selectedLocCode={selLocCode}
          onLocCodeChange={handleHeaderLocChange}
          onRouteDateChange={handleHeaderDateChange}
          onTripTypeChange={handleHeaderTripTypeChange}
          shiftOptions={shiftOptions}
          selectedShiftId={selShiftId}
          onShiftChange={handleHeaderShiftChange}
          isShiftsLoading={isShiftsFetching}
          shiftsErrorMessage={shiftInfoErrorMessage}
          onNewRoute={() => setShowAdhocRoute(true)}
        />

        {vehicleMode === "shuttle" ? (
          <ShuttleRouteStackPanel
            data={shuttleData}
            selectedTripIds={
              selectedShuttleTripId ? [selectedShuttleTripId] : []
            }
            onSelectTrip={(id) =>
              setSelectedShuttleTripId((prev) => (prev === id ? null : id))
            }
            isFetching={isShuttleFetching}
            tripType={routeParams.tripType}
            locCode={routeParams.locCode} // ADD
            onRefetch={refetchShuttle} // ADD
          />
        ) : (
          <RouteStackPanel
            locationOptions={locationOptions}
            routes={routes}
            colorMap={colorMap}
            selectedVehicleIds={selectedVehicleIds}
            overZoneId={dd.overZoneId}
            isFetching={isFetching}
            sortField={sortField}
            sortDir={sortDir}
            filters={activeFilters}
            onRemoveFilter={handleRemoveFilter}
            onClearAllFilters={handleClearAllFilters}
            onSortChange={handleSortChange}
            onSelect={toggleVehicle}
            onClearSelection={clearSelection}
            onBulkMerge={() => {
              if (selectedVehicleIds.length !== 2) return;
              setMergeSelectedIds([...selectedVehicleIds]);
              setShowMergeConfirm(true);
            }}
            onDragOver={(e, zoneId) => dd.onDragOver(e, zoneId)}
            onDragLeave={dd.onDragLeave}
            onDropOnRoute={handleDropOnRoute}
            onMobilePassengerDrop={handleMobilePassengerDrop}
            onOpenFilter={() => setShowFilter(true)}
            assignmentFilter="all"
            onAssignmentFilterChange={() => {}}
            activeVehicleId={selectedVehicleIds[0] ?? null}
            onAssignVehicle={(routeId) => {
              const id = parseInt(routeId, 10);
              if (!isNaN(id)) {
                if (ENABLE_ALLOCATION_ORCHESTRATOR) {
                  setOrchestratorDsIds([id]);
                  setShowOrchestrator(true);
                } else {
                  setSelectedVehicleIds((prev) =>
                    prev.includes(id) ? prev : [...prev, id],
                  );
                  setShowAssignVendor(true);
                }
              }
            }}
            tripActionLoading={tripActionLoading}
            onFlagTrip={handleFlagTrip}
            onApproveTrip={handleApproveTrip}
            onDeallocateVehicle={handleDeallocateVehicle}
            onSplit={handleSplitTrip}
            onPublishTrips={() => setShowPublishTrips(true)}
            onAssignVendor={() => {
              if (ENABLE_ALLOCATION_ORCHESTRATOR) {
                setOrchestratorDsIds(selectedVehicleIds);
                setShowOrchestrator(true);
              } else {
                setShowAssignVendor(true);
              }
            }}
            sessionParams={{
              locCode: routeParams.locCode,
              shiftId: routeParams.shiftId,
              tripType: routeParams.tripType,
              routeDate: routeParams.routeDate,
            }}
            flagFilter={activeFilters.flagTrip ?? false}
            onToggleFlagFilter={() =>
              setActiveFilters((prev) => ({
                ...prev,
                flagTrip: !prev.flagTrip,
              }))
            }
            onRefetch={refetch}
            onTripActionLoadingChange={setTripActionLoading}
          />
        )}

        {/* ── Modals — must be here; early return never reaches the desktop modal block ── */}
        <FilterPanel
          open={showFilter}
          onClose={() => setShowFilter(false)}
          onApply={handleApplyFilters}
          activeFilters={activeFilters}
        />

        {mobileDropAction && (
          <>
          <div
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1899,
              background: "rgba(15, 23, 42, 0.12)",
              pointerEvents: "none",
            }}
          />
          <div
            role="status"
            aria-live="polite"
            style={{
              position: "fixed",
              zIndex: 1900,
              left: "50%",
              bottom: "max(10vh, calc(env(safe-area-inset-bottom) + 16px))",
              transform: "translateX(-50%)",
              width: "calc(100% - 24px)",
              maxWidth: 520,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              padding: 12,
              border: `2px solid ${T.accent}`,
              borderRadius: T.radiusLg,
              background: "#fff",
              boxShadow:
                "0 16px 40px rgba(15, 23, 42, 0.24), 0 4px 12px rgba(15, 23, 42, 0.14), 0 0 0 4px rgba(22, 163, 74, 0.14)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  color: T.text,
                  fontSize: 12,
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {mobileDropAction.passenger.passengerName}
              </div>
              <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>
                Trip #{mobileDropAction.passenger.sourceVehicleId} → Trip #
                {mobileDropAction.targetVehicleId}
              </div>
            </div>
            <div style={{ display: "flex", flexShrink: 0, gap: 8 }}>
              <button
                type="button"
                onClick={handleOpenMobileDropConfirmation}
                style={{
                  minHeight: 38,
                  padding: "0 12px",
                  border: 0,
                  borderRadius: T.radiusSm,
                  background: T.accent,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {cabGroups.find(
                  (group) =>
                    group.vehicleId ===
                    mobileDropAction.passenger.sourceVehicleId,
                )?.passengers.length === 1
                  ? "Merge Trip"
                  : "Move Passenger"}
              </button>
              <button
                type="button"
                onClick={() => setMobileDropAction(null)}
                style={{
                  minHeight: 38,
                  padding: "0 10px",
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radiusSm,
                  background: T.card,
                  color: T.text,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
          </>
        )}

        <GlobalOperationOverlay
          visible={operationOverlay.visible}
          message={operationOverlay.message}
        />
        {singleEmpWarning && (
          <SingleEmployeeWarningModal
            sourceVehicleId={singleEmpWarning.passenger.sourceVehicleId}
            targetVehicleId={singleEmpWarning.targetVehicleId}
            passengerName={singleEmpWarning.passenger.passengerName}
            onMerge={handleSingleEmpMerge}
            onCancel={() => setSingleEmpWarning(null)}
          />
        )}
        <DropConfirmModal
          payload={dropModalPayload}
          onMoveOnly={handleMoveEmployeeOnly}
          onMergeAndRearrange={handleMergeFromDrop}
          onCancel={handleCancelDrop}
          colorMap={colorMap}
          isConfirming={isMoving || isMergingFromDrop}
        />

        {showMergeConfirm && mergeGroups?.groupA && mergeGroups?.groupB && (
          <MergeConfirmModal
            groupA={mergeGroups.groupA}
            groupB={mergeGroups.groupB}
            colorMap={colorMap}
            isMerging={isMerging}
            onConfirmAuto={handleMergeAuto}
            onConfirmAndRearrange={handleMergeAndRearrange}
            onCancel={() => setShowMergeConfirm(false)}
          />
        )}

        {ENABLE_ALLOCATION_ORCHESTRATOR && showOrchestrator && (
          <AllocationOrchestrator
            dsIds={orchestratorDsIds}
            locCode={routeParams.locCode}
            onClose={() => {
              setShowOrchestrator(false);
              setOrchestratorDsIds([]);
            }}
            onSessionComplete={() => {
              setShowOrchestrator(false);
              setOrchestratorDsIds([]);
              refetch();
            }}
          />
        )}

        {!ENABLE_ALLOCATION_ORCHESTRATOR && showAssignVendor && (
          <AssignVendorModal
            routes={routes.filter((r) =>
              selectedVehicleIds.includes(r.VehicleId),
            )}
            locCode={routeParams.locCode}
            onClose={() => setShowAssignVendor(false)}
            onSuccess={() => {
              refetch();
              setShowAssignVendor(false);
            }}
          />
        )}

        {showPublishTrips && (
          <PublishTripModal
            routes={routes.filter((r) =>
              selectedVehicleIds.includes(r.VehicleId),
            )}
            locCode={routeParams.locCode}
            shiftId={routeParams.shiftId}
            tripType={routeParams.tripType}
            routeDate={routeParams.routeDate}
            onClose={() => setShowPublishTrips(false)}
            onSuccess={() => {
              refetch();
              setShowPublishTrips(false);
              setSelectedVehicleIds([]);
            }}
          />
        )}
        {showAdhocRoute && (
          <CreateAdhocRouteModal
            routeParams={{
              locCode: routeParams.locCode,
              shiftId: routeParams.shiftId,
              tripType: routeParams.tripType,
              routeDate: routeParams.routeDate,
            }}
            onClose={() => setShowAdhocRoute(false)}
            onSuccess={() => {
              setShowAdhocRoute(false);
              refetch();
            }}
          />
        )}

        <style>{`
        @keyframes rmSpin { to { transform: rotate(360deg); } }
      `}</style>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const pageStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateRows: `${T.headerH}px ${T.statsH}px 1fr`,
    height: "100vh",
    overflow: "hidden",
    background: "#ffffff", // T.bg,
  };

  const workspaceStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: contentColumns(hasSelection),
    gap: GRID_GAP,
    padding: PAGE_PAD,
    overflow: "hidden",
    transition: "grid-template-columns 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
    alignItems: "stretch",
    minHeight: 0,
  };

  const panelStyle: React.CSSProperties = {
    borderRadius: T.radiusLg,
    overflow: "hidden",
    // boxShadow: T.shadowLg,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)",
    border: `1px solid ${T.border}`,
    minWidth: 0,
    minHeight: 0,
    height: "100%",
  };

  const handlePassengerCheckToggle = (
    stopId: string,
    passengerId: string,
    checked: boolean,
  ) => {
    setStops((prev) =>
      prev.map((stop) =>
        stop.id === stopId
          ? {
              ...stop,
              passengers: stop.passengers.map((p) =>
                p.id === passengerId ? { ...p, isChecked: checked } : p,
              ),
            }
          : stop,
      ),
    );
  };

  return (
    <div style={pageStyle}>
      {/* Refetch progress bar */}
      {isFetching && !isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            zIndex: 1000,
            background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`,
            animation: "slideRight 1.2s ease-in-out infinite",
          }}
        />
      )}
      {/* Row 1 — Header */}
      <AppHeader
        variant="route-maker"
        title="Route Optimization"
        // onBack={() => navigate(-1)}
        onBack={() => navigate("/routing/today-routing")}
        tripType={selTripType}
        isShuttleOn={true}
        vehicleMode={vehicleMode}
        onVehicleModeChange={setVehicleMode}
        shiftTime={routeParams.shiftTime} // pass as prop, or just display inline
        tripDate={selDate}
        locationOptions={locationOptions}
        selectedLocCode={selLocCode}
        onLocCodeChange={handleHeaderLocChange}
        onRouteDateChange={handleHeaderDateChange}
        onTripTypeChange={handleHeaderTripTypeChange}
        shiftOptions={shiftOptions}
        selectedShiftId={selShiftId}
        onShiftChange={handleHeaderShiftChange}
        isShiftsLoading={isShiftsFetching}
        shiftsErrorMessage={shiftInfoErrorMessage}
        onNewRoute={() => setShowAdhocRoute(true)}
      />
      {/* Row 2 — KPI bar */}

      {/* <KpiStatsBar
        totalEmployees={(apiData as any)?.totalEmployees ?? 0}
        totalTrips={(apiData as any)?.totalTrips ?? 0}
        guardTrips={(apiData as any)?.guardTrips ?? 0}
        specialNeedsCount={(apiData as any)?.specialNeedsCount ?? 0}
        totalDistanceKm={(apiData as any)?.totalDistanceKm ?? 0}
        totalExtraKm={(apiData as any)?.totalExtraKm ?? 0}
        totalVendorsAllocated={(apiData as any)?.totalVendorsAllocated ?? 0}
        onNewRoute={() => setShowAdhocRoute(true)}
        onDistribution={() => setShowDistribution(true)}
      /> */}

      <KpiStatsBar
        totalEmployees={
          vehicleMode === "shuttle"
            ? shuttleKpi.totalEmployees
            : ((apiData as any)?.totalEmployees ?? 0)
        }
        totalTrips={
          vehicleMode === "shuttle"
            ? shuttleKpi.totalTrips
            : ((apiData as any)?.totalTrips ?? 0)
        }
        guardTrips={
          vehicleMode === "shuttle"
            ? shuttleKpi.guardTrips
            : ((apiData as any)?.guardTrips ?? 0)
        }
        specialNeedsCount={
          vehicleMode === "shuttle"
            ? shuttleKpi.specialNeedsCount
            : ((apiData as any)?.specialNeedsCount ?? 0)
        }
        totalDistanceKm={
          vehicleMode === "shuttle"
            ? shuttleKpi.totalDistanceKm
            : ((apiData as any)?.totalDistanceKm ?? 0)
        }
        totalExtraKm={
          vehicleMode === "shuttle" ? 0 : ((apiData as any)?.totalExtraKm ?? 0)
        }
        totalVendorsAllocated={
          vehicleMode === "shuttle"
            ? shuttleKpi.totalVendorsAllocated
            : ((apiData as any)?.totalVendorsAllocated ?? 0)
        }
        onNewRoute={() => setShowAdhocRoute(true)}
        onDistribution={() => setShowDistribution(true)}
      />

      {/* Row 3 — Workspace */}
      <div style={workspaceStyle}>
        {/* LEFT: Sidebar */}
        <div
          style={{
            ...panelStyle,
            background: T.panel,
            // pointerEvents: hasSelection ? "auto" : "none",
            pointerEvents:
              hasSelection || vehicleMode === "shuttle" ? "auto" : "none",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {hasSelection && vehicleMode == "cabs" && (
            <LeftSidebar
              cabGroups={selectedCabGroups}
              colorMap={colorMap}
              activeVehicleId={
                selectedVehicleIds[selectedVehicleIds.length - 1] ?? null
              }
              onSelectVehicle={toggleVehicle}
              overZoneId={dd.overZoneId}
              dragItemId={dd.dragItem?.passengerId ?? null}
              dragHandlers={{
                onDragStart: dd.onDragStart,
                onDragEnd: dd.onDragEnd,
                onDragOver: dd.onDragOver,
                onDragLeave: dd.onDragLeave,
                onDrop: handleDropOnCab,
              }}
              onClearSelection={clearSelection}
              selectionCount={selectedVehicleIds.length}
              onReorder={handleReorder}
              onRearrange={(group) => {
                const route = routes.find(
                  (r) => r.VehicleId === group.vehicleId,
                );
                setRearrangeTarget({ group, route });
              }}
              mergeSelectedIds={mergeSelectedIds}
              onToggleMergeSelect={handleToggleMergeSelect}
              onRequestMerge={() => {
                if (mergeSelectedIds.length === 2) setShowMergeConfirm(true);
              }}
              onSplit={handleSplitTrip}
              // onRefetch={refetch}
              onRefetch={async () => {
                await refetch();
                setMapKey((k) => k + 1);
              }}
              tripType={routeParams.tripType}
            />
          )}

          {vehicleMode === "shuttle" && activeShuttleTrip && (
            <LeftSidebarShuttle
              tripInfo={adaptShuttleTripInfo(activeShuttleTrip) as any}
              stops={stops}
              onAddUser={() => setShowAddEmployee(true)}
              onLocationClick={handleShuttleLocationClick}
              selectedStopOrder={selectedStopOrder}
              onStopSelect={(
                stopNumber, // ← ADD
              ) =>
                setSelectedStopOrder((prev) =>
                  prev === stopNumber ? null : stopNumber,
                )
              }
              onCallClick={(passenger) => console.log("Call:", passenger.name)}
              onPassengerCheckToggle={handlePassengerCheckToggle}
            />
          )}
        </div>

        {/* CENTER: Map */}
        <div style={{ ...panelStyle, background: "#e8eaed" }}>
          {vehicleMode === "shuttle" ? (
            <ShuttleMapPanel
              data={shuttleData}
              selectedTripId={selectedShuttleTripId}
              selectedStopOrder={selectedStopOrder}
              office={office}
              onTripSelect={(id) =>
                setSelectedShuttleTripId((prev) => (prev === id ? null : id))
              }
              tripType={routeParams.tripType === 1 ? "login" : "logout"}
              onStopSelect={(order) =>
                setSelectedStopOrder((prev) => (prev === order ? null : order))
              }
            />
          ) : (
            <CenterMapPanel
              key={mapKey}
              routes={routes}
              colorMap={colorMap}
              activeVehicleId={selectedVehicleIds[0] ?? null}
              selectedVehicleIds={selectedVehicleIds}
              mapRef={mapRef}
              office={office}
              // onRouteSelect={(id) => {
              //   // ← ADD
              //   const numId = Number(id);
              //   if (!isNaN(numId)) {
              //     setSelectedVehicleIds([numId]); // deselects all, selects only clicked
              //   }
              // }}
              onRouteSelect={handleMapRouteSelect}
            />
          )}
        </div>

        {/* RIGHT: Route stack + Assign Vendor toolbar */}
        <div
          style={{
            ...panelStyle,
            background: T.bg,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Assign Vendor banner — shown when ≥ 1 trip selected */}
          {/* {selectedVehicleIds.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 12px",
                background: T.accentBg,
                borderBottom: `1px solid ${T.accent}33`,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: T.accent }}>
                {selectedVehicleIds.length} trip
                {selectedVehicleIds.length !== 1 ? "s" : ""} selected
              </span>
              <button
                onClick={}
                style={{
                  height: 26,
                  padding: "0 12px",
                  borderRadius: T.radiusSm,
                  border: `1px solid ${T.accent}`,
                  background: T.accent,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <svg
                  width="12"
                  height="12"
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
            </div>
          )} */}

          {vehicleMode === "shuttle" ? (
            <ShuttleRouteStackPanel
              data={shuttleData}
              selectedTripIds={
                selectedShuttleTripId ? [selectedShuttleTripId] : []
              }
              onSelectTrip={(id) =>
                setSelectedShuttleTripId((prev) => (prev === id ? null : id))
              }
              isFetching={isShuttleFetching}
              tripType={routeParams.tripType}
              locCode={routeParams.locCode} // ADD
              onRefetch={refetchShuttle} // ADD
            />
          ) : (
            <RouteStackPanel
              locationOptions={locationOptions}
              routes={routes}
              colorMap={colorMap}
              selectedVehicleIds={selectedVehicleIds}
              overZoneId={dd.overZoneId}
              // isFetching={isFetching}
              sortField={sortField}
              sortDir={sortDir}
              filters={activeFilters}
              onRemoveFilter={handleRemoveFilter}
              onClearAllFilters={handleClearAllFilters}
              onSortChange={handleSortChange}
              onSelect={toggleVehicle}
              onDragOver={(e, zoneId) => dd.onDragOver(e, zoneId)}
              onDragLeave={dd.onDragLeave}
              onDropOnRoute={handleDropOnRoute}
              onMobilePassengerDrop={handleMobilePassengerDrop}
              onOpenFilter={() => setShowFilter(true)}
              assignmentFilter="all"
              onAssignmentFilterChange={() => {}}
              activeVehicleId={selectedVehicleIds[0] ?? null}
              onAssignVehicle={(routeId) => {
                const id = parseInt(routeId, 10);
                if (!isNaN(id)) {
                  if (ENABLE_ALLOCATION_ORCHESTRATOR) {
                    setOrchestratorDsIds([id]); // single trip only
                    setShowOrchestrator(true);
                  } else {
                    setSelectedVehicleIds((prev) =>
                      prev.includes(id) ? prev : [...prev, id],
                    );
                    setShowAssignVendor(true);
                  }
                }
              }}
              tripActionLoading={tripActionLoading}
              onFlagTrip={handleFlagTrip}
              onApproveTrip={handleApproveTrip}
              onDeallocateVehicle={handleDeallocateVehicle}
              onSplit={handleSplitTrip}
              onPublishTrips={() => setShowPublishTrips(true)}
              // onAssignVendor={() => setShowOrchestrator(true)}
              onAssignVendor={() => {
                if (ENABLE_ALLOCATION_ORCHESTRATOR) {
                  setOrchestratorDsIds(selectedVehicleIds); // all selected trips
                  setShowOrchestrator(true);
                } else {
                  setShowAssignVendor(true);
                }
              }}
              sessionParams={{
                locCode: routeParams.locCode,
                shiftId: routeParams.shiftId,
                tripType: routeParams.tripType,
                routeDate: routeParams.routeDate,
              }}
              flagFilter={activeFilters.flagTrip ?? false}
              onToggleFlagFilter={() =>
                setActiveFilters((prev) => ({
                  ...prev,
                  flagTrip: !prev.flagTrip,
                }))
              }
              onRefetch={refetch}
              onTripActionLoadingChange={setTripActionLoading}
            />
          )}
        </div>
      </div>
      {/* ── Overlays ───────────────────────────────────────────────────────── */}
      <GlobalOperationOverlay
        visible={operationOverlay.visible}
        message={operationOverlay.message}
      />
      {singleEmpWarning && (
        <SingleEmployeeWarningModal
          sourceVehicleId={singleEmpWarning.passenger.sourceVehicleId}
          targetVehicleId={singleEmpWarning.targetVehicleId}
          passengerName={singleEmpWarning.passenger.passengerName}
          onMerge={handleSingleEmpMerge}
          onCancel={() => setSingleEmpWarning(null)}
        />
      )}
      {rearrangeTarget && (
        <RearrangeRouteDrawer
          group={rearrangeTarget.group}
          color={colorMap[rearrangeTarget.group.vehicleId] ?? T.accent}
          route={rearrangeTarget.route}
          isSaving={isSavingOrder}
          onClose={() => setRearrangeTarget(null)}
          onSave={handleSaveOrder}
        />
      )}
      <DropConfirmModal
        payload={dropModalPayload}
        onMoveOnly={handleMoveEmployeeOnly}
        onMergeAndRearrange={handleMergeFromDrop}
        onCancel={handleCancelDrop}
        colorMap={colorMap}
        isConfirming={isMoving || isMergingFromDrop}
      />
      {showMergeConfirm && mergeGroups?.groupA && mergeGroups?.groupB && (
        <MergeConfirmModal
          groupA={mergeGroups.groupA}
          groupB={mergeGroups.groupB}
          colorMap={colorMap}
          isMerging={isMerging}
          onConfirmAuto={handleMergeAuto}
          onConfirmAndRearrange={handleMergeAndRearrange}
          onCancel={() => setShowMergeConfirm(false)}
        />
      )}
      <FilterPanel
        open={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={handleApplyFilters}
        activeFilters={activeFilters}
      />

      {/* {showOrchestrator && (
        <AllocationOrchestrator
          dsIds={selectedVehicleIds}
          locCode={routeParams.locCode}
          onClose={() => setShowOrchestrator(false)}
          onSessionComplete={() => {
            setShowOrchestrator(false);
            refetch();
            setSelectedVehicleIds([]);
          }}
        />
      )} */}

      {ENABLE_ALLOCATION_ORCHESTRATOR && showOrchestrator && (
        <AllocationOrchestrator
          dsIds={orchestratorDsIds} // ← uses isolated state, not selectedVehicleIds
          locCode={routeParams.locCode}
          onClose={() => {
            setShowOrchestrator(false);
            setOrchestratorDsIds([]);
          }}
          onSessionComplete={() => {
            setShowOrchestrator(false);
            setOrchestratorDsIds([]);
            refetch();
          }}
        />
      )}

      {!ENABLE_ALLOCATION_ORCHESTRATOR && showAssignVendor && (
        <AssignVendorModal
          routes={routes.filter((r) =>
            selectedVehicleIds.includes(r.VehicleId),
          )}
          locCode={routeParams.locCode}
          onClose={() => setShowAssignVendor(false)}
          onSuccess={() => {
            refetch();
            setShowAssignVendor(false);
          }}
        />
      )}
      {showPublishTrips && (
        <PublishTripModal
          routes={routes.filter((r) =>
            selectedVehicleIds.includes(r.VehicleId),
          )}
          locCode={routeParams.locCode}
          shiftId={routeParams.shiftId}
          tripType={routeParams.tripType}
          routeDate={routeParams.routeDate}
          onClose={() => setShowPublishTrips(false)}
          onSuccess={() => {
            refetch();
            setShowPublishTrips(false);
            setSelectedVehicleIds([]);
          }}
        />
      )}
      {showDistribution && (
        <TripDistributionModal
          locCode={routeParams.locCode}
          shiftId={routeParams.shiftId}
          routeDate={routeParams.routeDate}
          onClose={() => setShowDistribution(false)}
        />
      )}
      {showAdhocRoute && (
        <CreateAdhocRouteModal
          routeParams={{
            locCode: routeParams.locCode,
            shiftId: routeParams.shiftId,
            tripType: routeParams.tripType,
            routeDate: routeParams.routeDate,
          }}
          onClose={() => setShowAdhocRoute(false)}
          onSuccess={() => {
            setShowAdhocRoute(false);
            refetch();
          }}
        />
      )}

      {showAddEmployee && selectedShuttleTripId && (
        <AddEmployeeModal
          dsId={selectedShuttleTripId}
          employees={availableEmployees}
          isLoading={isLoadingEmployees || isAddingEmployee}
          onAdd={handleAddEmployee}
          onClose={() => setShowAddEmployee(false)}
        />
      )}

      <style>{`
        @keyframes slideRight {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes rmSpin { to { transform: rotate(360deg); } }
        @keyframes rmPulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
      `}</style>
    </div>
  );
}
