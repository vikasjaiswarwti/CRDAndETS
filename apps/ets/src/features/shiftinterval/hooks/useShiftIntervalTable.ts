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
import { STATUS_MAP } from "../constants/Shiftintervalconstants";
import type { ShiftInterval } from "../types/shiftinterval.types";
import { SHIFT_INTERVAL_CONFIG } from "../config";

interface UseShiftIntervalTableOptions {
  onEdit: (record: ShiftInterval) => void;
}

export const useShiftIntervalTable = ({
  onEdit,
}: UseShiftIntervalTableOptions) => {
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  const [search, setSearch] = useState("");

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setTableState((prev) => ({ ...prev, page: 1 })); // safer pattern
    },
    [setTableState],
  );

  // ── Columns with Config-Driven Actions ──────────────────────────────────
  const columns = useMemo(() => {
    const actions: any[] = [];

    // Only add edit action if config allows and onEdit is provided
    if (SHIFT_INTERVAL_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    return buildColumns<ShiftInterval>([
      col.text("intervalMinute", "Minutes", { width: 120, sortable: true }),
      col.text("intervalText", "Label", { sortable: true }),
      col.status("active", "Status", {
        map: {
          true: STATUS_MAP.active,
          false: STATUS_MAP.inactive,
        },
        width: 120,
      }),
      // Actions column - only rendered if there are actions defined
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
