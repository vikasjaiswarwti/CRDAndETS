

import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

export const ROLE_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "roleName",
    label: "Role Name",
    type: "text",
    placeholder: "e.g. Admin, Manager, Viewer",
    span: 24,
    rules: [{ required: true, message: "Role name is required" }],
  },
  {
    name: "isActive",
    label: "Status",
    type: "switch",
    span: 24,
  },
];

// ── showParentField: true only in edit mode ────────────────────────────────────
// create-root → parent = null, no field
// create-sub  → parent locked via LockedParentField display, not in form fields
// edit        → parent editable dropdown
export function getMenuFormFields(
  parentOptions: { label: string; value: string }[],
  showParentField: boolean = false,
): FormFieldDef[] {
  const base: FormFieldDef[] = [
    {
      name: "menuName",
      label: "Menu Name",
      type: "text",
      placeholder: "e.g. Fleet Management",
      span: 12,
      rules: [{ required: true, message: "Menu name is required" }],
    },
    {
      name: "routeUrl",
      label: "Route URL",
      type: "text",
      placeholder: "e.g. fleet/vehicles",
      span: 12,
    },
    {
      name: "icon",
      label: "Icon Key",
      type: "text",
      placeholder: "-",
      span: 12,
    },
    {
      name: "orderNo",
      label: "Order No",
      type: "number",
      span: 12,
      rules: [{ required: true, message: "Order is required" }],
    },
    {
      name: "isShow",
      label: "Show in Menu Bar",
      type: "switch",
      span: 12,
    },

  ];

  // Only inject parent dropdown when editing an existing menu
  if (showParentField) {
    base.splice(2, 0, {
      name: "parentMenuId",
      label: "Parent Menu",
      type: "select",
      span: 24,
      placeholder: "None — root level menu",
      options: [{ label: "— None (root) —", value: "" }, ...parentOptions],
    });
  }

  return base;
}
