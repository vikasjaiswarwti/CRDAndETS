import { useCallback, useState } from "react";
import { Form, message } from "antd";
import {
  useCreateVendorMutation,
  useUpdateVendorMutation,
  type Vendor,
} from "../services/VendorApi";

interface UseVendorFormProps {
  onSuccess: () => void;
}

export function useVendorForm({ onSuccess }: UseVendorFormProps) {
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();

  const isEditing = editingId !== null;
  const submitting = isCreating || isUpdating;

  const openForCreate = useCallback(() => {
    setEditingId(null);
    form.resetFields();
    form.setFieldValue("isActive", true);
  }, [form]);

  const openForEdit = useCallback(
    (record: Vendor) => {
      setEditingId(record.id);
      form.setFieldsValue(record);
    },
    [form],
  );

  const submit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      if (isEditing && editingId != null) {
        await updateVendor({ id: editingId, ...values }).unwrap();
        message.success("Vendor updated");
      } else {
        await createVendor(values).unwrap();
        message.success("Vendor added");
      }
      form.resetFields();
      setEditingId(null);
      onSuccess();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(
        err?.data?.message ?? "Something went wrong. Please try again.",
      );
    }
  }, [form, isEditing, editingId, createVendor, updateVendor, onSuccess]);

  return { form, isEditing, submitting, openForCreate, openForEdit, submit };
}
