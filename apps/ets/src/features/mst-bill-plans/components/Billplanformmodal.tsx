import React from 'react';
import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
import { AppForm } from '../../../shared/components/AppForm/AppForm';
import type { FieldError } from '../../../shared/types/api-error.types';

import { getBillPlanFormFields } from '../constants/bill-plan-formfields';
import type { MstBillPlan } from '../types/bill-plan.types';


interface BillPlanFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: MstBillPlan | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;

  locationOptions: { label: string; value: string | number }[];
  billPlanTypeOptions: { label: string; value: string | number }[];
  isLookupsLoading: boolean;
}

const BillPlanFormModal: React.FC<BillPlanFormModalProps> = ({
  open,
  onClose,
  editingRecord,
  onSubmit,
  isSubmitting,
  serverErrors,
  locationOptions,        // ← from props now
  billPlanTypeOptions,
  isLookupsLoading,
}) => {
  const { Modal } = useUILibrary();


  console.log("locationsQuery from lookups", locationOptions);

  const fields = getBillPlanFormFields({ locationOptions, billPlanTypeOptions });

  // ── Initial values ────────────────────────────────────────────────────────
  const initialValues = editingRecord
    ? {
      ...editingRecord,
      locCode: editingRecord.locCode ?? '',
      bptCode: editingRecord.bptCode ?? '',
      bpName: editingRecord.bpName ?? '',
      active: editingRecord.active ?? true,
      // locCode will be handled by the form if it matches the option value
    }
    : {
      locCode: '',           // empty string so select shows placeholder
      bptCode: '',
      bpName: '',
      active: true,
    };


  console.log('initialValues from mst billplans', initialValues);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={editingRecord ? 'Edit Bill Plan' : 'Create Bill Plan'}
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
        isSubmitting={isSubmitting || isLookupsLoading}   // disable while loading
        submitLabel={editingRecord ? 'Save Changes' : 'Create Bill Plan'}
        showCancel
        columns={1}
        resetOnSuccess
      />
    </Modal>
  );
};

export default BillPlanFormModal;