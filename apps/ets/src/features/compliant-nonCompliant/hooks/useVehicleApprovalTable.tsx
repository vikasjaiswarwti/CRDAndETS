import { useMemo, useState, useCallback } from "react";
import {
  col,
  buildColumns,
} from "../../../shared/components/AppTable/AppTable";
import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";
import { APPROVAL_STATUS_MAP } from "../constants/VehicleComplianceConstants";
import type {
  VehicleApproval,
  ApprovalFilterStatus,
} from "../types/Vehiclecompliance.types";

interface Options {
  onReview: (record: VehicleApproval) => void;
}

export function useApprovalDashboardTable({ onReview }: Options) {
  const [tableState, setTableState] = useTableState({
    syncUrl: false,
    defaultPageSize: 10,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusRaw] = useState<
    ApprovalFilterStatus | undefined
  >(undefined);
  const [office, setOffice] = useState<string | undefined>(undefined);

  const handleSearch = useCallback(
    (val: string) => {
      setSearch(val);
      setTableState({ ...tableState, page: 1 });
    },
    [tableState, setTableState],
  );

  const setStatusFilter = useCallback(
    (val: ApprovalFilterStatus | undefined) => {
      setStatusRaw(val);
      setTableState({ ...tableState, page: 1 });
    },
    [tableState, setTableState],
  );

  const queryArgs = useMemo(
    () =>
      tableStateToQueryArgs(tableState, {
        status: statusFilter,
        office,
        searchTerm: search,
      }),
    [tableState, statusFilter, office, search],
  ) as {
    status?: ApprovalFilterStatus;
    office?: string;
    searchTerm: string;
    page: number;
    pageSize: number;
  };

  const columns = useMemo(
    () =>
      buildColumns<VehicleApproval>([
        col.text<VehicleApproval>("vehicleNo", "Vehicle No.", { width: 130 }),
        col.text<VehicleApproval>("vehicleType", "Vehicle Type", {
          width: 110,
        }),

        col.date<VehicleApproval>("registrationExpDate", "RC Expiry", {
          width: 110,
        }),
        col.date<VehicleApproval>("insuranceExpDate", "Insurance Expiry", {
          width: 130,
        }),
        col.date<VehicleApproval>("fitnessExpDate", "Fitness Expiry", {
          width: 120,
        }),
        col.date<VehicleApproval>("pucExpDate", "PUC Expiry", { width: 110 }),
        col.status<VehicleApproval>("status", "Status", {
          map: APPROVAL_STATUS_MAP,
          width: 130,
        }),
        {
          key: "__review__",
          title: "Action",
          width: 90,
          align: "center" as const,
          render: (_: unknown, record: VehicleApproval) => (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReview(record);
              }}
              style={{
                padding: "3px 12px",
                borderRadius: 14,
                border: `1px solid #d9d9d9`,
                background: "#fff",
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "inherit",
              }}
            >
              Review
            </button>
          ),
        },
      ]),
    [onReview],
  );

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    statusFilter,
    setStatusFilter,
    office,
    setOffice,
    queryArgs,
  };
}
