import React from 'react';
import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { AppForm } from '../../../shared/components/AppForm/AppForm';
import { LKP_TRIP_TYPE_FORM_FIELDS } from '../constants/Lkptriptypeformfields';
import type { LkpTripType } from '../types/Lkptriptype';
import type { FieldError } from '../../../shared/types/api-error.types';

interface LkpTripTypeFormModalProps {
    open: boolean;
    onClose: () => void;
    editingRecord: LkpTripType | null;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    isSubmitting: boolean;
    serverErrors?: FieldError[] | null;
}

const LkpTripTypeFormModal: React.FC<LkpTripTypeFormModalProps> = ({
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
            tripTypeName: editingRecord.tripTypeName ?? '',
            active: editingRecord.active ?? true,
        }
        : {
            tripTypeName: '',
            active: true,
        };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={editingRecord ? 'Edit Trip Type' : 'Add Trip Type'}
            width={580}
            destroyOnClose
            footer={null}
            styles={{
                header: { borderBottom: 'none' },
                mask: { background: 'rgba(0, 60, 30, 0.35)' },
                content: { borderRadius: 16 },
            }}
        >
            <AppForm
                fields={LKP_TRIP_TYPE_FORM_FIELDS}
                initialValues={initialValues}
                onSubmit={onSubmit}
                onCancel={onClose}
                serverErrors={serverErrors}
                isSubmitting={isSubmitting}
                submitLabel={editingRecord ? 'Save Changes' : 'Create Trip Type'}
                showCancel
                columns={1}
                resetOnSuccess
            />
        </Modal>
    );
};

export default LkpTripTypeFormModal;