import React, { useState, useMemo, useCallback } from "react";
import {
  col,
  buildColumns,
} from "../../../shared/components/AppTable/AppTable";
import { useTableState } from "../../../shared/hooks/useTableState";
import type { OngoingTrip, OngoingTripPassenger } from "../types/progressTrip.types";
import type { OngoingTripsRequest } from "../services/progressTripApi";
import {
  tripFilterOption,
  STARTED_TRIP_FILTER_ID,
  ALL_TRIP_FILTER_ID,
} from "../constants/TripOption";
// import { TeamOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { formatDateDDMMYY } from "../../../shared/utils/date.utils";
import { Send } from "lucide-react";
import { Checkbox, Tooltip, Tag } from "antd";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import {
  clearSelectedTripIds,
  setSelectedTripIds,
} from "../slice/progressTripsSlice";
import StatusFilterHeader from "../components/StatusFilterHeader";

// ── Types ─────────────────────────────────────────────────────────────────────
interface StatusStyle {
  label: string;
  color: string;
  backgroundColor: string;
}

const STATUS_STYLE_MAP: Record<number, StatusStyle> = {
  1: { label: "Route Created", color: "#4B5563", backgroundColor: "#F3F4F6" },
  2: { label: "Published Not Yet Started", color: "#1D4ED8", backgroundColor: "#DBEAFE" },
  3: { label: "Started", color: "#B45309", backgroundColor: "#FEF3C7" },
  4: { label: "Completed", color: "#15803D", backgroundColor: "#DCFCE7" },
  5: { label: "Completed", color: "#15803D", backgroundColor: "#DCFCE7" },
  6: { label: "Completed", color: "#15803D", backgroundColor: "#DCFCE7" },
  7: { label: "Cancelled", color: "#B91C1C", backgroundColor: "#FEE2E2" },
  9: { label: "Cancelled", color: "#B91C1C", backgroundColor: "#FEE2E2" },
};

const DEFAULT_STATUS_STYLE: StatusStyle = {
  label: "Unknown",
  color: "#374151",
  backgroundColor: "#F3F4F6",
};
const PassengerIconStyle = {
  width: 28,
  height: 40,
}

export const getStatusStyle = (statusCode: number): StatusStyle =>
  STATUS_STYLE_MAP[statusCode] ?? DEFAULT_STATUS_STYLE;

interface PaxStatusMeta {
  label: string;
  color: string;
}

// Normalizes backend status strings ("Not-Boarded", "No Show", "DeBoarded", ...)
// to the four tracking buckets used for the passenger icon colors.
const getPaxStatusMeta = (status: string | null | undefined): PaxStatusMeta => {
  const s = (status ?? "").toLowerCase().replace(/[-_\s]/g, "");
  if (s === "boarded" || s === "enroute") return { label: "Boarded", color: "#fff200" };
  if (s === "deboarded" || s === "signedout" || s === "dropped" || s == "tripcompleted")
    return { label: "De-Boarded", color: "#15803D" };
  if (s === "noshow") return { label: "No Show", color: "#B91C1C" };
  return { label: "Not Boarded", color: "#4B5563" };
};

const STATUS_BADGE_STYLE: Record<string, { color: string; backgroundColor: string }> = {
  Boarded: { color: "#92610E", backgroundColor: "#FEF3C7" },
  "De-Boarded": { color: "#15803D", backgroundColor: "#DCFCE7" },
  "No Show": { color: "#B91C1C", backgroundColor: "#FEE2E2" },
  "Not Boarded": { color: "#4B5563", backgroundColor: "#F3F4F6" },
};

// const stepCheckSvg = (done: boolean) =>
//   done
//     ? `<svg width="12" height="12" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#16A34A"/><path d="M6 10.3l2.6 2.6L14.2 7" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`
//     : `<svg width="12" height="12" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="9" fill="#fff" stroke="#D1D5DB" stroke-width="1.5"/></svg>`;

