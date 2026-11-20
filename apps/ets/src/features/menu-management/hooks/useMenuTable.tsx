import { useState, useMemo } from "react";
import {
  col,
  buildColumns,
} from "../../../shared/components/AppTable/AppTable";
import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";

import { STATUS_MAP } from "../constants/menuConstants";

import type { Menu } from "../types/menu.types";
import EditIcon from '../../../assets/icons/EditButton.png'

interface UseMenuTableOptions {
  onEdit: (record: Menu) => void;
  //   onDelete: (record: Menu) => void;
}

export function useMenuTable({ onEdit }: UseMenuTableOptions) {
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
      buildColumns<Menu>([
        col.text("menuName", "Menu Name", {
          sortable: true,
          width: 200,
        }),
        col.text("routeUrl", "Route URL", {
          width: 200,
        }),
        col.text("icon", "Icon", {
          width: 120,
        }),
        col.text("orderNo", "Order", {
          sortable: true,
          width: 80,
          align: "center",
        }),
        col.status("isActive", "Status", {
          map: {
            true: STATUS_MAP.active,
            false: STATUS_MAP.inactive,
          },
          width: 100,
        }),
        col.actions<Menu>([
          {
            label: "Edit",
            icon: <img
              src={EditIcon}
              alt="Edit"
              width={18}
              height={18}
              style={{ display: 'block' }}
            />,
            onClick: onEdit,
          },
          //   {
          //     label: "Delete",
          //     danger: true,
          //     confirm: true,
          //     confirmTitle: "Delete this menu? This cannot be undone.",
          //     onClick: (row) => onDelete(row),
          //   },
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
