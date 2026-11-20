import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

// Defined at MODULE level — never inside a component or hook.
export const BILL_PLAN_TYPE_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "bptCode",
    label: "Plan Type (Short Name)",
    type: "text",
    placeholder: "Enter bill plan type code",
    span: 12,
    rules: [{ required: true, message: "Plan type code is required" },
    {
      pattern: /^[a-zA-Z\u00C0-\u024F\s.\-']+$/,
      message:
        "No special characters allowed (letters, digits, spaces, . - ' only)",
    },
    ],
  },
  {
    name: "bptName",
    label: "Plan Type Name",
    type: "text",
    placeholder: "Enter bill plan type name",
    span: 12,
    rules: [{ required: true, message: "Plan type name is required" },
    {
      pattern: /^[a-zA-Z\u00C0-\u024F\s.\-']+$/,
      message:
        "No special characters allowed (letters, digits, spaces, . - ' only)",
    },
    ],
  },
  {
    name: "active",
    label: "Status",
    type: "switch",
    fieldProps: {
      checkedChildren: "Active",
      unCheckedChildren: "Inactive",
    },
  },
];
