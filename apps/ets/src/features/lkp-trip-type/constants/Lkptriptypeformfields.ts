import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

export const LKP_TRIP_TYPE_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "tripTypeName",
    label: "Trip Type Name",
    type: "text",
    required: true,
    placeholder: "Enter trip type name",
    span: 12,
  },
  {
    name: "active",
    label: "Availability Status",
    type: "switch",
    span: 12,
  },
];
