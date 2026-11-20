import { useMemo } from "react";
import type { GpsLocation, TripPassenger } from "../types/tracking.types";
import {
  convertGpsPointsToEventMarkers,
  convertPassengersToEventMarkers,
  generateIntervalMarks,
  // detectPanicEvents,
  type EventMarker,
  type IntervalMark,
} from "../utils/eventUtils";

interface UsePlaybackEventsConfig {
  overspeadThreshold?: number;
  gpsLossThreshold?: number;
  stoppingThreshold?: number;
  intervalMinutes?: number;
  enableAutoDetection?: boolean;
}

interface UsePlaybackEventsResult {
  eventMarkers: EventMarker[];
  intervalMarks: IntervalMark[];
  totalEvents: number;
  errorMessage?: string;
}

/**
 * Hook to convert GPS data to event markers and generate interval marks
 * Memoizes calculations to avoid unnecessary recomputation
 */
export function usePlaybackEvents(
  gpsPoints: GpsLocation[] | undefined,
  passengers:TripPassenger[],
  startTime: string | undefined,
  endTime: string | undefined,
  config: UsePlaybackEventsConfig = {},
): UsePlaybackEventsResult {
  // console.log(gpsPoints, "gpsPoints")
  const {
    overspeadThreshold = 80,
    stoppingThreshold = 10,
    intervalMinutes = 20,
    enableAutoDetection = true,
  } = config;

  return useMemo(() => {
    // Validation
    if (!gpsPoints || gpsPoints.length === 0) {
      return {
        eventMarkers: [],
        intervalMarks: [],
        totalEvents: 0,
        errorMessage: "No GPS points available",
      };
    }

    if (!startTime || !endTime) {
      return {
        eventMarkers: [],
        intervalMarks: [],
        totalEvents: 0,
        errorMessage: "Start time and end time are required",
      };
    }

    try {
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return {
          eventMarkers: [],
          intervalMarks: [],
          totalEvents: 0,
          errorMessage: "Invalid date format",
        };
      }

      if (startDate >= endDate) {
        return {
          eventMarkers: [],
          intervalMarks: [],
          totalEvents: 0,
          errorMessage: "Start time must be before end time",
        };
      }
      // GPS-derived events (overspeed, stoppage, GPS loss, etc.) — gated by enableAutoDetection
      // since these are heuristically detected, not directly recorded events.
      const gpsDerivedMarkers = enableAutoDetection
        ? convertGpsPointsToEventMarkers(gpsPoints, startTime, endTime, {
            overspeadThreshold,
            stoppingThreshold,
          })
        : [];

      // Passenger sign-in/sign-out markers — these are actual recorded events,
      // so they're generated regardless of enableAutoDetection.
      const passengerMarkers = passengers?.length
        ? convertPassengersToEventMarkers(passengers, startTime, endTime)
        : [];
        const eventMarkers = [...gpsDerivedMarkers, ...passengerMarkers];

      const intervalMarks = generateIntervalMarks(
        startTime,
        endTime,
      );

      return {
        eventMarkers,
        intervalMarks,
        totalEvents: eventMarkers.length,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        eventMarkers: [],
        intervalMarks: [],
        totalEvents: 0,
        errorMessage,
      };
    }
  }, [gpsPoints, startTime, endTime, overspeadThreshold, stoppingThreshold, intervalMinutes, enableAutoDetection]);
}