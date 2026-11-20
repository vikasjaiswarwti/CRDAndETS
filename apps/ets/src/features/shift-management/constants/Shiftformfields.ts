
import type { FormFieldDef } from "../../../shared/components/AppForm/AppForm";

interface DefineShiftFormOptions {
  officeOptions: { label: string; value: string }[];
  intervalOptions: { label: string; value: string }[];
}

export const getDefineShiftFormFields = ({
  officeOptions = [],
  intervalOptions = [],
}: DefineShiftFormOptions): FormFieldDef[] => [
  {
    name: "locCode",
    label: "Office",
    type: "select",
    options: officeOptions,
    span: 12,
    rules: [{ required: true, message: "Please select an office" }],
    placeholder: "Select corporate",
  },
  {
    name: "interval",
    label: "Interval (minutes)",
    type: "select",
    options: intervalOptions,
    span: 12,
    rules: [{ required: true, message: "Please select an interval" }],
    placeholder: "Select interval",
  },
];

// ── HH:MM validator (reusable) ────────────────────────────────────────────────
const timeValidator = (_: any, value: string) => {
  if (!value || value.trim() === "") return Promise.resolve(); // optional field
  if (!/^\d{2}:\d{2}$/.test(value)) return Promise.reject("Use HH:MM format");
  const [h, m] = value.split(":").map(Number);
  if (h > 23 || m > 59) return Promise.reject("Invalid time (00:00–23:59)");
  return Promise.resolve();
};

// ── Edit Slot form fields ─────────────────────────────────────────────────────
export const EDIT_SLOT_FORM_FIELDS: FormFieldDef[] = [
  {
    name: "dropShift",
    label: "Drop Shift",
    type: "text",
    placeholder: "HH:MM",
    span: 8,
    rules: [
      {
        validator: timeValidator,
      },
    ],
  },

  {
    name: "pickOccupancy",
    label: "Cab Occupancy — Pick",
    type: "number",
    span: 8,
    fieldProps: { min: 1 },
    rules: [
      { required: true, message: "Required" },
      {
        validator: (_: any, value: number) => {
          if (value === undefined || value === null)
            return Promise.reject("Required");
          if (value < 1) return Promise.reject("Must be at least 1");
          if (value > 100) return Promise.reject("Seems too high (max 100)");
          return Promise.resolve();
        },
      },
    ],
  },
  {
    name: "dropOccupancy",
    label: "Cab Occupancy — Drop",
    type: "number",
    span: 8,
    fieldProps: { min: 1 },
    rules: [
      { required: true, message: "Required" },
      {
        validator: (_: any, value: number) => {
          if (value === undefined || value === null)
            return Promise.reject("Required");
          if (value < 1) return Promise.reject("Must be at least 1");
          if (value > 100) return Promise.reject("Seems too high (max 100)");
          return Promise.resolve();
        },
      },
    ],
  },

  {
    name: "avgSpeed",
    label: "Avg Speed (km/h)",
    type: "number",
    span: 8,
    fieldProps: { min: 1 },
    rules: [
      { required: true, message: "Required" },
      {
        validator: (_: any, value: number) => {
          if (value === undefined || value === null)
            return Promise.reject("Required");
          if (value < 1) return Promise.reject("Must be at least 1");
          if (value > 200) return Promise.reject("Speed too high (max 200)");
          return Promise.resolve();
        },
      },
    ],
  },

  // ── Toggles ────────────────────────────────────────────────────────────
  {
    name: "unsPickAllwd",
    label: "Adhoc Allowed — Pick",
    type: "switch",
    span: 8,
    fieldProps: { checkedChildren: "Yes", unCheckedChildren: "No" },
  },
  {
    name: "unsDropAllwd",
    label: "Adhoc Allowed — Drop",
    type: "switch",
    span: 8,
    fieldProps: { checkedChildren: "Yes", unCheckedChildren: "No" },
  },
  {
    name: "pickDayShift",
    label: "Day Shift — Pick",
    type: "switch",
    span: 12,
    fieldProps: { checkedChildren: "Day", unCheckedChildren: "Night" },
  },
  {
    name: "dropDayShift",
    label: "Day Shift — Drop",
    type: "switch",
    span: 12,
    fieldProps: { checkedChildren: "Day", unCheckedChildren: "Night" },
  },
  {
    name: "peakHour",
    label: "Peak Hour",
    type: "switch",
    span: 8,
    fieldProps: { checkedChildren: "Peak", unCheckedChildren: "Off-Peak" },
  },
  {
    name: "isSafeReachedMale",
    label: "Safe Reach — Male",
    type: "switch",
    span: 8,
    fieldProps: { checkedChildren: "Enabled", unCheckedChildren: "Disabled" },
  },
  {
    name: "isSafeReachedFemale",
    label: "Safe Reach — Female",
    type: "switch",
    span: 8,
    fieldProps: { checkedChildren: "Enabled", unCheckedChildren: "Disabled" },
  },
  {
    name: "isGuardPick",
    label: "Guard — Pick",
    type: "switch",
    span: 8,
    fieldProps: {
      checkedChildren: "Required",
      unCheckedChildren: "Not Required",
    },
  },
  {
    name: "isGuardDrop",
    label: "Guard — Drop",
    type: "switch",
    span: 8,
    fieldProps: {
      checkedChildren: "Required",
      unCheckedChildren: "Not Required",
    },
  },
];
