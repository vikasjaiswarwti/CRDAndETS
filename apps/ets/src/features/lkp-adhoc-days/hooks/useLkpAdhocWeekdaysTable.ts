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

import { ADHOC_CONFIG_CONFIG } from "../config";
import { STATUS_MAP } from "../constants/LkpAdhocWeekDaysConstants";
import type { LkpAdhocWeekDay } from "../types/Lkpadhocweekdays.types";

interface UseLkpAdhocWeekDaysTableOptions {
  onEdit: (record: LkpAdhocWeekDay) => void;
}

export const useLkpAdhocWeekDaysTable = ({
  onEdit,
}: UseLkpAdhocWeekDaysTableOptions) => {
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

    if (ADHOC_CONFIG_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    return buildColumns<LkpAdhocWeekDay>([
      // col.text("locCode", "Location Code", { sortable: true, width: 160 }),

      col.text("daysName", "Day Name", { width: 160 }),

      col.status("active", "Status", {
        map: {
          true: STATUS_MAP.active,
          false: STATUS_MAP.inactive,
        },
        width: 120,
      }),

      col.dateTime("createdOn", "Created On", { width: 180 }),

      // Actions (only if enabled)
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
};
