import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

export const FUEL_TYPE_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "fuelTypeDesc",
    label: "Fuel Type Description",
    type: "text",
    required: true,
    placeholder: "Enter fuel type description",
    rules: [{ required: true, message: 'Fuel Type is required' },
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
