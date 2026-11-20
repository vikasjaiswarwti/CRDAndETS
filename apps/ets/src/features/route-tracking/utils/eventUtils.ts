/**
 * Event detection and conversion utilities for the playback bar
 * Converts GPS data points to event markers with percentage positions
 */

import type { GpsLocation, Miscellaneous ,TripPassenger} from "../types/tracking.types";

export interface EventMarker {
  key: string;
  pct: number;
  label?: string;
  timestamp: string;
  value?: number; // speed, etc.
}

export interface IntervalMark {
  pct: number;
  label: string;
  timeLabel: string;
}

interface EventDetectionConfig {
  overspeadThreshold: number; // km/h
  gpsLossThreshold: number; // km/h (vehicle moving = gps active)
  stoppingThreshold: number; // km/h
}

const DEFAULT_CONFIG: EventDetectionConfig = {
  overspeadThreshold: 80,
  gpsLossThreshold: 5,
  stoppingThreshold: 2,
};

/**
 * Convert ISO timestamp string to Date object
 */
function parseTimestamp(timestamp: string): Date {
  return new Date(timestamp);
}

/**
 * Calculate percentage position on progress bar
 * pct = (pointTime - startTime) / (endTime - startTime) * 100
 */
function calculatePercentage(
  pointTime: Date,
  startTime: Date,
  endTime: Date,
): number {
  const totalDuration = endTime.getTime() - startTime.getTime();
  if (totalDuration <= 0) return 0;

  const elapsed = pointTime.getTime() - startTime.getTime();
  const pct = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

  return Math.round(pct * 100) / 100; // Round to 2 decimals
}

/**
 * Detect speed-based events (overspeed, stoppage)
 */
function detectSpeedEvents(
  gpsPoint: GpsLocation,
  config: EventDetectionConfig,
): string[] {
  const events: string[] = [];
  const defaultMiscellaneous: Miscellaneous = {
    speed: 0,
    gpsLoss: false,
    networkLoss: false,
    bearing: 0,
  };

  const miscellaneous: Miscellaneous =
    typeof gpsPoint.miscellaneous === "string"
      ? {
        ...defaultMiscellaneous,
        ...(JSON.parse(gpsPoint.miscellaneous) as Partial<Miscellaneous>),
      }
      : {
        ...defaultMiscellaneous,
        ...(gpsPoint.miscellaneous ?? {}),
      };
  // const miscellaneous = gpsPoint.miscellaneous
  //   ? JSON.parse(gpsPoint?.miscellaneous as Miscellaneous)
  //   : {
  //     speed: 0,
  //     gpsLoss: false,
  //     networkLoss: false,
  //     bearing: 0,
  //   };


  const speed = miscellaneous?.speed;



  if (speed >= config.overspeadThreshold) {
    events.push("overspeed");
  }

  if (speed <= config.stoppingThreshold && speed >= 5) {
    events.push("vehicleStop");
  }

  return events;
}

/**
 * Detect connectivity events (GPS loss, network loss)
 */
function detectConnectivityEvents(gpsPoint: GpsLocation): string[] {
  const events: string[] = [];
  const defaultMiscellaneous: Miscellaneous = {
    speed: 0,
    gpsLoss: false,
    networkLoss: false,
    bearing: 0,
  };

  const miscellaneous: Miscellaneous =
    typeof gpsPoint.miscellaneous === "string"
      ? {
        ...defaultMiscellaneous,
        ...(JSON.parse(gpsPoint.miscellaneous) as Partial<Miscellaneous>),
      }
      : {
        ...defaultMiscellaneous,
        ...(gpsPoint.miscellaneous ?? {}),
      };

  if (miscellaneous?.gpsLoss === true) {
    events.push("gpsLosss");
  }

  if (miscellaneous?.networkLoss === true) {
    events.push("networkLoss");
  }

  return events;
}

/**
 * Main function: Convert GPS points to event markers
 * Detects all event types from GPS data and returns as EventMarker array
 */
export function convertGpsPointsToEventMarkers(
  gpsPoints: GpsLocation[],
  startTimeStr: string,
  endTimeStr: string,
  config: Partial<EventDetectionConfig> = {},
): EventMarker[] {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const startTime = parseTimestamp(startTimeStr);
  const endTime = parseTimestamp(endTimeStr);
  const markers: EventMarker[] = [];
  const eventsByPosition = new Map<string, EventMarker>();

  for (const point of gpsPoints) {
    if (!point.gpsTime) continue;
    const pointTime = parseTimestamp(point.gpsTime);
    const pct = calculatePercentage(pointTime, startTime, endTime);

    // Skip events outside the time range
    if (pct < 0 || pct > 100) continue;

    const speedEvents = detectSpeedEvents(point, finalConfig);
    const connectivityEvents = detectConnectivityEvents(point);
     const panicEvents = detectPanicEvents(point);
    const allEvents = [...speedEvents, ...connectivityEvents, ...panicEvents];

    for (const eventKey of allEvents) {
      const positionKey = `${pct}-${eventKey}`;
      const existing = eventsByPosition.get(positionKey);

      // Avoid duplicate events at the same position
      if (!existing) {
        const marker: EventMarker = {
          key: eventKey,
          pct,
          timestamp: point.gpsTime,
          value: point.miscellaneous?.speed ?? 0,
        };
        eventsByPosition.set(positionKey, marker);
        markers.push(marker);
      }
    }
  }

  return markers.sort((a, b) => a.pct - b.pct);
}

