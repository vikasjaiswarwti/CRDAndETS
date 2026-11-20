import React, { useEffect } from "react";
import { Button, Form, Input, Modal, Select, Switch } from "antd";
import type { FormRule } from "antd";
import type { FieldError } from "../../../shared/types/api-error.types";
import type {
  CreateEventNotificationDto,
  EventNotification,
} from "../types/notificationManagement.types";
import {
  EVENT_KEY_OPTIONS,
  MOBILE_RULE,
  digitsOnly,
} from "../constants/notificationManagementConstants";

interface EventNotificationFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: EventNotification | null;
  defaults?: Partial<CreateEventNotificationDto>;
  onSubmit: (values: CreateEventNotificationDto) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
}

const EventNotificationFormModal: React.FC<EventNotificationFormModalProps> = ({
  open,
  onClose,
  editingRecord,
  defaults,
  onSubmit,
  isSubmitting,
  serverErrors,
}) => {
  const [form] = Form.useForm<CreateEventNotificationDto>();

  // Surface backend validation errors on the matching fields.
  useEffect(() => {
    if (!open || !serverErrors?.length) return;
    form.setFields(
      serverErrors.map((fe) => ({
        name: fe.field as keyof CreateEventNotificationDto,
        errors: [fe.message],
      })),
    );
  }, [open, serverErrors, form]);

  // Keep a legacy/unknown eventKey selectable when editing an old record.
  const eventOptions =
    editingRecord &&
    !EVENT_KEY_OPTIONS.some((o) => o.value === editingRecord.eventKey)
      ? [
          ...EVENT_KEY_OPTIONS,
          {
            value: editingRecord.eventKey,
            label: `${editingRecord.eventKey} (not used by backend)`,
          },
        ]
      : EVENT_KEY_OPTIONS;

  // The form instance outlives the modal body, so antd won't re-apply
  // initialValues on reopen — reset explicitly every time it opens.
  useEffect(() => {
    if (!open) return;
    form.resetFields();
    form.setFieldsValue(
      editingRecord
        ? {
            eventKey: editingRecord.eventKey,
            email: editingRecord.email ?? undefined,
            mobile: editingRecord.mobile ?? undefined,
            active: editingRecord.active,
          }
        : { active: true, ...defaults },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingRecord, form]);

  // Email and mobile are each optional, but one of them is compulsory.
  const contactRequiredRule: FormRule = ({ getFieldValue }) => ({
    validator: () => {
      const email = String(getFieldValue("email") ?? "").trim();
      const mobile = String(getFieldValue("mobile") ?? "").trim();
      return email || mobile
        ? Promise.resolve()
        : Promise.reject(new Error("Enter email or mobile number"));
    },
  });

  const handleFinish = async (values: CreateEventNotificationDto) => {
    await onSubmit({
      eventKey: values.eventKey,
      email: values.email?.trim() || null,
      mobile: values.mobile || null,
      active: Boolean(values.active),
    });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        editingRecord
          ? "Edit Notification Recipient"
          : "Add Notification Recipient"
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
        form={form}
        layout="vertical"
        autoComplete="off"
        onFinish={handleFinish}
        requiredMark
        preserve={false}
      >
        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item
            name="eventKey"
            label="Event"
            className="sm:col-span-2"
            rules={[{ required: true, message: "Select an event" }]}
          >
            <Select placeholder="Select event" options={eventOptions} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            dependencies={["mobile"]}
            rules={[
              contactRequiredRule,
              { type: "email", message: "Enter a valid email address" },
              { max: 150, message: "Max 150 characters" },
            ]}
          >
            <Input placeholder="Enter email address" maxLength={150} />
          </Form.Item>

          <Form.Item
            name="mobile"
            label="Mobile"
            required={false}
            normalize={digitsOnly}
            dependencies={["email"]}
            rules={[contactRequiredRule, MOBILE_RULE]}
          >
            <Input
              prefix={<span style={{ color: "#6b7280" }}>+91</span>}
              placeholder="10-digit mobile number"
              maxLength={10}
              inputMode="numeric"
            />
          </Form.Item>

          <Form.Item name="active" label="Active" valuePropName="checked">
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

export default EventNotificationFormModal;
