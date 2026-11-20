import React from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppForm } from "../../../shared/components/AppForm/AppForm";
import { getDefineShiftFormFields } from "../../shift-management/constants/Shiftformfields";
import type { FieldError } from "../../../shared/types/api-error.types";

interface DefineShiftModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
  locationOptions: { label: string; value: string }[];
  intervalOptions: { label: string; value: string }[];
}

const TOKEN = {
  green900: "#1B4332",
  greenBg: "rgba(0, 60, 30, 0.35)",
};

export const DefineShiftModal: React.FC<DefineShiftModalProps> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  serverErrors,
  locationOptions,
  intervalOptions,
}) => {
  const { Modal } = useUILibrary();

  const fields = getDefineShiftFormFields({
    officeOptions: locationOptions, // ✅ map correctly
    intervalOptions,
  });

  console.log("fields", fields);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span style={{ fontSize: 20, fontWeight: 700, color: TOKEN.green900 }}>
          Define Shift
        </span>
      }
      width={760}
      destroyOnClose
      footer={null}
      styles={{
        mask: { background: TOKEN.greenBg },
        header: { borderBottom: "none", paddingBottom: 4 },
        content: { borderRadius: 16 },
      }}
    >
      <p
        style={{
          fontSize: 13,
          color: "#6B7280",
          marginBottom: 20,
          marginTop: 0,
        }}
      >
        Generate time slots for a selected corporate and interval.
      </p>
      <AppForm
        fields={fields}
        onSubmit={onSubmit}
        onCancel={onClose}
        serverErrors={serverErrors}
        isSubmitting={isSubmitting}
        submitLabel="Define Shifts"
        showCancel
        columns={1}
        resetOnSuccess={false}
      />
    </Modal>
  );
};

export default DefineShiftModal;