/**
 * Generate interval marks (tick labels) for the playback bar
 * intervalMinutes: How many minutes between each mark (default 20)
 */
export function generateIntervalMarks(
  startTimeStr: string,
  endTimeStr: string,
): IntervalMark[] {
  const startTime = parseTimestamp(startTimeStr);
  const endTime = parseTimestamp(endTimeStr);

  const totalDurationMs = endTime.getTime() - startTime.getTime();

  if (totalDurationMs <= 0) return [];

  // Total duration in minutes
  const totalMinutes = totalDurationMs / (60 * 1000);

  // Divide into 6 equal slabs
  const intervalMinutes = totalMinutes / 6;
  const intervalMs = intervalMinutes * 60 * 1000;

  const marks: IntervalMark[] = [];

  for (let i = 0; i <= 6; i++) {
    const currentTime = startTime.getTime() + i * intervalMs;

    const pct = (i / 6) * 100;

    const date = new Date(
      i === 6 ? endTime.getTime() : currentTime
    );

    marks.push({
      pct: Math.round(pct * 100) / 100,
      label: i === 0 ? "Start" : `${Math.round(intervalMinutes * i)}m`,
      timeLabel: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    });
  }

  return marks;
}

export function detectPanicEvents(gpsPoint: GpsLocation): string[] {
  const events: string[] = [];

  // panic can be true, false, or null — only fire on strict true
  if (gpsPoint.panic === true) {
    events.push("sos");
  }

  return events;
}

/**
 * Format event label for display
 */
export function getEventLabel(eventKey: string): string {
  const labels: Record<string, string> = {
    actualSignIn: "Sign in",
    actualSignOut: "Sign out",
    calls: "Call",
    noShow: "No show",
    gpsLoss: "GPS loss",
    sos: "SOS",
    overspeed: "Overspeed",
    vehicleStop: "Stoppage",
    networkLoss: "Network loss",
  };

  return labels[eventKey] ?? eventKey;
}

/**
 * Get color for event type
 */
export function getEventColor(eventKey: string): string {
  const colors: Record<string, string> = {
    actualSignIn: "#22c55e",
    actualSignOut: "#f59e0b",
    calls: "#3b82f6",
    noShow: "#ef4444",
    gpsLoss: "#a855f7",
    sos: "#dc2626",
    overspeed: "#f97316",
    vehicleStop: "#64748b",
    networkLoss: "#ec4899",
  };

  return colors[eventKey] ?? "#94a3b8";
}
/**
 * Converts a passenger's sign-in/sign-out timestamps into timeline EventMarkers.
 * - Skips passengers with null/missing timestamps (e.g. no-shows).
 * - Drops (does not clamp) markers whose timestamp falls outside [startTime, endTime],
 *   logging a warning, since clamping bad data to 0%/100% could mislead the timeline.
 * @param passengers List of trip passengers.
 * @param startTime  Trip start time (ISO string), same source used for pct mapping elsewhere.
 * @param endTime    Trip end time (ISO string).
 */
export function convertPassengersToEventMarkers(
  passengers: TripPassenger[],
  startTime: string,
  endTime: string,
): EventMarker[] {
  const startMs = new Date(startTime).getTime();
  const endMs = new Date(endTime).getTime();

  if (isNaN(startMs) || isNaN(endMs) || startMs >= endMs) {
    console.warn(
      "[convertPassengersToEventMarkers] Invalid trip time range, skipping passenger markers.",
    );
    return [];
  }

  const totalMs = endMs - startMs;
  const markers: EventMarker[] = [];

  const toPct = (timeStr: string | null): number | null => {
    if (!timeStr) return null;
    const t = new Date(timeStr).getTime();
    if (isNaN(t)) return null;
    if (t < startMs || t > endMs) return null; // dropped, not clamped
    return ((t - startMs) / totalMs) * 100;
  };

  for (const passenger of passengers) {
    const fullName = `${passenger.firstname} ${passenger.lastName}`.trim();

    const signInPct = toPct(passenger.empSigninTime);
    if (signInPct !== null) {
      markers.push({
        key: "actualSignIn",
        pct: signInPct,
        label: `${fullName}`,
        timestamp: passenger.empSigninTime as string,
      });
    } else if (passenger.empSigninTime) {
      console.warn(
        `[convertPassengersToEventMarkers] Dropped out-of-range sign-in for empId ${passenger.empId}`,
      );
    }

    const signOutPct = toPct(passenger.empSignOutTime);
    if (signOutPct !== null) {
      markers.push({
        key: "actualSignOut",
        pct: signOutPct,
        label: `${fullName}`,
        timestamp: passenger.empSignOutTime as string,
      });
    } else if (passenger.empSignOutTime) {
      console.warn(
        `[convertPassengersToEventMarkers] Dropped out-of-range sign-out for empId ${passenger.empId}`,
      );
    }
  }

  return markers;
}