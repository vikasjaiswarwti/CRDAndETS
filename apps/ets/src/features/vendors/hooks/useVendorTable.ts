import React, { useState, useMemo, useCallback } from "react";
import {
  col,
  // buildColumns,
  action, // ← Use action helper for consistency
} from "../../../shared/components/AppTable/AppTable";

import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";

import { STATUS_MAP } from "../constants/vendorConstants";
import type { Vendor } from "../types/vendor.types";

import { VENDOR_CONFIG } from "../config"; // ← Import your config
import { EnvironmentOutlined } from '@ant-design/icons';

interface UseVendorTableOptions {
  onEdit: (record: Vendor) => void;
  onMapLocations: (record: Vendor) => void; // ← add
  // onDelete can be added later when delete endpoint is ready
}

export function useVendorTable({ onEdit, onMapLocations }: UseVendorTableOptions) {
  // ── URL-synced table state ───────────────────────────────────────────────
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  // ── Search state ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState('');
  const [vendorName, setVendorName] = useState('');
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
  const handleVendorName = useCallback(
    (value: string) => {
      setVendorName(value);
      setTableState((prev) => ({ ...prev, page: 1 }));
    },
    [setTableState],
  );

  // ── Query args for RTK Query ─────────────────────────────────────────────
  const queryArgs = tableStateToQueryArgs(tableState, { searchTerm: search, location: location, vendorName: vendorName });

  // ── Column definitions with config-driven actions ────────────────────────
  const columns = useMemo(() => {
    const rowActions: any[] = [
      VENDOR_CONFIG.canUpdate && { ...action.edit(onEdit), label: "Edit" },
      onMapLocations && {
        ...action.custom({
          label: "Transport",
          icon: React.createElement(EnvironmentOutlined),
          onClick: onMapLocations,
          // hidden: (record: ApprovedUser) => !record.isActive,
        }),
      },
    ].filter(Boolean); // removes false entries


    return [
      col.text("vendorName", "Vendor Name", {
        sortable: true,
        width: 220,
      }),

      col.text("mobile", "Mobile Number", {
        width: 150,
      }),

      col.text("emailId", "Email ID", {
        width: 200,
      }),

      col.status("active", "Status", {
        map: STATUS_MAP, // ← This is correct
        width: 120,
      }),

      // Actions column - only shown if there are actions
      ...(rowActions.length > 0 ? [col.actions(rowActions, { width: 120 })] : []),
    ];
  }, [onEdit, onMapLocations]);

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    handleLocationName,
    handleVendorName,
    queryArgs,
  };
}
