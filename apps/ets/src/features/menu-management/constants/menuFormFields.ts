// src/features/menu-management/constants/menuFormFields.ts
//
// ─── Field layout (matches screenshot exactly) ───────────────────────────────
//  Row 1: [Menu Name (span 12)]  [Sub menu Name / parentMenuId (span 12)]
//  Row 2: [Route (span 12)]      [Menu Order (span 12)]
//  Row 3: [Availability Status switch (span 24, full-width)]
//           └─ sub-text: "Toggle whether this menu is visible in the frontend"
//  (Icon field is NOT shown in the modal screenshot — hidden or removed)
// ─────────────────────────────────────────────────────────────────────────────

import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

interface DynamicOptions {
  parentMenuOptions: { label: string; value: string }[];
}

export const getMenuFormFields = (options: DynamicOptions): FormFieldDef[] => [
  // ── Row 1 ──────────────────────────────────────────────────────────────────
  {
    name: "menuName",
    label: "Menu Name",
    type: "text",
    required: true,
    span: 12,
    placeholder: "e.g. Analytics Dashboard",
  },
  {
    name: "parentMenuId",
    label: "Sub Menu Name",
    type: "select",
    span: 12,
    placeholder: "e.g. 02",
    options: options.parentMenuOptions,
    required: false,
  },

  // ── Row 2 ──────────────────────────────────────────────────────────────────
  {
    name: "routeUrl",
    label: "Route",
    type: "text",
    span: 12,
    placeholder: "e.g. /analytics/dashboard",
    required: false,
  },
  {
    name: "orderNo",
    label: "Menu Order",
    type: "number",
    span: 12,
    placeholder: "e.g. 02",
    required: true,
  },
   {
    name: "icon",
    label: "Icon",
    type: "text",
    span: 12,
    placeholder: "e.g. icon-name",
    required: true,
  },

  // ── Row 3 — full-width switch with description ─────────────────────────────
  {
    name: "isActive",
    label: "Availability Status",
    type: "switch",
    span: 24,
    required: false,
    fieldProps: {
      checkedChildren: "Active",
      unCheckedChildren: "Inactive",
    },
    // `extra` surfaces the muted sub-text below the label (if AppForm supports it).
    // If your AppForm does not support `extra`, render a custom wrapper via `custom`.
 
  },
];
