import React from 'react';
import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { AppForm } from '../../../shared/components/AppForm/AppForm';
import { getLkpAdhocWeekDaysFormFields } from '../constants/Lkpadhocweekdaysformfields';
import type { LkpAdhocWeekDay } from '../types/Lkpadhocweekdays.types';
import type { FieldError } from '../../../shared/types/api-error.types';

interface LkpAdhocWeekDaysFormModalProps {
    open: boolean;
    onClose: () => void;
    editingRecord: LkpAdhocWeekDay | null;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    isSubmitting: boolean;
    serverErrors?: FieldError[] | null;
    locationOptions?: { label: string; value: string }[];
}

const LkpAdhocWeekDaysFormModal: React.FC<LkpAdhocWeekDaysFormModalProps> = ({
    open,
    onClose,
    editingRecord,
    onSubmit,
    isSubmitting,
    serverErrors,
    locationOptions
}) => {
    const { Modal } = useUILibrary();

    const fields = getLkpAdhocWeekDaysFormFields({
        locationOptions: locationOptions ?? [],
    });

    const initialValues = editingRecord
        ? {
            ...editingRecord,
            locCode: editingRecord.locCode ?? '',
            dayCode: editingRecord.dayCode ?? '',
            daysName: editingRecord.daysName ?? '',
            active: editingRecord.active ?? true,
        }
        : {
            locCode: '',
            dayCode: '',
            daysName: '',
            active: true,
        };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={editingRecord ? 'Edit Adhoc Week Day' : 'Add Adhoc Week Day'}
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
                fields={fields}
                initialValues={initialValues}
                onSubmit={onSubmit}
                onCancel={onClose}
                serverErrors={serverErrors}
                isSubmitting={isSubmitting}
                submitLabel={editingRecord ? 'Save Changes' : 'Create Adhoc Week Day'}
                showCancel
                columns={1}
                resetOnSuccess
            />
        </Modal>
    );
};

export default LkpAdhocWeekDaysFormModal;