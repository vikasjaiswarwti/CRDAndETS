import React, { useEffect } from "react";
import { Form } from "antd";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { T } from "../../../styles/tokens";
import type { RouteTableItem } from "../types/routeTable.types";
import type { FieldError } from "../../../shared/types/api-error.types";

interface RouteFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: RouteTableItem | null;
  locationOptions: { label: string; value: number }[];
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
}

const FIELD_STYLE: React.CSSProperties = {
  border: `1px solid ${T.formcss.greyBorder}`,
  width: "100%",
  background: T.formcss.inputBg,
};

const LABEL_STYLE: React.CSSProperties = {
  fontWeight: 600,
  color: "#1B4332",
  fontSize: 12,
};

export const RouteFormModal: React.FC<RouteFormModalProps> = ({
  open,
  onClose,
  editingRecord,
  locationOptions,
  onSubmit,
  isSubmitting,
  serverErrors,
}) => {
  const { Modal, Input, Select, Switch, Button, Typography } = useUILibrary();
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;

    if (editingRecord) {
      form.setFieldsValue({
        routeName: editingRecord.routeName,
        isActive: editingRecord.isActive,
        locCode: editingRecord.locCode ?? undefined,
        routeNo: editingRecord.routeNo ?? undefined,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
  }, [open, editingRecord, form]);

  useEffect(() => {
    if (!serverErrors?.length) return;
    form.setFields(
      serverErrors.map((e) => ({ name: e.field, errors: [e.message] })),
    );
  }, [serverErrors, form]);

  const handleFinish = async (values: Record<string, unknown>) => {
    await onSubmit({
      routeName: String(values.routeName ?? "").trim(),
      isActive: Boolean(values.isActive),
      locCode:
        values.locCode !== undefined && values.locCode !== null
          ? Number(values.locCode)
          : null,
      routeNo:
        values.routeNo !== undefined &&
        values.routeNo !== null &&
        values.routeNo !== ""
          ? Number(values.routeNo)
          : null,
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Typography.Text
          style={{ fontSize: 20, fontWeight: 700, color: "#1B4332" }}
        >
          {editingRecord ? "Edit Route" : "Add Route"}
        </Typography.Text>
      }
      width={480}
      destroyOnClose
      footer={null}
      styles={{
        mask: { background: "rgba(0, 60, 30, 0.35)" },
        header: { borderBottom: "none", paddingBottom: 0 },
        content: { borderRadius: 16 },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        requiredMark={false}
      >
        <Form.Item
          name="locCode"
          label={<span style={LABEL_STYLE}>Location</span>}
          rules={[{ required: true, message: "Location is required" }]}
        >
          <Select
            options={locationOptions}
            placeholder="Select location"
            style={FIELD_STYLE}
          />
        </Form.Item>
        <Form.Item
          name="routeName"
          label={<span style={LABEL_STYLE}>Route Name</span>}
          rules={[{ required: true, message: "Route name is required" }]}
        >
          <Input placeholder="Enter route name" style={FIELD_STYLE} />
        </Form.Item>

        <Form.Item
          name="routeNo"
          label={<span style={LABEL_STYLE}>Route No</span>}
          rules={[{ required: true, message: "Route number is required" }]}
        >
          <Input
            type="number"
            placeholder="Enter route number"
            style={FIELD_STYLE}
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label={<span style={LABEL_STYLE}>Active</span>}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 8,
            paddingTop: 16,
            borderTop: "1px solid #B7E4C7",
          }}
        >
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              borderRadius: 50,
              borderColor: "#1B4332",
              color: "#1B4332",
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            style={{
              borderRadius: 50,
              background: "#1B4332",
              borderColor: "#1B4332",
            }}
          >
            {editingRecord ? "Save Changes" : "Create Route"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default RouteFormModal;
