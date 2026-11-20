import type { SecurityIncident, SeverityFilter } from "../types/Security.types";
import { T } from "../constants/Designtokens";

export function filterIncidents(
  incidents: SecurityIncident[],
  filter: SeverityFilter,
  search: string
): SecurityIncident[] {
  let result = incidents;

  if (filter === "SOS") {
    result = result.filter((i) => i.signalType === "SOS");
  } else if (filter !== "all") {
    result = result.filter((i) => i.severity === filter);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    result = result.filter(
      (i) =>
        i.vehicleNo.toLowerCase().includes(q) ||
        i.driverName.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
    );
  }

  return result;
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case "critical": return T.danger;
    case "high": return T.warning;
    case "medium": return T.blue;
    default: return T.muted;
  }
}

export function getSeverityBg(severity: string): string {
  switch (severity) {
    case "critical": return T.dangerBg;
    case "high": return T.warningBg;
    case "medium": return T.blueBg;
    default: return "#F8FAFC";
  }
}

export function getSignalColor(signal: string): string {
  switch (signal) {
    case "SOS": return T.danger;
    case "OVERSPEED": return T.warning;
    case "ROUTE_DEVIATION": return T.orange;
    case "DEVICE_ISSUE": return T.blue;
    case "FEMALE_ALONE": return T.purple;
    case "GPS_OFFLINE": return T.muted;
    default: return T.muted;
  }
}

export function getSignalLabel(signal: string): string {
  switch (signal) {
    case "SOS": return "SOS Alert";
    case "OVERSPEED": return "Overspeeding";
    case "ROUTE_DEVIATION": return "Route Deviation";
    case "DEVICE_ISSUE": return "Device Issue";
    case "FEMALE_ALONE": return "Female Alone";
    case "GPS_OFFLINE": return "GPS Offline";
    default: return signal;
  }
}

export function getSignalBg(signal: string): string {
  switch (signal) {
    case "SOS": return T.dangerBg;
    case "OVERSPEED": return T.warningBg;
    case "ROUTE_DEVIATION": return T.orangeBg;
    case "DEVICE_ISSUE": return T.blueBg;
    case "FEMALE_ALONE": return T.purpleBg;
    case "GPS_OFFLINE": return "#F1F5F9";
    default: return "#F1F5F9";
  }
}

export function getTimelineColor(type: string): string {
  switch (type) {
    case "sos": return T.danger;
    case "overspeed": return T.warning;
    case "route": return T.orange;
    case "gps": return T.muted;
    case "female": return T.purple;
    default: return T.muted;
  }
}

export function getRiskBadgeStyle(risk: string) {
  const map: Record<string, { color: string; bg: string }> = {
    "SOS Triggered": { color: T.danger, bg: T.dangerBg },
    "Overspeeding": { color: T.warning, bg: T.warningBg },
    "Unsafe Zone": { color: T.orange, bg: T.orangeBg },
    "Device Issue": { color: T.blue, bg: T.blueBg },
    "Route Deviation": { color: T.purple, bg: T.purpleBg },
    "GPS Offline": { color: T.muted, bg: "#F1F5F9" },
    "Female Alone": { color: T.purple, bg: T.purpleBg },
    "Night Trip": { color: T.muted, bg: "#F1F5F9" },
  };
  return map[risk] || { color: T.muted, bg: "#F1F5F9" };
}

export function countBySeverity(incidents: SecurityIncident[], severity: string): number {
  if (severity === "SOS") return incidents.filter((i) => i.signalType === "SOS").length;
  return incidents.filter((i) => i.severity === severity).length;
}