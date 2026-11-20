import type { DriverAppConfigRawResponse } from "../services/userAppConfigurationApi";

const GROUP_KEYS = [
  "tripStartConfig",
] as const;

export function initDriverAppForm(
  data: DriverAppConfigRawResponse[] | null | undefined,
): Record<string, unknown> {
  const form: Record<string, unknown> = {};
  if (!data || data.length === 0) return form;
  const row = data[0];

  GROUP_KEYS.forEach((group) => {
    const raw = row[group];
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const obj = Array.isArray(parsed) ? parsed[0] : parsed;
      Object.entries(obj ?? {}).forEach(([k, v]) => {
        form[k] = v;
      });
    } catch {
      // malformed group from backend — skip rather than crash the card
    }
  });

  return form;
}

/** ColumnName is the raw field key itself for this API (e.g. "IsTripChatAllowed"). */
export function toDriverAppColumnName(fieldKey: string): string {
  return fieldKey;
}

/** Booleans travel as "1" / "0" per the sample payload; everything else stringified as-is. */
export function toDriverAppApiValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "1" : "0";
  return String(value);
}
