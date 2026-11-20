import React from 'react';
import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { AppForm } from '../../../shared/components/AppForm/AppForm';
import { LKP_PENALTY_TYPE_FORM_FIELDS } from '../constants/Lkppenaltytypeformfields';
import type { LkpPenaltyType } from '../types/Lkppenaltytype.types';
import type { FieldError } from '../../../shared/types/api-error.types';

interface LkpPenaltyTypeFormModalProps {
    open: boolean;
    onClose: () => void;
    editingRecord: LkpPenaltyType | null;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    isSubmitting: boolean;
    serverErrors?: FieldError[] | null;
}

const LkpPenaltyTypeFormModal: React.FC<LkpPenaltyTypeFormModalProps> = ({
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
            penaltyType: editingRecord.penaltyType ?? '',
            applicableTo: editingRecord.applicableTo ?? '',
            isActive: editingRecord.isActive ?? true,
        }
        : {
            penaltyType: '',
            applicableTo: '',
            isActive: true,
        };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={editingRecord ? 'Edit Penalty Type' : 'Add Penalty Type'}
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
                fields={LKP_PENALTY_TYPE_FORM_FIELDS}
                initialValues={initialValues}
                onSubmit={onSubmit}
                onCancel={onClose}
                serverErrors={serverErrors}
                isSubmitting={isSubmitting}
                submitLabel={editingRecord ? 'Save Changes' : 'Create Penalty Type'}
                showCancel
                columns={1}
                resetOnSuccess
            />
        </Modal>
    );
};

export default LkpPenaltyTypeFormModal;