import React from 'react';
import { AppForm } from '../../../shared/components/AppForm/AppForm';
import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { DOCUMENT_OWNER_TYPE_FORM_FIELDS } from '../constants/DocuOwnerTypeFormFields';
import type { FieldError } from '../../../shared/types/api-error.types';
import type { DocumentOwnerType } from '../types/documentOwnerType.types';

interface DocumentOwnerTypeFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: DocumentOwnerType | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
}

export const DocumentOwnerTypeFormModal: React.FC<DocumentOwnerTypeFormModalProps> = ({
  open,
  onClose,
  editingRecord,
  onSubmit,
  isSubmitting,
  serverErrors,
}) => {
  const { Modal } = useUILibrary();

  const initialValues = editingRecord
    ? { ...editingRecord, docOwnerTypeName: editingRecord.docOwnerTypeName ?? '' }
    : { docOwnerTypeName: '', active: true };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={editingRecord ? 'Edit Document Owner Type' : 'Add Document Owner Type'}
      width={580}
      destroyOnClose
      footer={null}
      // styles={{
      //   header: { borderBottom: 'none' },
      //   mask: { background: 'rgba(0, 60, 30, 0.35)' },
      // }}
      style={{ borderRadius: 16 }}
    >
      <AppForm
        fields={DOCUMENT_OWNER_TYPE_FORM_FIELDS}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onClose}
        serverErrors={serverErrors}
        isSubmitting={isSubmitting}
        submitLabel={editingRecord ? 'Save Changes' : 'Create Owner Type'}
        showCancel
        columns={1}
        resetOnSuccess
      />
    </Modal>
  );
};