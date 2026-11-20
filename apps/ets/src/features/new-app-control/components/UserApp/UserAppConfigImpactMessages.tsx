import { getUserAppFieldLabel } from "../../constants/UserAppConfig";
import type { ImpactMessage } from "../Configimpactmessages"; // ← shared type, not a local redeclare

export function getUserAppImpactMessage(
  fieldKey: string,
  _oldValue: unknown,
  newValue: unknown,
): ImpactMessage {
  const label = getUserAppFieldLabel(fieldKey);
  const isBool = typeof newValue === "boolean";
  return {
    title: label,
    description: isBool
      ? `This will ${newValue ? "enable" : "disable"} "${label}" for all users at this office.`
      : `This will update "${label}" for all users at this office.`,
    severity: "warning", // valid: "info" | "warning" | "critical"
  };
}
