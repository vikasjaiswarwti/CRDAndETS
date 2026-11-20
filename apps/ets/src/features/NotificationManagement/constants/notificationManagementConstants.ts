import type {
  NotificationManagementTab,
  StatusFilter,
} from "../types/notificationManagement.types";

export const TAB_OPTIONS: { key: NotificationManagementTab; label: string }[] = [
  { key: "sos", label: "SOS Escalation Hierarchy" },
  { key: "event", label: "Event Notification Config" },
];

export const STATUS_MAP = {
  active: { label: "Active", color: "green" },
  inactive: { label: "Inactive", color: "red" },
} as const;

export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

// Event keys the backend actually reads today. eventKey is free text on the
// API, but anything outside this list is not consumed by any handler.
export const EVENT_KEY_OPTIONS = [
  { value: "NIGHT_DROP_NOT_SAFE", label: "Night Drop Not Safe" },
  { value: "ALERT_RESOLVED", label: "Alert Resolved" },
  {
    value: "SAFE_HOME_REACH_CLOSED_TO_ADMIN",
    label: "Safe Home Reach Closed (Admin)",
  },
  { value: "SOS_TRIGGERED_TO_ADMIN", label: "SOS Triggered (Admin)" },
  { value: "ADDRESS_CHANGE_REQUEST", label: "Address Change Request" },
  {
    value: "EMPLOYEE_NO_SHOW_INFORM_ADMIN",
    label: "Employee No Show (Admin)",
  },
];

export const EVENT_KEY_LABEL_MAP = Object.fromEntries(
  EVENT_KEY_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;

export const PAGE_SIZE = 10;

// Indian 10-digit mobile, stored without the +91 prefix.
export const MOBILE_RULE = {
  pattern: /^[6-9]\d{9}$/,
  message: "Enter a valid 10-digit mobile number",
};

export const digitsOnly = (value?: string) =>
  (value ?? "").replace(/\D/g, "").slice(0, 10);
