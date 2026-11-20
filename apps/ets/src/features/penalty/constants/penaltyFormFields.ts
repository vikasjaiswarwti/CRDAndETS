import type { FormFieldDef } from '../../../shared/components/AppForm/AppForm';

export interface PenaltyFormFieldOptions {
  applicableOptions:   { label: string; value: number }[];
  applicableOnOptions: { label: string; value: number }[];
  reasonOptions:       { label: string; value: number }[];
  statusOptions:       { label: string; value: number }[];
  isLoadingApplicable:   boolean;
  isLoadingApplicableOn: boolean;
  isLoadingReasons:      boolean;
  onApplicableChange: (value: number) => void;
  onApplicableOnChange?: (value: number) => void;
}

export function getPenaltyFormFields(opts: PenaltyFormFieldOptions): FormFieldDef[] {
  const {
    applicableOptions,
    applicableOnOptions,
    reasonOptions,
    statusOptions,
    isLoadingApplicable,
    isLoadingApplicableOn,
    isLoadingReasons,
    onApplicableChange,
  } = opts;

  return [
    {
      name: 'ApplicableID',
      label: 'Applicable On Type',
      type: 'select',
      required: true,
      span: 12,
      options: applicableOptions,
      fieldProps: {
        loading: isLoadingApplicable,
        onChange: onApplicableChange,
        placeholder: 'Select type (Driver / Vehicle / Vendor)',
      },
    },
    {
      name: 'ApplicableOnId',
      label: 'Apply To',
      type: 'select',
      required: true,
      span: 12,
      options: applicableOnOptions,
      fieldProps: {
        loading: isLoadingApplicableOn,
        disabled: applicableOnOptions.length === 0,
        placeholder: 'Select driver / vehicle / vendor',
      },
    },
    {
      name: 'PenaltyType_id',
      label: 'Penalty Reason',
      type: 'select',
      required: true,
      span: 12,
      options: reasonOptions,
      fieldProps: {
        loading: isLoadingReasons,
        disabled: reasonOptions.length === 0,
        placeholder: 'Select penalty reason',
      },
    },
    {
      name: 'DSID',
      label: 'Trip / DS ID',
      type: 'number',
      required: true,
      span: 12,
      placeholder: 'Enter trip DS ID',
    },
    {
      name: 'Amount',
      label: 'Penalty Amount',
      type: 'number',
      required: true,
      span: 12,
      placeholder: 'Enter amount',
    },
    {
      name: 'Status',
      label: 'Status',
      type: 'select',
      required: true,
      span: 12,
      options: statusOptions,
    },
    {
      name: 'Remarks',
      label: 'Remarks',
      type: 'textarea',
      required: false,
      placeholder: 'Optional — additional notes about this penalty',
    },
  ];
}
