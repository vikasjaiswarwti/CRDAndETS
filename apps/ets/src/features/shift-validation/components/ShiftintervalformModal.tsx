import React from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppForm } from "../../../shared/components/AppForm/AppForm";
import { SHIFT_INTERVAL_FORM_FIELDS } from "../../shift-management/constants/Shiftintervalformfields";
// import type { ShiftInterval } from '../types/shiftinterval.types';
import type { FieldError } from "../../../shared/types/api-error.types";

interface ShiftIntervalFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
}

export const ShiftIntervalFormModal: React.FC<ShiftIntervalFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  serverErrors,
}) => {
  const { Modal } = useUILibrary();

  const initialValues = {
    intervalMinute: null,
    intervalText: "",
    active: true,
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span style={{ fontSize: 20, fontWeight: 700, color: "#1B4332" }}>
          {"Create Shift Interval"}
        </span>
      }
      width={580}
      destroyOnClose
      footer={null}
      styles={{
        header: { borderBottom: "none" },
        mask: { background: "rgba(0, 60, 30, 0.35)" },
      }}
      style={{ borderRadius: 16, overflow: "hidden" }}
    >
      <AppForm
        fields={SHIFT_INTERVAL_FORM_FIELDS}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onClose}
        serverErrors={serverErrors}
        isSubmitting={isSubmitting}
        submitLabel={"Create Shift Interval"}
        showCancel
        columns={2}
        resetOnSuccess
      />
    </Modal>
  );
};

export default ShiftIntervalFormModal;
