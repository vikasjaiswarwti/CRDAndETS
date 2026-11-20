// src/features/role-management/hooks/useRoleTable.ts

import { useState, useMemo } from "react";
import {
  col,
  buildColumns,
  action, // ← Imported for action.edit()
} from "../../../shared/components/AppTable/AppTable";

import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";

import { ROLE_STATUS_MAP } from "../constants/roleConstants";
import type { Role } from "../types/role.types";

import { ROLE_CONFIG } from "../config"; // ← Make sure this config file exists

interface UseRoleTableOptions {
  onEdit: (record: Role) => void;
  // onDelete?: (record: Role) => void;
}

export function useRoleTable({ onEdit }: UseRoleTableOptions) {
  // ── URL-synced pagination / sort ──────────────────────────────────────────
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  // ── Search — separate from tableState so it resets page correctly ─────────
  const [search, setSearch] = useState("");

  const handleSearch = (value: string) => {
    setSearch(value);
    setTableState({ page: 1 });
  };

  // ── Query args derived from table state + search ──────────────────────────
  const queryArgs = tableStateToQueryArgs(tableState, { searchTerm: search });

  // ── Column definitions with config-driven actions ────────────────────────
  const columns = useMemo(() => {
    const actions: any[] = [];

    // Add Edit action only if allowed in config
    if (ROLE_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    // You can add delete later like this:
    // if (ROLE_CONFIG.canDelete && onDelete) {
    //   actions.push(action.delete(onDelete));
    // }

    return buildColumns<Role>([
      col.text("roleName", "Role Name", {
        sortable: true,
        width: 200,
      }),

      col.status("isActive", "Status", {
        map: {
          true: ROLE_STATUS_MAP.true,
          false: ROLE_STATUS_MAP.false,
        },
        width: 120,
      }),

      // col.dateTime("createdAt", "Created At", {
      //   sortable: true,
      //   width: 180,
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