const statusPill = (label: string) => {
  const style = STATUS_BADGE_STYLE[label] ?? STATUS_BADGE_STYLE["Not Boarded"];
  return React.createElement(
    "span",
    {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 6px",
        borderRadius: 999,
        background: style.backgroundColor,
        color: style.color,
        fontSize: 9,
        fontWeight: 600,
        whiteSpace: "nowrap",
      },
    },
    React.createElement("span", {
      style: {
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: style.color,
        display: "inline-block",
      },
    }),
    label,
  );
};

const timelineStep = (
  label: string,
  time: string,
) =>
  React.createElement(
    "div",
    { style: { display: "flex", alignItems: "stretch" } },
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", alignItems: "center", marginRight: 4, minHeight: "100%" } },
    ),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flex: 1,
          gap: 8,
          // paddingBottom: 14,
        },
      },
      React.createElement(
        "span",
        { style: { color: "#fff", fontWeight: 500, fontSize: 12 } },
        label,
      ),
      React.createElement(
        "span",
        { style: { color: "#fff", fontSize: 12 } },
        time,
      ),
    ),
  );

// Rich tooltip content for a single passenger icon: a timeline card with the
// planned/cab-reached/boarding/de-boarding/reached-home steps.
const renderPassengerTooltipContent = (
  pax: OngoingTripPassenger,
  fullName: string,
) => {
  const steps: Array<{ label: string; time: string | null | undefined }> = [
    { label: "ETA", time: pax.plannedScheduleTime },
    { label: "Cab Reached", time: pax.cabReachedTime },
    { label: "Boarding Time", time: pax.signinTime },
    { label: "De-Boarding Time", time: pax.signOutTime },
  ];

  return React.createElement(
    "div",
    { style: { width: 200 }, onClick: (e: any) => e.stopPropagation() },
    React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 } },
      React.createElement(
        "span",
        { style: { fontWeight: 600, fontSize: 13, color: "#fff" } },
        fullName || "-",
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          },
        },
        React.createElement(
          "span",
          { style: { fontSize: 11, color: "#9CA3AF" } },
          `Emp ID: ${pax.empId}`,
        ),
        pax.noShow ? statusPill(pax.noshowReason?.trim() || "-") : statusPill(pax.paxTrackingStatus || "—"),
      ),
    ),
    React.createElement(
      "div",
      null,
      steps.map((s) =>
        timelineStep(
          s.label,
          s.time ? getTime(s.time) : "—",
        ),
      ),
    ),
  );
};

