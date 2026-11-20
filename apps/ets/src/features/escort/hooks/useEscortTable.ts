import { useState, useMemo, useCallback } from "react";
import {
  col,
  buildColumns,
  action,
} from "../../../shared/components/AppTable/AppTable";

import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";

import { ESCORT_CONFIG } from "../config";
import { STATUS_MAP } from "../constants/EscortConstants";
import type { Escort } from "../types/Escort.types";

interface UseEscortTableOptions {
  onEdit: (record: Escort) => void;
}

export function useEscortTable({ onEdit }: UseEscortTableOptions) {
  // Table State
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  // Search State
  const [search, setSearch] = useState("");

  // Handle Search
  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setTableState({ page: 1 });
    },
    [setTableState],
  );

  // Query Args
  const queryArgs = useMemo(
    () => tableStateToQueryArgs(tableState, { searchTerm: search }),
    [tableState, search],
  );

  // Columns
  const columns = useMemo(() => {
    const actions: any[] = [];

    if (ESCORT_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    return buildColumns<Escort>([
      col.text("name", "Escort Name", { sortable: true, width: 260 }),

      col.text("mobileNo", "Mobile", { width: 140 }),
      col.text("emailId", "Email", { width: 200 }),
      col.text("locationName", "Office", { width: 100 }),

      col.status("active", "Status", {
        map: {
          true: STATUS_MAP.active,
          false: STATUS_MAP.inactive,
        },
        width: 120,
      }),

      // col.dateTime("createdOn", "Created On", { width: 180}),

      // Actions
      ...(actions.length > 0 ? [col.actions(actions)] : []),
    ]);
  }, [onEdit]);

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
  };
}
