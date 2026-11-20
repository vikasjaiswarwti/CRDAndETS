import type { ParsedDashboardData, UserDashboardResponse } from "../types/employeeProfile.types";

export const parseDashboardResponse = (
  data: UserDashboardResponse
): ParsedDashboardData => ({
  userInfo: data.jsonUserInfo
    ? JSON.parse(data.jsonUserInfo)
    : null,

  todayTommorowTrips: data.jsonTodayTommorowTrips
    ? JSON.parse(data.jsonTodayTommorowTrips)
    : null,

  adhocRequest: data.jsonAdhocRequest
    ? JSON.parse(data.jsonAdhocRequest)
    : null,

  noshowTrips: data.jsonNoshowTrips
    ? JSON.parse(data.jsonNoshowTrips)
    : null,

  weeklySchedule: data.jsonWeeklySchedule
    ? JSON.parse(data.jsonWeeklySchedule)
    : null,

  teamCabs: data.jsonTeamCabs
    ? JSON.parse(data.jsonTeamCabs)
    : null,

  teamAdhocTrips: data.jsonTeamAdhocTrips
    ? JSON.parse(data.jsonTeamAdhocTrips)
    : null,

  complaint: data.jsonComplaint
    ? JSON.parse(data.jsonComplaint)
    : null,

  teamComplaint: data.jsonTeamComplaint
    ? JSON.parse(data.jsonTeamComplaint)
    : null,
});

export function fmtNum(n: number): string {
  return n.toLocaleString('en-IN');
}

export function pct(value: number, total: number): number {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}
// Utility
export const formatDateTime = (iso: string): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  // Output: "22 Jun 2026, 09:00 AM"
};
export const formatDate = (iso: string): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  // Output: "22 Jun 2026"
};

export const formatTime = (iso: string): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  // Output: "09:00 AM"
};
export const getCurrentLocation = (): Promise<GeolocationCoordinates> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};