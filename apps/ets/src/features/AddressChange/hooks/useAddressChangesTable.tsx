import React, { useState, useMemo, useCallback } from "react";
import { Tooltip, Checkbox } from "antd";
import { col } from "../../../shared/components/AppTable/AppTable";
import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";
// import { ACTION_TYPE_MAP } from "../constants/addressChangesConstants";
import type { AddressChange } from "../types/addressChanges.types";
import { action } from "../../../shared/components/AppTable/AppTable";
import { ADDRESS_CHANGES_CONFIG } from "../config";
import { getActionBadge } from "../utils/ActionBadge";

interface UseAddressChangesTableOptions {
  onEdit: (record: AddressChange) => void;
  data?: AddressChange[];
  isSelectable?: boolean;
}

export const useAddressChangesTable = ({
  onEdit,
  data = [],
  isSelectable = true,
}: UseAddressChangesTableOptions) => {
  const [search, setSearch] = useState("");
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  // --- selection state ---
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const toggleRow = useCallback((id: React.Key, checked: boolean) => {
    const value = Number(id);
    setSelectedRowKeys((prev: number[]) =>
      checked ? [...prev, value] : prev.filter((key) => key !== value),
    );
  }, []);

  const toggleAll = useCallback(
    (checked: boolean) => {
      const pageIds = data
        .map((r) => r.empID)
        .filter((id): id is number => id !== null);

      setSelectedRowKeys((prev) =>
        checked
          ? [...new Set([...prev, ...pageIds])]
          : prev.filter((key) => !pageIds.includes(key)),
      );
    },
    [data],
  );

  const clearSelection = useCallback(() => setSelectedRowKeys([]), []);
  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setTableState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableState],
  );

  const queryArgs = tableStateToQueryArgs(tableState, { searchTerm: search });

  const columns = useMemo(() => {
    const actions: any[] = [];

    if (ADDRESS_CHANGES_CONFIG.canUpdate && onEdit) {
      actions.push(action.edit(onEdit));
    }

    const pageIds = data.map((r) => r.empID);
    const allChecked =
      pageIds.length > 0 &&
      pageIds.every((id) => selectedRowKeys.includes(id as number));
    const someChecked =
      pageIds.some((id) => selectedRowKeys.includes(id as number)) &&
      !allChecked;

    const selectionColumn = {
      title: (
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked}
          onChange={(e) => toggleAll(e.target.checked)}
        />
      ),
      dataIndex: "checkbox",
      key: "checkbox",
      width: 48,
      render: (_val: unknown, record: AddressChange) => (
        <Checkbox
          checked={selectedRowKeys.includes(record?.empID as number)}
          onChange={(e) => toggleRow(record?.empID as number, e.target.checked)}
        />
      ),
    };

    const baseColumns = [
      ...(isSelectable ? [selectionColumn] : []),
      col.text("employeeName", "Name", { width: 130 }),
      col.text("mobileNo", "Phone No", { width: 120 }),
      col.text("createdBy", "Raised By", { width: 120 }),
      col.text("city", "City", { width: 130 }),
      col.text("address", "Address", {
        width: 150,
        render: (_val, record: AddressChange) =>
          React.createElement(
            Tooltip,
            { title: record.address ?? undefined },
            React.createElement(
              "span",
              {
                style: {
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              },
              record.address && record.address?.length > 35
                ? `${String(record.address).slice(0, 35)}...`
                : (record.address ?? "—"),
            ),
          ),
      }),
      {
        title: "Status",
        dataIndex: "actionType",
        key: "actionType",
        width: 110,
        render: (actionType: string | null) => {
          const b = getActionBadge(actionType);
          return (
            <span
              style={{
                padding: "2px 10px",
                borderRadius: 12,
                background: b.bg,
                border: `1px solid ${b.border}`,
                color: b.color,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {b.label}
            </span>
          );
        },
      },
      col.dateTime("createdOn", "Raised On", { width: 190 }),
      col.actions([...actions]),
    ];

    return baseColumns;
  }, [data, onEdit, selectedRowKeys, toggleAll, toggleRow, isSelectable]);

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
    selectedRowKeys,
    selectedCount: selectedRowKeys.length,
    clearSelection,
  };
};
