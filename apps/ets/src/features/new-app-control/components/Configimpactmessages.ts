// ============================================================
// configImpactMessages.ts — Central Impact Message Registry
//
// Every configurable field gets a human-readable explanation
// shown in the confirmation modal before the API call.
// ============================================================

export type ImpactSeverity = "info" | "warning" | "critical";

export interface ImpactMessage {
  title: string;
  description: string;
  severity: ImpactSeverity;
}

type ImpactFactory = (oldValue: unknown, newValue: unknown) => ImpactMessage;

const DEFAULT_MESSAGE: ImpactMessage = {
  title: "Configuration Change",
  description:
    "This configuration will affect future operations. Please verify before saving.",
  severity: "info",
};

// ── Scope label lookup (mirrors SCOPE_OPTIONS in constants) ──────────────────
const SCOPE_LABEL: Record<number, string> = {
  1: "Normal Shift",
  2: "User Wise",
  3: "Department Wise",
  4: "LOB Wise",
  5: "Process Wise",
};

// ── Lock mode label lookup ────────────────────────────────────────────────────
export const LOCK_MODE_LABEL: Record<number, string> = {
  1: "Calendar Days",
  2: "Day & Time",
  3: "Weekly",
  4: "Minutes Before",
};

export const CONFIG_IMPACT_MESSAGES: Record<string, ImpactFactory> = {
  // ── Basic ──────────────────────────────────────────────────────────────────
  ors_Lock_days: (_old, newVal) => ({
    title: "Excel Upload Roster Before",
    description: `Admins will be able to upload the roster via Excel up to ${newVal} day(s) before the shift schedule. This change will affect future roster uploads only.`,
    severity: "info",
  }),

  ScheduleListTAT: (_old, newVal) => ({
    title: "Schedule List TAT",
    description: `The mobile app will show the roster for the next ${newVal} day(s) from today. Employees will only see upcoming schedules within this window.`,
    severity: "info",
  }),

  shiftValidationID: (oldVal, newVal) => {
    const fromLabel = SCOPE_LABEL[oldVal as number] ?? `Scope ${oldVal}`;
    const toLabel = SCOPE_LABEL[newVal as number] ?? `Scope ${newVal}`;
    return {
      title: "Shift Configuration Scope",
      description: `You are changing Shift Validation from "${fromLabel}" to "${toLabel}". This controls which shifts are validated during roster submission and will affect all future roster processing.`,
      severity: "warning",
    };
  },

  // ── Adhoc ─────────────────────────────────────────────────────────────────
  adhocRequestEnabledForUser: (_old, newVal) => ({
    title: "Adhoc Requests",
    description: newVal
      ? "Employees will be able to raise adhoc ride requests. This takes effect immediately for all future requests."
      : "Adhoc ride requests will be disabled for all employees. Existing scheduled trips are not affected.",
    severity: newVal ? "info" : "warning",
  }),

  boardDebaordEnabledForUser: (_old, newVal) => ({
    title: "Board / Deboard",
    description: newVal
      ? "Board and deboard functionality will be enabled for employees."
      : "Board and deboard functionality will be disabled. Employees will not be able to board or deboard from trips.",
    severity: newVal ? "info" : "warning",
  }),

  adhocRequestApproval: (_old, newVal) => ({
    title: "Adhoc Request Approval",
    description: newVal
      ? "All adhoc requests will now require manager approval before processing. This adds an approval step to the workflow."
      : "Adhoc requests will be auto-approved without manager intervention.",
    severity: "warning",
  }),

  adhocRequestPickTAT: (_old, newVal) => ({
    title: "Adhoc Pick TAT",
    description: `The pickup processing window for adhoc requests will be set to ${newVal} minutes. Requests submitted outside this window may not be fulfilled.`,
    severity: "info",
  }),

  adhocRequestDropTAT: (_old, newVal) => ({
    title: "Adhoc Drop TAT",
    description: `The drop processing window for adhoc requests will be set to ${newVal} minutes.`,
    severity: "info",
  }),

  // ── Notifications ─────────────────────────────────────────────────────────
  scheduleNotificationReminder: (_old, newVal) => ({
    title: "Schedule Reminder",
    description: `Employees will receive a push notification ${newVal} minutes before their scheduled pickup. Changing this affects all future notifications.`,
    severity: "info",
  }),

  pickCancelTAT_Minutes: (_old, newVal) => ({
    title: "Pick Cancel TAT",
    description: `The pickup cancellation window will be set to ${newVal} minutes. Cancellations requested beyond this window will be rejected.`,
    severity: "info",
  }),

  dropCancelTAT_Minutes: (_old, newVal) => ({
    title: "Drop Cancel TAT",
    description: `The drop cancellation window will be set to ${newVal} minutes.`,
    severity: "info",
  }),

  // ── Geofence ──────────────────────────────────────────────────────────────
  geofenceAutoTripClose: (_old, newVal) => ({
    title: "Auto Trip Close Radius",
    description: `Trips will automatically close when the vehicle is within ${newVal} metres of the destination. Setting this too low may cause premature closures.`,
    severity: "warning",
  }),

  geofenceCabReachedHome: (_old, newVal) => ({
    title: "Cab Reached Home Radius",
    description: `The system will consider the cab to have reached home when within ${newVal} metres of the employee's address.`,
    severity: "info",
  }),

  geofenceToCallingUSer: (_old, newVal) => ({
    title: "Calling User Radius",
    description: `The driver-to-employee notification will trigger when within ${newVal} metres. Larger values alert employees earlier; smaller values alert them just-in-time.`,
    severity: "info",
  }),

  routingPickupTAT: (_old, newVal) => ({
    title: "Routing Pickup TAT",
    description: `The routing engine will allow up to ${newVal} minutes for pickup route optimisation. This affects all future trip routing.`,
    severity: "info",
  }),

  routingDropTAT: (_old, newVal) => ({
    title: "Routing Drop TAT",
    description: `The routing engine will allow up to ${newVal} minutes for drop route optimisation.`,
    severity: "info",
  }),

  configBoardDeboardSMSTATinMinutes: (_old, newVal) => ({
    title: "Board/Deboard SMS TAT",
    description: `SMS alerts for board/deboard events will be triggered within ${newVal} minutes of the event. This applies to all future trips.`,
    severity: "info",
  }),

  configSendSMSBeforeTripStart: (_old, newVal) => ({
    title: "SMS Before Trip Start",
    description: `Employees will receive an SMS ${newVal} minutes before their trip begins. Changing this takes effect from the next scheduled trip cycle.`,
    severity: "info",
  }),

  // ── Features ──────────────────────────────────────────────────────────────
  hybridScheduleEnabled: (_old, newVal) => ({
    title: "Hybrid Schedule",
    description: newVal
      ? "Hybrid scheduling will be enabled. Employees can mix work-from-home and office days within a single roster week."
      : "Hybrid scheduling will be disabled. All roster submissions will revert to standard office scheduling.",
    severity: newVal ? "info" : "warning",
  }),

  mergeShift: (_old, newVal) => ({
    title: "Merge Shift",
    description: newVal
      ? "Shift merging will be enabled. Back-to-back shifts within the merge window will be combined into a single trip."
      : "Shift merging will be disabled. Each shift will be treated independently.",
    severity: "info",
  }),

  noShowCountIsActive: (_old, newVal) => ({
    title: "No Show Count",
    description: newVal
      ? "No-show tracking will be active. Employees who miss rides will have their count incremented, which may trigger suspension."
      : "No-show tracking will be deactivated. No suspension thresholds will apply.",
    severity: newVal ? "warning" : "info",
  }),

  noShowCount: (_old, newVal) => ({
    title: "No Show Threshold",
    description: `Employees will be flagged after ${newVal} consecutive no-shows. This threshold applies to all future no-show events.`,
    severity: "warning",
  }),

  rosterSuspensionDays: (_old, newVal) => ({
    title: "Roster Suspension Duration",
    description: `Employees who exceed the no-show threshold will be suspended from the roster for ${newVal} day(s). This change applies to future suspension decisions only.`,
    severity: "warning",
  }),
};

