// src/features/routeManagement/pages/RouteManagementPage.tsx
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import {
  setOffice,
  setDate,
  setShiftType,
} from "../slice/Routemanagementslice";
import {
  useGetRouteManagementDataQuery,
  useGetRouteEditDropdownQuery,
} from "../services/RouteManagementApi";
import { RouteManagementFilters } from "../components/RouteManagementFilters";
import { RouteManagementStats } from "../components/RouteManagementStats";
import { RouteManagementTables } from "../components/RouteManagementTables";
import { useRouteModals } from "../hooks/useRouteModals";
import { RouteModalRegistry } from "./Routemodalregistry";
import { RM_COLOR, RM_FONT, RM_SPACE } from "../Routeuiconfig";

import { CalendarX } from "lucide-react";
import type { ShiftTypeOption } from "../types/RouteTypes";
import AuditLogButton from "../../audit/pages/Audit";
import { auditConstant } from "../../audit/constants/auditConstant";
import { useLookups } from "../../lookups";

const EMPTY_STATS = {
  totalEmployees: 0,
  maleEmployees: 0,
  femaleEmployees: 0,
  adhocEmployees: 0,
  routesGenerated: 0,
  employeesInTripSheets: 0,
  avgOccupancy: 0,
  guardTrips: 0,
};

export default function RouteManagementPage() {
  const dispatch = useDispatch();
  const filters = useSelector((s: RootState) => s.routeManagementUi.filters);
  const modals = useRouteModals();
  const { locationOptions } = useLookups({ only: ["locationOptions"] });

  const locCode = Number(filters.officeId) || 0;
  const tripType = (Number(filters.shiftType) || 0) as 0 | 1 | 2;
  const canFetch = locCode > 0;

  // ── Dashboard data ──────────────────────────────────────────────────────
  const { data, isLoading, isFetching, isError, refetch } =
    useGetRouteManagementDataQuery(
      { locCode, tripType, tripDate: filters.date },
      { skip: !canFetch, refetchOnMountOrArgChange: true },
    );
  // ── Route-edit dropdown (called once, no args) ──────────────────────────
  const { data: dropdownData } = useGetRouteEditDropdownQuery();

  const loginShiftsOptions: ShiftTypeOption[] = useMemo(() => {
    return (
      data?.routePlanningRows
        ?.filter((item) => item.tripType === 1)
        .map((item) => ({
          label: item.shiftTime,
          value: item.shiftId,
        })) ?? []
    );
  }, [data?.routePlanningRows]);
  // console.log(loginShiftsOptions, "loginShiftsOptions");

  const loading = isLoading || isFetching;

  const hasNoData =
    canFetch &&
    !loading &&
    !isError &&
    data?.routePlanningRows.length === 0 &&
    data?.tripPublishingRows.length === 0;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOfficeChange = (v: string) => dispatch(setOffice(v));
  const handleDateChange = (v: string) => dispatch(setDate(v));
  const handleShiftTypeChange = (v: number) => dispatch(setShiftType(v));

  const handleGenerateRoutes = async (p: any) => {
    console.log("Generate routes", p);
    modals.close();
  };
  const handleCopyRoutes = async (p: any) => {
    console.log("Copy routes", p);
    modals.close();
  };
  // const handleUpdateTripsheets = async (c: boolean) => {
  //   console.log("Update tripsheets", c);
  //   // modals.close();
  // };
  // const handleDownloadReport = (k: string, f: "PDF" | "XLS") => {
  //   console.log("Download", k, f);
  // };
  const handleDownloadRouteData = (k: string) => {
    console.log("Download route data", k);
  };
  const handleValidateVehicleFile = async (f: File) => {
    console.log("Validate file", f.name);
    modals.close();
  };
  const handleSmsReviewed = async (c: string) => {
    console.log("SMS reviewed", c);
    modals.close();
  };
  const officeOptions = locationOptions.map((o) => ({
    value: String(o.value),
    label: o.label,
  }));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        minHeight: 0,
        overflow: "hidden",
        backgroundColor: "#fff",
        gap: RM_SPACE.pageGap,
        padding: RM_SPACE.pagePad,
        boxSizing: "border-box",
      }}
    >
      {/* Title */}
      <div style={{ flexShrink: 0, position: "relative" }}>
        <p style={{ position: "absolute", right: 4, top: 4 }}>
          <AuditLogButton
            module={auditConstant.TripManagement}
            modules={[
              auditConstant.TripManagement,
              auditConstant.VendorService,
            ]}
          />
        </p>
        <h1
          style={{
            fontSize: RM_FONT.xl,
            fontWeight: 600,
            color: RM_COLOR.gray900,
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          Route Management
        </h1>
        <p
          style={{
            fontSize: RM_FONT.base,
            color: RM_COLOR.gray400,
            margin: "2px 0 0",
          }}
        >
          Plan routes and publish trips for your shifts
        </p>
      </div>

      {/* Filters */}
      <div style={{ flexShrink: 0 }}>
        <RouteManagementFilters
          officeOptions={officeOptions}
          filters={filters}
          onOfficeChange={handleOfficeChange}
          onDateChange={handleDateChange}
          onShiftTypeChange={handleShiftTypeChange}
        />
      </div>

      {/* Stats */}
      <div style={{ flexShrink: 0 }}>
        {isError && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: "#FEF2F2",
              color: "#991B1B",
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            Failed to load dashboard data. Check your connection and try again.
          </div>
        )}
        <RouteManagementStats
          stats={data?.stats ?? EMPTY_STATS}
          loading={loading}
        />
      </div>

      {/* Tables area */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {hasNoData ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              color: "#94A3B8",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#F1F5F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
              }}
            >
              <CalendarX size={24} strokeWidth={1.6} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#475569" }}>
                No routing data for {filters.date}
              </div>
              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 3 }}>
                No shifts or trips are scheduled for this date and office.
              </div>
            </div>
          </div>
        ) : canFetch && !isError ? (
          <RouteManagementTables
            routePlanningRows={data?.routePlanningRows ?? []}
            tripPublishingRows={data?.tripPublishingRows ?? []}
            loading={loading}
            modals={modals}
            currentDate={filters.date}
            currentShiftId={String(filters.shiftType)}
            planningDropdownActions={dropdownData?.routePlanning ?? []}
            publishingDropdownActions={dropdownData?.routePublishing ?? []}
            locCode={locCode}
          />
        ) : null}
      </div>

      <RouteModalRegistry
        modals={modals}
        onRefresh={refetch}
        onGenerateRoutes={handleGenerateRoutes}
        onCopyRoutes={handleCopyRoutes}
        loginShiftsOptions={loginShiftsOptions}
        // onUpdateTripsheets={handleUpdateTripsheets}
        // onDownloadReport={handleDownloadReport}
        onDownloadRouteData={handleDownloadRouteData}
        onValidateVehicleFile={handleValidateVehicleFile}
        onSmsReviewed={handleSmsReviewed}
      />
    </div>
  );
}
