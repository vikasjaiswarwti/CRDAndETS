// rosterTAT.form.ts — initForm
//
// Actual API response shape:
//   Array<Record<string, string>>   — array of 1 object
//   Each value is a JSON-encoded string:
//     rec[0].basicSetting === '[{"ShiftValidationID":2,"ORS_Lock_days":0,...}]'
//
// Section keys (camelCase):
//   basicSetting, schedulingTATEmployee, schedulingTATSpoc,
//   scheduleCancellationTATUser, scheduleCancellationTATSpoc,
//   adhocTATForUser, adhocTATForSpoc,
//   adhocCancellationTATForUser, adhocCancellationTATForSpoc,
//   adhocTATOther, notifications, geofencingAndRouting, feature
//
// Field casing exceptions (API key → form key):
//   ShiftValidationID            → shiftValidationID
//   ORS_Lock_days                → ors_Lock_days
//   AdhocRequestApproval         → adhocRequestApproval
//   ScheduleNotificationReminder → scheduleNotificationReminder
//   ConfigSendSMSBeforeTripStart → configSendSMSBeforeTripStart
//   MergeShift                   → mergeShift
//   NoShowCountIsActive          → noShowCountIsActive
//   NoShowCount                  → noShowCount
//   RosterSuspensionDays         → rosterSuspensionDays
//
// Lock fields: spread directly — API field names already match form keys.
// Week day fields: API returns 0 when unset → default to 1 (Monday) via || 1.
// Time fields:     API returns "00:00" for unset — kept as-is (valid value).

export function initForm(
  rec: Array<Record<string, string>> | null,
): Record<string, unknown> {
  // Parse one named section from the outer row
  const row = rec?.[0] ?? {};
  const s = (key: string): Record<string, unknown> => {
    try {
      const parsed = JSON.parse(row[key] ?? "[]");
      return (Array.isArray(parsed) ? parsed[0] : parsed) ?? {};
    } catch {
      return {};
    }
  };

  const basic = s("basicSetting");
  const schEmp = s("schedulingTATEmployee");
  const schSpoc = s("schedulingTATSpoc");
  const schCEmp = s("scheduleCancellationTATUser");
  const schCSpoc = s("scheduleCancellationTATSpoc");
  const adhocU = s("adhocTATForUser");
  const adhocS = s("adhocTATForSpoc");
  const adhocCU = s("adhocCancellationTATForUser");
  const adhocCS = s("adhocCancellationTATForSpoc");
  const adhocOther = s("adhocTATOther");
  const notif = s("notifications");
  const geo = s("geofencingAndRouting");
  const feat = s("feature");

  // Fix week-day fields: API returns 0 for unset, we want 1 (Sunday) as fallback
  const fixWeek = (obj: Record<string, unknown>): Record<string, unknown> => {
    const r = { ...obj };
    for (const k of Object.keys(r)) {
      // Week-day fields (number): schPickupWeekUser, adhocDropWeekSpoc, etc.
      if (/Week(User|Spoc)$/.test(k) && !k.includes("Time")) {
        r[k] = (r[k] as number) || 1;
      }
    }
    return r;
  };

  return {
    // ── Basic ─────────────────────────────────────────────────────────────
    shiftValidationID: (basic.ShiftValidationID as number) ?? 1,
    ors_Lock_days: (basic.ORS_Lock_days as number) ?? 0,
    ScheduleListTAT: (basic.ScheduleListTAT as number) ?? 0,
    IsDPDPA: Boolean(basic.IsDPDPA ?? false),
    IsShowVehicleQR: Boolean(basic.IsShowVehicleQR ?? false),
    ScheduleAndAdhocCapping: (basic.ScheduleAndAdhocCapping as number) ?? 0,
    IsAdhocRequestCountAllowed: Boolean(
      basic.IsAdhocRequestCountAllowed ?? false,
    ),
    AdhocRequestQuota: (basic.AdhocRequestQuota as number) ?? 0,
    AdhocRequestResetFrequency:
      (basic.AdhocRequestResetFrequency as string) ?? "Monthly",

    // CORRECT — match the API's PascalCase exactly
    isScheduleFillForLoginAndLogoutBoth: Boolean(
      basic.IsScheduleFillForLoginAndLogoutBoth ?? false,
    ),
    isBoardDeBoardOTPSameOrDifferent: Boolean(
      basic.IsBoardDeBoardOTPSameOrDifferent ?? false,
    ),
    isCancelTripByUserAfterTAT: Boolean(
      basic.IsCancelTripByUserAfterTAT ?? false,
    ),
    isCancelScheduleByUserAfterTAT: Boolean(
      basic.IsCancelScheduleByUserAfterTAT ?? false,
    ),

    isDropTripCancelledWhenUserCancelsPickupTrip: Boolean(
      basic.isDropTripCancelledWhenUserCancelsPickupTrip ?? false,
    ),

    // ── Adhoc toggles + TAT ───────────────────────────────────────────────
    adhocRequestApproval: Boolean(adhocOther.AdhocRequestApproval ?? false),
    adhocRequestEnabledForUser: Boolean(
      adhocOther.adhocRequestEnabledForUser ?? false,
    ),
    boardDebaordEnabledForUser: Boolean(
      adhocOther.boardDebaordEnabledForUser ?? false,
    ),
    adhocRequestPickTAT: (adhocOther.adhocRequestPickTAT as number) ?? 30,
    adhocRequestDropTAT: (adhocOther.adhocRequestDropTAT as number) ?? 30,

    // ── Notifications ─────────────────────────────────────────────────────
    scheduleNotificationReminder:
      (notif.ScheduleNotificationReminder as number) ?? 15,
    pickCancelTAT_Minutes: (notif.pickCancelTAT_Minutes as number) ?? 60,
    dropCancelTAT_Minutes: (notif.dropCancelTAT_Minutes as number) ?? 60,
    IsRosterNotificationEnabled: Boolean(notif.IsRosterNotificationEnabled ?? false),

    // ── Geofence & Routing ────────────────────────────────────────────────
    geofenceAutoTripClose: (geo.geofenceAutoTripClose as number) ?? 0,
    geofenceCabReachedHome: (geo.geofenceCabReachedHome as number) ?? 0,
    geofenceToCallingUSer: (geo.geofenceToCallingUSer as number) ?? 0,
    routingPickupTAT: (geo.routingPickupTAT as number) ?? 0,
    routingDropTAT: (geo.routingDropTAT as number) ?? 0,
    configBoardDeboardSMSTATinMinutes:
      (geo.configBoardDeboardSMSTATinMinutes as number) ?? 0,
    configSendSMSBeforeTripStart:
      (geo.ConfigSendSMSBeforeTripStart as number) ?? 0,

    // ── Features ──────────────────────────────────────────────────────────
    hybridScheduleEnabled: Boolean(feat.hybridScheduleEnabled ?? false),
    mergeShift: Boolean(feat.MergeShift ?? false),
    noShowCountIsActive: Boolean(feat.NoShowCountIsActive ?? false),
    noShowCount: (feat.NoShowCount as number) ?? 0,
    rosterSuspensionDays: (feat.RosterSuspensionDays as number) ?? 0,

    // ── Lock fields — spread directly, field names match form keys ─────────
    ...fixWeek(schEmp),
    ...fixWeek(schSpoc),
    ...fixWeek(schCEmp),
    ...fixWeek(schCSpoc),
    ...fixWeek(adhocU),
    ...fixWeek(adhocS),
    ...fixWeek(adhocCU),
    ...fixWeek(adhocCS),
  };
}
