// src/features/role-management/constants/roleFormFields.ts

import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

/** Static — no dynamic options needed for Role */
export const ROLE_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "roleName",
    label: "Role Name",
    type: "text",
    required: true,
    placeholder: "e.g. Super Admin",
    span: 12,
  },
  {
    name: "isActive",
    label: "Availability Status",
    type: "switch",
    required: false,
    fieldProps: {
      checkedChildren: "Active",
      unCheckedChildren: "Inactive",
    },
    span: 12,
  },
];