// Preferred: one icon per real passenger, colored/tooltipped by their actual tracking status.
const renderPassengerIcons = (passengers: OngoingTripPassenger[]) =>
  React.createElement(
    "div",
    { style: { display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" } },
    [...passengers]
      .sort((a, b) => a.paxOrder - b.paxOrder)
      .map((pax) => {
        const { color } = getPaxStatusMeta(pax.paxTrackingStatus);
        const fullName = `${pax.firstname ?? ""} ${pax.lastName ?? ""}`.trim();
        const GenderIcon = pax.gender === "Female" ? WomenIcons : ManIcons;
        return React.createElement(
          Tooltip,
          {
            key: pax.empId,
            title: renderPassengerTooltipContent(pax, fullName),
            overlayStyle: { maxWidth: 260 },
            overlayInnerStyle: {
              padding: 10,
              borderRadius: 8,
              boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            },
          },
          React.createElement("span", {
            style: { display: "inline-flex", alignItems: "center", cursor: "pointer" },
            // onClick: (e: any) => e.stopPropagation(),
            dangerouslySetInnerHTML: {
              __html: GenderIcon({ ...PassengerIconStyle, color }),
            },
          }),
        );
      }),
  );

// Fallback for responses without a per-passenger breakdown: render anonymous
// icons from the aggregate counts (boarded / deboarded / no-show / remaining).
const renderCountBasedIcons = (record: OngoingTrip) =>
  React.createElement(
    "div",
    { style: { display: "flex", alignItems: "center", gap: 2 } },
    React.createElement(
      "span",
      { style: { display: "flex", alignItems: "center", gap: 2 } },
      Array.from({ length: record.deBoardedCount }, (_, index) =>
        React.createElement(
          Tooltip,
          { title: "DeBoarded", key: `deBoarded-${index}` },
          React.createElement("span", {
            style: { display: "inline-flex", alignItems: "center", cursor: "pointer" },
            onClick: (e: any) => e.stopPropagation(),
            dangerouslySetInnerHTML: {
              __html: ManIcons({ ...PassengerIconStyle, color: "#15803D" }),
            },
          }),
        ),
      ),
    ),
    React.createElement(
      "span",
      { style: { display: "flex", alignItems: "center", gap: 2 } },
      Array.from(
        { length: record.boardedCount - Number(record.deBoardedCount ?? 0) },
        (_, index) =>
          React.createElement(
            Tooltip,
            { title: "Boarded", key: `boarded-${index}` },
            React.createElement("span", {
              style: { display: "inline-flex", alignItems: "center", cursor: "pointer" },
              onClick: (e: any) => e.stopPropagation(),
              dangerouslySetInnerHTML: {
                __html: ManIcons({ ...PassengerIconStyle, color: "#fff200" }),
              },
            }),
          ),
      ),
    ),
    React.createElement(
      "span",
      { style: { display: "flex", alignItems: "center", gap: 2, color: "#4B5563" } },
      Array.from(
        {
          length: Math.max(
            Number(record.paxCount) -
            (Number(record.noShowCount) +
              Number(record.boardedCount) +
              Number(record.deBoardedCount ?? 0)),
            0,
          ),
        },
        (_, index) =>
          React.createElement(
            Tooltip,
            { key: `pax-${index}`, title: "Not Boarded", placement: "top" },
            React.createElement("span", {
              style: { display: "inline-flex", alignItems: "center", fontSize: 14, cursor: "pointer" },
              onClick: (e: any) => e.stopPropagation(),
              dangerouslySetInnerHTML: {
                __html: ManIcons({ ...PassengerIconStyle, color: "#4B5563" }),
              },
            }),
          ),
      ),
    ),
    React.createElement(
      "span",
      { style: { display: "flex", alignItems: "center", gap: 2 } },
      Array.from({ length: Number(record.noShowCount) || 0 }, (_, index) =>
        React.createElement(
          Tooltip,
          { key: `no-show-${index}`, title: "No Show", placement: "top" },
          React.createElement("span", {
            style: { display: "inline-flex", alignItems: "center", cursor: "pointer" },
            onClick: (e: any) => e.stopPropagation(),
            dangerouslySetInnerHTML: {
              __html: ManIcons({ ...PassengerIconStyle, color: "#B91C1C" }),
            },
          }),
        ),
      ),
    ),
  );

const renderEmployeeStatusCell = (
  record: OngoingTrip,
  onCellClick: (record: OngoingTrip) => void,
) => {
  const passengers = record.passengers;
  const hasPassengerDetails = Array.isArray(passengers) && passengers.length > 0;
  const hasGuard = record.isGuard || false;
  const guardDetails = [record.guardName, record.guardMobileNo]
    .filter(Boolean)
    .join(" · ");

  return React.createElement(
    "div",
    {
      onClick: () => onCellClick(record),
      style: {
        cursor: "pointer",
        fontSize: 13,
        display: "flex",
        alignItems: "center",
        gap: 4,
      },
    },
    record.paxCount > 7
      ? React.createElement(
        "span",
        { style: { color: "#1D4ED8", textDecoration: "underline" } },
        `${record.paxCount}(${record.boardedCount} / ${record.noShowCount})`,
      )
      : hasPassengerDetails
        ? renderPassengerIcons(passengers as OngoingTripPassenger[])
        : renderCountBasedIcons(record),
    hasGuard &&
    React.createElement(
      Tooltip,
      {
        title: guardDetails ? `Guard: ${guardDetails}` : "Guard required",
        placement: "top",
      },
      React.createElement("span", {
        "aria-label": "Guard",
        style: { display: "inline-flex", alignItems: "center" },
        dangerouslySetInnerHTML: {
          __html: GuardIcons({ width: 28, height: 36 }),
        },
      }),
    ),
  );
};

const cellStyle: React.CSSProperties = { fontSize: 12 };

const DEFAULT_FILTER_TRIP_TYPE: string | undefined = tripFilterOption[0]?.value;
const getDefaultDateRange = (): [Dayjs, Dayjs] => [dayjs(), dayjs()];

export const getTime = (dateTime?: string | null): string => {
  if (!dateTime) return "-";
  return new Date(dateTime).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useTripsInProgressTable = (pageData: OngoingTrip[] = []) => {
  const dispatch = useDispatch();
  const selectedRowKeys = useSelector(
    (state: RootState) => state.progressTrips.selectedTripIds,
  );

  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });
  const [selectedTrip, setSelectedTrip] = useState<OngoingTrip | null>(null);
  const [search, setSearch] = useState("");
  const [locCode, setLocCode] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string | undefined>(DEFAULT_FILTER_TRIP_TYPE);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>(getDefaultDateRange());
  const [shiftId, setShiftId] = useState<number | null>(null);
  const [tripType, setTripType] = useState<number | null>(null);

  // ── Status column filter ──────────────────────────────────────────────────
  const [statusFilterCodes, setStatusFilterCodes] = useState<number[]>([]);

  const isStartedFilterActive = filterType === STARTED_TRIP_FILTER_ID;
  const isAllFilterActive = filterType === ALL_TRIP_FILTER_ID;

  // Returns only rows whose statusCode is selected; pass-through when nothing selected
  const filterByStatus = useCallback(
    (trips: OngoingTrip[]): OngoingTrip[] => {
      if (!isAllFilterActive || statusFilterCodes.length === 0) return trips;
      const matched: OngoingTrip[] = [];
      const rest: OngoingTrip[] = [];
      trips.forEach((t) =>
        statusFilterCodes.includes(t.statusCode)
          ? matched.push(t)
          : rest.push(t),
      );
      return [...matched, ...rest];
    },
    [isAllFilterActive, statusFilterCodes],
  );


  const handleStatusFilterChange = useCallback((codes: number[]) => {
    setStatusFilterCodes(codes);
  }, []);

  // ── Checkbox handlers ─────────────────────────────────────────────────────
  const toggleRow = useCallback(
    (dsId: number, checked: boolean) => {
      const next = checked
        ? [...selectedRowKeys, dsId]
        : selectedRowKeys.filter((id: any) => id !== dsId);
      dispatch(setSelectedTripIds(next));
    },
    [dispatch, selectedRowKeys],
  );

  const pageIds = useMemo(
    () =>
      pageData
        .filter((trip) => trip.statusCode === 3)
        .map((r) => r.dsId)
        .filter((id): id is number => id != null),
    [pageData],
  );
  const allPageChecked =
    pageIds.length > 0 && pageIds.every((id) => selectedRowKeys.includes(id));
  const somePageChecked =
    !allPageChecked && pageIds.some((id) => selectedRowKeys.includes(id));

  const toggleAll = useCallback(
    (checked: boolean) => {
      const next = checked
        ? [...new Set([...selectedRowKeys, ...pageIds])]
        : selectedRowKeys.filter((id) => !pageIds.includes(id));
      dispatch(setSelectedTripIds(next));
    },
    [dispatch, selectedRowKeys, pageIds],
  );

  const clearSelection = useCallback(() => {
    dispatch(clearSelectedTripIds());
  }, [dispatch]);

  // ── Filter handlers ───────────────────────────────────────────────────────
  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setTableState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableState],
  );

  // Clear the status column filter when switching away from "All"
  const handleFilterType = useCallback(
    (value?: string) => {
      setFilterType(value);
      if (value !== ALL_TRIP_FILTER_ID) setStatusFilterCodes([]);
      setTableState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableState],
  );
  const handleTripType = useCallback(
    (value: number) => {
      setTripType(value);
      setTableState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableState],
  );
  const handleLocCode = useCallback(
    (value: number) => {
      setLocCode(value);
      setTableState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableState],
  );
  const handleShift = useCallback(
    (value: number) => {
      setShiftId(value);
      setTableState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableState],
  );

  const handleDateRange = useCallback(
    (dates: [Dayjs | null, Dayjs | null]) => {
      setDateRange(dates);
      setTableState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableState],
  );

  const handleTripCellClick = useCallback((record: OngoingTrip) => {
    setSelectedTrip(record);
  }, []);

  const closeTripModal = useCallback(() => setSelectedTrip(null), []);

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = useMemo(() => {
    const selectionColumn = {
      key: "checkbox",
      dataIndex: "checkbox",
      width: 48,
      title: React.createElement(Checkbox, {
        checked: allPageChecked,
        indeterminate: somePageChecked,
        onChange: (e: any) => toggleAll(e.target.checked),
      }),
      render: (_val: unknown, record: OngoingTrip) =>
        React.createElement(Checkbox, {
          checked: selectedRowKeys.includes(record?.dsId as number),
          onChange: (e: any) => toggleRow(record?.dsId as number, e.target.checked),
          onClick: (e: any) => e.stopPropagation(),
        }),
    };

    const built = buildColumns<OngoingTrip>([
      ...(isStartedFilterActive ? [selectionColumn] : []),

      col.text("dsId", "Trip ID", {
        width: 100,
        render: (_val: unknown, record: OngoingTrip) =>
          React.createElement(
            "a",
            {
              href: `/routing/route-tracking?dsId=${record.dsId}`,
              target: "_blank",
              style: {
                fontSize: 13,
                color: "#1d4ed8",
                display: "flex",
                gap: 3,
                alignItems: "center",
                textDecoration: "underline",
              },
            },
            record.dsId,
            React.createElement(Send, { size: 12 }),
          ) as any,
      }),
      col.text("totalPax", "Total Pax", {
        width: 80,
      }),
      col.text("totalPax", "Employee Status", {
        width: 210,
        render: (_val: unknown, record: OngoingTrip) =>
          renderEmployeeStatusCell(record, handleTripCellClick),
      }),

      col.text("statusName", "Trip Status", {
        width: 140,
        render: (_val: any, record: OngoingTrip) => {
          const { color, backgroundColor } = getStatusStyle(record.statusCode);
          return React.createElement(
            "span",
            {
              style: {
                ...cellStyle,
                color,
                backgroundColor,
                padding: "2px 10px",
                borderRadius: "12px",
                fontWeight: 500,
                display: "inline-block",
              },
            },
            record.statusName,
          ) as any;
        },
      }),

      col.text("shiftTime", "Shift/Trip Type", {
        width: 150,
        render: (_val: any, record: OngoingTrip) =>
          React.createElement(
            "span",
            { style: cellStyle },
            `${record.shiftTime ?? "-"} / ${record.tripType == 1 ? "Login" : "Logout"}`,
          ) as any,
      }),

      col.text("vehicleNo", "Vehicle", {
        width: 100,
        render: (_val: any, record: OngoingTrip) =>
          React.createElement(
            "span",
            { style: cellStyle },
            `${record.vehicleNo ?? "-"}`,
          ) as any,
      }),
      col.text("driverName", "Driver Name", {
        width: 220,
        render: (_val: any, record: OngoingTrip) =>
          React.createElement(
            "span",
            { style: cellStyle },
            `${record.driverName ?? "-"}`,
          ) as any,
      }),
      col.text("driverNumber", "Driver No.", {
        width: 140,
      }),

      col.text("dsDate", "Trip Date", {
        width: 120,
        render: (_val: any, record: OngoingTrip) =>
          React.createElement(
            "span",
            { style: cellStyle },
            `${formatDateDDMMYY(record.dsDate) ?? "-"}`,
          ) as any,
      }),

      col.text("shiftTime", "Planned Start/End Time", {
        width: 230,
        render: (_val: any, record: OngoingTrip) =>
          React.createElement(
            "span",
            { style: cellStyle },
            `${getTime(record.scheduledStartTime)} / ${getTime(record.scheduledEndTime)}`,
          ) as any,
      }),

      col.text("shiftTime", "Actual Start/End Time", {
        width: 240,
        render: (_val: any, record: OngoingTrip) =>
          React.createElement(
            "span",
            { style: cellStyle },
            `${getTime(record.actualStartTime)} / ${getTime(record.actualEndTime)}`,
          ) as any,
      }),

      col.text("vendorName", "Vendor", {
        width: 200,
        render: (_val: any, record: OngoingTrip) =>
          React.createElement(
            "span",
            { style: cellStyle },
            `${record.vendorName ?? "-"}`,
          ) as any,
      }),
      col.text("isGuard", "Guard Required", {
        width: 160,
        render: (_val: any, record: OngoingTrip) =>
          React.createElement(
            Tag,
            {
              color: record.isGuard ? "green" : "default",
              style: { margin: 0 },
            },
            record.isGuard ? "Yes" : "No",
          ) as any,
      }),
      col.text("guardName", "Guard", {
        width: 200,
        render: (_val: any, record: OngoingTrip) =>
          React.createElement(
            "span",
            { style: cellStyle },
            `${record.guardName ?? "-"}`,
          ) as any,
      }),
      col.text("guardMobileNo", "Guard No.", {
        width: 160,
        render: (_val: any, record: OngoingTrip) =>
          React.createElement(
            "span",
            { style: cellStyle },
            `${record.guardMobileNo ?? "-"}`,
          ) as any,
      }),
    ]);

    return built.map((c) => {
      // Inject the interactive filter header on the "Trip Status" column for "All" filter
      if (c.key === "statusName" && isAllFilterActive) {
        return {
          ...c,
          title: React.createElement(StatusFilterHeader, {
            selectedCodes: statusFilterCodes,
            onChange: handleStatusFilterChange,
          }),
        };
      }
      // All other columns: wrap plain string titles in a sized span
      return {
        ...c,
        title:
          typeof c.title === "string"
            ? React.createElement("span", { style: { fontSize: 13 } }, c.title)
            : c.title,
      };
    });
  }, [
    allPageChecked,
    somePageChecked,
    selectedRowKeys,
    toggleAll,
    toggleRow,
    handleTripCellClick,
    isStartedFilterActive,
    isAllFilterActive,
    statusFilterCodes,
    handleStatusFilterChange,
  ]);

  const queryArgs = useMemo<OngoingTripsRequest>(
    () => ({
      searchDsId: search.trim() !== "" ? search.trim() : null,
      filterId: filterType,
      fromDate: dateRange[0]?.format("YYYY-MM-DD"),
      toDate: dateRange[1]?.format("YYYY-MM-DD"),
      tripType: tripType,
      shiftId: shiftId,
      locCode: locCode,
    }),
    [search, filterType, dateRange, locCode, tripType, shiftId],
  );

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
    filterType,
    dateRange,
    selectedTrip,
    closeTripModal,
    handleFilterType,
    handleDateRange,
    selectedRowKeys,
    clearSelection,
    locCode,
    handleLocCode,
    shiftId,
    handleShift,
    tripType,
    handleTripType,
    filterByStatus,
  };
};
const ManIcons = ({
  width = 32,
  height = 36,
  color = "#4B5563",
}: {
  width?: number;
  height?: number;
  color?: string;
}) => {
  return `
  <svg width="${width}px"
height="${height}px" viewBox="-15.14 0 47.753 47.753" xmlns="http://www.w3.org/2000/svg">
  <path fill="${color}" id="_20" data-name="20" d="M270.333,630.217h-3.194V616.968h-.718v31.2h-4.505V630.243h-.646v17.924h-4.5v-31.2h-.718v13.249h-3.194V615.683h.016v-.908c0-2.962,5.78-4.388,8.724-4.388s8.724,1.426,8.724,4.388v.908h.016Zm-8.578-21.847a3.978,3.978,0,1,1,4.038-3.978A4.02,4.02,0,0,1,261.755,608.37Z" transform="translate(-252.853 -600.414)"  fill-rule="evenodd"/>
</svg>
`;
};

