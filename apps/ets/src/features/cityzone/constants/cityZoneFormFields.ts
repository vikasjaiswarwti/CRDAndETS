// All fields are static — no dynamic options needed for this entity.

import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

export const CITY_ZONE_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "cityZoneCode",
    label: "City Zone Code",
    type: "text",
    placeholder: "Enter city zone code (e.g. NZ-01)",
    span: 12,
    rules: [{ required: true, message: "City zone code is required" },
    {
      pattern: /^[a-zA-Z\u00C0-\u024F\s.\-']+$/,
      message:
        "No special characters allowed (letters, digits, spaces, . - ' only)",
    },
    ],
  },
  {
    name: "cityZoneDescription",
    label: "Description",
    type: "textarea",
    placeholder: "Enter a brief description of this zone",
    // full-width — no span
    fieldProps: { rows: 3 },
  },
  {
    name: "active",
    label: "Active Status",
    type: "switch",
    span: 12,
  },
];
