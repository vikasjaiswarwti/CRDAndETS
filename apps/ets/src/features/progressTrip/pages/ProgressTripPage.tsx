import React, { useEffect, useMemo, useRef, useState } from "react";
import AppHeader from "../../../shared/components/RoutingHeader/RoutingHeader";

import { AppTable } from "../../../shared/components/AppTable/AppTable";
import { ApiStateWrapper } from "../../../shared/components/ApiState/ApiStateWrapper";
import { PageContainer } from "../../../shared/components/PageContainer/PageContainer";
import { DataTableWrapper } from "../../../shared/components/DataTableWrapper/DataTableWrapper";
import SearchFilterWrapper from "../../../shared/components/Search/SearchFilterWrapper";

import { useTripsInProgressTable } from "../hooks/useTripsInProgressTable";
import {
  tripFilterOption,
  LIVE_MERGE_FILTER_IDS,
  tripTypeOption,
} from "../constants/TripOption";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useGetOngoingTripsQuery } from "../services/progressTripApi";
import { selectStyle } from "../../../shared/components/Search/searchCSS";
import TripEmployeeModal from "../components/TripEmployeeModal";
import type { RootState } from "../../../app/store";
import { useSignalRTracking } from "../hooks/useSignalRTracking";
import { mergeTripWithEvent } from "../hooks/mergeTripWithEvent";
import { message, Drawer } from "antd";
import {
  EnvironmentOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import type { OngoingTrip } from "../types/progressTrip.types";
import { clearSelectedTripIds } from "../slice/progressTripsSlice";
import { useNavigate } from "react-router-dom";
import { useLookups } from "../../lookups";
import type { UserShift } from "../../roaster";
import type { TripTypeOption } from "../types/progressTrip.types";
import { useGetUserShiftsQuery } from "../../roaster/services/RosterApi";
import MobileFriendlyRangePicker from "../components/MobileFriendlyRangePicker";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { Popover } from "antd";

const getErrorMessage = (error: any) => {
  if (!error?.data) return "Something went wrong.";

  const errors = error.data.errors;

  if (errors) {
    const firstKey = Object.keys(errors)[0];
    if (firstKey && Array.isArray(errors[firstKey])) {
      return errors[firstKey][0];
    }
  }

  return error.data.title || "Something went wrong.";
};
/** Maps raw UserShift[] -> dropdown options. Kept pure/reusable & unit-testable. */
const mapShiftsToOptions = (shifts: UserShift[]): TripTypeOption[] =>
  shifts.map((s) => ({
    label: s.shiftName,
    value: s.shiftId,
  }));
/**
 * Merges pick + drop shifts for the "Both" trip type.
 * De-duplicates by shiftId; pick shift wins on collision (assumption #3/#7).
 */
const mergeShiftOptions = (
  pick: TripTypeOption[],
  drop: TripTypeOption[],
): TripTypeOption[] => {
  const merged = new Map<number, TripTypeOption>();
  pick.forEach((opt) => merged.set(opt.value, opt));
  drop.forEach((opt) => {
    if (!merged.has(opt.value)) merged.set(opt.value, opt);
  });
  return Array.from(merged.values());
};
const ProgressTripPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { Select, Button } = useUILibrary();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const token = useSelector((store: RootState) => store.auth.accessToken);
  const { businessFullName } = useSelector(
    (state: RootState) => state.business,
  );
  const selectedRowKeys = useSelector(
    (state: RootState) => state.progressTrips.selectedTripIds,
  );
  const { locationOptions } = useLookups({
    only: ["locationOptions"],
  });
  // Ref holds the latest displayedTrips — initialized empty, updated each render
  const latestTripsRef = useRef<OngoingTrip[]>([]);
  const {
    columns,
    tableState,
    setTableState,
    filterType,
    dateRange,
    handleFilterType,
    handleDateRange,
    locCode,
    handleLocCode,
    tripType,
    handleTripType,
    shiftId,
    handleShift,
    queryArgs,
    selectedTrip,
    closeTripModal,
    // ── status column filter ──
    filterByStatus,
  } = useTripsInProgressTable(latestTripsRef.current);

  // Shift API call
  const { data: shiftData } = useGetUserShiftsQuery((locCode as number) ?? 0, {
    skip: !locCode || locCode <= 0,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: tripData,
    isLoading,
    isFetching,
    error,
    isError,
    refetch,
  } = useGetOngoingTripsQuery(queryArgs);
  useEffect(() => {
    if (isError && error) {
      message.error(getErrorMessage(error));
    }
  }, [isError, error]);
  useEffect(() => {
    dispatch(clearSelectedTripIds());
  }, []);

  // console.log(error, "error");
  const { currentLocation, isConnected } = useSignalRTracking(token);
  // console.log(selectedTrip, "selectedTrip");
  const isLiveMergeFilterActive = LIVE_MERGE_FILTER_IDS.has(
    String(filterType ?? ""),
  );
  // const isStartedFilterActive = filterType === STARTED_TRIP_FILTER_ID;
  const pickShiftOptions = useMemo<TripTypeOption[]>(
    () => mapShiftsToOptions(shiftData?.pickShifts ?? []),
    [shiftData?.pickShifts],
  );

  const dropShiftOptions = useMemo<TripTypeOption[]>(
    () => mapShiftsToOptions(shiftData?.dropShifts ?? []),
    [shiftData?.dropShifts],
  );
  const shiftOptions = useMemo<TripTypeOption[]>(() => {
    switch (tripType as number) {
      case 1:
        return pickShiftOptions;
      case 2:
        return dropShiftOptions;
      default:
        return mergeShiftOptions(pickShiftOptions, dropShiftOptions);
    }
  }, [tripType, pickShiftOptions, dropShiftOptions]);

  const displayedTrips = useMemo(() => {
    const trips = tripData?.trips ?? [];

    // 1. Merge live SignalR event into the matching trip row
    const merged =
      !isLiveMergeFilterActive ||
      !currentLocation ||
      currentLocation.dsId == null
        ? trips
        : trips.map((trip) =>
            trip.dsId === currentLocation.dsId
              ? mergeTripWithEvent(trip, currentLocation)
              : trip,
          );

    // 2. Client-side filter by status codes selected in the column header
    //    (no-op when no codes are selected or filterType !== "All")
    return filterByStatus(merged);
  }, [tripData, currentLocation, isLiveMergeFilterActive, filterByStatus]);

  // ✅ Update ref every render — next render the hook sees fresh pageIds
  latestTripsRef.current = displayedTrips;

  // Shared filter fields — rendered inline on desktop, stacked in a Drawer on mobile.
  const renderFilterFields = (fullWidth: boolean) => (
    <>
      <FilterField label={`Select Filter`}>
        <Select
          placeholder="Select type"
          value={filterType}
          onChange={handleFilterType}
          options={tripFilterOption}
          style={{
            ...selectStyle,
            width: fullWidth ? "100%" : "200px",
            fontSize: 14,
          }}
        />
      </FilterField>
      <FilterField label={`From - ToDate`}>
        <MobileFriendlyRangePicker
          allowClear={false}
          value={dateRange}
          onChange={handleDateRange}
          style={{ ...selectStyle, width: fullWidth ? "100%" : undefined }}
        />
      </FilterField>
      <FilterField label={`Select Office`}>
        <Select
          placeholder="Select Office"
          value={locCode as number}
          onChange={handleLocCode}
          options={locationOptions}
          allowClear
          style={{
            ...selectStyle,
            width: fullWidth ? "100%" : "160px",
            fontSize: 14,
          }}
        />
      </FilterField>
      <FilterField label={`Trip Type`}>
        <Select
          placeholder="Select type"
          value={tripType as number}
          onChange={handleTripType}
          options={tripTypeOption}
          allowClear
          style={{
            ...selectStyle,
            width: fullWidth ? "100%" : "120px",
            fontSize: 14,
          }}
        />
      </FilterField>
      <FilterField label={`Select Shift`}>
        <Select
          placeholder="Select Shift"
          value={shiftId as number}
          onChange={handleShift}
          options={shiftOptions}
          allowClear
          style={{
            ...selectStyle,
            width: fullWidth ? "100%" : "120px",
            fontSize: 14,
          }}
        />
      </FilterField>
    </>
  );

  return (
    <>
      <AppHeader
        variant="ongoing"
        title="Track Shift Trips"
        officeName={businessFullName ?? ""}
        onBack={() => history.back()}
        isLive={isConnected ?? false}
      />
      <PageContainer
        title="Track All Trips"
        subtitle="Monitor ongoing trips and view real-time trip details."
        headerActions={
          !isMobile ? <EmployeeStatusInfo isMobile={isMobile} /> : undefined
        }
      >
        <DataTableWrapper
          searchPlaceholder="Search Trip ID"
          onSearch={() => {}}
          showSearch={false}
          pagination={null}
        >
          <SearchFilterWrapper>
            {isMobile ? (
              <div className="flex items-center justify-between gap-2">
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => setFiltersOpen(true)}
                  style={{ border: "1px solid #d9d9d9" }}
                >
                  Filters
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => refetch()}
                    loading={isFetching}
                    style={{
                      border: "1px solid",
                      backgroundColor: "#22C55E22",
                      color: "#15803D",
                    }}
                  >
                    Refresh
                  </Button>
                  {selectedRowKeys.length > 0 && (
                    <Button
                      icon={<EnvironmentOutlined />}
                      onClick={() => navigate("/routing/multiple-trip-view")}
                      type="primary"
                      style={{
                        border: "1px solid #d9d9d9",
                        color: "#fff",
                        backgroundColor: "green",
                      }}
                    >
                      Map
                    </Button>
                  )}
                </div>
                <EmployeeStatusInfo isMobile={isMobile} />
              </div>
            ) : (
              <div className="flex items-end flex-wrap justify-center gap-2">
                {renderFilterFields(false)}
                <div>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => refetch()}
                    loading={isFetching}
                    style={{
                      border: "1px solid",
                      backgroundColor: "#22C55E22",
                      color: "#15803D",
                    }}
                  >
                    Refresh
                  </Button>
                </div>{" "}
                {selectedRowKeys.length > 0 && (
                  <Button
                    icon={<EnvironmentOutlined />}
                    onClick={() => navigate("/routing/multiple-trip-view")}
                    type="primary"
                    style={{
                      border: "1px solid #d9d9d9",
                      color: "#fff",
                      backgroundColor: "green",
                    }}
                  >
                    View On Map
                  </Button>
                )}
              </div>
            )}
          </SearchFilterWrapper>

          <Drawer
            title="Filters"
            placement="bottom"
            height="auto"
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            extra={
              <Button type="primary" onClick={() => setFiltersOpen(false)}>
                Apply
              </Button>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {renderFilterFields(true)}
            </div>
          </Drawer>

          <div
            style={{ overflowY: "auto", overflowX: "hidden", height: "55vh" }}
          >
            <ApiStateWrapper
              isLoading={isLoading}
              isEmpty={!displayedTrips?.length}
              onRetry={refetch}
              emptyMessage="No trips in progress found."
            >
              <AppTable
                loading={isLoading}
                columns={columns}
                dataSource={displayedTrips ?? []}
                rowKey="dsId"
                total={tripData?.totalCount}
                scroll={{ x: 200 }}
                tableState={tableState}
                onTableChange={setTableState}
              />
            </ApiStateWrapper>
          </div>
        </DataTableWrapper>
      </PageContainer>
      <TripEmployeeModal
        open={!!selectedTrip}
        onClose={closeTripModal}
        trip={selectedTrip ?? null}
      />
    </>
  );
};

