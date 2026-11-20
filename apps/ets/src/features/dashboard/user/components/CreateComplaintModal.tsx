import React, { useState, useCallback } from "react";
import { FileTextOutlined, SendOutlined } from "@ant-design/icons";
import { useUILibrary } from "../../../../shared/lib/ui-lib/ui-library-context"; // adjust to your import path
import type { CreateComplaintRequest } from "../types/employeeProfile.types";
import type { FieldError } from "../../../../shared/types/api-error.types";
import { useGetComplaintListQuery } from "../services/employeeProfileApi";
import { TRIP_TYPE_OPTIONS } from "../constants/employeeProfileFormFields";
import { T } from "../../../../styles/tokens";
import dayjs from "dayjs";

// ── Types ────────────────────────────────────────────────────────────────────

interface ComplaintFormState {
  tripType: number | null;
  tripDate: string;
  complaintType: number | null;
  complainMessage: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CreateComplaintRequest) => void;
  empId: number; // logged-in employee, not user-entered
  isSubmitting?: boolean;
  serverErrors?: FieldError[] | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const FIELD_STYLE: React.CSSProperties = {
  borderRadius: 8,
  borderColor: "#D1E8DD",
  fontSize: 13,
};

const FieldWrap: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required, error, children }) => (
  <div style={{ marginBottom: 14 }}>
    <label
      style={{
        display: "block",
        fontSize: 11,
        fontWeight: 600,
        marginBottom: 4,
        letterSpacing: 0.3,
        textTransform: "uppercase",
      }}
    >
      {label}
      {required && <span style={{ color: "#E53E3E", marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {error && (
      <div
        style={{
          color: "#C53030",
          fontSize: 11,
          marginTop: 3,
          paddingLeft: 2,
        }}
      >
        {error}
      </div>
    )}
  </div>
);

const MAX_MESSAGE_LEN = 500;

// ── Component ─────────────────────────────────────────────────────────────────

export const CreateComplaintModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  empId,
  isSubmitting,
  serverErrors,
}) => {
  const { Input, Button, Modal, Select, DatePicker } = useUILibrary();

  const [form, setForm] = useState<ComplaintFormState>({
    tripType: null,
    tripDate: "",
    complaintType: null,
    complainMessage: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ComplaintFormState, string>>
  >({});

  const { data, isLoading } = useGetComplaintListQuery(undefined, {
    skip: !open,
  });
  const set = useCallback(
    <K extends keyof ComplaintFormState>(
      key: K,
      value: ComplaintFormState[K],
    ) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
    },
    [],
  );

  const validate = (): boolean => {
    const errs: Partial<Record<keyof ComplaintFormState, string>> = {};

    if (form.tripType === null) errs.tripType = "Trip type is required";
    if (!form.tripDate.trim()) errs.tripDate = "Trip date is required";
    if (form.complaintType === null)
      errs.complaintType = "Complaint type is required";

    if (!form.complainMessage.trim()) {
      errs.complainMessage = "Please describe the complaint";
    } else if (form.complainMessage.length > MAX_MESSAGE_LEN) {
      errs.complainMessage = `Must be under ${MAX_MESSAGE_LEN} characters`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: CreateComplaintRequest = {
      tripType: form.tripType as number,
      tripDate: form.tripDate,
      complaintType: form.complaintType as number,
      complainMessage: form.complainMessage.trim(),
      empId,
    };

    await onSubmit(payload);
  };

  const handleClose = () => {
    setForm({
      tripType: null,
      tripDate: "",
      complaintType: null,
      complainMessage: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      width={480}
      destroyOnClose
      footer={null}
      styles={{
        mask: { background: "rgba(0, 60, 30, 0.35)" },
        content: { borderRadius: 16, padding: 0, overflow: "hidden" },
        header: {
          padding: "12px 16px 8px",
          borderBottom: "1px solid #F0F7F4",
          marginBottom: 0,
        },
        body: { padding: 0, overflow: "hidden" },
      }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "#F0FAF4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileTextOutlined style={{ color: "#1B4332", fontSize: 15 }} />
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#1B4332",
                lineHeight: 1.3,
              }}
            >
              Raise a Complaint
            </div>
            <div style={{ fontSize: 11, color: "#8A9E99", fontWeight: 400 }}>
              Let us know what went wrong with your trip
            </div>
          </div>
        </div>
      }
      style={{ top: 20 }}
    >
      {/* ── Form body ── */}
      <div style={{ padding: "12px" }}>
        {/* Trip Type */}
        <FieldWrap label="Trip Type" required error={errors.tripType}>
          <Select
            value={form.tripType ?? undefined}
            onChange={(val: number) => set("tripType", val)}
            placeholder="Select trip type"
            options={TRIP_TYPE_OPTIONS}
            style={{
              ...FIELD_STYLE,
              width: "100%",
              background: `${T.formcss.inputBg}`,
              border: `1px solid ${T.formcss.greyBorder}`,
            }}
          />
        </FieldWrap>

        {/* Trip Date */}
        <FieldWrap label="Trip Date" required error={errors.tripDate}>
          <DatePicker
            value={form.tripDate ? dayjs(form.tripDate) : null}
            onChange={(_date: unknown, dateString: string | string[]) =>
              set(
                "tripDate",
                Array.isArray(dateString) ? dateString[0] : dateString,
              )
            }
            style={{
              ...FIELD_STYLE,
              width: "100%",
              background: `${T.formcss.inputBg}`,
              border: `1px solid ${T.formcss.greyBorder}`,
            }}
            disabledDate={(current) =>
              current && current.isAfter(dayjs(), "day")
            }
          />
        </FieldWrap>

        {/* Complaint Type */}
        <FieldWrap label="Complaint Type" required error={errors.complaintType}>
          <Select
            value={form.complaintType ?? undefined}
            onChange={(val: number) => set("complaintType", val)}
            placeholder="Select complaint type"
            options={data}
            loading={isLoading}
            style={{
              ...FIELD_STYLE,
              width: "100%",
              background: `${T.formcss.inputBg}`,
              border: `1px solid ${T.formcss.greyBorder}`,
            }}
          />
        </FieldWrap>

        {/* Complaint Message */}
        <FieldWrap
          label="Complaint Details"
          required
          error={errors.complainMessage}
        >
          <Input.TextArea
            value={form.complainMessage}
            onChange={(e: any) => set("complainMessage", e.target.value)}
            placeholder="Describe your complaint in detail"
            rows={3}
            maxLength={MAX_MESSAGE_LEN}
            style={{
              ...FIELD_STYLE,
              background: `${T.formcss.inputBg}`,
              border: `1px solid ${T.formcss.greyBorder}`,
            }}
          />
        </FieldWrap>

        {/* Server errors */}
        {serverErrors && serverErrors.length > 0 && (
          <div
            style={{
              background: "#FFF5F5",
              border: "1px solid #FC8181",
              borderRadius: 8,
              padding: "8px 12px",
              marginBottom: 10,
            }}
          >
            {serverErrors.map((e, i) => (
              <div key={i} style={{ color: "#C53030", fontSize: 12 }}>
                • {e.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          style={{
            borderRadius: 999,
            border: "1px solid #D1E8DD",
            color: "#52796F",
            fontWeight: 600,
            paddingInline: 20,
            height: 40,
          }}
        >
          Cancel
        </Button>

        <Button
          type="primary"
          loading={isSubmitting}
          onClick={handleSubmit}
          icon={<SendOutlined />}
          style={{
            borderRadius: 999,
            background: "#1B4332",
            border: "1px solid #1B4332",
            fontWeight: 600,
            paddingInline: 28,
            height: 40,
          }}
        >
          Submit
        </Button>
      </div>
    </Modal>
  );
};
