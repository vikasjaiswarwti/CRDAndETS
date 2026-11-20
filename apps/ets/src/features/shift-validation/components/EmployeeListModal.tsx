// src/features/shift-validation/components/EmployeeListModal.tsx
//
// Opens a modal listing all employees for the selected office + wise-id.
// Calls POST /Report/UserListbyWiseIdReportContent.

import React, { useEffect } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import {
  AppTable,
  type AppTableColumn,
} from "../../../shared/components/PopupTable/PopupTable";
import {
  useLazyGetEmployeeListByWiseIdQuery,
  type EmployeeListItem,
} from "../services/shiftValidationApi";
import { T } from "../constants/Token";

interface EmployeeListModalProps {
  open: boolean;
  onClose: () => void;
  locCode: number | null;
  shiftValidationID: number; // currentMode (1–5)
  wiseId: string;
  officeName: string;
  wiseLabel?: string;
}

const COLUMNS: AppTableColumn<EmployeeListItem>[] = [
  { key: "CommutrID", label: "#", width: 52, align: "center" },
  { key: "Name", label: "NAME", width: 160 },
  { key: "OfficeName", label: "OFFICE", width: 120 },
  { key: "MobileNo", label: "MOBILE", width: 120 },
  { key: "EmailID", label: "EMAIL", width: 220 },
  {
    key: "Address",
    label: "ADDRESS",
    width: 200,
    render: (v) =>
      v ? (
        <span
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            whiteSpace: "normal",
            wordBreak: "break-word",
            lineHeight: 1.45,
            maxWidth: 200,
          }}
        >
          {v}
        </span>
      ) : (
        "—"
      ),
  },
];

export const EmployeeListModal: React.FC<EmployeeListModalProps> = ({
  open,
  onClose,
  locCode,
  shiftValidationID,
  wiseId,
  officeName,
  wiseLabel,
}) => {
  const { Modal } = useUILibrary();

  const [fetchEmployees, { data = [], isFetching, isError }] =
    useLazyGetEmployeeListByWiseIdQuery();

  // Fetch whenever modal opens with valid params
  useEffect(() => {
    if (!open || !locCode) return;
    fetchEmployees({
      LocCode: locCode,
      shiftValidationID,
      wiseId: wiseId ?? "",
    });
  }, [open, locCode, shiftValidationID, wiseId, fetchEmployees]);

  const subtitle = [
    officeName,
    wiseLabel && wiseId ? `${wiseLabel}: ${wiseId}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={860}
      title={
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>
            Employee List
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 12,
                color: T.textSecondary,
                marginTop: 2,
                fontWeight: 400,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      }
      destroyOnClose
    >
      {/* Count badge */}
      {!isFetching && !isError && data.length > 0 && (
        <div
          style={{
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "3px 10px",
              borderRadius: 99,
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.18)",
              fontSize: 12,
              fontWeight: 700,
              color: "#6366f1",
            }}
          >
            {data.length} employee{data.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {isError && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: T.textSecondary,
            fontSize: 13,
          }}
        >
          Failed to load employees. Please try again.
        </div>
      )}

      {!isError && (
        <AppTable<EmployeeListItem>
          columns={COLUMNS}
          data={data}
          rowKey="CommutrID"
          loading={isFetching}
          loadingText="Loading employees…"
          emptyText="No employees found for the selected criteria."
          maxHeight={460}
          striped
        />
      )}
    </Modal>
  );
};

export default EmployeeListModal;
