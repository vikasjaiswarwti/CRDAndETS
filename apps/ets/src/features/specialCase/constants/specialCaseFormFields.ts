import type { FormFieldDef } from '../../../shared/components/AppForm/AppForm';

export const SPECIAL_CASE_FORM_FIELDS: FormFieldDef[] = [
  {
    name: 'specialCaseDesc',
    label: 'Description',
    type: 'text',
    required: true,
    placeholder: 'Enter special case description',
    rules: [{ required: true, message: 'EHS Type is required' },
    {
      pattern: /^[a-zA-Z\u00C0-\u024F\s.\-']+$/,
      message:
        "No special characters allowed (letters, digits, spaces, . - ' only)",
    },
    ],
  },
  {
    name: 'isActive',
    label: 'Availability Status',
    type: 'switch',
    required: false,
    fieldProps: {
      checkedChildren: 'Active',
      unCheckedChildren: 'Inactive',
    },
    hidden: (values) => !!values['specialCase_Id'],
  },
];