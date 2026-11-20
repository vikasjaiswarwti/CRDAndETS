import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

export const DEPARTMENT_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "depCode",
    label: "Department Code",
    type: "text",
    placeholder: "Enter department code",
    span: 12,
  },
  {
    name: "depName",
    label: "Department Name",
    type: "text",
    placeholder: "Enter department name",
    span: 12,
  },
  {
    name: "isActive",
    label: "Availability Status",
    type: "switch",
    fieldProps: {
      checkedChildren: "Active",
      unCheckedChildren: "Inactive",
    },
  },
];
