import { useState, useMemo } from "react";
import {
  col,
  buildColumns,
  action, // ← Important: Import action helper
} from "../../../shared/components/AppTable/AppTable";

import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";

import type { VehicleType } from "../types/vehicType.types";

// Assuming you have a config file (create one if it doesn't exist)
import { VEHICLE_TYPE_CONFIG } from "../config";
// import { ACTIVE_OPTIONS } from "../constants/Vehicletypeconstants";

interface UseVehicleTypeTableOptions {
  onEdit: (record: VehicleType) => void;
  // onDelete / onView etc. can be added later if needed
}

export function useVehicleTypeTable({ onEdit }: UseVehicleTypeTableOptions) {
  // ── URL-synced table state ───────────────────────────────────────────────
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  // ── Search state ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  // ── Handle search with page reset ────────────────────────────────────────
  const handleSearch = (value: string) => {
    setSearch(value);
    setTableState({ page: 1 });
  };

  // ── Query args for RTK Query ─────────────────────────────────────────────
  const queryArgs = tableStateToQueryArgs(tableState, { searchTerm: search });

  // ── Column definitions with config-driven actions ────────────────────────
  const columns = useMemo(() => {
    const actions: any[] = [];

    // Add Edit action only if allowed in config
    if (VEHICLE_TYPE_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    // Future actions example:
    // if (VEHICLE_TYPE_CONFIG.canDelete && onDelete) {
    //   actions.push(action.delete(onDelete));
    // }

    return buildColumns<VehicleType>([
      col.text("vehicleTypeDesc", "Vehicle Type", {
        width: 280,
        sortable: true, // Recommended to add for consistency
      }),

      col.text("locationName", "Office", {
        width: 160,
      }),

      col.text("capacity", "Capacity", {
        width: 120,
      }),
      // col.text("isActive", "Status", {
      //   width: 120,
      // }),

      // Actions column - only added if there is at least one action
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
