import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

export const PROCESS_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "procode",
    label: "Process Code",
    type: "text",
    placeholder: "Enter process code",
    rules: [{ required: true, message: "Process code is required" },
    // {
    //   pattern: /^[A-Z\u00C0-\u024F\s.\-']+$/,
    //   message:
    //     "No special characters allowed (letters, digits, spaces, . - ' only)",
    // },
    ],
    span: 12,
  },
  {
    name: "proname",
    label: "Process Name",
    type: "text",
    placeholder: "Enter process name",
    rules: [{ required: true, message: "Process name is required" },
    // {
    //   pattern: /^[a-zA-Z\u00C0-\u024F\s.\-']+$/,
    //   message:
    //     "No special characters allowed (letters, digits, spaces, . - ' only)",
    // },
    ],
    span: 12,
  },
  {
    name: "active",
    label: "Availability Status",
    type: "switch",
    fieldProps: { checkedChildren: "Active", unCheckedChildren: "Inactive" },
  },
];
