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
import { STATUS_MAP } from "../constants/Lkptriptypeconstants";
import type { LkpTripType } from "../types/Lkptriptype";
import { LKP_TRIP_TYPE_CONFIG } from "../config";

interface UseLkpTripTypeTableOptions {
  onEdit: (record: LkpTripType) => void;
}

export const useLkpTripTypeTable = ({ onEdit }: UseLkpTripTypeTableOptions) => {
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

    if (LKP_TRIP_TYPE_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    return buildColumns<LkpTripType>([
      col.text("tripTypeName", "Trip Type Name", { sortable: true }),

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