export default ProgressTripPage;

interface FilterFieldProps {
  label: string;
  children: React.ReactNode;
}

const FilterField: React.FC<FilterFieldProps> = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label
      style={{
        fontSize: 11,
        fontWeight: 500,
        color: "#9CA3AF",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      {label}
    </label>
    {children}
  </div>
);

const EmployeeStatusInfo = ({ isMobile }: { isMobile: boolean }) => {
  return (
    <>
      {!isMobile ? (
        <div
          className="hidden md:flex"
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
            padding: "6px 10px",
            borderRadius: 10,
            border: "1px solid #E5E7EB",
            background: "#F9FAFB",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: 11,
              color: "#6B7280",
              textTransform: "uppercase",
              letterSpacing: "0.4px",
              whiteSpace: "nowrap",
            }}
          >
            Employee Status
          </span>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <StatusInfo color="#4B5563" label="Not Boarded" />
            <StatusInfo color="#FFF200" label="Boarded" />
            <StatusInfo color="#15803D" label="DeBoarded" />
            <StatusInfo color="#B91C1C" label="No Show/Cancelled" />
          </div>
        </div>
      ) : (
        <div className="flex md:hidden">
          <Popover
            trigger="click"
            placement="bottomRight"
            content={<EmployeeStatusInfoContent />}
          >
            <button
              type="button"
              aria-label="Employee status information"
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                background: "#F9FAFB",
                color: "#6B7280",
                cursor: "pointer",
              }}
            >
              <InfoCircleOutlined style={{ fontSize: 17 }} />
            </button>
          </Popover>
        </div>
      )}
    </>
  );
};
const EmployeeStatusInfoContent = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div
      style={{
        fontWeight: 600,
        fontSize: 12,
        color: "#374151",
        marginBottom: 2,
      }}
    >
      Employee Status
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <StatusInfo color="#4B5563" label="Not Boarded" />
      <StatusInfo color="#FFF200" label="Boarded" />
      <StatusInfo color="#15803D" label="DeBoarded" />
      <StatusInfo color="#B91C1C" label="No Show/Cancelled" />
    </div>
  </div>
);
interface StatusInfoProps {
  color: string;
  label: string;
}

const StatusInfo: React.FC<StatusInfoProps> = ({ color, label }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "3px 8px",
      borderRadius: 999,
      background: "#fff",
      border: "1px solid #E5E7EB",
    }}
  >
    <span
      style={{
        width: 8,
        height: 8,
        minWidth: 8,
        borderRadius: "50%",
        backgroundColor: color,
        border: color === "#FFF200" ? "1px solid #D4C900" : "none",
      }}
    />
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "#374151",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  </div>
);
