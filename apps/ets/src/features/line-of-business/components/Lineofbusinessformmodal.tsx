import React from 'react';
import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { AppForm } from '../../../shared/components/AppForm/AppForm';
import type { FieldError } from '../../../shared/types/api-error.types';
import { LINE_OF_BUSINESS_FORM_FIELDS } from '../constants/line-of-business-formfields';
import type { LineOfBusiness } from '../types/line-of-business.types';

// ─── Props ────────────────────────────────────────────────────────────────────
interface LineOfBusinessFormModalProps {
    open: boolean;
    onClose: () => void;
    editingRecord: LineOfBusiness | null;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    isSubmitting: boolean;
    serverErrors?: FieldError[] | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
// PURELY PRESENTATIONAL:
//   ✅ No mutations, no API calls, no useEffect, no Form.useForm()
//   ✅ destroyOnClose handles reset — form.resetFields() never called manually
//   ✅ footer={null} always — AppForm owns its submit / cancel buttons
//   ✅ No onOk / form.submit() pattern
// ─────────────────────────────────────────────────────────────────────────────

const LineOfBusinessFormModal: React.FC<LineOfBusinessFormModalProps> = ({
    open,
    onClose,
    editingRecord,
    onSubmit,
    isSubmitting,
    serverErrors,
}) => {
    const { Modal } = useUILibrary();

    // ── Initial values ────────────────────────────────────────────────────────
    // Editing: spread entity; null → '' to avoid uncontrolled→controlled warning
    // Creating: sensible defaults
    const initialValues = editingRecord
        ? {
            // Preserve lobCode_Id so handleSubmit in the page can read it
            lobCode_Id: editingRecord.lobCode_Id,
            lobName: editingRecord.lobName ?? '',
            active: editingRecord.active,
        }
        : {
            lobName: '',
            active: true,
        };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={editingRecord ? 'Edit Line of Business' : 'Add Line of Business'}
            width={580}
            destroyOnClose
            footer={null}
            // ── Design system tokens ─────────────────────────────────────────────

            style={{ borderRadius: 16 }}
        >
            <AppForm
                fields={LINE_OF_BUSINESS_FORM_FIELDS}
                initialValues={initialValues}
                onSubmit={onSubmit}
                onCancel={onClose}
                serverErrors={serverErrors}
                isSubmitting={isSubmitting}
                submitLabel={editingRecord ? 'Save Changes' : 'Create Line of Business'}
                showCancel
                columns={1}
                resetOnSuccess
            />
        </Modal>
    );
};

export default LineOfBusinessFormModal;