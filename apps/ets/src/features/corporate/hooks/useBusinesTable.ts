import { useState, useMemo } from "react";
import {
  col,
  buildColumns,
  action,
} from "../../../shared/components/AppTable/AppTable";
import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";
import type { Business } from "../types/Business.types";

interface UseBusinessTableOptions {
  onEdit: (record: Business) => void;
  // onDelete?: (record: Business) => void; // Uncomment when delete is supported
}

export function useBusinessTable({ onEdit }: UseBusinessTableOptions) {
  // ── URL-synced pagination / sort ──────────────────────────────────────────
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  // ── Search — separate from tableState so it resets page correctly ─────────
  const [search, setSearch] = useState("");

  const handleSearch = (value: string) => {
    setSearch(value);
    setTableState({ page: 1 }); // always reset to page 1 on new search
  };

  // ── Query args derived from table state + search ──────────────────────────
  const queryArgs = tableStateToQueryArgs(tableState, { searchTerm: search });

  // ── Column definitions — stable via useMemo + buildColumns ────────────────
  const columns = useMemo(
    () =>
      buildColumns<Business>([
        col.text("businessFullName", "Full Name"),
        col.text("businessShortName", "Short Name", { width: 140 }),
        // col.text("businessId", "Biz ID", { width: 90 }),
        // col.text("serviceID", "Service ID", { width: 100 }),
        // col.text("businessUrl", "URL"),
        // col.text("updation_Lmit", "Update Limit", { width: 120 }),
        // col.text("scheduleUpdateVersion", "Schedule Ver.", { width: 140 }),
        // col.bool("isAreaZone", "Area Zone", { width: 110 }),

        col.actions([
          action.edit(onEdit),
          // action.delete(onDelete), // Uncomment when canDelete becomes true
        ]),
      ]),
    [onEdit],
  );

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
  };
}
