// FILE 9 — components/CityZoneFormModal.tsx

import React from 'react';
import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { AppForm } from '../../../shared/components/AppForm/AppForm';
import { CITY_ZONE_FORM_FIELDS } from '../constants/cityZoneFormFields';
import type { CityZone } from '../types/cityZone.types';
import type { FieldError } from '../../../shared/types/api-error.types';

interface CityZoneFormModalProps {
    open: boolean;
    onClose: () => void;
    editingRecord: CityZone | null;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    isSubmitting: boolean;
    serverErrors?: FieldError[] | null;
}

const CityZoneFormModal: React.FC<CityZoneFormModalProps> = ({
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
            cityZoneDescription: editingRecord.cityZoneDescription ?? '',
        }
        : {
            cityZoneCode: '',
            cityZoneDescription: '',
            active: true,
        };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={editingRecord ? 'Edit City Zone' : 'Add City Zone'}
            width={580}
            destroyOnClose
            footer={null}

            style={{ top: 80 }}
        >
            <AppForm
                fields={CITY_ZONE_FORM_FIELDS}
                initialValues={initialValues}
                onSubmit={onSubmit}
                onCancel={onClose}
                serverErrors={serverErrors}
                isSubmitting={isSubmitting}
                submitLabel={editingRecord ? 'Save Changes' : 'Create City Zone'}
                showCancel
                columns={1}
                resetOnSuccess
            />
        </Modal>
    );
};

export default CityZoneFormModal;