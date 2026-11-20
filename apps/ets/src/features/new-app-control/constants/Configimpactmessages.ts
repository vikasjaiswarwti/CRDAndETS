// ============================================================
// configImpactMessages.ts
//
// Central registry of human-readable descriptions for every
// configurable field in App Control Configuration.
//
// Used by FieldHelpPopover to show context on hover.
// Used by the confirmation modal to explain the impact of a change.
//
// To add a new field: add an entry keyed by the exact form field key.
// LockPanel dynamic keys (e.g. "schLockDaysUser") are matched by
// stripping the trailing "User" | "Spoc" suffix automatically.
// ============================================================

export interface FieldImpact {
  /** Short display title shown in the popover header and modal */
  title: string;
  /** Full human-readable description of what this field controls */
  description: string;
  /** Optional concrete example shown in smaller italic text */
  example?: string;
}

// ── Registry ──────────────────────────────────────────────────────────────────
export const CONFIG_IMPACT: Record<string, FieldImpact> = {
  // ── Basic ──────────────────────────────────────────────────────────────────
  shiftValidationID: {
    title: "Shift Validation Scope",
    description:
      "Specifies how shifts are managed and validated for the selected office.",
    example:
      "e.g. Department-wise → Employees must be mapped to a shift based on their department. Normal Shift → No employee-to-shift mapping is required. User-wise Shift → The admin can open additional shifts but control which shifts are visible to employees. For example, if 10 shifts are open, the admin can choose to display only 5 shifts in the User App for schedule submission and hide the remaining 5.",
  },

  ors_Lock_days: {
    title: "Admin Fill Schedule TAT (incl. Excel)",
    description:
      "Number of days before the roster deadline by which admins must complete schedule entry — including bulk Excel uploads. Once this window closes, no new entries are accepted.",
    example:
      "e.g. Set to 2 → Admin must complete all roster entries at least 2 days before the scheduled date.",
  },

  ScheduleListTAT: {
    title: "Schedule List Visibility (Days) in User App",
    description:
      "How many days ahead an employee can see their upcoming schedule in the app. Outside this window, schedules are hidden from the employee view.",
    example: "e.g. Set to 7 → Employees see schedules up to 7 days in advance.",
  },

  // ── Geofence ───────────────────────────────────────────────────────────────
  geofenceAutoTripClose: {
    title: "Auto Trip Close Radius",
    description:
      "Radius in meters around the drop-off point at which a trip is automatically marked complete. The system does not wait for a manual close once the cab enters this zone.",
    example:
      "e.g. Set to 100 → Trip closes automatically when the cab is within 100 meter of the destination.",
  },

  geofenceCabReachedHome: {
    title: "Cab Reached Home Radius",
    description:
      "Distance in meters that defines 'arrived at home'. When the cab crosses this boundary, a 'Cab Reached' push notification is sent to the employee.",
    example:
      "e.g. Set to 200 → Notification fires when the cab is within 200 m of the employee's home.",
  },

  geofenceToCallingUSer: {
    title: "Calling User Radius",
    description:
      "The distance in meters within which the driver is allowed to call the employee. Once the cab comes within this range, the call option is unlocked for the driver.",
    example:
      "e.g. Set to 500 → Driver can call the employee only when within 500 m of their location.",
  },

  routingPickupTAT: {
    title: "Routing Login TAT",
    description:
      "How many minutes before a login shift routing must be generated. Once inside this window, routing can no longer be created for that shift.",
    example:
      "e.g. Set to 120 → For a 12:00 PM shift, routing must be done by 10:00 AM. Any attempt after 10:00 AM is blocked.",
  },

  routingDropTAT: {
    title: "Routing Logout TAT",
    description:
      "How many minutes before a logout shift routing must be generated. Routing requests made inside this window before the shift time are rejected.",
    example:
      "e.g. Set to 120 → For an 8:00 PM drop, routing must be done by 6:00 PM. Requests after 6:00 PM are blocked.",
  },

  configBoardDeboardSMSTATinMinutes: {
    title: "Board / Deboard SMS TAT",
    description:
      "Minutes before the scheduled boarding or deboarding time at which an SMS reminder is dispatched to the employee.",
    example:
      "e.g. Set to 5 → SMS is sent 5 minutes before the employee needs to board or alight.",
  },

  configSendSMSBeforeTripStart: {
    title: "SMS Before Trip Start",
    description:
      "Minutes before a trip starts that an advance reminder SMS is sent to the employee, giving them time to prepare.",
    example:
      "e.g. Set to 15 → Employee gets an SMS 15 minutes before the trip begins.",
  },

  // ── Notifications ──────────────────────────────────────────────────────────
  scheduleNotificationReminder: {
    title: "Schedule Reminder",
    description:
      "Minutes before a scheduled shift that an automatic push notification reminder is delivered to the employee's device.",
    example:
      "e.g. Set to 30 → Push notification fires 30 minutes before the shift starts.",
  },

  pickCancelTAT_Minutes: {
    title: "Login Cancel TAT",
    description:
      "How many minutes before the login trip an employee must cancel to avoid a no-show. If they try to cancel inside this window, the request is rejected — and if they don't board, it counts as a no-show.",
    example:
      "e.g. Set to 60 → Employee must cancel at least 1 hour before pickup. Cancel at 30 mins → blocked. Don't board → no-show.",
  },

  dropCancelTAT_Minutes: {
    title: "Logout Cancel TAT",
    description:
      "How many minutes before the logout trip an employee must cancel to avoid a no-show. Cancellations inside this window are blocked — missing the cab after that counts as a no-show.",
    example:
      "e.g. Set to 60 → Must cancel 1 hour before drop pickup. Cancel at 45 mins → blocked. Don't board → no-show.",
  },

  // ── Adhoc ──────────────────────────────────────────────────────────────────
  adhocRequestEnabledForUser: {
    title: "Adhoc Requests",
    description:
      "Enables or disables the ability for employees to raise on-demand cab requests outside their regular roster schedule.",
    example:
      "e.g. Enabled → Employees can request a cab at any time, subject to availability.",
  },

  boardDebaordEnabledForUser: {
    title: "Board / Deboard",
    description:
      "Enable this option to show the Board/Deboard buttons in the User App. Employees can board or deboard themselves using the app. When disabled, the Board/Deboard buttons are hidden from the User App, and only the driver can mark employees as boarded or deboarded.",
    example:
      "e.g. Enabled → Employees can board/deboard using the User App. Disabled → The buttons are hidden, and the driver manages boarding/deboarding.",
  },

  adhocRequestApproval: {
    title: "Require Approval for Adhoc",
    description:
      "When enabled, every adhoc cab request must be reviewed and approved by a SPOC or supervisor before the cab is dispatched.",
    example:
      "e.g. Enabled → Manager must approve within X minutes or the request expires.",
  },

  adhocRequestPickTAT: {
    title: "Adhoc Login TAT",
    description:
      "Maximum time in minutes within which a cab must arrive after an adhoc login request is raised. Requests not fulfilled within this window are escalated or cancelled.",
    example:
      "e.g. Set to 30 → Cab must arrive within 30 minutes of an adhoc pickup request.",
  },

  adhocRequestDropTAT: {
    title: "Adhoc Logout TAT",
    description:
      "Maximum time in minutes within which a cab must arrive for an adhoc logout/drop after the request is raised.",
    example:
      "e.g. Set to 30 → Drop cab must arrive within 30 minutes of the adhoc drop request.",
  },

  // ── Features ───────────────────────────────────────────────────────────────
  hybridScheduleEnabled: {
    title: "Hybrid Schedule",
    description:
      "Shows the hybrid schedule option in the User App so employees can pick specific office dates for the month — like 3rd, 6th, and 9th June. Cabs are booked only for the dates they select.",
    example:
      "e.g. Enabled → Employee picks 3 Jun, 6 Jun, 9 Jun as office days → cabs booked for those dates only.",
  },

  mergeShift: {
    title: "Merge Shift",
    description:
      "When enabled, consecutive shifts on the same route are automatically merged into a single cab trip to optimise vehicle utilisation and reduce empty trips.",
    example:
      "e.g. Enabled → Two back-to-back shifts share one cab instead of two.",
  },

  noShowCountIsActive: {
    title: "Enable No-Show Policy",
    description:
      "Enable this option to enforce the no-show policy. When enabled, the No-Show Threshold and Roster Suspension Days settings become applicable. If an employee's no-show count reaches the configured threshold, they will be automatically suspended from submitting their roster for the specified number of days.",
    example:
      "Example: Threshold = 3 and Suspension Days = 7 → After 3 no-shows, the employee cannot submit a roster for 7 days.",
  },
  noShowCount: {
    title: "No Show Limit",
    description:
      "Applicable only when no-show count is active. Maximum number of no-shows an employee is allowed before the system automatically suspends their roster access.",
    example:
      "e.g. Set to 3 → On the 3rd consecutive no-show, the employee is suspended.",
  },

  rosterSuspensionDays: {
    title: "Suspension Duration (Days)",
    description:
      "Applicable only when no-show count is active. When Number of days an employee remains suspended from the roster system after hitting the no-show limit. During suspension they cannot book or be allocated cabs.",
    example:
      "e.g. Set to 7 → Suspended employee is locked out for 7 calendar days.",
  },

  // ── LockPanel — base keys (suffix User/Spoc is stripped before lookup) ─────
  // Scheduling TAT

  schLockDays: {
    title: "Schedule Lock Days",
    description:
      "Defines how many days in advance an employee must submit their roster.",
    example:
      "e.g. 0 = Can submit today's roster. 1 = Must submit at least 1 day before the shift.",
  },

  schPickupDay: {
    title: "Schedule Login Day",
    description:
      "Select how many days before the scheduled login time employees can start submitting their Login Schedules.",
    example:
      "e.g. 0 = On the scheduled day. 1 = 1 day before. 3 = 3 days before.",
  },

  schPickupDayTime: {
    title: "Schedule Logout Time",
    description:
      "Select the time on the selected day when Login Schedule submission starts.",
    example:
      "e.g. 1 + 09:00 AM = Employees can submit login schedules from 9:00 AM, 1 day before the scheduled login time.",
  },

  schDropDay: {
    title: "Schedule Logout Day",
    description:
      "Select how many days before the scheduled logout time employees can start submitting their Logout Schedules.",
    example:
      "e.g. 1 = Employees can submit logout schedules 1 day before the scheduled logout time.",
  },

  schDropDayTime: {
    title: "Schedule Logout Time",
    description:
      "Select the time on the selected day when Logout Schedule submission starts.",
    example:
      "e.g. 1 + 06:00 PM = Employees can submit logout schedules from 6:00 PM, 1 day before the scheduled logout time.",
  },

  schPickupWeek: {
    title: "Schedule Pickup Week Day",
    description:
      "The day of the week (in weekly mode) when the scheduling window opens, allowing employees to submit or update their roster for the next week.",
  },
  schPickupWeekTime: {
    title: "Schedule Pickup Week Time",
    description:
      "The time on the weekly pickup day when the schedule submission window opens.",
  },
  schDropWeek: {
    title: "Schedule Drop Week Day",
    description:
      "The day of the week (in weekly mode) by which all schedule submissions must be completed.",
  },
  schDropWeekTime: {
    title: "Schedule Drop Week Cutoff Time",
    description:
      "The exact time on the weekly drop day after which no further schedule submissions are accepted.",
  },
  schPickupMinute: {
    title: "Schedule Open Advance (Minutes)",
    description:
      "Minutes before the shift start time that the scheduling window opens, allowing last-minute submissions.",
    example:
      "e.g. Set to 120 → Employees can submit schedule up to 2 hours before shift.",
  },
  schDropMinute: {
    title: "Schedule Close Advance (Minutes)",
    description:
      "Minutes before the shift start time that the scheduling window closes. Submissions after this point are rejected.",
    example: "e.g. Set to 60 → Scheduling closes 1 hour before shift start.",
  },

  // Schedule Cancellation TAT
  // schCancelLockDays: {
  //   title: "Cancellation Lock Days",
  //   description:
  //     "Defines how many days before the shift employees are allowed to cancel their schedule.",
  //   example:
  //     "e.g. Set to 1 → Employees can cancel their schedule only up to 1 day before the shift. Cancellations are not allowed after that.",
  // },

  // ── Schedule Cancellation TAT ───────────────────────────────────────────────

  schCancelLockDays: {
    title: "Cancellation Lock Days",
    description:
      "Defines how many days before the shift employees are allowed to cancel their schedule.",
    example:
      "e.g. 0 = Can cancel on the shift day. 1 = Must cancel at least 1 day before the shift.",
  },

  schCancelPickupDay: {
    title: "Cancellation Login Day",
    description:
      "Select how many days before the scheduled login time employees can cancel their Login Schedule.",
    example:
      "e.g. 0 = On the scheduled day. 1 = 1 day before. 3 = 3 days before.",
  },

  schCancelPickupDayTime: {
    title: "Cancellation Login Time",
    description:
      "Select the time on the selected day when Login Schedule cancellation starts.",
    example:
      "e.g. 1 + 09:00 AM = Employees can cancel login schedules from 9:00 AM, 1 day before the scheduled login time.",
  },

  schCancelDropDay: {
    title: "Cancellation Logout Day",
    description:
      "Select how many days before the scheduled logout time employees can start cancelling their Logout Schedule.",
    example:
      "e.g. 1 = Employees can cancel logout schedules 1 day before the scheduled logout time.",
  },

  schCancelDropDayTime: {
    title: "Cancellation Logout Time",
    description:
      "Select the time on the selected day when Logout Schedule cancellation starts.",
    example:
      "e.g. 1 + 06:00 PM = Employees can cancel logout schedules from 6:00 PM, 1 day before the scheduled logout time.",
  },

  schCancelPickupWeek: {
    title: "Cancellation Login Week Day",
    description:
      "The day of the week (in weekly mode) when employees can start cancelling their login schedules for the upcoming week.",
  },

  schCancelPickupWeekTime: {
    title: "Cancellation Login Week Time",
    description:
      "The time on the selected weekly day when login schedule cancellation becomes available.",
  },

  schCancelDropWeek: {
    title: "Cancellation Logout Week Day",
    description:
      "The day of the week (in weekly mode) when employees can start cancelling their logout schedules for the upcoming week.",
  },

  schCancelDropWeekTime: {
    title: "Cancellation Logout Week Time",
    description:
      "The time on the selected weekly day when logout schedule cancellation becomes available.",
  },

  schCancelPickupMinute: {
    title: "Login Cancellation Advance (Minutes)",
    description:
      "Specifies how many minutes before the scheduled login time employees can cancel their Login Schedule.",
    example:
      "e.g. Set to 120 → Login Schedule can be cancelled only until 2 hours before the scheduled login time.",
  },

  schCancelDropMinute: {
    title: "Logout Cancellation Advance (Minutes)",
    description:
      "Specifies how many minutes before the scheduled logout time employees can cancel their Logout Schedule.",
    example:
      "e.g. Set to 60 → Logout Schedule can be cancelled only until 1 hour before the scheduled logout time.",
  },

  // // Adhoc Lock TAT
  // adhocLockDays: {
  //   title: "Adhoc Lock Days",
  //   description:
  //     "Number of days before a shift within which adhoc cab requests are no longer accepted.",
  //   example: "e.g. Set to 0 → Adhoc requests can be made up until shift day.",
  // },
  // ── Adhoc TAT ───────────────────────────────────────────────────────────────

  adhocLockDays: {
    title: "Adhoc Lock Days",
    description:
      "Defines how many days before the shift employees are allowed to raise an adhoc cab request.",
    example:
      "e.g. 0 = Can raise an adhoc request on the shift day. 1 = Must raise the adhoc request at least 1 day before the shift.",
  },

  adhocPickupDay: {
    title: "Adhoc Login Day",
    description:
      "Fill how many days before the scheduled login time employees can start raising Login adhoc requests.",
    example:
      "e.g. 0 = On the scheduled day. 1 = 1 day before. 3 = 3 days before.",
  },

  adhocPickupDayTime: {
    title: "Adhoc Login Time",
    description:
      "Select the time on the selected day when Login adhoc requests can be raised.",
    example:
      "e.g. 1 + 09:00 AM = Employees can raise login adhoc requests from 9:00 AM, 1 day before the scheduled login time.",
  },

  adhocDropDay: {
    title: "Adhoc Logout Day",
    description:
      "Select how many days before the scheduled logout time employees can start raising Logout adhoc requests.",
    example:
      "e.g. 1 = Employees can raise logout adhoc requests 1 day before the scheduled logout time.",
  },

  adhocDropDayTime: {
    title: "Adhoc Logout Time",
    description:
      "Select the time on the selected day when Logout adhoc requests can be raised.",
    example:
      "e.g. 1 + 06:00 PM = Employees can raise logout adhoc requests from 6:00 PM, 1 day before the scheduled logout time.",
  },

  adhocPickupWeek: {
    title: "Adhoc Login Week Day",
    description:
      "The day of the week (in weekly mode) when employees can start raising login adhoc requests for the upcoming week.",
  },

  adhocPickupWeekTime: {
    title: "Adhoc Login Week Time",
    description:
      "The time on the selected weekly day when login adhoc requests become available.",
  },

  adhocDropWeek: {
    title: "Adhoc Logout Week Day",
    description:
      "The day of the week (in weekly mode) when employees can start raising logout adhoc requests for the upcoming week.",
  },

  adhocDropWeekTime: {
    title: "Adhoc Logout Week Time",
    description:
      "The time on the selected weekly day when logout adhoc requests become available.",
  },

  adhocPickupMinute: {
    title: "Adhoc Login Advance (Minutes)",
    description:
      "Specifies how many minutes before the scheduled login time employees can raise a Login adhoc request.",
    example:
      "e.g. Set to 120 → Login adhoc requests can be raised only until 2 hours before the scheduled login time.",
  },

  adhocDropMinute: {
    title: "Adhoc Logout Advance (Minutes)",
    description:
      "Specifies how many minutes before the scheduled logout time employees can raise a Logout adhoc request.",
    example:
      "e.g. Set to 60 → Logout adhoc requests can be raised only until 1 hour before the scheduled logout time.",
  },

  // Adhoc Cancellation
  // adhocCancelLockDays: {
  //   title: "Adhoc Cancel Lock Days",
  //   description:
  //     "Minimum number of days before the scheduled adhoc trip within which a cancellation request must be submitted.",
  //   example:
  //     "e.g. Set to 0 → Cancellations must be raised on or before the trip day.",
  // },

  // ── Adhoc Cancellation TAT ──────────────────────────────────────────────────

  adhocCancelLockDays: {
    title: "Adhoc Cancel Lock Days",
    description:
      "Defines how many days before the shift employees are allowed to cancel an adhoc cab request.",
    example:
      "e.g. 0 = Can cancel an adhoc request on the shift day. 1 = Must cancel the adhoc request at least 1 day before the shift.",
  },

  adhocCancelPickupDay: {
    title: "Adhoc Login Cancellation Day",
    description:
      "Fill how many days before the scheduled login time employees can start cancelling Login adhoc requests.",
    example:
      "e.g. 0 = On the scheduled day. 1 = 1 day before. 3 = 3 days before.",
  },

  adhocCancelPickupDayTime: {
    title: "Adhoc Login Cancellation Time",
    description:
      "Select the time on the selected day when Login adhoc request cancellation starts.",
    example:
      "e.g. 1 + 09:00 AM = Employees can cancel login adhoc requests from 9:00 AM, 1 day before the scheduled login time.",
  },

  adhocCancelDropDay: {
    title: "Adhoc Logout Cancellation Day",
    description:
      "Fill how many days before the scheduled logout time employees can start cancelling Logout adhoc requests.",
    example:
      "e.g. 1 = Employees can cancel logout adhoc requests 1 day before the scheduled logout time.",
  },

  adhocCancelDropDayTime: {
    title: "Adhoc Logout Cancellation Time",
    description:
      "Select the time on the selected day when Logout adhoc request cancellation starts.",
    example:
      "e.g. 1 + 06:00 PM = Employees can cancel logout adhoc requests from 6:00 PM, 1 day before the scheduled logout time.",
  },

  adhocCancelPickupWeek: {
    title: "Adhoc Login Cancellation Week Day",
    description:
      "The day of the week (in weekly mode) when employees can start cancelling login adhoc requests for the upcoming week.",
  },

  adhocCancelPickupWeekTime: {
    title: "Adhoc Login Cancellation Week Time",
    description:
      "The time on the selected weekly day when login adhoc request cancellation becomes available.",
  },

  adhocCancelDropWeek: {
    title: "Adhoc Logout Cancellation Week Day",
    description:
      "The day of the week (in weekly mode) when employees can start cancelling logout adhoc requests for the upcoming week.",
  },

  adhocCancelDropWeekTime: {
    title: "Adhoc Logout Cancellation Week Time",
    description:
      "The time on the selected weekly day when logout adhoc request cancellation becomes available.",
  },

  adhocCancelPickupMinute: {
    title: "Adhoc Login Cancellation Advance (Minutes)",
    description:
      "Specifies how many minutes before the scheduled login time employees can cancel a Login adhoc request.",
    example:
      "e.g. Set to 120 → Login adhoc requests can be cancelled only until 2 hours before the scheduled login time.",
  },

  adhocCancelDropMinute: {
    title: "Adhoc Logout Cancellation Advance (Minutes)",
    description:
      "Specifies how many minutes before the scheduled logout time employees can cancel a Logout adhoc request.",
    example:
      "e.g. Set to 60 → Logout adhoc requests can be cancelled only until 1 hour before the scheduled logout time.",
  },

  isScheduleFillForLoginAndLogoutBoth: {
    title: "Schedule Fill for Login & Logout Both",
    description: "Allow ability to fill login & logout schedule both",
    example:
      "e.g. Enabled → Employee fills both 9 AM login and 6 PM logout together.",
  },
  isBoardDeBoardOTPSameOrDifferent: {
    title: "Board/Deboard OTP",
    description: "If enabled, boarding & deboarding OTP must be different.",
    example: "e.g. Enabled → Board OTP: 4821, Deboard OTP: 9374 (different).",
  },
  isCancelTripByUserAfterTAT: {
    title: "Cancel Trip After TAT",
    description: "If enabled, allow trip cancellation after TAT",
    example:
      "e.g. Enabled → Employee can still cancel at T-10 min even if TAT is 30 min.",
  },
  isCancelScheduleByUserAfterTAT: {
    title: "Cancel Schedule After TAT",
    description: "If enabled, allow schedule cancellation after TAT",
    example:
      "e.g. Enabled → Schedule cancellation allowed past the cutoff window.",
  },

  isDropTripCancelledWhenUserCancelsPickupTrip: {
    title: "Auto-Cancel Drop on Pickup Cancel",
    description:
      "If enabled, automatic cancellation of logout if employee cancels login for a day",
    example:
      "e.g. Enabled → Employee cancels morning pickup → evening drop is also cancelled automatically.",
  },
  // --------------- Driver Config Message ---------------
  MinPickupTripStartBeforeMinutes: {
    title: "Pickup Trip Start Before",
    description:
      "Specify the number of additional minutes before the scheduled pickup time that the driver is allowed to start the trip. A default lead time of 2 hours 30 minutes is always applied. If a value is configured, it is added to the default lead time.",
    example:
      "30 (The driver can start the trip 3 hours before the scheduled pickup time: 2 hours 30 minutes + 30 minutes)",
  },
  MinDropTripStartBeforeMinutes: {
    title: "Drop Trip Start Before",
    description:
      "Specify the number of minutes before the scheduled drop time that the driver is allowed to start the trip.",
    example:
      "30 (The driver can start the trip 30 minutes before the scheduled drop time)",
  },
  // -------- user Profile update config message ----------- 03 Aug
  IsUserUpdateProfile: {
    title: "Allow User Profile Update",
    description:
      "If enabled, allow user to update their profile in the User App.",
    example:
      "e.g. Enabled → Employee can update their profile information in the User App.",
  },

  // -------- User App Configuration — new fields --------
  BoardingType: {
    title: "Boarding Type",
    description:
      "The process employees must complete to mark themselves boarded on a trip (e.g. OTP, Signature, QR, RFID).",
    example: "e.g. QR → Employee scans a QR code on the vehicle to board.",
  },
  DeboardingType: {
    title: "Deboarding Type",
    description:
      "The process employees must complete to mark themselves deboarded from a trip (e.g. OTP, Signature, QR, RFID).",
    example: "e.g. OTP → Employee enters an OTP to confirm deboarding.",
  },
  IsTripAlreadyNoShow: {
    title: "Trip Already No-Show",
    description:
      "If enabled, a trip already marked as no-show can still be acted on further in the User App instead of being locked.",
  },
  IsTripCancellationAllowedAfterTAT: {
    title: "Allow Trip Cancellation After TAT",
    description:
      "If enabled, employees can cancel an in-progress trip even after the trip cancellation TAT window has closed.",
    example:
      "e.g. Enabled → Employee can still cancel at T-5 min even if TAT closed at T-10 min.",
  },
  IsAreaDDLEnabled: {
    title: "Enable Area Dropdown",
    description:
      "Shows an Area dropdown in the User App so employees can select/filter by area where applicable.",
  },
  IsZoneDDlEnabled: {
    title: "Enable Zone Dropdown",
    description:
      "Shows a Zone dropdown in the User App so employees can select/filter by zone where applicable.",
  },
  AppIcon: {
    title: "App Icon",
    description:
      "The icon key used for the User App's branding for this office — e.g. to switch to a festival-themed icon for a limited period.",
    example: 'e.g. "independence_day" → App icon switches to the Independence Day theme.',
  },
  IsAdhocRequestCountAllowed: {
    title: "Allow Adhoc Request Count",
    description:
      "If enabled, employees can see the number of adhoc requests they have raised and how many are remaining for the defined time period.",
    example:
      "e.g. Enabled → Employee sees 'You have 2 adhoc requests remaining this month.'",

  },
  AdhocRequestQuota: {
    title: "Adhoc Request Quota",
    description:
      "The maximum number of adhoc requests an employee can raise within a defined time period.",
    example:
      "e.g. Set to 5 → Employee can raise up to 5 adhoc requests in a month.",
  },
  AdhocRequestResetFrequency: {
    title: "Adhoc Request Reset Frequency",
    description:
      "The frequency at which adhoc requests are reset.",
  },
  IsDPDPA: {
    title: "DPDPA Consent",
    description:
      "Controls whether the DPDPA consent flow is enabled for this office.",
  },
  IsShowVehicleQR: {
    title: "Show Vehicle QR",
    description:
      "Controls whether the vehicle QR option is shown in the application.",
  },
  ScheduleAndAdhocCapping: {
    title: "Schedule and Adhoc Capping",
    description:
      "Users can save Schedules and Adhoc Requests up to the defined capping limit.",
    example:
      "e.g. Enabled → Employees can submit schedules and adhoc requests only up to the defined limit during the specified period.",
  },
  IsSpeedServiceEnabled: {
    title: "Speed Service",
    description:
      "When enabled, the system uses real-time speed data from TomTom to calculate a more accurate ETA.",
  },
  CityID: {
    title: "City",
    description:
      "Specifies the city used by the Speed Service to fetch relevant real-time speed data from TomTom for accurate ETA calculation.",
  },
  IsSosIvrEnabled: {
    title: "SOS Calling Enabled",
    description:
      "If a user triggers SOS, an IVR call will be initiated to the configured admin and escalation contacts.",
  },
  SosIvrRetryIntervalMinutes: {
    title: "SOS Calling Retry Interval",
    description:
      "Specifies the time interval in minutes before retrying the SOS IVR call to the admin and escalation contacts if the previous call is unsuccessful.",
  },
  IsScheduleBulkCancellationEnabled: {
    title: "Bulk Schedule Cancellation",
    description: "Allows users to cancel multiple schedules at once.",
  },
  ScheduleBlockDays: {
    title: "Schedule Block Days",
    description:
      "Users can fill Schedule only for the specified number of days from today. Scheduling beyond this period will be blocked.",
  },
  IsRoutingCancelWindowCheckEnabled: {
    title: "Create Route After Schedule Cancellation TAT Expiry",
    description:
      "If IsRoutingCancelWindowCheckEnabled is enabled, the route will be created after the schedule cancellation cutoff time",
  },
  IsPickupNoShowCancelsDropTripEnabled: {
    title: "Auto-Cancel Drop Trip on Pickup No-Show",
    description: "When enabled, the drop trip will be automatically cancelled if the driver marks the pickup trip as No-Show."
  },
  IsRosterNotificationEnabled: {
    title: "Enable Roster Notifications",
    description: "If disabled, stop sending push notifications to the user app for schedule-filling reminders."
  }
};

