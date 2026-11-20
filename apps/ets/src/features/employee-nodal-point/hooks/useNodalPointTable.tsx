import { useMemo, useState, useCallback } from "react";
import {
  col,
  buildColumns,
  action,
  type RowAction,
} from "../../../shared/components/AppTable/AppTable";
import { useTableState } from "../../../shared/hooks/useTableState";
import { StopOutlined, TeamOutlined } from "@ant-design/icons";
import { TRIP_TYPE_LABEL, STATUS_MAP } from "../constants/nodalPointConstants";
import type { NodalPoint } from "../types/nodalPoint.types";

interface UseNodalPointTableOptions {
  data: NodalPoint[] | undefined;
  onEdit: (record: NodalPoint) => void;
  onManageEmployees: (record: NodalPoint) => void;
  onDeactivate: (record: NodalPoint) => void;
}

export const useNodalPointTable = ({
  data,
  onEdit,
  onManageEmployees,
  onDeactivate,
}: UseNodalPointTableOptions) => {
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

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = useMemo(() => {
    const actions: RowAction<NodalPoint>[] = [
      action.edit(onEdit),
      action.custom<NodalPoint>({
        label: "Employees",
        icon: <TeamOutlined style={{ fontSize: 18, color: "#1B4332" }} />,
        onClick: onManageEmployees,
      }),
      action.custom<NodalPoint>({
        label: "Deactivate",
        icon: <StopOutlined style={{ fontSize: 18, color: "#DC2626" }} />,
        onClick: onDeactivate,
        // danger: true,
        // confirm: true,
        confirmTitle: "Deactivate this nodal point?",
        hidden: (row) => !row.isActive,
      }),
    ];

    return buildColumns<NodalPoint>([
      col.text("name", "Name", { width: 200 }),

      // col.text("locationCode", "Location Code", { width: 140, sortable: true }),

      col.text("boardingOrder", "Order", { width: 80, sortable: true }),

      col.text("tripType", "Trip Type", {
        width: 120,
        render: (val) => TRIP_TYPE_LABEL[String(val)] ?? "—",
      }),

      col.text("address", "Address", { width: 260, ellipsis: true }),

      col.status("isActive", "Status", {
        map: {
          true: STATUS_MAP.active,
          false: STATUS_MAP.inactive,
        },
        width: 120,
      }),

      col.actions(actions),
    ]);
  }, [onEdit, onManageEmployees, onDeactivate]);

  // ── Client-side search ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data ?? [];
    return (data ?? []).filter((n) =>
      [n.locationCode].some((field) =>
        String(field ?? "")
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [data, search]);

  // ── Client-side sort ──────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    const { sortField, sortOrder } = tableState;
    if (!sortField || !sortOrder) return filtered;

    const direction = sortOrder === "descend" ? -1 : 1;
    return [...filtered].sort((a, b) => {
      const left = a[sortField as keyof NodalPoint];
      const right = b[sortField as keyof NodalPoint];
      if (left == null) return 1;
      if (right == null) return -1;
      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * direction;
      }
      return String(left).localeCompare(String(right)) * direction;
    });
  }, [filtered, tableState]);

  // ── Client-side paging ────────────────────────────────────────────────────
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
