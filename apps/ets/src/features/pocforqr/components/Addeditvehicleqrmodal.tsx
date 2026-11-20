import React, { useEffect, useMemo } from "react";
import { Form, Input, Select, Spin } from "antd";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../../../shared/constants/tokens";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { useVehicleQrForm } from "../hooks/useVehicleQrForm";
import { useGetVendorsQuery } from "../services/VendorApi";
import { useGetFleetDriversQuery } from "../services/FleetDriverApi";
import {
  useGetCurrentStatusesQuery,
  useGetVehicleTypesQuery,
  type VehicleQr,
} from "../services/VehicleQrApi";

const VEHICLE_REG_PATTERN =
  /^[A-Za-z]{2}[-\s]?\d{1,2}[-\s]?[A-Za-z]{1,3}[-\s]?\d{4}$/;
const COMPANY_PATTERN = /^[A-Za-z0-9&.\s-]{2,50}$/;
const MODEL_PATTERN = /^[A-Za-z0-9\s-]{1,50}$/;

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
  normalize?: (value: any) => any;
}

// Same pattern used across the compliance modals: Field clamps its own
// gridColumn span to 1 on mobile so nothing breaks the one-field-per-row layout.
const Field: React.FC<FieldProps> = ({
  label,
  name,
  required,
  rules = [],
  span = 1,
  children,
  normalize,
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
        normalize={normalize}
        validateTrigger="onChange"
      >
        {children}
      </Form.Item>
    </div>
  );
};

interface Props {
  open: boolean;
  record: VehicleQr | null;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Vendor and Driver options are pulled from the dedicated VendorApi /
 * FleetDriverApi services (same :5002 backend as this Vehicle QR module) —
 * NOT the generic useLookups hook, since those are a different master list
 * tied to the compliance module. vehicleTypeOptions/currentStatusOptions
 * still come from useLookups until this module gets its own equivalents.
 */
export const AddEditVehicleQrModal: React.FC<Props> = ({
  open,
  record,
  onClose,
  onSuccess,
}) => {
  const { Modal } = useUILibrary();
  const { color, spacing, radius, font } = useTokens();
  const isMobile = useIsMobile();

  const { data: currentStatusData } = useGetCurrentStatusesQuery();
  const currentStatusOptions = useMemo(
    () =>
      (currentStatusData?.items ?? []).map((s) => ({
        label: s.statusName,
        value: s.id,
      })),
    [currentStatusData],
  );

  const { data: vehicleTypeData } = useGetVehicleTypesQuery();
  const vehicleTypeOptions = useMemo(
    () =>
      (vehicleTypeData?.items ?? []).map((t) => ({
        label: t.vehicleTypeDesc,
        value: t.vehicleTypeCode,
      })),
    [vehicleTypeData],
  );

  const { data: vendorData } = useGetVendorsQuery();
  const vendorOptions = useMemo(
    () =>
      (vendorData?.items ?? []).map((v) => ({ label: v.name, value: v.id })),
    [vendorData],
  );

  const { data: driverData } = useGetFleetDriversQuery();
  const driverOptions = useMemo(
    () =>
      (driverData?.items ?? []).map((d) => ({
        label: d.driverName,
        value: d.id,
      })),
    [driverData],
  );

  const { form, isEditing, submitting, openForCreate, openForEdit, submit } =
    useVehicleQrForm({ onSuccess });

  useEffect(() => {
    if (!open) return;
    if (record) openForEdit(record);
    else openForCreate();
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
          {isEditing ? "Edit Vehicle" : "Add Vehicle"}
        </span>
      }
      footer={null}
      // centered={!isMobile}
      width={isMobile ? "100%" : 640}
      // style={isMobile ? { top: 0, maxWidth: "100%", margin: 0 } : undefined}
      style={{ top: 60 }}
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
            label="Vehicle Number"
            name="vehicleNumber"
            required
            rules={[
              { required: true, message: "Vehicle number is required" },
              {
                pattern: VEHICLE_REG_PATTERN,
                message: "Enter a valid vehicle number (e.g. UP-16-PH-8228)",
              },
            ]}
            normalize={(val: string) => (val ?? "").toUpperCase()}
          >
            <Input style={S.input} placeholder="UP-16-PH-8228" maxLength={15} />
          </Field>

          <Field
            label="Vehicle Company"
            name="vehicleCompany"
            required
            rules={[
              { required: true, message: "Vehicle company is required" },
              {
                pattern: COMPANY_PATTERN,
                message: "Enter a valid company name",
              },
            ]}
          >
            <Input style={S.input} placeholder="TATA" />
          </Field>

          <Field
            label="Model"
            name="modal"
            required
            rules={[
              { required: true, message: "Model is required" },
              { pattern: MODEL_PATTERN, message: "Enter a valid model name" },
            ]}
          >
            <Input style={S.input} placeholder="Ace" />
          </Field>

          <Field
            label="Vehicle Type"
            name="vehicleTypeCode"
            required
            rules={[{ required: true, message: "Vehicle type is required" }]}
          >
            <Select
              style={S.select}
              size="small"
              placeholder="Select type"
              options={vehicleTypeOptions ?? []}
            />
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
              options={vendorOptions ?? []}
            />
          </Field>

          <Field label="Driver" name="driverId">
            <Select
              style={S.select}
              size="small"
              placeholder="Select driver (optional)"
              options={driverOptions ?? []}
              allowClear
              showSearch
              optionFilterProp="label"
            />
          </Field>

          <Field
            label="Current Status"
            name="currentStatusId"
            required
            rules={[{ required: true, message: "Status is required" }]}
          >
            <Select
              style={S.select}
              size="small"
              placeholder="Select status"
              options={currentStatusOptions ?? []}
            />
          </Field>

          <div style={{ display: "none" }}>
            {isEditing && (
              <Field label="QR Unique Code" name="qrUniqueCode">
                <Input
                  style={S.input}
                  disabled
                  placeholder="Generated automatically"
                />
              </Field>
            )}
          </div>
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
          {submitting
            ? "Saving…"
            : isEditing
              ? "Update Vehicle"
              : "Add Vehicle"}
        </button>
      </div>
    </Modal>
  );
};
