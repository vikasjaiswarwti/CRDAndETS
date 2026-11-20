import { useCallback, useMemo, useState } from "react";
import { col } from "../../../shared/components/AppTable/AppTable";
import { useTableState } from "../../../shared/hooks/useTableState";
import type { Booking, BookingListParams } from "../services/BookingApi";

export function useBookingTable() {
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  const [search, setSearch] = useState("");

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setTableState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableState],
  );

  // Field names (pageNumber/pageSize/search) must match the Booking API's
  // actual query params — not the generic page/pageSize used elsewhere.
  const queryArgs = useMemo<BookingListParams>(
    () => ({
      pageNumber: tableState.page,
      pageSize: tableState.pageSize,
      search,
    }),
    [tableState, search],
  );

  const columns = useMemo(
    () => [
      col.dateTime<Booking>("bookedOn", "Date", {
        width: 170,
      }),

      {
        title: "Employee Name",
        dataIndex: "userName",
        key: "userName",
        width: 160,
        render: (v: string | null) => v || "—",
      },

      {
        title: "Employee Code",
        dataIndex: "employeeCode",
        key: "employeeCode",
        width: 120,
        render: (v: string | null) => v || "—",
      },

      {
        title: "Employee Contact",
        dataIndex: "userMobileNumber",
        key: "userMobileNumber",
        width: 140,
        render: (v: string | null) => v || "—",
      },

      {
        title: "Model",
        dataIndex: "modal",
        key: "modal",
        width: 140,
        render: (v: string | null) => v || "—",
      },

      {
        title: "Vehicle No.",
        dataIndex: "vehicleNumber",
        key: "vehicleNumber",
        width: 140,
        render: (v: string | null) => v || "—",
      },

      {
        title: "Driver Name",
        dataIndex: "driverName",
        key: "driverName",
        width: 160,
        render: (v: string | null) => v || "—",
      },

      {
        title: "Driver Number",
        dataIndex: "driverNumber",
        key: "driverNumber",
        width: 150,
        render: (v: string | null) => v || "—",
      },

      {
        title: "Pickup Lat",
        dataIndex: "pickLatitude",
        key: "pickLatitude",
        width: 120,
        render: (v: number) => Number(v).toFixed(6),
      },

      {
        title: "Pickup Lng",
        dataIndex: "pickLongitude",
        key: "pickLongitude",
        width: 120,
        render: (v: number) => Number(v).toFixed(6),
      },

      col.dateTime<Booking>("startTime", "Pickup Time", {
        width: 180,
      }),

      {
        title: "Drop Lat",
        dataIndex: "dropLatitude",
        key: "dropLatitude",
        width: 120,
        render: (v: number) => Number(v).toFixed(6),
      },

      {
        title: "Drop Lng",
        dataIndex: "dropLongitude",
        key: "dropLongitude",
        width: 120,
        render: (v: number) => Number(v).toFixed(6),
      },

      col.dateTime<Booking>("endTime", "Drop Time", {
        width: 180,
      }),

      {
        title: "Purpose",
        dataIndex: "purpose",
        key: "purpose",
        width: 180,
        render: (v: string | null) => v || "—",
      },

      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 120,
      },
    ],
    [],
  );

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
  };
}
