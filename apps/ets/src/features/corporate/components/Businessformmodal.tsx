import React, { useMemo } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppForm } from "../../../shared/components/AppForm/AppForm";
import { BUSINESS_FORM_FIELDS } from "../constants/Businessformfields";
import type { Business } from "../types/Business.types";
import type { FieldError } from "../../../shared/types/api-error.types";

interface BusinessFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: Business | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
}

export const BusinessFormModal: React.FC<BusinessFormModalProps> = ({
  open,
  onClose,
  editingRecord,
  onSubmit,
  isSubmitting,
  serverErrors,
}) => {
  const { Modal } = useUILibrary();

  const corporateRegisterUrl = window.location.origin;

  const initialValues = useMemo(() => {
    return editingRecord
      ? {
          ...editingRecord,
          businessUrl: corporateRegisterUrl,
          // scheduleUpdateVersion: editingRecord.scheduleUpdateVersion ?? "",
        }
      : {
          businessFullName: "",
          businessShortName: "",
          businessId: null,
          // serviceID: null,
          businessUrl: corporateRegisterUrl,
          // updation_Lmit: null,
          // scheduleUpdateVersion: "WEB",
          // isAreaZone: false,
        };
  }, [editingRecord]); // only recompute
  //   // {
  //  "businessFullName": "Western Union",
  //  "businessShortName": "WU",
  //  "businessUrl": ""
  // }
  // POST {{HostAddress}}/Business/UpdateBusiness
  // Content-Type: application/json
  // Authorization: Bearer {{AccessToken}}
  // {
  //    "BusinessId": 1,
  //    "businessFullName": "Western Union pvt ltd",
  //    "businessShortName": "WU",
  //    "businessUrl": "www.wu.com"
  // }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1B4332" }}>
            {editingRecord ? "Edit Corporate" : "Register Corporate"}
          </div>
          <div
            style={{
              marginTop: 8,
              padding: "10px 14px",
              backgroundColor: "#F5F5F5",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <span
              style={{
                color: "#6B7280",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              Business URL
            </span>

            <span
              style={{
                color: "#111827",
                fontWeight: 500,
                wordBreak: "break-all",
              }}
            >
              {corporateRegisterUrl}
            </span>
          </div>
        </div>
      }
      width={580}
      destroyOnClose
      footer={null}
      styles={{
        header: { borderBottom: "none" },
        mask: { background: "rgba(0, 60, 30, 0.35)" },
      }}
      style={{ borderRadius: 16, overflow: "hidden" }}
    >
      <AppForm
        key={editingRecord ? `edit-${editingRecord.businessId}` : "create"}
        fields={BUSINESS_FORM_FIELDS}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onClose}
        serverErrors={serverErrors}
        isSubmitting={isSubmitting}
        submitLabel={editingRecord ? "Save Changes" : "Create Corporate"}
        showCancel
        columns={2}
        resetOnSuccess
      />
    </Modal>
  );
};

export default BusinessFormModal;
