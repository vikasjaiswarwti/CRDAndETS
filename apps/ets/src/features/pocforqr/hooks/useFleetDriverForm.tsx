import { useCallback, useState } from "react";
import { Form, message } from "antd";
import {
  useCreateFleetDriverMutation,
  useUpdateFleetDriverMutation,
  type FleetDriver,
} from "../services/FleetDriverApi";
import dayjs from "dayjs";



interface UseFleetDriverFormProps {
  onSuccess: () => void;
}

export function useFleetDriverForm({ onSuccess }: UseFleetDriverFormProps) {
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  const [createFleetDriver, { isLoading: isCreating }] =
    useCreateFleetDriverMutation();
  const [updateFleetDriver, { isLoading: isUpdating }] =
    useUpdateFleetDriverMutation();

  const isEditing = editingId !== null;
  const submitting = isCreating || isUpdating;

  const openForCreate = useCallback(() => {
    setEditingId(null);
    form.resetFields();
    form.setFieldValue("currentStatusId", 1);
  }, [form]);

  const openForEdit = useCallback(
    (record: FleetDriver) => {
      setEditingId(record.id);
      form.setFieldsValue({
        ...record,
        // Set as dayjs in one shot — never leave a raw string in a mounted DatePicker
        dob: record.dob ? dayjs(record.dob) : undefined,
      });
    },
    [form],
  );

  const submit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      // Format only the outgoing payload — the form field itself stays dayjs
      const payload = {
        ...values,
        dob:
          values.dob && typeof values.dob.format === "function"
            ? values.dob.format("YYYY-MM-DD")
            : values.dob,
      };

      if (isEditing && editingId != null) {
        await updateFleetDriver({ id: editingId, ...payload }).unwrap();
        message.success("Driver updated");
      } else {
        await createFleetDriver(payload).unwrap();
        message.success("Driver added");
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
  }, [
    form,
    isEditing,
    editingId,
    createFleetDriver,
    updateFleetDriver,
    onSuccess,
  ]);

  return { form, isEditing, submitting, openForCreate, openForEdit, submit };
}
