import { useMemo, useState } from "react";
import type { TableState } from "../../../shared/components/AppTable/AppTable";
import { useTableState } from "../../../shared/hooks/useTableState";

// ---- API response types -----------------------------------------------

export interface AdhocApprovalItem {
  empId: number;
  requestID: string;
  userName: string;
  address: string;
  tripDate: string;
  tripType: string;
  shift: string;
  status: string;
  totalCount: number;
}

export interface AdhocApprovalListResult {
  items: AdhocApprovalItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdhocApprovalListResponse {
  result: AdhocApprovalListResult;
  isSuccess: boolean;
  message: string;
}

// ---- Hook ---------------------------------------------------------------

const renderValue = (value: unknown) =>
  value == null || value === "" ? "-" : String(value);

export function useAdhocApprovalTable() {
  const [tableState, setTableState] = useTableState({
    syncUrl: false,
    defaultPageSize: 10,
  });
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);

  const columns = useMemo(
    () => [
      {
        title: "Request ID",
        dataIndex: "requestID",
        key: "requestID",
        render: renderValue,
      },
      {
        title: "Trip Date",
        dataIndex: "tripDate",
        key: "tripDate",
        render: renderValue,
      },
      {
        title: "Employee ID",
        dataIndex: "empId",
        key: "empId",
        render: renderValue,
      },

      {
        title: "Employee Name",
        dataIndex: "userName",
        key: "userName",
        render: renderValue,
      },

      {
        title: "Trip Type",
        dataIndex: "tripType",
        key: "tripType",
        render: renderValue,
      },
      {
        title: "Shift",
        dataIndex: "shift",
        key: "shift",
        render: renderValue,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: renderValue,
      },
    ],
    [],
  );

  const handleTableChange = (next: TableState) => {
    setSelectedIds([]);
    setTableState(next);
  };

  return {
    columns,
    tableState,
    handleTableChange,
    selectedIds,
    setSelectedIds,
  };
}
