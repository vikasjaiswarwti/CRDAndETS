import React, { useMemo } from "react";
import { AppForm } from "../../../shared/components/AppForm/AppForm";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import type { FieldError } from "../../../shared/types/api-error.types";
import { CURRENT_STATUS_FORM_FIELDS } from "../constants/currentStatusFormFields";
import type { CurrentStatusRaw } from "../types/currentStatus.types";

// ─── Props ────────────────────────────────────────────────────────────────────
interface CurrentStatusFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: CurrentStatusRaw | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
}

// ─── Component — purely presentational, zero side effects ────────────────────
const CurrentStatusFormModal: React.FC<CurrentStatusFormModalProps> = ({
  open,
  onClose,
  editingRecord,
  onSubmit,
  isSubmitting,
  serverErrors,
}) => {
  const { Modal } = useUILibrary();

  const initialValues = useMemo(() => {
    if (editingRecord) {
      return {
        id: editingRecord.id,
        statusName: editingRecord.statusName ?? "",
        status: editingRecord.status,
      };
    }

    return {
      statusName: "",
      status: true, // default to active for new records
    };
  }, [editingRecord]);

  const title = editingRecord ? "Edit Current Status" : "Add Current Status";

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={title}
      width={580}
      destroyOnClose
      footer={null}
      styles = {{
        header: { borderBottom: 'none' },
        mask: { background: 'rgba(0, 60, 30, 0.35)' },
      }}
      style={{ borderRadius: 16 }}
    >
      <AppForm
        fields={CURRENT_STATUS_FORM_FIELDS}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onClose}
        serverErrors={serverErrors}
        isSubmitting={isSubmitting}
        submitLabel={editingRecord ? "Save Changes" : "Create State"}
        showCancel
        // twoColumn
        resetOnSuccess
      />
    </Modal>
  );
};

export default CurrentStatusFormModal;
