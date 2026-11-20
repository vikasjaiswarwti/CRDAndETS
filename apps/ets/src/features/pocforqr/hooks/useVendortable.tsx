import { useState, useCallback, useMemo } from "react";
import { col, action } from "../../../shared/components/AppTable/AppTable";
import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";
import type { Vendor } from "../services/VendorApi";

interface UseVendorTableProps {
  onEdit: (record: Vendor) => void;
}

type VendorStatusBadge = {
  bg: string;
  border: string;
  color: string;
  label: string;
};

const VENDOR_STATUS_BADGE: Record<string, VendorStatusBadge> = {
  true: {
    bg: "#ECFDF5",
    border: "#A7F3D0",
    color: "#065F46",
    label: "Active",
  },
  false: {
    bg: "#F3F4F6",
    border: "#E5E7EB",
    color: "#6B7280",
    label: "Inactive",
  },
};

const getVendorStatusBadge = (isActive: unknown): VendorStatusBadge =>
  VENDOR_STATUS_BADGE[String(!!isActive)] ?? VENDOR_STATUS_BADGE["false"];

export function useVendorTable({ onEdit }: UseVendorTableProps) {
  const [search, setSearch] = useState("");

  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setTableState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableState],
  );

  const queryArgs = tableStateToQueryArgs(tableState, { searchTerm: search });

  const columns = useMemo(() => {
    const actions: any[] = [action.edit(onEdit)];

    return [
      col.text<Vendor>("name", "Name", { width: 180 }),
      col.text<Vendor>("contactNumber", "Contact Number", { width: 150 }),
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        width: 240,
        render: (v: string | null) => v ?? "—",
      },
      {
        title: "Address",
        dataIndex: "address",
        key: "address",
        render: (v: string | null) => v ?? "—",
      },
      {
        title: "Status",
        dataIndex: "isActive",
        key: "isActive",
        width: 110,
        render: (isActive: unknown) => {
          const badge = getVendorStatusBadge(isActive);
          return (
            <span
              style={{
                padding: "2px 10px",
                borderRadius: 12,
                background: badge.bg,
                border: `1px solid ${badge.border}`,
                color: badge.color,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {badge.label}
            </span>
          );
        },
      },
      col.actions(actions, { width: 100 }),
    ];
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
