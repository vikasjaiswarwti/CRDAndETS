import React from 'react';
import { AppForm } from '../../../shared/components/AppForm/AppForm';
import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { FUEL_TYPE_FORM_FIELDS } from '../constants/FuelTypeFormFields';
import type { FieldError } from '../../../shared/types/api-error.types';
import type { FuelType } from '../types/fuelType.types';

interface FuelTypeFormModalProps {
    open: boolean;
    onClose: () => void;
    editingRecord: FuelType | null;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    isSubmitting: boolean;
    serverErrors?: FieldError[] | null;
}

export const FuelTypeFormModal: React.FC<FuelTypeFormModalProps> = ({
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
            fuelTypeDesc: editingRecord.fuelTypeDesc ?? '',
        }
        : { fuelTypeDesc: '', active: true };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={editingRecord ? 'Edit Fuel Type' : 'Add Fuel Type'}
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
                fields={FUEL_TYPE_FORM_FIELDS}
                initialValues={initialValues}
                onSubmit={onSubmit}
                onCancel={onClose}
                serverErrors={serverErrors}
                isSubmitting={isSubmitting}
                submitLabel={editingRecord ? 'Save Changes' : 'Create Fuel Type'}
                showCancel
                columns={1}
                resetOnSuccess
            />
        </Modal>
    );
};