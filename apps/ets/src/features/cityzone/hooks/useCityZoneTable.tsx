// FILE 8 — hooks/useCityZoneTable.ts

import { useState, useMemo } from "react";
import {
  col,
  buildColumns,
  action
} from "../../../shared/components/AppTable/AppTable";
import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";

import { STATUS_MAP } from "../constants/cityZoneConstants";
import type { CityZone } from "../types/cityZone.types";


interface UseCityZoneTableOptions {
  onEdit: (record: CityZone) => void;
  // onDelete: (record: CityZone) => void; // Uncomment when delete endpoint is available
}

export function useCityZoneTable({ onEdit }: UseCityZoneTableOptions) {
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
      buildColumns<CityZone>([
        col.text("cityZoneCode", "Zone Code", {
          width: 160,
          sortable: true, // Recommended: use sortable instead of sorter
        }),
        col.text("cityZoneDescription", "Description", {
          sortable: true,
        }),
        col.status("active", "Status", {
          map: {
            true: STATUS_MAP.active,
            false: STATUS_MAP.inactive,
          },
          width: 120,
          // renderAs: "toggle",   // Removed — not present in the new pattern
        }),
        col.dateTime("createdOn", "Created On", {
          width: 180,
          sortable: true,
        }),
        // col.dateTime("modOn", "Last Modified", {
        //   width: 180,
        //   sortable: true,
        // }),
        col.actions([
          action.edit(onEdit),
        ])
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
