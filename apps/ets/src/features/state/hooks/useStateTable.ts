// hooks/useStateTable.ts

import { useState, useCallback, useMemo } from "react";
import {
  col,
  buildColumns,
  action,
} from "../../../shared/components/AppTable/AppTable";
import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";
import type { State } from "../types/state.types";
import { STATE_CONFIG } from "../config";

interface UseStateTableOptions {
  onEdit: (record: State) => void;
}

export const useStateTable = ({ onEdit }: UseStateTableOptions) => {
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

    if (STATE_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    return buildColumns<State>([
      col.text('stateCode', 'State Code', { width: 130 }),
      col.text('stateName', 'State Name', { width: 250 , sortable: true }),

      col.dateTime("createdOn", "Created On", { width: 180 }),

      // Actions column — only rendered if there are actions
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
