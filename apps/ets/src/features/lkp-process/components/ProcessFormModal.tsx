import React from 'react';
import { AppForm } from '../../../shared/components/AppForm/AppForm';
import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { PROCESS_FORM_FIELDS } from '../constants/processFormFields';
import type { Process } from '../types/process.types';
import type { FieldError } from '../../../shared/types/api-error.types';

interface ProcessFormModalProps {
    open: boolean; onClose: () => void; editingRecord: Process | null;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    isSubmitting: boolean; serverErrors?: FieldError[] | null;
}

export const ProcessFormModal: React.FC<ProcessFormModalProps> =
    ({ open, onClose, editingRecord, onSubmit, isSubmitting, serverErrors }) => {

        const { Modal } = useUILibrary();
        const initialValues = editingRecord
            ? {
                ...editingRecord,
                procode: editingRecord.procode ?? '',
                proname: editingRecord.proname ?? ''
            }
            : { procode: '', proname: '', active: true };

        return (
            <Modal
                open={open}
                onCancel={onClose}
                title={editingRecord ? 'Edit Process' : 'Add Process'}
                width={580}
                destroyOnClose
                footer={null}
                styles={{
                    header:
                        { borderBottom: 'none' },
                    mask: { background: 'rgba(0, 60, 30, 0.35)' },
                    content: { borderRadius: 16 }
                }}>

                <AppForm
                    fields={PROCESS_FORM_FIELDS}
                    initialValues={initialValues}
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    serverErrors={serverErrors}
                    isSubmitting={isSubmitting}
                    submitLabel={editingRecord ? 'Save Changes' : 'Create Process'}
                    showCancel columns={1} resetOnSuccess />
            </Modal>
        );
    };

export default ProcessFormModal;