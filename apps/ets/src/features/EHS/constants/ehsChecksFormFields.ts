import type { FormFieldDef } from '../../../shared/components/AppForm/AppForm';

export const EHS_CHECKS_FORM_FIELDS: FormFieldDef[] = [
  {
    name: 'ehsType',
    label: 'EHS Type',
    type: 'text',
    placeholder: 'Enter EHS check type',
    rules: [{ required: true, message: 'EHS Type is required' },
    {
      pattern: /^[a-zA-Z\u00C0-\u024F\s.\-']+$/,
      message:
        "No special characters allowed (letters, digits, spaces, . - ' only)",
    },
    ],
    span: 12,
  },
];