import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { AppForm } from '../../../shared/components/AppForm/AppForm';
import type { FieldError } from '../../../shared/types/api-error.types';
import { BILL_PLAN_TYPE_FORM_FIELDS } from '../constants/Billplantypeformfields';
import type { LkpBillPlanType } from '../types/bill-plan-type';

interface BillPlanTypeFormModalProps {
    open: boolean;
    onClose: () => void;
    editingRecord: LkpBillPlanType | null;
    onSubmit: (values: Record<string, unknown>) => Promise<void>;
    isSubmitting: boolean;
    serverErrors?: FieldError[] | null;
}

// PURELY PRESENTATIONAL — no mutations, no API calls, no useEffect, no useForm()
const BillPlanTypeFormModal = ({
    open,
    onClose,
    editingRecord,
    onSubmit,
    isSubmitting,
    serverErrors,
}: BillPlanTypeFormModalProps) => {
    const { Modal } = useUILibrary();

    const initialValues = editingRecord
        ? {
            ...editingRecord,
            bptCode: editingRecord.bptCode ?? '',
            bptName: editingRecord.bptName ?? '',
        }
        : { bptCode: '', bptName: '', active: true };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title={editingRecord ? 'Edit Bill Plan Type' : 'Create Bill Plan Type'}
            width={580}
            destroyOnClose
            footer={null}
            style={{ top: 80 }}
        >
            <AppForm
                fields={BILL_PLAN_TYPE_FORM_FIELDS}
                initialValues={initialValues}
                onSubmit={onSubmit}
                onCancel={onClose}
                serverErrors={serverErrors}
                isSubmitting={isSubmitting}
                submitLabel={editingRecord ? 'Save Changes' : 'Create Bill Plan Type'}
                showCancel
                columns={1}
                resetOnSuccess
            />
        </Modal>
    );
};

export default BillPlanTypeFormModal;