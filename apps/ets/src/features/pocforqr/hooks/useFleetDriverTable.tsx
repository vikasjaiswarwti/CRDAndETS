import { useState, useCallback, useMemo } from "react";
import { col, action } from "../../../shared/components/AppTable/AppTable";
import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";
import type { FleetDriver } from "../services/FleetDriverApi";
import type { Vendor } from "../services/VendorApi";

interface UseFleetDriverTableOptions {
  onEdit: (record: FleetDriver) => void;
  /** Optional vendor list so the table can show a vendor name instead of a raw id */
  vendors?: Vendor[];
}

type DriverStatusBadge = {
  bg: string;
  border: string;
  color: string;
  label: string;
};

const DRIVER_STATUS_BADGE: Record<string, DriverStatusBadge> = {
  "1": {
    bg: "#ECFDF5",
    border: "#A7F3D0",
    color: "#065F46",
    label: "Active",
  },
  "0": {
    bg: "#F3F4F6",
    border: "#E5E7EB",
    color: "#6B7280",
    label: "Inactive",
  },
};

const getDriverStatusBadge = (status: unknown): DriverStatusBadge =>
  DRIVER_STATUS_BADGE[String(status)] ?? DRIVER_STATUS_BADGE["0"];

export const useFleetDriverTable = ({
  onEdit,
  vendors,
}: UseFleetDriverTableOptions) => {
  const [search, setSearch] = useState("");

  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setTableState((prev) => ({
        ...prev,
        page: 1,
      }));
    },
    [setTableState],
  );

  const queryArgs = tableStateToQueryArgs(tableState, {
    searchTerm: search,
  });

  const vendorNameById = useMemo(() => {
    const map = new Map<string | number, string>();

    (vendors ?? []).forEach((vendor) => {
      map.set(vendor.id, vendor.name);
    });

    return map;
  }, [vendors]);

  const columns = useMemo(() => {
    const actions: any[] = [];

    if (onEdit) {
      actions.push(action.edit(onEdit));
    }

    return [
      col.text<FleetDriver>("driverName", "Driver Name", {
        width: 160,
      }),

      col.text<FleetDriver>("driverNumber", "Mobile", {
        width: 130,
      }),

      col.text<FleetDriver>("licenceNumber", "Licence No.", {
        width: 150,
      }),

      col.date<FleetDriver>("dob", "DOB", {
        width: 120,
      }),

      {
        title: "Vendor",
        dataIndex: "vendorId",
        key: "vendorId",
        width: 160,
        render: (vendorId: string | number | null | undefined) =>
          vendorNameById.get(vendorId as string | number) ?? vendorId ?? "—",
      },

      {
        title: "Status",
        dataIndex: "currentStatusId",
        key: "currentStatusId",
        width: 110,
        render: (status: unknown) => {
          const badge = getDriverStatusBadge(status);

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

      col.actions(actions,{width:100}),
    ];
  }, [onEdit, vendorNameById]);

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
  };
};
