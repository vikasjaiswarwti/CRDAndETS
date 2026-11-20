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

import { FUEL_TYPE_CONFIG } from "../config";
import { STATUS_MAP } from "../constants/FuelTypeConstants";
import type { FuelType } from "../types/fuelType.types";

interface UseFuelTypeTableOptions {
  onEdit: (record: FuelType) => void;
}

export function useFuelTypeTable({ onEdit }: UseFuelTypeTableOptions) {
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

    if (FUEL_TYPE_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    return buildColumns<FuelType>([
      // col.text("fuelTypeCode", "Code", { width: 80, sortable: true }),

      col.text("fuelTypeDesc", "Fuel Type Description", {
        sortable: true,
        width: 300,
      }),

      col.status("active", "Status", {
        map: {
          true: STATUS_MAP.active,
          false: STATUS_MAP.inactive,
        },
        width: 120,
      }),

      col.dateTime("createdOn", "Created On", { width: 180 }),

      // Actions column
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