/**
 * Look up the impact message for a field key.
 * Supports exact match first, then pattern matching for dynamic
 * LockPanel keys (e.g. "schPickupDayUser", "adhocDropWeekTimeSpoc").
 * Falls back to a generic message if no pattern matches.
 */
export function getImpactMessage(
  fieldKey: string,
  oldValue: unknown,
  newValue: unknown,
): ImpactMessage {
  // 1. Exact match
  const factory = CONFIG_IMPACT_MESSAGES[fieldKey];
  if (factory) return factory(oldValue, newValue);

  // 2. Pattern match for dynamic LockPanel keys
  const lk = fieldKey.toLowerCase();

  if (lk.includes("lockdays"))
    return {
      title: "Lock Days",
      description: `The lock window will be set to ${newValue} day(s). This affects when employees can modify their roster.`,
      severity: "info",
    };

  if (lk.includes("pickupday") && !lk.includes("time"))
    return {
      title: "Pickup Day",
      description: `The pickup cutoff day will change to the selected day. Select the matching pickup time to complete this configuration.`,
      severity: "info",
    };

  if (lk.includes("pickupday") && lk.includes("time"))
    return {
      title: "Pickup Day & Time",
      description: `The pickup cutoff time will be updated to ${newValue}. This applies together with the pickup day selection for future roster periods.`,
      severity: "info",
    };

  if (lk.includes("pickup") && lk.includes("week") && !lk.includes("time"))
    return {
      title: "Pickup Week Day",
      description: `The weekly pickup cutoff day will change. Select the matching pickup time to complete this configuration.`,
      severity: "info",
    };

  if (lk.includes("pickup") && lk.includes("week") && lk.includes("time"))
    return {
      title: "Pickup Weekly Time",
      description: `The weekly pickup cutoff time will be set to ${newValue}. Applied together with the selected pickup day for all future weekly rosters.`,
      severity: "info",
    };

  if (lk.includes("pickupminute"))
    return {
      title: "Pickup Before (minutes)",
      description: `Employees must request a pickup at least ${newValue} minutes before their shift. Requests made after this window will be rejected.`,
      severity: "info",
    };

  if (lk.includes("dropday") && !lk.includes("time"))
    return {
      title: "Drop Day",
      description: `The drop cutoff day will change to the selected day. Select the matching drop time to complete this configuration.`,
      severity: "info",
    };

  if (lk.includes("dropday") && lk.includes("time"))
    return {
      title: "Drop Day & Time",
      description: `The drop cutoff time will be updated to ${newValue}. Applied together with the drop day selection for future roster periods.`,
      severity: "info",
    };

  if (lk.includes("drop") && lk.includes("week") && !lk.includes("time"))
    return {
      title: "Drop Week Day",
      description: `The weekly drop cutoff day will change. Select the matching drop time to complete this configuration.`,
      severity: "info",
    };

  if (lk.includes("drop") && lk.includes("week") && lk.includes("time"))
    return {
      title: "Drop Weekly Time",
      description: `The weekly drop cutoff time will be set to ${newValue}. Applied together with the selected drop day for all future weekly rosters.`,
      severity: "info",
    };

  if (lk.includes("dropminute"))
    return {
      title: "Drop Before (minutes)",
      description: `Employees must request a drop at least ${newValue} minutes before their shift end. Requests made after this window will be rejected.`,
      severity: "info",
    };

  // 3. Generic fallback
  return { ...DEFAULT_MESSAGE };
}
