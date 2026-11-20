import React from 'react';
import { AppForm } from '../../../shared/components/AppForm/AppForm';
import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { DEPARTMENT_FORM_FIELDS } from '../constants/Departmentformfields';
import type { Department } from '../types/department.type';
import type { FieldError } from '../../../shared/types/api-error.types';

interface DepartmentFormModalProps {
    open: boolean;
    onClose: () => void;
    editingRecord: Department | null;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    isSubmitting: boolean;
    serverErrors?: FieldError[] | null;
}

export const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({
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
            depCode: editingRecord.depCode ?? '',
            depName: editingRecord.depName ?? '',
        }
        : {
            depCode: '',
            depName: '',
            isActive: true,
        };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={editingRecord ? 'Edit Department' : 'Add Department'}
            width={580}
            destroyOnClose
            footer={null}
            styles={{
                header: { borderBottom: 'none' },
                mask: { background: 'rgba(0, 60, 30, 0.35)' },
                content: { borderRadius: 16 },
            }}
            style={{ top: 80 }}
        >
            <AppForm
                fields={DEPARTMENT_FORM_FIELDS}
                initialValues={initialValues}
                onSubmit={onSubmit}
                onCancel={onClose}
                serverErrors={serverErrors}
                isSubmitting={isSubmitting}
                submitLabel={editingRecord ? 'Save Changes' : 'Create Department'}
                showCancel
                columns={1}
                resetOnSuccess
            />
        </Modal>
    );
};

export default DepartmentFormModal;