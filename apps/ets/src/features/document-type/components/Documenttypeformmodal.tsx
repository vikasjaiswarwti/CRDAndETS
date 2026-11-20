import React from "react";
import { AppForm } from "../../../shared/components/AppForm/AppForm";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { getDocumentTypeFormFields } from "../constants/DocumentTypeFormFelds";
import type { FieldError } from "../../../shared/types/api-error.types";
import type { DocumentType } from "../types/docType.types";

interface DocumentTypeFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: DocumentType | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
  docOwnerTypeOptions: { label: string; value: number }[];
  isLookupsLoading: boolean;
}

export const DocumentTypeFormModal: React.FC<DocumentTypeFormModalProps> = ({
  open,
  onClose,
  editingRecord,
  onSubmit,
  isSubmitting,
  serverErrors,
  docOwnerTypeOptions,
  isLookupsLoading,
}) => {
  const { Modal } = useUILibrary();

  const fields = getDocumentTypeFormFields({docOwnerTypeOptions});
  const initialValues = editingRecord
    ? {
        ...editingRecord,
        docTypeName: editingRecord.docTypeName ?? "",
        docOwnerTypeId: editingRecord.docOwnerTypeId ?? "",
      }
    : { docTypeName: "", docOwnerTypeId: undefined, active: true };
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={editingRecord ? "Edit Document Type" : "Add Document Type"}
      width={580}
      destroyOnClose
      footer={null}
      // styles={{
      //     header: { borderBottom: 'none' },
      //     mask: { background: 'rgba(0, 60, 30, 0.35)' },
      // }}
      style={{ borderRadius: 16 }}
    >
      <AppForm
        fields={fields}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onClose}
        serverErrors={serverErrors}
        isSubmitting={isSubmitting || isLookupsLoading}
        submitLabel={editingRecord ? "Save Changes" : "Create Document Type"}
        showCancel
        columns={1}
        resetOnSuccess
      />
    </Modal>
  );
};
