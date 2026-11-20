import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

// ─── All fields are static → plain const array ────────────────────────────────
// Defined at MODULE level — never inside a component or hook.
// ─────────────────────────────────────────────────────────────────────────────

export const LINE_OF_BUSINESS_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "lobName",
    label: "LOB Name",
    type: "text",
    placeholder: "Enter line of business name",
    span: 12,
    rules: [
      { required: true, message: "LOB Name is required" },
      {
        pattern: /^[a-zA-Z\u00C0-\u024F\s.\-']+$/,
        message:
          "No special characters allowed (letters, digits, spaces, . - ' only)",
      },
    ],
  },
  {
    name: "active",
    label: "Availability Status",
    type: "switch",
    // Sub-text rendered inside AppForm via fieldProps.description
    fieldProps: {
      checkedChildren: "Active",
      unCheckedChildren: "Inactive",
    },
  },
];
