import { useState, useMemo } from "react";
import {
  col,
  buildColumns,
  action, // ← Make sure this is imported
} from "../../../shared/components/AppTable/AppTable";

import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";

import { STATUS_MAP } from "../constants/Billplantypeconstants";
import type { LkpBillPlanType } from "../types/bill-plan-type";

import { BILL_PLAN_TYPE_CONFIG } from "../config";

interface UseBillPlanTypeTableOptions {
  onEdit: (record: LkpBillPlanType) => void;
  // onDelete?: (record: LkpBillPlanType) => void;   // Uncomment when needed
}

export function useBillPlanTypeTable({ onEdit }: UseBillPlanTypeTableOptions) {
  // ── URL-synced pagination / sort ──────────────────────────────────────────
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  // ── Search ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  const handleSearch = (value: string) => {
    setSearch(value);
    setTableState({ page: 1 });
  };

  // ── Query args ────────────────────────────────────────────────────────────
  const queryArgs = tableStateToQueryArgs(tableState, { searchTerm: search });

  // ── Column definitions with config-driven actions ────────────────────────
  const columns = useMemo(() => {
    const actions: any[] = [];

    // ← This was missing in your second file
    if (BILL_PLAN_TYPE_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    return buildColumns<LkpBillPlanType>([
      col.text("bptName", "Plan Type Name", {
        width: 240,
        sortable: true,
      }),

      // col.text("bptCode", "Plan Type Code", {
      //   width: 160,
      //   sortable: true,
      // }),

      col.dateTime("createdOn", "Created On", {
        width: 180,
        sortable: true,
      }),

      // col.text("createdBy", "Created By", {
      //   width: 140,
      // }),

      col.status("active", "Status", {
        map: {
          true: STATUS_MAP.active,
          false: STATUS_MAP.inactive,
        },
        width: 120,
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
    queryArgs,
  };
}
