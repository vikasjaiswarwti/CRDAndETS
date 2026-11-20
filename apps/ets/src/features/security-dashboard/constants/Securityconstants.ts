import { T } from "./Designtokens";

export const SEVERITY_CONFIG = {
  critical: { label: "CRITICAL", color: T.danger, bg: T.dangerBg, border: "#FECACA" },
  high: { label: "HIGH", color: T.warning, bg: T.warningBg, border: "#FDE68A" },
  medium: { label: "MEDIUM", color: T.blue, bg: T.blueBg, border: "#BFDBFE" },
};

export const SIGNAL_CONFIG = {
  SOS: { label: "SOS Alert", color: T.danger, bg: T.dangerBg },
  OVERSPEED: { label: "Overspeeding", color: T.warning, bg: T.warningBg },
  ROUTE_DEVIATION: { label: "Route Deviation", color: T.orange, bg: T.orangeBg },
  DEVICE_ISSUE: { label: "Device Issue", color: T.blue, bg: T.blueBg },
  FEMALE_ALONE: { label: "Female Alone", color: T.purple, bg: T.purpleBg },
  GPS_OFFLINE: { label: "GPS Offline", color: T.muted, bg: "#F1F5F9" },
};

export const RISK_COLORS = {
  SOS_Triggered: { color: T.danger, bg: T.dangerBg },
  Overspeeding: { color: T.warning, bg: T.warningBg },
  Unsafe_Zone: { color: T.orange, bg: T.orangeBg },
  Device_Issue: { color: T.blue, bg: T.blueBg },
  Route_Deviation: { color: T.purple, bg: T.purpleBg },
  GPS_Offline: { color: T.muted, bg: "#F1F5F9" },
  Female_Alone: { color: T.purple, bg: T.purpleBg },
};

export const MAP_CHIP_CONFIG = [
  { label: "Critical", color: T.danger, bg: "#FEE2E2" },
  { label: "High risk", color: T.warning, bg: "#FEF3C7" },
  { label: "Medium risk", color: T.blue, bg: "#DBEAFE" },
  { label: "SOS Active", color: T.danger, bg: "#FEE2E2" },
  { label: "Female alone", color: T.purple, bg: "#FCE7F3" },
  { label: "GPS Offline", color: T.muted, bg: "#E2E8F0" },
  { label: "Total Trips", color: T.accent, bg: "#DCFCE7" },
];