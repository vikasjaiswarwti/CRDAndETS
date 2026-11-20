export const AREA_ZONE_OPTIONS = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
] as const;

export const AREA_ZONE_LABEL_MAP = Object.fromEntries(
  AREA_ZONE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;
