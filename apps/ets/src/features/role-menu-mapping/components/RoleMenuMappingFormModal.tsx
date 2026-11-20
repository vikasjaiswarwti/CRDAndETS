// src/features/role-menu-mapping/components/RoleMenuMappingFormModal.tsx

import { useMemo } from 'react';
import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { AppForm } from '../../../shared/components/AppForm/AppForm';
import { getRoleMenuMappingFormFields } from '../constants/roleMenuMappingFormFields';
import type { FieldError } from '../../../shared/types/api-error.types';
import type { RoleMenuMapping } from '../types/roleMenuMapping.types';

interface RoleMenuMappingFormModalProps {
    open: boolean;
    onClose: () => void;
    editingRecord: RoleMenuMapping | null;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    isSubmitting: boolean;
    serverErrors?: FieldError[] | null;
    roleOptions: { label: string; value: string }[];
    menuOptions: { label: string; value: string }[];
}

export const RoleMenuMappingFormModal = ({
    open,
    onClose,
    editingRecord,
    onSubmit,
    isSubmitting,
    serverErrors,
    roleOptions,
    menuOptions,
}: RoleMenuMappingFormModalProps) => {
    const { Modal } = useUILibrary();

    // Fields are dynamic — derived from props, stable via useMemo
    const fields = useMemo(
        () => getRoleMenuMappingFormFields({ roleOptions, menuOptions }),
        [roleOptions, menuOptions]
    );

    const initialValues = editingRecord
        ? {
            ...editingRecord,
            roleId: editingRecord.roleId ?? '',
            menuId: editingRecord.menuId ?? '',
        }
        : { roleId: '', menuId: '', isActive: true };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={editingRecord ? 'Edit Role-Menu Mapping' : 'Create Role-Menu Mapping'}
            width={580}
            destroyOnClose
            footer={null}
            style={{ top: 80 }}
        >
            <AppForm
                fields={fields}
                initialValues={initialValues}
                onSubmit={onSubmit}
                onCancel={onClose}
                serverErrors={serverErrors}
                isSubmitting={isSubmitting}
                submitLabel={editingRecord ? 'Save Changes' : 'Create Mapping'}
                showCancel
                columns={1}
                resetOnSuccess
            />
        </Modal>
    );
};