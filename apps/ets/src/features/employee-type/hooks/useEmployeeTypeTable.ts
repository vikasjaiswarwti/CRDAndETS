// src/features/menu-management/hooks/useEmployeeTypeTable.ts

import { useMemo, useState, useCallback } from "react";
import {
  col,
  buildColumns,
  action,
} from "../../../shared/components/AppTable/AppTable";
import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";
import { STATUS_MAP } from "../constants/Employeetypeconstants";
import { EMPLOYEE_TYPE_CONFIG } from "../config";
import type { EmployeeType } from "../types/emplType.types";

interface UseEmployeeTypeTableOptions {
  onEdit: (record: EmployeeType) => void;
}

export const useEmployeeTypeTable = ({
  onEdit,
}: UseEmployeeTypeTableOptions) => {
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

  // ── Columns with Config-Driven Actions ──────────────────────────────────
  const columns = useMemo(() => {
    const actions: any[] = [];

    if (EMPLOYEE_TYPE_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    return buildColumns<EmployeeType>([
      col.text("empType", "Employee Type", { width: 200, sortable: true }),

      col.text("description", "Description", { sortable: true }),

      col.status("isActive", "Status", {
        map: {
          true: STATUS_MAP.active,
          false: STATUS_MAP.inactive,
        },
        width: 120,
      }),

      col.dateTime("createdOn", "Created On", { width: 180 }),

      // Actions column - only if there are actions
      ...(actions.length > 0 ? [col.actions(actions)] : []),
    ]);
  }, [onEdit]);

  const queryArgs = useMemo(
    () => tableStateToQueryArgs(tableState, { searchTerm: search }),
    [tableState, search],
  );

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
  };
};
