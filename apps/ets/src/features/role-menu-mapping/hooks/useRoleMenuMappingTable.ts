// src/features/role-menu-mapping/hooks/useRoleMenuMappingTable.ts

import { useState, useMemo } from "react";
import {
  col,
  buildColumns,
} from "../../../shared/components/AppTable/AppTable";
import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";
import { ROLE_MENU_MAPPING_STATUS_MAP } from "../constants/roleMenuMappingConstants";
import type { RoleMenuMapping } from "../types/roleMenuMapping.types";

interface UseRoleMenuMappingTableOptions {
  onEdit: (record: RoleMenuMapping) => void;
  /** Optional display maps so table can show names instead of raw IDs */
  roleNameMap?: Record<string, string>;
  menuNameMap?: Record<string, string>;
}

export function useRoleMenuMappingTable({
  onEdit,
  roleNameMap = {},
  menuNameMap = {},
}: UseRoleMenuMappingTableOptions) {
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

  // ── Column definitions — stable via useMemo ───────────────────────────────
  const columns = useMemo(
    () =>
      buildColumns<RoleMenuMapping>([
        col.text("roleId", "Role", {
          sortable: true,
          render: (val) => roleNameMap[val as string] ?? (val as string),
        }),
        col.text("menuId", "Menu", {
          sortable: true,
          render: (val) => menuNameMap[val as string] ?? (val as string),
        }),
        col.status("isActive", "Status", {
          map: {
            true: ROLE_MENU_MAPPING_STATUS_MAP.true,
            false: ROLE_MENU_MAPPING_STATUS_MAP.false,
          },
          width: 120,
        }),
        col.dateTime("createdAt", "Created At", {
          sortable: true,
        }),
        col.actions<RoleMenuMapping>(
          [
            {
              label: "Edit",
              onClick: onEdit,
            },
            // {
            //   label: "Delete",
            //   danger: true,
            //   confirm: true,
            //   confirmTitle: "Remove this menu from role?",
            //   onClick: (row) => onDelete?.(row),
            // },
          ],
          { fixed: "right", width: 100 },
        ),
      ]),
    [onEdit, roleNameMap, menuNameMap],
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
