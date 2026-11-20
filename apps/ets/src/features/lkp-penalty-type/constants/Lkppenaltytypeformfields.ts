import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";
import { APPLICABLE_TO_OPTIONS } from "./Lkppenaltytypeconstants";

export const LKP_PENALTY_TYPE_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "penaltyType",
    label: "Penalty Type",
    type: "text",
    required: true,
    placeholder: "Enter penalty type",
    span: 12,
    rules: [
      { required: true, message: "Vehicle type description is required" },
      {
        pattern: /^[a-zA-Z\u00C0-\u024F\s.\-']+$/,
        message:
          "No special characters allowed (letters, digits, spaces, . - ' only)",
      },
    ],
  },
  {
    name: "applicableTo",
    label: "Applicable To",
    type: "select",
    required: true,
    placeholder: "Select applicable to",
    options: APPLICABLE_TO_OPTIONS as unknown as {
      value: string | number;
      label: string;
    }[],
    span: 12,
  },
  {
    name: "isActive",
    label: "Availability Status",
    type: "switch",
    span: 12,
  },
];
