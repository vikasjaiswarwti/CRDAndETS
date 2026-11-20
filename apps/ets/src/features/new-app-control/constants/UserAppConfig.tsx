import React from "react";
import { MapPin, CalendarClock, Car, Settings2 } from "lucide-react";

export type UserAppSectionKey = "basic" | "schedule" | "trip" | "general";

export interface UserAppSectionDef {
  key: UserAppSectionKey;
  title: string;
  accent: string;
  icon: React.ReactNode;
}

export const USER_APP_SECTIONS: UserAppSectionDef[] = [
  {
    key: "basic",
    title: "Basic Settings",
    accent: "#2563EB",
    icon: <MapPin size={16} />,
  },
  {
    key: "schedule",
    title: "Schedule",
    accent: "#059669",
    icon: <CalendarClock size={16} />,
  },
  { key: "trip", title: "Trip", accent: "#DB2777", icon: <Car size={16} /> },
  {
    key: "general",
    title: "General",
    accent: "#7C3AED",
    icon: <Settings2 size={16} />,
  },
];

export const USER_APP_FIELD_LABELS: Record<string, string> = {
  BoardingType: "Boarding Type",
  DeboardingType: "Deboarding Type",
  IsBoardDeboardOtpSame: "Board/Deboard OTP Same",
  IsTripPublishWithETA: "Publish Trip with ETA",

  IsAlreadyScheduledNoShow: "Already Scheduled No-Show",
  IsCancellationScheduledAllowed: "Allow Schedule Cancellation",
  IsCancelledScheduledAllowedAfterTAT: "Allow Cancellation After TAT",
  IsEditScheduleAllowed: "Allow Schedule Edit",
  IsTrackingScheduledAllowed: "Allow Schedule Tracking",
  IsCreateScheduleAllowed: "Allow Schedule Creation",
  IsScheduleBulkCancellationEnabled: "Schedule Bulk Cancellation Enabled",

  IsTripCancellationAllowed: "Allow Trip Cancellation",
  IsTripChatAllowed: "Allow Trip Chat",
  IsTripIvrCallAllowed: "Allow Trip IVR Call",
  IsTripShareCabAllowed: "Allow Share Cab",
  IsTripTrackingAllowed: "Allow Trip Tracking",
  IsTripAlreadyNoShow: "Trip Already No-Show",
  IsTripCancellationAllowedAfterTAT: "Allow Trip Cancellation After TAT",
  IsPickupNoShowCancelsDropTripEnabled: "Auto-Cancel Drop Trip on Pickup No-Show",

  isDeboardOtpFieldAllowed: "Show Deboard OTP Field",
  isTripNoShowAllowed: "Allow Trip No-Show",
  isTripSafeHomeReach: "Safe Home Reach Alert",
  isTripSummaryAllowed: "Show Trip Summary",
  IsAreaDDLEnabled: "Enable Area Dropdown",
  IsZoneDDlEnabled: "Enable Zone Dropdown",
  AppIcon: "App Icon",
  IsSosIvrEnabled: "SOS IVR Calling Enabled",
  SosIvrRetryIntervalMinutes: "SOS IVR Calling Retry Interval(in min)",
};

export function getUserAppFieldLabel(key: string): string {
  return USER_APP_FIELD_LABELS[key] ?? key;
}

// Used only when the backend's "boardingProcess" list is empty/unavailable.
export const BOARDING_TYPE_OPTIONS = [
  { label: "OTP", value: 1 },
  { label: "Manual", value: 2 },
];

export const DEBOARDING_TYPE_OPTIONS = [
  { label: "OTP", value: 1 },
  { label: "Manual", value: 2 },
];
