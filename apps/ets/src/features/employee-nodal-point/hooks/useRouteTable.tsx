import { useMemo, useState, useCallback } from "react";
import {
  col,
  buildColumns,
  // action,
  // type RowAction,
} from "../../../shared/components/AppTable/AppTable";
import { useTableState } from "../../../shared/hooks/useTableState";
import type { RouteTableItem } from "../types/routeTable.types";
// import {DeleteOutlined} from "@ant-design/icons";
const STATUS_MAP = {
  active: { label: "Active", color: "green" },
  inactive: { label: "Inactive", color: "red" },
} as const;

interface UseRouteTableOptions {
  data: RouteTableItem[] | undefined;
  onEdit: (record: RouteTableItem) => void;
  onDeactivate: (record: RouteTableItem) => void;
}

export const useRouteTable = ({
  data,
  onEdit,
  onDeactivate,
}: UseRouteTableOptions) => {
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });
  const [search, setSearch] = useState("");

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setTableState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableState],
  );

  const columns = useMemo(() => {
    // const actions: RowAction<RouteTableItem>[] = [
    // action.edit(onEdit),
    // action.custom<RouteTableItem>({
    //   label: "Deactivate",
    //   onClick: onDeactivate,
    //   icon: <DeleteOutlined />,
    //   confirmTitle: "Deactivate this route?",
    //   hidden: (row) => !row.isActive,
    // }),
    // ];

    return buildColumns<RouteTableItem>([
      col.text("routeNo", "Route No", { width: 120 }),
      col.text("routeName", "Route Name", { width: 280 }),
      col.status("isActive", "Status", {
        map: { true: STATUS_MAP.active, false: STATUS_MAP.inactive },
        width: 120,
      }),
      // col.actions(actions),
    ]);
  }, [onEdit, onDeactivate]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data ?? [];
    return (data ?? []).filter((r) => r.routeName.toLowerCase().includes(term));
  }, [data, search]);

  const sorted = useMemo(() => {
    const { sortField, sortOrder } = tableState;
    if (!sortField || !sortOrder) return filtered;

    const direction = sortOrder === "descend" ? -1 : 1;
    return [...filtered].sort((a, b) => {
      const left = a[sortField as keyof RouteTableItem];
      const right = b[sortField as keyof RouteTableItem];
      if (left == null) return 1;
      if (right == null) return -1;
      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * direction;
      }
      return String(left).localeCompare(String(right)) * direction;
    });
  }, [filtered, tableState]);

  const rows = useMemo(() => {
    const start = (tableState.page - 1) * tableState.pageSize;
    return sorted.slice(start, start + tableState.pageSize);
  }, [sorted, tableState.page, tableState.pageSize]);

  return {
    columns,
    rows,
    total: sorted.length,
    tableState,
    setTableState,
    search,
    handleSearch,
  };
};
