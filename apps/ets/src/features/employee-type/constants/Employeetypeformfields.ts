import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

export const EMPLOYEE_TYPE_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "empType",
    label: "Employee Type",
    type: "text",
    placeholder: "Enter employee type",
    rules: [{ required: true, message: 'Employee Type is required' },
    {
      pattern: /^[a-zA-Z0-9\u00C0-\u024F\s.\-']+$/,
      message:
        "No special characters allowed (letters, digits, spaces, . - ' only)",
    },
    ],

  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter description",
    rules: [{ required: true, message: 'Employee Type is required' },
    {
      pattern: /^[a-zA-Z0-9\u00C0-\u024F\s.\-']+$/,
      message:
        "No special characters allowed (letters, digits, spaces, . - ' only)",
    },
    ],
  },
  {
    name: "isActive",
    label: "Availability Status",
    type: "switch",
    fieldProps: {
      checkedChildren: "Active",
      unCheckedChildren: "Inactive",
    },
  },
];
