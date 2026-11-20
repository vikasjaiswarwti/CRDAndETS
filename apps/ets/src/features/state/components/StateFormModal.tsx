// FILE 9 — components/StateFormModal.tsx

import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import {AppForm} from '../../../shared/components/AppForm/AppForm';
import type { FieldError } from '../../../shared/types/api-error.types';
import type { State } from '../types/state.types';
import { STATE_FORM_FIELDS } from '../constants/stateFormFields';

interface StateFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: State | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
}

const StateFormModal: React.FC<StateFormModalProps> = ({
  open,
  onClose,
  editingRecord,
  onSubmit,
  isSubmitting,
  serverErrors,
}) => {
  const { Modal } = useUILibrary();

  const initialValues = editingRecord
    ? {
        ...editingRecord,
        stateName: editingRecord.stateName ?? '',
      }
    : {
        stateName: '',
      };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={editingRecord ? 'Edit State' : 'Add State'}
      width={580}
      destroyOnClose
      footer={null}
      styles={{
        header: { borderBottom: 'none' },
        mask: { background: 'rgba(0, 60, 30, 0.35)' },
      }}
      style={{ borderRadius: 16 }}
    >
      <AppForm
        fields={STATE_FORM_FIELDS}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onClose}
        serverErrors={serverErrors}
        isSubmitting={isSubmitting}
        submitLabel={editingRecord ? 'Save Changes' : 'Create State'}
        showCancel
        // twoColumn
        resetOnSuccess
      />
    </Modal>
  );
};

export default StateFormModal;