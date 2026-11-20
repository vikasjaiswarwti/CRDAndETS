// ============================================================
// DriverConfig.constants.ts
// Field metadata for the Driver App Configuration card.
// Keyed exactly to the DB column names so `toColumnName` is a no-op
// identity mapping (unlike Rostertat.utils.toColumnName, which does
// prefix/suffix transforms for the office config keys).
// ============================================================

import React from "react";
import { Clock } from "lucide-react";

export const DRIVER_EVENT_SECTIONS = [
  { code: 1, title: "Trip Started" },
  { code: 2, title: "User Approaching Pickup" },
  { code: 3, title: "User Onboarded" },
  { code: 4, title: "User Deboarded" },
  { code: 5, title: "Auto Deboard On Reach Office" },
  { code: 6, title: "User No Show" },
  { code: 7, title: "Trip Ended" },
  { code: 8, title: "Cab Approaching Office" },
  { code: 9, title: "User Auto Deboard" },
  { code: 10, title: "Night Drop Safety Check" },
] as const;

export const DRIVER_EVENT_BOOLEAN_FIELDS = [
  "IsWaitRequired",
  "IsNavigationRequired",
  "IsPassengerMessageRequired",
  "IsAutoReachEnabled",
  "IsSignInOtpRequired",
  "IsNearOfficeGeofenceRequired",
  "IsAutoCloseEnabled",
  "HasAutoReachCommunication",
  // "Active"
] as const;

export const DRIVER_EVENT_NUMBER_FIELDS = [
  "StartDutyWaitTimeInMinutes",
  "GeofenceRadiusMeters",
] as const;

export const DRIVER_EVENT_TEXT_FIELDS = [
  "CommunicationTemplateId",
] as const;

export const DRIVER_EVENT_FIELD_LABELS: Record<string, string> = {
  IsWaitRequired: "Wait required",
  IsNavigationRequired: "Navigation required",
  IsPassengerMessageRequired: "Passenger message required",
  CommunicationTemplateId: "Communication template",
  IsAutoReachEnabled: "Auto reach enabled",
  HasAutoReachCommunication: "Auto reach communication",
  IsSignInOtpRequired: "Sign-in OTP required",
  StartDutyWaitTimeInMinutes: "Start duty wait time (minutes)",
  IsNearOfficeGeofenceRequired: "Near-office geofence required",
  IsAutoCloseEnabled: "Auto close enabled",
  GeofenceRadiusMeters: "Geofence radius (meters)",
  // Active: "Active",
};

// ── Accordion sections ───────────────────────────────────────────────────────
// Same shape as Rostertat.constants.ts's SECTIONS array, so
// DriverConfigurationCard's renderSection() can be a straight copy of
// OfficeConfigurationCard's. Only one section today (all 3 columns live
// in one table) — add more entries here if the driver config table grows
// and needs to be split, exactly like the office card's SECTIONS does.
export type DriverSectionKey = "driverTat";

export interface DriverSectionDef {
  key: DriverSectionKey;
  title: string;
  icon: React.ReactNode;
  accent: string;
}

export const DRIVER_SECTIONS: DriverSectionDef[] = [
  {
    key: "driverTat",
    title: "Driver TAT Configuration",
    icon: React.createElement(Clock, { size: 16 }),
    accent: "#2563EB",
  },
];

export const DRIVER_CONFIG_FIELDS = {
  MinPickupTripStartBeforeMinutes: "MinPickupTripStartBeforeMinutes",
  MinDropTripStartBeforeMinutes: "MinDropTripStartBeforeMinutes",
  Active: "Active",
} as const;

export type DriverConfigField = keyof typeof DRIVER_CONFIG_FIELDS;

export const DRIVER_FIELD_LABELS: Record<DriverConfigField, string> = {
  MinPickupTripStartBeforeMinutes: "Pickup start time before login time (mins)",
  MinDropTripStartBeforeMinutes: "Drop start time before logout time (mins)",
  Active: "Active",
};

// Straight passthrough — DB column name === form key for this table.
// Kept as a function (rather than using the key directly) so call sites
// read identically to the office-config card and stay consistent if this
// table ever needs a mapping layer later.
export function toDriverColumnName(fieldKey: string): string {
  return fieldKey;
}

export interface DriverConfigRow {
  LocCode: number;
  MinPickupTripStartBeforeMinutes: string | number;
  MinDropTripStartBeforeMinutes: string | number;
  Active: string | number | boolean;
}