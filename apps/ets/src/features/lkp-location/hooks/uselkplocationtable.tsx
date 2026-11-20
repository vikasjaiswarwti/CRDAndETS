import React, { useState, useMemo } from "react";
import {
  col,
  buildColumns,
  action,
} from "../../../shared/components/AppTable/AppTable";

import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";

import { STATUS_MAP } from "../constants/lkplocationconstants";
import type { LkpLocation } from "../types/lkpLocation.types";

import { LOCATION_CONFIG } from "../config";

interface UseLkpLocationTableOptions {
  onEdit: (record: LkpLocation) => void;
  onDelete?: (record: LkpLocation) => void;   // optional for now

}

export function useLkpLocationTable({ onEdit, onDelete, totalCount = 0 }: UseLkpLocationTableOptions & { totalCount?: number }) {
  // ── URL-synced pagination / sort ──────────────────────────────────────────
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  // ── Search ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  const handleSearch = (value: string) => {
    setSearch(value);
    setTableState({ page: 1 });
  };

  // ── Query args ────────────────────────────────────────────────────────────
  const queryArgs = tableStateToQueryArgs(tableState, { searchTerm: search });

  // ── Clamp page when we know totalCount ──
  const maxPage = totalCount > 0
    ? Math.max(1, Math.ceil(totalCount / tableState.pageSize))
    : 1;

  React.useEffect(() => {
    if (totalCount > 0 && tableState.page > maxPage) {
      setTableState({ page: maxPage });
    }
  }, [totalCount, tableState.page, tableState.pageSize, maxPage, setTableState]);

  // ── Column definitions with config-driven actions ────────────────────────
  const columns = useMemo(() => {

    const actions: any[] = [];

    if (LOCATION_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    // if (LOCATION_CONFIG.delete && onDelete) {
    //   actions.push(action.delete(onDelete));
    // }

    return buildColumns<LkpLocation>([

      col.text("locName", "Office Name", { width: 100 , sortable: true }),
      col.text("dispName", "Display Name", { width: 100 }),
      col.text("city", "City", { width: 130, sortable: true }),
      // col.text("state", "State", { width: 120 }),
      col.status("active", "Status", {
        map: {
          true: STATUS_MAP.active,
          false: STATUS_MAP.inactive,
        },
        width: 130,
      }),
      col.status("isAutoPenalty", "Auto Penalty", {
        map: {
          true: { label: "Yes", color: "blue" },
          false: { label: "No", color: "default" },
        },
        width: 130,
      }),
      // col.dateTime("createdOn", "Created On", {
      //   width: 180,
      //   sortable: true,
      // }),

      // Actions column - only added if there is at least one action
      ...(actions.length > 0
        ? [col.actions(actions)]
        : []),
    ]);
  }, [onEdit, onDelete]);

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
    maxPage
  };
}