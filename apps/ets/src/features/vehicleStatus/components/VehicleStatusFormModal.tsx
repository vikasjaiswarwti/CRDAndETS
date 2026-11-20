import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { AppForm } from '../../../shared/components/AppForm/AppForm';
import type { FieldError } from '../../../shared/types/api-error.types';
import type { VehicleStatus } from '../types/vehicleStatus.types';
import { VEHICLE_STATUS_FORM_FIELDS } from '../constants/vehicleStatusFormFields';

interface VehicleStatusFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: VehicleStatus | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
}

export const VehicleStatusFormModal = ({
  open,
  onClose,
  editingRecord,
  onSubmit,
  isSubmitting,
  serverErrors,
}: VehicleStatusFormModalProps) => {
  const { Modal } = useUILibrary();

  const initialValues = editingRecord
    ? { ...editingRecord }
    : { vehicleStatusName: '' };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={editingRecord ? 'Edit Vehicle Status' : 'Add Vehicle Status'}
      width={520}
      destroyOnClose
      footer={null}
      styles={{
        mask: { background: 'rgba(0, 60, 30, 0.35)' },
        header: { borderBottom: 'none' },
      }}
    >
      <AppForm
        fields={VEHICLE_STATUS_FORM_FIELDS}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onClose}
        serverErrors={serverErrors}
        isSubmitting={isSubmitting}
        submitLabel={editingRecord ? 'Save Changes' : 'Create Status'}
        showCancel
        resetOnSuccess
      />
    </Modal>
  );
};