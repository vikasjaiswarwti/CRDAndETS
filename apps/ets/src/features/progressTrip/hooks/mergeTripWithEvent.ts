// utils/mergeTripWithEvent.ts
import type { OngoingTrip, Event } from "../types/progressTrip.types";
/**
 * Returns a NEW OngoingTrip with fields overwritten from a real-time Event,
 * skipping any field the event sends as null/undefined (no-op means "unchanged").
 */
export function mergeTripWithEvent(trip: OngoingTrip, event: Event): OngoingTrip {
  return {
    ...trip,
    statusCode: event.statusCode ?? trip.statusCode,
    statusName: event.statusName ?? trip.statusName,
    actualStartTime: event.actualStartTime ?? trip.actualStartTime,
    actualEndTime: event.actualEndTime ?? trip.actualEndTime,
    paxCount: event.paxCount ?? trip.paxCount,
    boardedCount: event.boardedCount ?? trip.boardedCount,
    deBoardedCount: event.deBoardedCount ?? trip.deBoardedCount,
    noShowCount: event.noShowCount ?? trip.noShowCount,
  };
}