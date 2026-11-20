import { useEffect, useMemo, useRef, useState } from "react";
import type { ColumnsType } from "antd/es/table";
import { Select, Tag } from "antd";
import type { EscortTrip, EscortOption } from "../types/escort.types";
import dayjs from "dayjs";
import { T } from "../../../../styles/tokens";
import { Send } from "lucide-react";
interface EscortQueryArgs {
  locCode?: number;
  tripType?: number;
  shiftId?: number;
  tripDate?: string;
}

interface Options {
  escorts: EscortOption[];
  locationOptions: { label: string; value: number }[];
  onAssignEscort: (tripId: number, escortId: number) => void;
  isAssigning?: boolean;
}

export const useEscortDashboardTable = ({
  escorts,
  locationOptions,
  onAssignEscort,
  isAssigning,
}: Options) => {
  const [queryArgs, setQueryArgs] = useState<EscortQueryArgs>({
    tripType: 1,
    tripDate: dayjs().format("YYYY-MM-DD"),
  });
  const [tableState, setTableState] = useState({ page: 1, pageSize: 10 });
  // Select the first office once lookups arrive — fire once, don't clobber later edits
  const didInitLoc = useRef(false);
  useEffect(() => {
    if (didInitLoc.current || !locationOptions?.length) return;
    didInitLoc.current = true;
    setQueryArgs((p) => ({ ...p, locCode: locationOptions[0].value }));
  }, [locationOptions]);
  // Changing office/type clears the dependent shift, same as vendor page
  const handleLocCodeChange = (value: number) =>
    setQueryArgs((p) => ({ ...p, locCode: value }));
  const handleTripTypeChange = (value: number) =>
    setQueryArgs((p) => ({ ...p, tripType: value }));
  const handleShiftIdChange = (value: number) =>
    setQueryArgs((p) => ({ ...p, shiftId: value }));
  const handleTripDateChange = (value: string) =>
    setQueryArgs((p) => ({ ...p, tripDate: value }));

  const escortOptions = useMemo(
    () => escorts.map((e) => ({ label: e.Name, value: e.EscortId })),
    [escorts],
  );
  const navigateToTracking = (dsId: number) => {
    window.open(`/routing/route-tracking?dsId=${dsId}`, "_blank");
  };

  const columns: ColumnsType<EscortTrip> = useMemo(() => {
    return [
      {
        title: "Trip ID",
        dataIndex: "TripId",
        key: "TripId",
        width: 90,
        render: (tripId: number) => (
          <button
            type="button"
            onClick={() => navigateToTracking(tripId)}
            style={{
              padding: 0,
              border: 0,
              background: "transparent",
              color: T.accent ?? "#1677ff",
              cursor: "pointer",
              textDecoration: "underline",
              display: "flex",
              alignItems: "center",
            }}
          >
            {tripId} <Send size={12} />
          </button>
        ),
      },
      { title: "Date", dataIndex: "TripDate", key: "TripDate", width: 130 },
      {
        title: "Shift",
        dataIndex: "ShiftTime",
        key: "ShiftTime",
        width: 160,
        render: (_val: string, data) => (
          <span>
            {data.ShiftTime}({data.TripType})
          </span>
        ),
      },
      {
        title: "Vehicle No.",
        dataIndex: "Vehicle_Registration_No",
        key: "Vehicle_Registration_No",
        width: 140,
        render: (val: string) => <span>{val ? val : "-"}</span>,
      },
      {
        title: "Driver Name",
        dataIndex: "DriverName",
        key: "DriverName",
        width: 180,
        render: (val: string) => <span>{val ? val : "-"}</span>,
      },
      {
        title: "Driver No.",
        dataIndex: "DriverMobileNo",
        key: "DriverMobileNo",
        width: 120,
        render: (val: string) => <span>{val ? val : "-"}</span>,
      },
      {
        title: "Guard Required",
        dataIndex: "GaurdRequired",
        key: "GaurdRequired",
        width: 150,
        render: (val: string) => (
          <Tag color={val === "Yes" ? "red" : "default"}>{val}</Tag>
        ),
      },
      {
        title: "Assigned Escort",
        key: "Escort",
        width: 210,
        render: (_: unknown, record: EscortTrip) => (
          <Select
            style={{ width: 190, background: T.formcss.inputBg }}
            placeholder="Assign escort"
            options={escortOptions}
            value={record.EscortId || undefined}
            loading={isAssigning}
            onChange={(escortId: number) =>
              onAssignEscort(record.TripId, escortId)
            }
          />
        ),
      },
    ];
  }, [escortOptions, isAssigning, onAssignEscort]);

  return {
    columns,
    queryArgs,
    tableState,
    setTableState,
    handleLocCodeChange,
    handleTripTypeChange,
    handleShiftIdChange,
    handleTripDateChange,
  };
};
