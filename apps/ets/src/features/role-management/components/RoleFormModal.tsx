// src/features/role-management/components/RoleFormModal.tsx

import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { AppForm } from '../../../shared/components/AppForm/AppForm';
import { ROLE_FORM_FIELDS } from '../constants/roleFormFields';
import type { FieldError } from '../../../shared/types/api-error.types';
import type { Role } from '../types/role.types';

interface RoleFormModalProps {
    open: boolean;
    onClose: () => void;
    editingRecord: Role | null;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    isSubmitting: boolean;
    serverErrors?: FieldError[] | null;
}

export const RoleFormModal = ({
    open,
    onClose,
    editingRecord,
    onSubmit,
    isSubmitting,
    serverErrors,
}: RoleFormModalProps) => {
    const { Modal } = useUILibrary();

    const initialValues = editingRecord
        ? { ...editingRecord, roleName: editingRecord.roleName ?? '' }
        : { roleName: '', isActive: true };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={editingRecord ? 'Edit Role' : 'Create Role'}
            width={580}
            destroyOnClose
            footer={null}

        >
            <AppForm
                fields={ROLE_FORM_FIELDS}
                initialValues={initialValues}
                onSubmit={onSubmit}
                onCancel={onClose}
                serverErrors={serverErrors}
                isSubmitting={isSubmitting}
                submitLabel={editingRecord ? 'Save Changes' : 'Create Role'}
                showCancel
                columns={1}
                resetOnSuccess
            />
        </Modal>
    );
};