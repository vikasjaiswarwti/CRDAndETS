import React from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppForm } from "../../../shared/components/AppForm/AppForm";
import type { FieldError } from "../../../shared/types/api-error.types";
import { EHS_CHECKS_FORM_FIELDS } from "../constants/ehsChecksFormFields";
import type { EhsCheck } from "../types/ehsChecks.types";

// ─── Props ────────────────────────────────────────────────────────────────────
interface EhsChecksFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord?: EhsCheck | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
// PURELY PRESENTATIONAL — no mutations, no API calls, no useEffect, no useForm.
// destroyOnClose handles form reset; never call form.resetFields() manually.
// footer={null} always — AppForm renders its own submit/cancel buttons.

const EhsChecksFormModal: React.FC<EhsChecksFormModalProps> = ({
  open,
  onClose,

  onSubmit,
  isSubmitting,
  serverErrors,
}) => {
  const { Modal } = useUILibrary();

  // ── Initial values ─────────────────────────────────────────────────────
  const initialValues = {
    ehsType: "",
    active: true,
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={"Add EHS Check"}
      width={580}
      destroyOnClose
      footer={null}
      // ── Greenish overlay per design tokens ──────────────────────────
      styles={{
        mask: { background: "rgba(0, 60, 30, 0.35)" },
        header: { borderBottom: "none" },
        content: { borderRadius: 16 },
      }}
      style={{ top: 80 }}
    >
      <AppForm
        fields={EHS_CHECKS_FORM_FIELDS}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onClose}
        serverErrors={serverErrors}
        isSubmitting={isSubmitting}
        submitLabel={"Create EHS Check"}
        showCancel
        // twoColumn
        resetOnSuccess
      />
    </Modal>
  );
};

export default EhsChecksFormModal;