// ── Fallback ──────────────────────────────────────────────────────────────────
export const FALLBACK_IMPACT: FieldImpact = {
  title: "Configuration Setting",
  description:
    "This setting controls an operational parameter for this office. Please verify the value carefully before saving — changes take effect immediately on future roster cycles.",
};

// ── Lookup helper ─────────────────────────────────────────────────────────────
/**
 * Returns the impact message for a given form field key.
 * LockPanel dynamic keys like "schLockDaysUser" or "adhocPickupDaySpoc"
 * are matched by stripping the trailing "User" | "Spoc" suffix first,
 * then further stripping known prefixes to find the base entry.
 */
export function getFieldImpact(fieldKey: string): FieldImpact {
  // 1. Direct match
  if (CONFIG_IMPACT[fieldKey]) return CONFIG_IMPACT[fieldKey];

  // 2. Strip trailing "User" | "Spoc" (LockPanel appends persona)
  const withoutPersona = fieldKey.replace(/(User|Spoc)$/, "");

  console.log("fieldKey from getFieldImpact", fieldKey);

  if (CONFIG_IMPACT[withoutPersona]) return CONFIG_IMPACT[withoutPersona];

  // 3. Try camelCase base after stripping known fp prefixes
  //    e.g. "schCancelLockDaysUser" → strip "schCancel" → "LockDays" → "schLockDays"
  const prefixes = ["schCancel", "adhocCancel", "adhoc", "sch"];
  for (const pfx of prefixes) {
    if (withoutPersona.startsWith(pfx)) {
      const suffix = withoutPersona.slice(pfx.length);
      // Try the normalised key with canonical prefix
      const canonical = pfx.replace("Cancel", "") + suffix;
      if (CONFIG_IMPACT[canonical]) return CONFIG_IMPACT[canonical];
      break;
    }
  }

  return FALLBACK_IMPACT;
}
