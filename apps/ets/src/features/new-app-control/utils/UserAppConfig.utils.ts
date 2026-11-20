import type { UserAppConfigRawResponse } from "../services/userAppConfigurationApi";

const GROUP_KEYS = [
  "basicSetting",
  "appScheduleInfoTAT",
  "appTripInfoTAT",
  "appGeneral",
] as const;

export function initUserAppForm(
  data: UserAppConfigRawResponse[] | null | undefined,
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
export function toUserAppColumnName(fieldKey: string): string {
  return fieldKey;
}

/** Booleans travel as "1" / "0" per the sample payload; everything else stringified as-is. */
export function toUserAppApiValue(value: unknown): string {
  if (typeof value === "boolean") return value ? "1" : "0";
  return String(value);
}

export interface BoardingProcessOption {
  label: string;
  value: number;
}

/**
 * "boardingProcess" is shaped differently from the other groups — a JSON array of
 * { id, Name } records rather than a single settings object — so it's kept out of
 * GROUP_KEYS and parsed separately into Select options for BoardingType/DeboardingType.
 */
export function getBoardingProcessOptions(
  data: UserAppConfigRawResponse[] | null | undefined,
): BoardingProcessOption[] {
  if (!data || data.length === 0) return [];
  const raw = data[0]?.boardingProcess;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<{ id: number; Name: string }>;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p) => ({ label: p.Name, value: p.id }));
  } catch {
    return [];
  }
}
