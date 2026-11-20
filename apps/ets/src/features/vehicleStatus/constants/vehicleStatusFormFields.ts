import type { FormFieldDef } from '../../../shared/components/AppForm/AppForm';

export const VEHICLE_STATUS_FORM_FIELDS: FormFieldDef[] = [
  {
    name: 'vehicleStatusName',
    label: 'Status Name',
    type: 'text',
    placeholder: 'e.g. Active, Inactive, Under Maintenance',
    required: true,
    rules: [{ required: true, message: 'Vehicle Status is required' },
    {
      pattern: /^[a-zA-Z\u00C0-\u024F\s]+$/,
      message:
        "No special characters allowed (letters, digits, spaces, . - ' only)",
    },
    ],
  },
];