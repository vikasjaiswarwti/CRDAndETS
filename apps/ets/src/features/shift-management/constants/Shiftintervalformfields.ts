import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

export const SHIFT_INTERVAL_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "intervalMinute",
    label: "Interval (Minutes)",
    type: "number",
    required: true,
    span: 12,
    placeholder: "e.g. 30",
  },
  {
    name: "intervalText",
    label: "Interval Label",
    type: "text",
    span: 12,
    placeholder: "e.g. Every 30 minutes",
  },
  // {
  //   name: "active",
  //   label: "Active",
  //   type: "switch",
  //   span: 12,
  // },
];
