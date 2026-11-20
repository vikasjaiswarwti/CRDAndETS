import React from 'react';
import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { AppForm } from '../../../shared/components/AppForm/AppForm';
import { LKP_FEEDBACK_TYPE_FORM_FIELDS } from '../constants/Lkpfeedbacktypeformfields';
import type { LkpFeedbackType } from '../types/Lkpfeedbacktype.types';
import type { FieldError } from '../../../shared/types/api-error.types';

interface LkpFeedbackTypeFormModalProps {
    open: boolean;
    onClose: () => void;
    editingRecord: LkpFeedbackType | null;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    isSubmitting: boolean;
    serverErrors?: FieldError[] | null;
}

const LkpFeedbackTypeFormModal: React.FC<LkpFeedbackTypeFormModalProps> = ({
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
            feedbackType: editingRecord.feedbackType ?? '',
        }
        : {
            feedbackType: '',
            isActive: true,
        };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={editingRecord ? 'Edit Feedback Type' : 'Add Feedback Type'}
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
                fields={LKP_FEEDBACK_TYPE_FORM_FIELDS}
                initialValues={initialValues}
                onSubmit={onSubmit}
                onCancel={onClose}
                serverErrors={serverErrors}
                isSubmitting={isSubmitting}
                submitLabel={editingRecord ? 'Save Changes' : 'Create Feedback Type'}
                showCancel
                columns={1}
                resetOnSuccess
            />
        </Modal>
    );
};

export default LkpFeedbackTypeFormModal;