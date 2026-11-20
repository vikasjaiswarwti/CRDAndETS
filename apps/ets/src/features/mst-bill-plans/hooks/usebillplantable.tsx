import { useState, useMemo, useCallback } from "react";
import {
  col,
  buildColumns,
  action, // ← Important: Import action helper
} from "../../../shared/components/AppTable/AppTable";

import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";

import { STATUS_MAP } from "../constants/bill-plan-constants";
import type { MstBillPlan } from "../types/bill-plan.types";

import { BILL_PLAN_CONFIG } from "../config"; // ← Assuming you have a config file

interface UseBillPlanTableOptions {
  onEdit: (record: MstBillPlan) => void;
  // onDelete is omitted because there is no delete endpoint
}

export function useBillPlanTable({ onEdit }: UseBillPlanTableOptions) {
  // ── URL-synced table state ───────────────────────────────────────────────
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  // ── Search state ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  // ── Handle search with page reset ────────────────────────────────────────
  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setTableState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableState],
  );
  const handleLocationName = useCallback(
    (value: string) => {
      setLocation(value);
      setTableState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableState],
  );

  // ── Query args for RTK Query ─────────────────────────────────────────────
  const queryArgs = tableStateToQueryArgs(tableState, {
    searchTerm: search,
    location: location,
  });

  // ── Column definitions with config-driven actions ────────────────────────
  const columns = useMemo(() => {
    const actions: any[] = [];

    // Add Edit action only if allowed in config
    if (BILL_PLAN_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    // You can add more actions here in future (e.g., delete, view, etc.)
    // if (BILL_PLAN_CONFIG.canDelete) {
    //   actions.push(action.delete(onDelete));
    // }

    return buildColumns<MstBillPlan>([
      col.text("bpName", "Bill Plan Name", {
        sortable: true,
        width: 220,
      }),

      // col.text("bptCode", "Plan Type Code", {
      //   width: 160,
      // }),

      col.text("billPlanTypeName", "Bill Plan Type", {
        width: 160,
      }),

      col.text("locationName", "Office", {
        width: 130,
      }),

      col.status("active", "Status", {
        map: {
          true: STATUS_MAP.active,
          false: STATUS_MAP.inactive,
        },
        width: 120,
      }),

      col.dateTime("createdOn", "Created On", {
        width: 180,
        sortable: true, // ← Added sortable for consistency
      }),

      col.text("createdBy", "Created By", {
        width: 180,
      }),

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
    handleLocationName,
    queryArgs,
  };
}
