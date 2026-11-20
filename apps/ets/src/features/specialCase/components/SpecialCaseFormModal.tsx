import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { AppForm } from "../../../shared/components/AppForm/AppForm";
import { SPECIAL_CASE_FORM_FIELDS } from "../constants/specialCaseFormFields";
import type { FieldError } from "../../../shared/types/api-error.types";
import type { SpecialCase } from "../types/specialCase.types";

interface SpecialCaseFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: SpecialCase | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
}

const SpecialCaseFormModal = ({
  open,
  onClose,
  editingRecord,
  onSubmit,
  isSubmitting,
  serverErrors,
}: SpecialCaseFormModalProps) => {
  const { Modal } = useUILibrary();

  const initialValues = editingRecord
    ? {
        ...editingRecord,
        specialCaseDesc: editingRecord.specialCaseDesc ?? "",
        isActive: editingRecord.isActive ?? true,
      }
    : {
        specialCaseDesc: "",
        isActive: true,
      };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={editingRecord ? "Edit Special Case" : "Add Special Case"}
      width={580}
      destroyOnClose
      footer={null}
      styles={{
        header: { borderBottom: "none" },
        mask: { background: "rgba(0, 60, 30, 0.35)" },
      }}
      style={{ borderRadius: 16 }}
    >
      <AppForm
        fields={SPECIAL_CASE_FORM_FIELDS}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onClose}
        serverErrors={serverErrors}
        isSubmitting={isSubmitting}
        submitLabel={editingRecord ? "Save Changes" : "Create Special Case"}
        showCancel
        // twoColumn={false}
        resetOnSuccess
      />
    </Modal>
  );
};

export default SpecialCaseFormModal;
