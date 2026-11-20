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
import { STATUS_MAP } from "../constants/processConstants";
import type { Process } from "../types/process.types";
import { PROCESS_CONFIG } from "../config";

interface UseProcessTableOptions {
  onEdit: (record: Process) => void;
}

export const useProcessTable = ({ onEdit }: UseProcessTableOptions) => {
  
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  const [search, setSearch] = useState("");

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setTableState((prev) => ({ ...prev, page: 1 })); // safer than direct object
    },
    [setTableState],
  );

  // ── Columns with Config-Driven Actions ──────────────────────────────────
  const columns = useMemo(() => {
    const actions: any[] = [];

    if (PROCESS_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    return buildColumns<Process>([
      col.text("procode", "Process Code", { width: 160, sortable: true }),

      col.text("proname", "Process Name", { sortable: true }),

      col.status("active", "Status", {
        map: {
          true: STATUS_MAP.active,
          false: STATUS_MAP.inactive,
        },
        width: 120,
      }),

      col.dateTime("createdOn", "Created On", { width: 180 }),

      // Actions column - only rendered if there are actions
      ...(actions.length > 0 ? [col.actions(actions)] : []),
    ]);
  }, [onEdit]);

  const queryArgs = tableStateToQueryArgs(tableState, { searchTerm: search });

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
  };
};
