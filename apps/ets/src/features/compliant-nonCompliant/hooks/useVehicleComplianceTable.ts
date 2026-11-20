import React, { useMemo, useState, useCallback } from "react";
import { Button, Dropdown } from "antd";
import {
  EditOutlined,
  MoreOutlined,
  QrcodeOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import {
  col,
  buildColumns,
  action,
} from "../../../shared/components/AppTable/AppTable";
import type { TableColumn } from "../../../shared/lib/ui-lib/types";
import { useTableState } from "../../../shared/hooks/useTableState";
// import { COMPLIANCE_STATUS_MAP } from "../constants/VehicleComplianceConstants";
import type {
  VehicleCompliance,
  DriverComplianceRow,
  ComplianceTab,
  DriverTab,
  DashboardView,
} from "../types/Vehiclecompliance.types";

interface Options {
  activeTab: ComplianceTab | DriverTab | string;
  view: DashboardView;
  onEdit?: (record: VehicleCompliance) => void;
  onViewQr?: (record: VehicleCompliance) => void;
  /** Called when the edit action is clicked on a driver row */
  onDriverEdit?: (record: any) => void;
  onChangeStatus?: (record: VehicleCompliance | DriverComplianceRow) => void;
}

export function useVehicleComplianceTable({
  activeTab,
  view,
  onEdit,
  onViewQr,
  onDriverEdit,
  onChangeStatus,
}: Options) {
  const [tableState, setTableState] = useTableState({
    syncUrl: true,
    defaultPageSize: 10,
  });
  const [search, setSearch] = useState("");

  const handleSearch = useCallback(
    (val: string) => {
      setSearch(val);
      setTableState({ ...tableState, page: 1 });
    },
    [tableState, setTableState],
  );

  // page/pageSize passed back to the page so it can build the list body
  const queryArgs = useMemo(
    () => ({
      tab: activeTab,
      view,
      searchTerm: search,
      page: tableState.page,
      pageSize: tableState.pageSize,
    }),
    [tableState, activeTab, view, search],
  );

  // ── Vehicle columns ─────────────────────────────────────────────────────────
  const vehicleColumns = useMemo(
    () => {
      const columns: TableColumn<VehicleCompliance>[] = [
        col.text<VehicleCompliance>("vehicleNo", "Reg. No.", { width: 130 }),
        col.text<VehicleCompliance>("vehicleType", "Type", { width: 90 }),
        col.text<VehicleCompliance>("make", "Make", { width: 90 }),
        col.text<VehicleCompliance>("model", "Model", { width: 90 }),
        col.text<VehicleCompliance>("ownerName", "Owner", { width: 110 }),
        col.date<VehicleCompliance>("registrationExpDate", "RC Expiry", {
          width: 110,
        }),
        col.date<VehicleCompliance>("insuranceExpDate", "Insurance Expiry", {
          width: 130,
        }),
        col.date<VehicleCompliance>("fitnessExpDate", "Fitness Expiry", {
          width: 120,
        }),
        col.date<VehicleCompliance>("permitExpDate", "Permit Expiry", {
          width: 120,
        }),
        col.date<VehicleCompliance>("pucExpDate", "PUC Expiry", { width: 110 }),
        col.date<VehicleCompliance>("roadTaxExpDate", "Road Tax Expiry", {
          width: 140,
        }),
        col.text<VehicleCompliance>("currentStatusName", "Status", {
          width: 110,
          render: (_value, row) =>
            row.currentStatusName ||
            ({ 1: "Active", 2: "Inactive", 3: "Blacklisted" }[
              row.currentStatus ?? -1
            ] ??
              "Unknown"),
        }),
        // col.status<VehicleCompliance>("currentStatusName", "Status", {
        //   map: COMPLIANCE_STATUS_MAP,
        //   width: 140,
        // }),
        ...(onChangeStatus
          ? [
              {
                key: "__actions__",
                title: "Actions",
                fixed: "right" as const,
                width: 120,
                align: "center" as const,
                render: (_value: unknown, row: VehicleCompliance) =>
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                    },
                    onEdit
                      ? React.createElement(Button, {
                          type: "text",
                          icon: React.createElement(EditOutlined),
                          "aria-label": "Edit",
                          onClick: () => onEdit(row),
                        })
                      : null,
                    React.createElement(
                      Dropdown,
                      {
                        menu: {
                          items: [
                            ...(onViewQr
                              ? [
                                  {
                                    key: "qr",
                                    label: "View QR",
                                    icon: React.createElement(QrcodeOutlined),
                                    onClick: () => onViewQr(row),
                                  },
                                ]
                              : []),
                            {
                              key: "change-status",
                              label: "Change Status",
                              icon: React.createElement(SwapOutlined),
                              onClick: () => onChangeStatus(row),
                            },
                          ],
                        },
                        trigger: ["click"],
                        placement: "bottomRight",
                      },
                      React.createElement(Button, {
                        type: "text",
                        icon: React.createElement(MoreOutlined),
                        "aria-label": "More actions",
                      }),
                    ),
                  ),
              },
            ]
          : onEdit || onViewQr
          ? [
            col.actions<VehicleCompliance>(
              [
                ...(onEdit ? [action.edit(onEdit)] : []),
                ...(onViewQr
                  ? [
                    action.custom({
                      label: "View QR",
                      icon: React.createElement(QrcodeOutlined, {
                        style: { fontSize: 18 },
                      }),
                      onClick: onViewQr,
                    }),
                  ]
                  : []),
              ],
              { width: onViewQr && onEdit ? 150 : 120 },
            ),
          ]
          : []),
      ];
      return buildColumns<VehicleCompliance>(columns);
    },
    [onEdit, onViewQr, onChangeStatus],
  );

  // ── Driver status colour map ─────────────────────────────────────────────────
  // const DRIVER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  //   Active: { label: "Active", color: "#16a34a" },
  //   Inactive: { label: "Inactive", color: "#dc2626" },
  //   Pending: { label: "Pending", color: "#d97706" },
  //   "": { label: "—", color: "#9ca3af" },
  // };

  // ── Driver columns ──────────────────────────────────────────────────────────
  const driverColumns = useMemo(
    () =>
      buildColumns<DriverComplianceRow>([
        col.text<DriverComplianceRow>("driverName", "Driver Name", {
          width: 150,
        }),
        col.text<DriverComplianceRow>("licenseNo", "License No.", {
          width: 130,
        }),
        col.text<DriverComplianceRow>("mobileNo", "Mobile", { width: 120 }),
        // col.text<DriverComplianceRow>("locationName", "Location", {
        //   width: 160,
        // }),
        col.text<DriverComplianceRow>("driverType", "Type", { width: 100 }),
        col.date<DriverComplianceRow>("licenseExpDate", "License Expiry", {
          width: 130,
        }),
        col.text<DriverComplianceRow>("status", "Status", {
          width: 110,
          render: (_value, row) =>
            row.currentStatusName ||
            row.status ||
            ({ 1: "Active", 2: "Inactive", 3: "Blacklisted" }[
              row.currentStatus ?? -1
            ] ??
              "Unknown"),
        }),
        // col.date<DriverComplianceRow>("inductionDate", "Induction Date", {
        //   width: 120,
        // }),
        // col.status<DriverComplianceRow>("currentStatusName", "Status", {
        //   map: DRIVER_STATUS_MAP,
        //   width: 110,
        // }),
        // Edit action — opens UploadDriverDocumentsModal; only rendered when handler provided
        ...(onDriverEdit && onChangeStatus
          ? [
              {
                key: "__actions__",
                title: "Actions",
                fixed: "right" as const,
                width: 120,
                align: "center" as const,
                render: (_value: unknown, row: DriverComplianceRow) =>
                  React.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                    },
                    React.createElement(Button, {
                      type: "text",
                      icon: React.createElement(EditOutlined),
                      "aria-label": "Edit",
                      onClick: () => onDriverEdit(row),
                    }),
                    React.createElement(
                      Dropdown,
                      {
                        menu: {
                          items: [
                            {
                              key: "change-status",
                              label: "Change Status",
                              icon: React.createElement(SwapOutlined),
                              onClick: () => onChangeStatus(row),
                            },
                          ],
                        },
                        trigger: ["click"],
                        placement: "bottomRight",
                      },
                      React.createElement(Button, {
                        type: "text",
                        icon: React.createElement(MoreOutlined),
                        "aria-label": "More actions",
                      }),
                    ),
                  ),
              },
            ]
          : onDriverEdit
          ? [
            col.actions<DriverComplianceRow>(
              [action.edit(onDriverEdit as any)],
              { width: 80 },
            ),
          ]
          : []),
      ]) as any[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onDriverEdit, onChangeStatus],
  );

  const columns = view === "Vehicle" ? vehicleColumns : driverColumns;

  return {
    columns,
    tableState,
    setTableState,
    search,
    handleSearch,
    queryArgs,
  };
}
