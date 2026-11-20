import type { DashboardApiResponse, ParsedDashboardData } from '../types/admin.types';

export function parseDashboardResponse(raw: DashboardApiResponse): ParsedDashboardData {
  return {
    users: JSON.parse(raw.jsonUsers),
    otaOtd: JSON.parse(raw.jsonOTAOTD),
    adhocRequest: JSON.parse(raw.jsonAdhocRequest),
    occupancy: JSON.parse(raw.jsonOccupancy),
    safetySecurity: JSON.parse(raw.jsonSafetySecurity),
    uniqueVehicleDriver: JSON.parse(raw.jsonUniqueVehicleDriver),
    compliance: JSON.parse(raw.vehicleDriverCompliance),
    vehicleTypes: JSON.parse(raw.jsonVehicleType),
    feedback: JSON.parse(raw.jsonFeedbackReport),
    vehicleDeployment: JSON.parse(raw.jsonVehicleDeployment),
    vehicleUtilization: JSON.parse(raw.jsonVehicleUtilization),
  };
}

export function fmtNum(n: number): string {
  return n.toLocaleString('en-IN');
}

export function pct(value: number, total: number): number {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}