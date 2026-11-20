import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

// ─── Icons (inline SVG — no external dep) ────────────────────────────────────

// const ClockIcon = () => (
//     <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
//         <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
//         <path d="M7 4v3.5l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
//     </svg>
// );

// ─── Option shape ─────────────────────────────────────────────────────────────

export interface RosterSelectOption {
  value: string;
  label: string;
}

export interface CreateRosterFormFieldsOptions {
  officeOptions: RosterSelectOption[];
  shiftOptions: RosterSelectOption[];
}

// ─── getCreateRosterFormFields ────────────────────────────────────────────────
// Dynamic because both office and shift options come from RTK Query at runtime.
// Defined at module level — never called inside a component render body.
//
// Layout (two-column grid via span: 12):
//
//   [ Office                        ] [ ← full width, own row ]
//   [ From Date       ] [ To Date   ]
//   [ Login Shift     ] [ Logout Shift ]

export function getCreateRosterFormFields({
  officeOptions,
  shiftOptions,
}: CreateRosterFormFieldsOptions): FormFieldDef[] {
  return [
    // ── Row 1: Office (full width) ────────────────────────────────────────
    {
      name: "officeId",
      label: "Office",
      type: "select",
      options: officeOptions,
      placeholder: "Select office",
      rules: [{ required: true, message: "Please select an office" }],
      // full width — no span
    },

    // ── Row 2: Date range ─────────────────────────────────────────────────
    {
      name: "fromDate",
      label: "From Date",
      type: "date",
      placeholder: "Select start date",
      rules: [{ required: true, message: "Please select a from date" }],
      span: 8,
    },
    {
      name: "toDate",
      label: "To Date",
      type: "date",
      placeholder: "Select end date",
      rules: [{ required: true, message: "Please select a to date" }],
      span: 12,
      // Disable dates before fromDate — fieldProps receives the full form values
      // fieldProps: (values: Record<string, unknown>) => ({
      //     disabledDate: (current: { isBefore: (d: string, u: string) => boolean }) =>
      //         values.fromDate
      //             ? current.isBefore(values.fromDate as string, "day")
      //             : false,
      // }),
    },

    // ── Row 3: Shifts ─────────────────────────────────────────────────────
    {
      name: "pickupShiftId",
      label: "Login Shift",
      type: "select",
      options: shiftOptions,
      placeholder: "Select login shift",
      // prefix:      <ClockIcon />,
      span: 8,
    },
    {
      name: "dropShiftId",
      label: "Logout Shift",
      type: "select",
      options: shiftOptions,
      placeholder: "Select logout shift",
      // prefix:      <ClockIcon />,
      span: 8,
    },
  ];
}
