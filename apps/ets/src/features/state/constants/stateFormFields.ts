// FILE 5 — constants/stateFormFields.ts

import type { FormFieldDef } from '../../../shared/components/AppForm/AppForm';

// All fields are static — no dynamic options required.
// Defined at module level per architecture contract.

export const STATE_FORM_FIELDS: FormFieldDef[] = [
  {
    name: 'stateName',
    label: 'State Name',
    type: 'text',
    placeholder: 'Enter state name',
    required: true,
    span: 12,
    rules: [{ required: true, message: 'State is required' },
    {
      pattern: /^[a-zA-Z\u00C0-\u024F\s.\-']+$/,
      message:
        "No special characters allowed (letters, digits, spaces, . - ' only)",
    },
    ],
  },
  //   {
  //   name: "docs",
  //   label: "Profile Photos",
  //   type: "file",
  //   placeholder: 'Upload profile photo',
  //   span: 12,
  //   multiple: false,
  //   maxFiles: 5,
  //   maxSizeMB: 2,
  //   accept: ".xlxs",
  // },
];