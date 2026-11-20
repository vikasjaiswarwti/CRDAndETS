import React from 'react';
import { AppForm } from '../../../shared/components/AppForm/AppForm';
import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { EMPLOYEE_TYPE_FORM_FIELDS } from '../constants/Employeetypeformfields';
import type { EmployeeType } from '../types/emplType.types';
import type { FieldError } from '../../../shared/types/api-error.types';

interface EmployeeTypeFormModalProps {
    open: boolean;
    onClose: () => void;
    editingRecord: EmployeeType | null;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    isSubmitting: boolean;
    serverErrors?: FieldError[] | null;
}

export const EmployeeTypeFormModal: React.FC<EmployeeTypeFormModalProps> = ({
    open, onClose, editingRecord, onSubmit, isSubmitting, serverErrors,
}) => {
    const { Modal } = useUILibrary();

    const initialValues = editingRecord
        ? { ...editingRecord, empType: editingRecord.empType ?? '', description: editingRecord.description ?? '' }
        : { empType: '', description: '', isActive: true };

    return (
        <Modal open={open} onCancel={onClose}
            title={editingRecord ? 'Edit Employee Type' : 'Add Employee Type'}
            width={580} destroyOnClose footer={null}
            styles={{
                header: { borderBottom: 'none' },
                mask: { background: 'rgba(0, 60, 30, 0.35)' },
                content: { borderRadius: 16 },
            }}>
            <AppForm
                fields={EMPLOYEE_TYPE_FORM_FIELDS}
                initialValues={initialValues}
                onSubmit={onSubmit}
                onCancel={onClose}
                serverErrors={serverErrors}
                isSubmitting={isSubmitting}
                submitLabel={editingRecord ? 'Save Changes' : 'Create Employee Type'}
                showCancel
                columns={2}
                resetOnSuccess
            />
        </Modal>
    );
};

export default EmployeeTypeFormModal;