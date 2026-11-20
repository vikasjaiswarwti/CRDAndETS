import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

export const DOCUMENT_OWNER_TYPE_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "docOwnerTypeName",
    label: "Owner Type Name",
    type: "text",
    required: true,
    placeholder: "Enter owner type name",
    rules: [{ required: true, message: 'Owner Type is required' },
    {
      pattern: /^[a-zA-Z\u00C0-\u024F\s.\-']+$/,
      message:
        "No special characters allowed (letters, digits, spaces, . - ' only)",
    },
    ],
    span: 12,
  },
  {
    name: "active",
    label: "Status",
    type: "switch",
    span: 12,
    fieldProps: {
      checkedChildren: "Active",
      unCheckedChildren: "Inactive",
    },
  },
];
