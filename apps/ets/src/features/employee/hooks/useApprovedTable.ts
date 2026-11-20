import React, { useMemo, useCallback } from "react";
import { col, action } from "../../../shared/components/AppTable/AppTable";
import { useTableState } from "../../../shared/hooks/useTableState";
import type { ApprovedUser } from "../types/Employee.types";
import { ACTIVE_MAP } from "../constants/Employeeconstants";
import { EMPLOYEE_CONFIG } from "../config";
import { CarOutlined, StopOutlined } from "@ant-design/icons";

import {
  ShieldCheck,
  MapPinned,
  KeyRound,
  UserX,
  RotateCcw,
  NotebookPen,
  LockKeyhole,
} from "lucide-react";
// import { CarOutlined } from "@ant-design/icons";

export const useApprovedTable = ({
  onEdit,
  onCancel,
  onTransport,
  onChangeRole, // ← add
  onMapLocations, // ← add
  onResetAdhocCount, // ← add
  onSendCredentials,
  onResetNoShow,
  onResetPassword,
}: {
  onEdit: (record: ApprovedUser) => void;
  onCancel: (record: ApprovedUser) => void;
  onTransport: (record: ApprovedUser) => void;
  onChangeRole: (record: ApprovedUser) => void; // ← add
  onMapLocations: (record: ApprovedUser) => void; // ← add
  onSendCredentials: (record: ApprovedUser) => void;
  onResetNoShow: (record: ApprovedUser) => void;
  onResetAdhocCount: (record: ApprovedUser) => void; // ← add
  onResetPassword: (record: ApprovedUser) => void;
}) => {
  const [tableState, setTableState] = useTableState({
    syncUrl: false,
    defaultPageSize: 10,
  });

  const handleSearch = useCallback(
    (value: string) => {
      setTableState((prev) => ({ ...prev, searchTerm: value, page: 1 }));
    },
    [setTableState],
  );

  const columns = useMemo(() => {
    // ✅ Build actions based on config flags
    const rowActions: any[] = [
      EMPLOYEE_CONFIG.canEdit && { ...action.edit(onEdit), label: "Edit" },
      // EMPLOYEE_CONFIG.canCancel &&
      //   onCancel && {
      //     ...action.cancel(onCancel),
      //     label: "Deactivate",
      //     hidden: (record: ApprovedUser) => !record.isActive,
      //   },
      // ✅ Add transport custom action
      // Block — visible only when transport is currently ON
      EMPLOYEE_CONFIG.canTransport &&
      onTransport && {
        ...action.custom({
          label: "Block Transportation",
          icon: React.createElement(StopOutlined, {
            style: { color: "#dc2626", fontSize: 15 },
          }),
          onClick: onTransport,
          hidden: (record: ApprovedUser) => !(record.transport ?? false),
        }),
      },

      EMPLOYEE_CONFIG.canTransport &&
      onTransport && {
        ...action.custom({
          label: "Enable Transportation",
          icon: React.createElement(CarOutlined, {
            style: { color: "#059669", fontSize: 15 },
          }),
          onClick: onTransport,
          hidden: (record: ApprovedUser) => !!(record.transport ?? true),
        }),
      },
      // {
      //   key: "changeRole",
      //   label: "Change Role",
      //   onClick: onChangeRole,

      // },
      {
        ...action.custom({
          label: "Change Role",
          icon: React.createElement(ShieldCheck, { size: 16 }),
          onClick: onChangeRole,
        }),
      },

      {
        ...action.custom({
          label: "Reset No-Show Count",
          icon: React.createElement(RotateCcw, { size: 16 }),
          onClick: onResetNoShow,
        }),
      },
      // {
      //   key: "mapLocations",
      //   label: "Map Locations",
      //   onClick: onMapLocations,
      // },
      {
        ...action.custom({
          label: "Map Locations",
          icon: React.createElement(MapPinned, { size: 16 }),
          onClick: onMapLocations,
        }),
      },
      {
        ...action.custom({
          label: "Reset Adhoc Count",
          icon: React.createElement(NotebookPen, { size: 16 }),
          onClick: onResetAdhocCount,
        }),
      },
      {
        ...action.custom({
          label: "Send Credentials",
          icon: React.createElement(LockKeyhole , { size: 16 }),
          onClick: onSendCredentials,
        }),
      },
      EMPLOYEE_CONFIG.canResetPassword && {
        ...action.custom({
          label: "Reset Password",
          icon: React.createElement(KeyRound, { size: 16 }),
          onClick: onResetPassword,
        }),
      },
      // Deactivate LAST
      EMPLOYEE_CONFIG.canCancel &&
      onCancel && {
        ...action.custom({
          label: "Deactivate",
          icon: React.createElement(UserX, {
            size: 16,
            color: "#ef4444", // red
          }),
          onClick: onCancel,
          hidden: (record: ApprovedUser) => !record.isActive,
        }),
      },
    ].filter(Boolean); // removes false entries

    return [
      // col.text("firstName", "First Name"),
      // col.text("lastName", "Last Name"),
      col.text("firstName", "Full Name", {
        width: 200,
        render: (_val, record: ApprovedUser) =>
          `${record.firstName}  ${record?.middleName ?? ""} ${record.lastName}`,
      }),
      col.text("mobileNo", "Mobile", { width: 130 }),
      col.text("emailId", "Email", { width: 250 }),
      col.text("locationName", "Location", { width: 160 }),
      col.text("noShowCount", "NoShows Left", { width: 130 }),
      col.status("isActive", "Status", { map: ACTIVE_MAP, width: 110 }),
      col.dateTime("createdOn", "Registered On", { width: 170 }),
      // col.actions([{ ...action.edit(onEdit), label: "Update Profile" },
      // { ...action.cancel(onCancel), label: "Deactivate", hidden: (record: ApprovedUser) => !record.isActive, }
      // ]),
      ...(rowActions.length > 0
        ? [col.actions(rowActions, { width: 120 })]
        : []), // ✅ skip actions col if none
    ];
  }, [
    onEdit,
    onCancel,
    onTransport,
    onChangeRole,
    onMapLocations,
    onSendCredentials,
    onResetAdhocCount,
    onResetPassword,
  ]);

  return { columns, tableState, setTableState, handleSearch };
};
