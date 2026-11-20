export const getTimeDifference = (
  startDateTime: string,
  endDateTime: string
): string => {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  const diffMs = end.getTime() - start.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
};
export const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
export const formatDateTimeWithoutYear = (dateTime: string) => {
  return new Date(dateTime).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatAdjustedTime = (
  plannedScheduleTime: string,
  etaDeviationMinutes: number = 0
) => {
  const date = new Date(plannedScheduleTime);

  if (etaDeviationMinutes > 0) date.setMinutes(date.getMinutes() + etaDeviationMinutes);

  return formatTime(date.toString());
};
export const formatUTCToIST = (utcDate: string) => {
  if (!utcDate) return "-";
  const date = new Date(utcDate + "Z"); // Force UTC
  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    // second: "2-digit",
    hour12: true,
  });
};
/**
 * Formats an ISO timestamp into a short, human-readable time (HH:MM:SS).
 * Falls back to the raw string if the timestamp can't be parsed.
 *
 * @param timestamp ISO datetime string (e.g. "2026-07-06T09:15:00Z")
 * @returns Localized time string, or the original string if invalid
 */
export function formatEventTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}