import React, { useEffect } from "react";
import { Form, Input, Switch, Spin } from "antd";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../../../shared/constants/tokens";
import { useIsMobile } from "../../../shared/customHooks/useIsMobile";
import { useVendorForm } from "../hooks/useVendorForm";
import type { Vendor } from "../services/VendorApi";

const S = {
  label: {
    fontSize: 11,
    fontWeight: 500,
    marginBottom: 2,
    color: "#374151",
    display: "block",
  } as React.CSSProperties,
  input: { height: 32, fontSize: 12 } as React.CSSProperties,
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
  record: Vendor | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddEditVendorModal: React.FC<Props> = ({
  open,
  record,
  onClose,
  onSuccess,
}) => {
  const { Modal } = useUILibrary();
  const { color, spacing, radius, font } = useTokens();
  const isMobile = useIsMobile();

  const { form, isEditing, submitting, openForCreate, openForEdit, submit } =
    useVendorForm({ onSuccess });

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
          {isEditing ? "Edit Vendor" : "Add Vendor"}
        </span>
      }
      footer={null}
      centered={!isMobile}
      width={isMobile ? "100%" : 560}
      style={isMobile ? { top: 0, maxWidth: "100%", margin: 0 } : undefined}
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
            label="Vendor Name"
            name="name"
            required
            rules={[{ required: true, message: "Vendor name is required" }]}
            span={2}
          >
            <Input style={S.input} placeholder="Wti Cabs" />
          </Field>

          <Field
            label="Contact Number"
            name="contactNumber"
            required
            rules={[{ required: true, message: "Contact number is required" }]}
          >
            <Input style={S.input} placeholder="9876543210" maxLength={10} />
          </Field>

          <Field
            label="Email"
            name="email"
            rules={[{ type: "email", message: "Enter a valid email" }]}
          >
            <Input style={S.input} placeholder="Optional" />
          </Field>

          <Field label="Address" name="address" span={2}>
            <Input style={S.input} placeholder="Optional" />
          </Field>

          <div>
            <label style={S.label}>Active</label>
            <Form.Item
              name="isActive"
              valuePropName="checked"
              style={{ ...S.item, paddingTop: 4 }}
            >
              <Switch
                size="small"
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </Form.Item>
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
          {submitting ? "Saving…" : isEditing ? "Update Vendor" : "Add Vendor"}
        </button>
      </div>
    </Modal>
  );
};
