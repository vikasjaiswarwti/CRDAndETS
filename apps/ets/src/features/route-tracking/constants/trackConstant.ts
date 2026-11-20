// ============================================================
// constants.ts — App-wide enums and constants
// ============================================================

export const ROUTE_STATUS = {
  COMPLETED: "Completed",
  ONGOING: "Ongoing",
  DELAYED: "Delayed",
} as const;

export const BOARDING_STATUS = {
  BOARDED: "Boarded",
  NO_SHOW: "No Show",
  PENDING: "Pending",
} as const;

export const TRACKING_MODE = {
  DRIVER_APP: "Driver App",
  FIXED_DEVICE: "Fixed Device",
} as const;

export const TRAFFIC_KEYS = ["1st Pick Up", "2nd Pick Up", "Office"] as const;

export const DRIVER_ACTIONS = [
  {
    label: "Vehicle Arrived",
    icon: "ti-car",
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  {
    label: "Call Emp",
    icon: "ti-phone",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    label: "No Show",
    icon: "ti-user-x",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
  },
] as const;
export const TRIP_STATUS={
 CREATED :1,
 PRINTED:2,
 STARTED:3,
 END:4,
 AUDITED:5,
 BILLED:6,
 CANCELLED:9,
} as const

export const MAP_DEFAULT_CENTER: [number, number] = [19.028, 72.848];
export const MAP_DEFAULT_ZOOM = 13;
export const VEHICLE_ANIMATION_INTERVAL_MS = 1200;

export type TrafficStatus = "stopped" | "heavy-traffic" | "traffic" | "normal" | "overspeed";

export const TRAFFIC_COLORS: Record<TrafficStatus, string> = {
  stopped: "#6b7280",       // gray
  "heavy-traffic": "#dc2626", // red
  traffic: "#f59e0b",       // amber
  normal: "#22c55e",        // green
  overspeed: "#660000",     // purple — distinct from heavy-traffic red
};

export const vehicleSpeedKMH = {
  STOPPED_KMH: 2,
  HEAVY_TRAFFIC_KMH: 5,
  TRAFFIC_KMH: 10,
  OVERSPEED_KMH: 80,
}
export const TRAFFIC_LABELS: Record<TrafficStatus, string> = {
  stopped: "Stopped",
  "heavy-traffic": "Heavy Traffic",
  traffic: "Traffic",
  normal: "Normal",
  overspeed: "Overspeed",
};
export const TRAFFIC_STROKE_WEIGHT: Record<TrafficStatus, number> = {
  stopped: 3,
  "heavy-traffic": 5,
  traffic: 4,
  normal: 2,
  overspeed: 3,
};
export interface TrafficConfig {
  label: string;
  color: string;
  strokeWeight: number;
  display?:""
}

export const TRAFFIC_CONFIG: Record<TrafficStatus, TrafficConfig> = {
  stopped: {
    label: "Stopped",
    color: "#6B7280", // Gray
    strokeWeight: 3,
  },
  "heavy-traffic": {
    label: "Heavy Traffic",
    color: "#EA4335", // Red
    strokeWeight: 5,
  },
  traffic: {
    label: "Traffic",
    color: "#F29900", // Orange
    strokeWeight: 4,
  },
  normal: {
    label: "Normal",
    color: "#34A853", // Green
    strokeWeight: 2,
  },
  overspeed: {
    label: "Overspeed",
    color: "#660000", // Blue
    strokeWeight: 3,
  },
};
export function getTrafficStatus(speed: number): TrafficStatus {
  if (speed <= vehicleSpeedKMH.STOPPED_KMH) return "stopped";
  if (speed <= vehicleSpeedKMH.HEAVY_TRAFFIC_KMH) return "heavy-traffic";
  if (speed <= vehicleSpeedKMH.TRAFFIC_KMH) return "traffic";
  if (speed >= vehicleSpeedKMH.OVERSPEED_KMH) return "overspeed";
  return "normal";
}