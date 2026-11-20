import React, { useEffect, useMemo } from "react";
import { Form, Input, Select, DatePicker, Spin } from "antd";
import dayjs from "dayjs";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../../../shared/constants/tokens";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { useFleetDriverForm } from "../hooks/useFleetDriverForm";
import { useGetVendorsQuery } from "../services/VendorApi";
import type { FleetDriver } from "../services/FleetDriverApi";

import { useGetCurrentStatusesQuery } from "../services/VehicleQrApi";

const MOBILE_PATTERN = /^[6-9]\d{9}$/;
const NAME_PATTERN = /^[A-Za-z\s.'-]{2,100}$/;
const LICENCE_PATTERN = /^[A-Za-z0-9-]{6,20}$/;

const S = {
  label: {
    fontSize: 11,
    fontWeight: 500,
    marginBottom: 2,
    color: "#374151",
    display: "block",
  } as React.CSSProperties,
  input: { height: 32, fontSize: 12 } as React.CSSProperties,
  select: { width: "100%", fontSize: 12 } as React.CSSProperties,
  item: { margin: 0 } as React.CSSProperties,
};

interface FieldProps {
  label: string;
  name: string;
  required?: boolean;
  rules?: any[];
  span?: number;
  children: React.ReactNode;
}
const Field: React.FC<FieldProps> = ({
  label,
  name,
  required,
  rules = [],
  span = 1,
  children,
}) => {
  const isMobile = useIsMobile();
  const effectiveSpan = isMobile ? 1 : span;
  return (
    <div style={{ gridColumn: `span ${effectiveSpan}` }}>
      <label style={S.label}>
        {label}
        {required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      <Form.Item
        name={name}
        rules={rules}
        style={S.item}
        validateTrigger="onChange"
      >
        {children}
      </Form.Item>
    </div>
  );
};

interface Props {
  open: boolean;
  record: FleetDriver | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Vendor options here come from the dedicated VendorApi (getVendors), not the
 * generic useLookups hook — this is a proper per-driver "which vendor owns
 * this driver" assignment, not the vendor/driver lookups we removed from the
 * Vehicle QR modals.
 */
export const AddEditFleetDriverModal: React.FC<Props> = ({
  open,
  record,
  onClose,
  onSuccess,
}) => {
  const { Modal } = useUILibrary();
  const { color, spacing, radius, font } = useTokens();
  const isMobile = useIsMobile();

  const { data: vendorData } = useGetVendorsQuery();
  const vendorOptions = useMemo(
    () =>
      (vendorData?.items ?? []).map((v) => ({ label: v.name, value: v.id })),
    [vendorData],
  );

  const { data: currentStatusData } = useGetCurrentStatusesQuery();
  const currentStatusOptions = useMemo(
    () =>
      (currentStatusData?.items ?? []).map((s) => ({
        label: s.statusName,
        value: s.id,
      })),
    [currentStatusData],
  );

  const { form, isEditing, submitting, openForCreate, openForEdit, submit } =
    useFleetDriverForm({ onSuccess });

  useEffect(() => {
    if (!open) return;
    if (record) {
      openForEdit(record);
    } else {
      openForCreate();
    }
  }, [open, record]); // eslint-disable-line react-hooks/exhaustive-deps

  const G2: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
    gap: "10px 16px",
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span style={{ fontSize: font.sizeLg, fontWeight: 600 }}>
          {isEditing ? "Edit Driver" : "Add Driver"}
        </span>
      }
      footer={null}
      //   centered={!isMobile}
      width={isMobile ? "100%" : 640}
      style={isMobile ? { top: 0, maxWidth: "100%" } : { top: 20 }}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        size="small"
        style={{
          padding: isMobile
            ? `${spacing.md}px ${spacing.md}px`
            : `${spacing.md}px ${spacing.xl}px`,
        }}
      >
        <div style={G2}>
          <Field
            label="Driver Name"
            name="driverName"
            required
            rules={[
              { required: true, message: "Driver name is required" },
              { pattern: NAME_PATTERN, message: "Enter a valid name" },
            ]}
          >
            <Input style={S.input} placeholder="Full name" />
          </Field>

          <Field
            label="Mobile Number"
            name="driverNumber"
            required
            rules={[
              { required: true, message: "Mobile number is required" },
              {
                pattern: MOBILE_PATTERN,
                message: "Enter a valid 10-digit mobile number",
              },
            ]}
          >
            <Input style={S.input} placeholder="9876543210" maxLength={10} />
          </Field>

          <Field
            label="Date of Birth"
            name="dob"
            required
            rules={[
              {
                validator: (_: any, value: any) => {
                  if (!value)
                    return Promise.reject(
                      new Error("Date of birth is required"),
                    );
                  if (!dayjs.isDayjs(value) || !value.isValid()) {
                    return Promise.reject(new Error("Enter a valid date"));
                  }
                  if (value.isAfter(dayjs())) {
                    return Promise.reject(
                      new Error("Date of birth cannot be in the future"),
                    );
                  }
                  const age = dayjs().diff(value, "year");
                  if (age < 18) {
                    return Promise.reject(
                      new Error("Driver must be at least 18 years old"),
                    );
                  }
                  if (age > 75) {
                    return Promise.reject(
                      new Error("Please check the date of birth"),
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker
              size="small"
              format="DD/MM/YYYY"
              style={{ width: "100%", height: 32, fontSize: 12 }}
            />
          </Field>

          <Field
            label="Licence Number"
            name="licenceNumber"
            required
            rules={[
              { required: true, message: "Licence number is required" },
              {
                pattern: LICENCE_PATTERN,
                message: "Enter a valid licence number",
              },
            ]}
          >
            <Input style={S.input} placeholder="DL01202312345" />
          </Field>

          <Field
            label="Vendor"
            name="vendorId"
            required
            rules={[{ required: true, message: "Vendor is required" }]}
          >
            <Select
              style={S.select}
              size="small"
              placeholder="Select vendor"
              options={vendorOptions}
              showSearch
              optionFilterProp="label"
            />
          </Field>

          <Field
            label="Status"
            name="currentStatusId"
            required
            rules={[{ required: true, message: "Status is required" }]}
          >
            <Select
              style={S.select}
              size="small"
              placeholder="Select status"
              options={currentStatusOptions}
            />
          </Field>
        </div>
      </Form>

      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column-reverse" : "row",
          justifyContent: isMobile ? "stretch" : "flex-end",
          gap: spacing.sm,
          padding: isMobile
            ? `${spacing.sm}px ${spacing.md}px ${spacing.md}px`
            : `${spacing.sm}px ${spacing.xl}px ${spacing.md}px`,
          borderTop: "1px solid #f3f4f6",
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: "7px 18px",
            borderRadius: radius.md,
            border: "1px solid #d9d9d9",
            background: "#fff",
            cursor: "pointer",
            fontSize: font.sizeSm,
            fontFamily: "inherit",
            width: isMobile ? "100%" : "auto",
          }}
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={submitting}
          style={{
            padding: "7px 22px",
            borderRadius: radius.md,
            border: "none",
            background: submitting ? "#9ca3af" : color.primary,
            color: "#fff",
            cursor: submitting ? "not-allowed" : "pointer",
            fontSize: font.sizeSm,
            fontFamily: "inherit",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            width: isMobile ? "100%" : "auto",
          }}
        >
          {submitting && <Spin size="small" />}
          {submitting ? "Saving…" : isEditing ? "Update Driver" : "Add Driver"}
        </button>
      </div>
    </Modal>
  );
};
