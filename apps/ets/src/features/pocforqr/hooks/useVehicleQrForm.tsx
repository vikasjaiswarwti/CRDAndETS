import { useCallback, useState } from "react";
import { Form, message } from "antd";
import {
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  type VehicleQr,
} from "../services/VehicleQrApi";

interface UseVehicleQrFormProps {
  onSuccess: () => void;
}

function generateQrCode(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `QR-${crypto.randomUUID()}`;
  }
  return `QR-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useVehicleQrForm({ onSuccess }: UseVehicleQrFormProps) {
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  const [editingRecord, setEditingRecord] = useState<VehicleQr | null>(null);

  const [createVehicle, { isLoading: isCreating }] = useCreateVehicleMutation();
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();

  const isEditing = editingId !== null;
  const submitting = isCreating || isUpdating;

  const openForCreate = useCallback(() => {
    setEditingId(null);
    setEditingRecord(null);
    form.resetFields();
  }, [form]);

  const openForEdit = useCallback(
    (record: VehicleQr) => {
      setEditingId(record.id);
      setEditingRecord(record);
      form.setFieldsValue(record);
    },
    [form],
  );

  // const submit = useCallback(async () => {
  //   try {
  //     const values = await form.validateFields();

  //     console.log("values before submitting", values);

  //     if (isEditing && editingId != null) {
  //       await updateVehicle({ id: editingId, ...values }).unwrap();
  //       message.success("Vehicle updated");
  //     } else {
  //       await createVehicle({
  //         ...values,
  //         qrUniqueCode: `QR-${Date.now()}`,
  //       }).unwrap();
  //       message.success("Vehicle added");
  //     }
  //     form.resetFields();
  //     setEditingId(null);
  //     onSuccess();
  //   } catch (err: any) {
  //     if (err?.errorFields) return; // antd validation error — already shown inline on the fields
  //     message.error(
  //       err?.data?.message ?? "Something went wrong. Please try again.",
  //     );
  //   }
  // }, [form, isEditing, editingId, createVehicle, updateVehicle, onSuccess]);

  const submit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      if (isEditing && editingId != null) {
        await updateVehicle({
          id: editingId,
          ...values,
          qrUniqueCode: editingRecord?.qrUniqueCode,
        }).unwrap();
        message.success("Vehicle updated");
      } else {
        await createVehicle({
          ...values,
          qrUniqueCode: generateQrCode(),
        }).unwrap();
        message.success("Vehicle added");
      }
      form.resetFields();
      setEditingId(null);
      setEditingRecord(null);
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
    editingRecord,
    createVehicle,
    updateVehicle,
    onSuccess,
  ]);

  return {
    form,
    isEditing,
    submitting,
    openForCreate,
    openForEdit,
    submit,
  };
}
