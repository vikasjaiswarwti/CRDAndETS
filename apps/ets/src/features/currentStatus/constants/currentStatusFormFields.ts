import type { FormFieldDef } from '../../../shared/components/AppForm/AppForm';

// ─── Static form fields — defined at module level, never inside a component ──
// Create mode  → statusName only (status not required by POST endpoint)
// Edit mode    → statusName + status toggle (required by PUT endpoint)
export const CURRENT_STATUS_FORM_FIELDS: FormFieldDef[] = [
  {
    name: 'statusName',
    label: 'Status Name',
    type: 'text',
    required: true,
    placeholder: 'e.g. Active, On Leave, Terminated',
    // full-width — no span override
    rules: [{ required: true, message: 'Current Status is required' },
    {
      pattern: /^[a-zA-Z\u00C0-\u024F\s.\-']+$/,
      message:
        "No special characters allowed (letters, digits, spaces, . - ' only)",
    },
    ],
  },
  {
    name: 'status',
    label: 'Active Status',
    type: 'switch',
    // Show this field only during edit (id is present in initialValues when editing)
    hidden: (values) => !!values['currentStatus_Id'],
  },
];