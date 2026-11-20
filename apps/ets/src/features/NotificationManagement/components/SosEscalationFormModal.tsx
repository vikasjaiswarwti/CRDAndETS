import React, { useEffect, useMemo } from "react";
import { Button, Form, Input, InputNumber, Modal, Select, Switch } from "antd";
import type { FieldError } from "../../../shared/types/api-error.types";
import type {
  CreateSosEscalationDto,
  SosEscalation,
} from "../types/notificationManagement.types";
import {
  MOBILE_RULE,
  digitsOnly,
} from "../constants/notificationManagementConstants";
import { T } from "../../../styles/tokens";

interface SosEscalationFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: SosEscalation | null;
  defaults?: Partial<CreateSosEscalationDto>;
  locationOptions: { label: string; value: number }[];
  onSubmit: (values: CreateSosEscalationDto) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
}

const SosEscalationFormModal: React.FC<SosEscalationFormModalProps> = ({
  open,
  onClose,
  editingRecord,
  defaults,
  locationOptions,
  onSubmit,
  isSubmitting,
  serverErrors,
}) => {
  const [form] = Form.useForm<CreateSosEscalationDto>();
  // Surface backend validation errors on the matching fields.
  useEffect(() => {
    if (!open || !serverErrors?.length) return;
    form.setFields(
      serverErrors.map((fe) => ({
        name: fe.field as keyof CreateSosEscalationDto,
        errors: [fe.message],
      })),
    );
  }, [open, serverErrors, form]);

  const initialValues = useMemo<Partial<CreateSosEscalationDto>>(
    () =>
      editingRecord
        ? {
            locCode: Number(editingRecord.locCode),
            orderNo: editingRecord.orderNo,
            recipientName: editingRecord.recipientName,
            recipientMobile: editingRecord.recipientMobile,
            isActive: editingRecord.isActive,
          }
        : {
            isActive: true,
            locCode: defaults?.locCode,
            orderNo: defaults?.orderNo,
          },
    // `defaults` is an inline object from the parent; depend on its fields.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editingRecord, defaults?.locCode, defaults?.orderNo],
  );

  // The form store outlives the modal, so stale values from the previous
  // open would otherwise win over the new initialValues. Reset on every open.
  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue(initialValues);
  }, [open, initialValues, form]);

  const handleFinish = async (values: CreateSosEscalationDto) => {
    await onSubmit({
      locCode: Number(values.locCode),
      orderNo: Number(values.orderNo),
      recipientName: values.recipientName.trim(),
      recipientMobile: values.recipientMobile,
      isActive: Boolean(values.isActive),
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        editingRecord ? "Edit Escalation Recipient" : "Add Escalation Recipient"
      }
      width={640}
      destroyOnHidden
      footer={null}
      styles={{
        header: { borderBottom: "none" },
        mask: { background: "rgba(0, 60, 30, 0.35)" },
        container: { borderRadius: 16 },
      }}
    >
      <Form
        key={editingRecord?.id ?? "new"}
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleFinish}
        requiredMark
        preserve={false}
      >
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item
            name="locCode"
            label="Office"
            rules={[{ required: true, message: "Select an office" }]}
          >
            <Select
              style={{
                background: T.formcss.inputBg,
                border: T.formcss.greyBorder,
              }}
              showSearch
              optionFilterProp="label"
              placeholder="Select office"
              options={locationOptions}
            />
          </Form.Item>

          <Form.Item
            name="orderNo"
            label="Call Order"
            tooltip="Order 1 is called first; if unacknowledged, order 2 is called next."
            rules={[{ required: true, message: "Enter the call order" }]}
          >
            <InputNumber
              min={1}
              max={99}
              precision={0}
              placeholder="1 = called first"
              style={{
                width: "100%",
                background: T.formcss.inputBg,
                border: T.formcss.greyBorder,
              }}
            />
          </Form.Item>

          <Form.Item
            name="recipientName"
            label="Recipient Name"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Enter recipient name",
              },
              { max: 100, message: "Max 100 characters" },
            ]}
          >
            <Input
              placeholder="Enter recipient name"
              maxLength={100}
              style={{
                background: T.formcss.inputBg,
                border: T.formcss.greyBorder,
              }}
            />
          </Form.Item>

          <Form.Item
            name="recipientMobile"
            label="Recipient Mobile"
            normalize={digitsOnly}
            rules={[
              { required: true, message: "Enter mobile number" },
              MOBILE_RULE,
            ]}
          >
            <Input
              style={{
                background: T.formcss.inputBg,
                border: T.formcss.greyBorder,
              }}
              prefix={<span style={{ color: "#6b7280" }}>+91</span>}
              placeholder="10-digit mobile number"
              maxLength={10}
              inputMode="numeric"
            />
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {editingRecord ? "Save Changes" : "Create Recipient"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default SosEscalationFormModal;