export const WomenIcons = ({
  width = 32,
  height = 36,
  color = "#F43F5E",
}: {
  width?: number;
  height?: number;
  color?: string;
}) => {
  return `
<svg fill="${color}" width="${width}" height="${height}" viewBox="0 0 50 50" version="1.2" baseProfile="tiny" xmlns="http://www.w3.org/2000/svg" overflow="inherit"><circle cx="22.875" cy="4.625" r="4.125"/><path d="M32.913 32l-5.909-16.237-.034-.167c0-.237.199-.429.447-.429.211 0 .388.141.435.329l4.017 10.504c.267.601 1.365 1 2.087 1 .965 0 1.065-1.895 1.044-2l-4.017-10.357c-.349-2.321-2.693-4.643-5.368-4.643h-5.235c-2.675 0-5.193 2.322-5.542 4.643l-3.837 10.357c-.087.199 0 2 1.043 2 .811 0 1.89-.283 2.087-1l3.875-10.549c.062-.166.228-.284.421-.284.247 0 .446.192.446.428l-.028.153-5.757 16.252c-.011.048 0 .951 0 1 0 .346.835 1 1.198 1h3.714v13.095c0 1.04.916 1.905 2 1.905s2-.866 2-1.905v-13.104c0-.283 2-.274 2 .009v13c0 1.04.917 2 2 2 1.086 0 2-.961 2-2v-13h3.869c.362 0 1.044-.654 1.044-1 0-.08.029-.931 0-1z"/></svg>
  `}

