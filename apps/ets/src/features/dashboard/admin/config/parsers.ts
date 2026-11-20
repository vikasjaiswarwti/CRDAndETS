import type { DashboardApiResponse, ParsedDashboardData } from '../types/admin.types';


export function parseDashboardResponse(
  raw: DashboardApiResponse
): ParsedDashboardData {
  return {
    kpi: JSON.parse(raw.kpi),
    tripSummary: JSON.parse(raw.tripSummary),
    userInfo: JSON.parse(raw.userInfo),
    otaOtd: JSON.parse(raw.jsonOTAOTD),
    adhocRequest: JSON.parse(raw.jsonAdhocRequest),
    vehicleDriver: JSON.parse(raw.jsonVehicleDriver),
    safetySecurity: JSON.parse(raw.jsonSafetyandSecurity),
    uniqueVehicleDriver: JSON.parse(raw.jsonUniqueVehicleDriver),
    compliance: JSON.parse(raw.vehicleDriverCompliance),
    vehicleDeployment: JSON.parse(raw.jsonVehicleDeployment),
    feedback: JSON.parse(raw.jsonFeedbackReport),
    vehicleTypes: JSON.parse(raw.jsonVehicleType),
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