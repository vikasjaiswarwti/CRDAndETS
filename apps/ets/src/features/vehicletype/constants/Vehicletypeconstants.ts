// VehicleType has no active/status field — no STATUS_MAP needed.
// Location code options — extend as your system defines them.
export const LOC_CODE_OPTIONS = [
  { value: 1, label: "Location 1" },
  { value: 2, label: "Location 2" },
] as const;

export const LOC_CODE_LABEL_MAP = Object.fromEntries(
  LOC_CODE_OPTIONS.map((o) => [String(o.value), o.label]),
) as Record<string, string>;

export const ACTIVE_OPTIONS = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
] as const;
