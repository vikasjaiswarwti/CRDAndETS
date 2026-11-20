import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

export const LKP_FEEDBACK_TYPE_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "feedbackType",
    label: "Feedback Type",
    type: "text",
    required: true,
    placeholder: "Enter feedback type",
    span: 12,
  },
  {
    name: "isActive",
    label: "Availability Status",
    type: "switch",
    span: 12,
  },
];
