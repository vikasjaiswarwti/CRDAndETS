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

import { LOB_CONFIG } from "../config";
import { STATUS_MAP } from "../constants/line-of-business-constants";
import type { LineOfBusiness } from "../types/line-of-business.types";

interface UseLineOfBusinessTableOptions {
  onEdit: (record: LineOfBusiness) => void;
}

export function useLineOfBusinessTable({ onEdit }: UseLineOfBusinessTableOptions) {
  // ── Table State ─────────────────────────────────────────────────────────
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  // ── Search State ────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  // ── Handle Search ───────────────────────────────────────────────────────
  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setTableState({ page: 1 });
    },
    [setTableState],
  );

  // ── Query Args ──────────────────────────────────────────────────────────
  const queryArgs = useMemo(
    () => tableStateToQueryArgs(tableState, { searchTerm: search }),
    [tableState, search],
  );

  // ── Columns with Config-Driven Actions ──────────────────────────────────
  const columns = useMemo(() => {
    const actions: any[] = [];

    if (LOB_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    return buildColumns<LineOfBusiness>([
      // col.text("lobCode", "LOB Code", { width: 120, sortable: true }), // Uncomment if needed

      col.text("lobName", "LOB Name", {
        sortable: true,
      }),

      col.status("active", "Status", {
        map: {
          true: STATUS_MAP.active,
          false: STATUS_MAP.inactive,
        },
        width: 130,
      }),

      col.dateTime("createdOn", "Created On", {
        width: 180,
        sortable: true,
      }),

      // Actions column (only if allowed by config)
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