export const GuardIcons = ({
  width = 42,
  height = 48,
  color = "#F43F5E",
}) => {
  return `<svg fill="${color}" width="${width}" height="${height}" aria-labelledby="police-icon-title police-icon-description" viewBox="0 0 220 344" xmlns="http://www.w3.org/2000/svg"><path fill="#fff" d="M0 0h220v344H0z"/><g fill="#35414c"><path d="M79 62h62v11c0 17.5-13.9 31.7-31 31.7S79 90.5 79 73zm-8.8-19.9c.7-4.2 4.1-7.4 7.8-9.2l25.8-9.3a18.4 18.4 0 0 1 12.4 0l25.8 9.3c3.7 1.8 7.1 5 7.8 9.2.8 4.8-2.7 8-7.4 10.1v7.2H77.6v-7.2c-4.7-2.1-8.2-5.3-7.4-10.1"/><path d="M76 57.7h68a2.5 2.5 0 0 1 0 5H76a2.5 2.5 0 0 1 0-5m5.7 55.3h17.8l7.6 11.7-7.8 47.8 10.7 11.2 10.7-11.2-7.8-47.8 7.6-11.7h17.8c18.5 0 33.5 15 33.5 33.5v75.8c0 6.4-5.2 11.7-11.7 11.7s-11.7-5.3-11.7-11.7v-51.8a3.2 3.2 0 0 0-6.4 0V303a3 3 0 0 1-3 3H81a3 3 0 0 1-3-3V170.5a3.2 3.2 0 0 0-6.4 0v51.8c0 6.4-5.2 11.7-11.7 11.7s-11.7-5.3-11.7-11.7v-75.8c0-18.5 15-33.5 33.5-33.5"/></g><path d="M110 31.1c2.4 2.4 5.3 3.5 8.5 3.9v5.1c0 5.3-3.5 9-8.5 10.7-5-1.7-8.5-5.4-8.5-10.7V35c3.2-.4 6.1-1.5 8.5-3.9m-8 81.9 8 11.7 8-11.7-4.7 13 7.4 46.5-10.7 11.2-10.7-11.2 7.4-46.5zm35.5 23.5c2.9 2.8 6.4 4.1 10.2 4.6v6.1c0 6.4-4.2 10.8-10.2 12.9-6-2.1-10.2-6.5-10.2-12.9v-6.1c3.8-.5 7.3-1.8 10.2-4.6" fill="#fff"/></svg>`
}