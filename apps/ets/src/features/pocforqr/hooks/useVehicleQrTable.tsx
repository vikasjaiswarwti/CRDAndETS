import { useState, useCallback, useMemo } from "react";
import {
  QrcodeOutlined,
  UserSwitchOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { col, action } from "../../../shared/components/AppTable/AppTable";
import {
  useTableState,
  tableStateToQueryArgs,
} from "../../../shared/hooks/useTableState";
import type { VehicleQr } from "../services/VehicleQrApi";

interface UseVehicleQrTableProps {
  onViewQr: (record: VehicleQr) => void;
  onAssignDriver: (record: VehicleQr) => void;
  onDriverHistory: (record: VehicleQr) => void;
  onEdit: (record: VehicleQr) => void;
}

export function useVehicleQrTable({
  onViewQr,
  onAssignDriver,
  onDriverHistory,
  onEdit,
}: UseVehicleQrTableProps) {
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
    const actions: any[] = [
      action.custom({
        label: "View QR",
        icon: <QrcodeOutlined style={{ fontSize: 18 }} />,
        onClick: onViewQr,
      }),
      action.custom({
        label: "Assign Driver",
        icon: <UserSwitchOutlined style={{ fontSize: 18 }} />,
        onClick: onAssignDriver,
      }),
      action.custom({
        label: "Driver History",
        icon: <HistoryOutlined style={{ fontSize: 18 }} />,
        onClick: onDriverHistory,
      }),
      action.edit(onEdit),
    ];

    return [
      col.text<VehicleQr>("vehicleNumber", "Vehicle No.", { width: 150 }),
      col.text<VehicleQr>("vehicleCompany", "Company", { width: 140 }),
      col.text<VehicleQr>("modal", "Model", { width: 130 }),
      col.text<VehicleQr>("vehicleTypeDesc", "Type", { width: 110 }),
      {
        title: "Status",
        dataIndex: "currentStatusName",
        key: "currentStatusName",
        width: 120,
        render: (status?: string) => {
          const isActive = status?.toLowerCase() === "active";

          return (
            <span
              style={{
                padding: "2px 10px",
                borderRadius: 12,
                background: isActive ? "#ECFDF5" : "#F3F4F6",
                border: `1px solid ${isActive ? "#A7F3D0" : "#E5E7EB"}`,
                color: isActive ? "#065F46" : "#6B7280",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {status || "Inactive"}
            </span>
          );
        },
      },
      {
        title: "Driver",
        dataIndex: "driverName",
        key: "driverName",
        width: 150,
        render: (v: string | null) =>
          v ? v : <span style={{ color: "#9ca3af" }}>Unassigned</span>,
      },
      {
        title: "QR Code",
        dataIndex: "qrUniqueCode",
        key: "qrUniqueCode",
        width: 350,
        render: (v: string) =>
          v ? (
            <span style={{ fontFamily: "monospace", fontSize: 12 }}>{v}</span>
          ) : (
            "—"
          ),
      },
      col.actions(actions, { width: 100 }),
    ];
  }, [onViewQr, onAssignDriver, onDriverHistory, onEdit]);

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
  };
}
