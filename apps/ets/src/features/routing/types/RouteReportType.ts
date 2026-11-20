export interface DownloadRouteDataPayload {
  date: string;
  shiftId: string;
  locCode: number;
  tripType: number;
}

// To:
export interface DownloadReportsPayload {
  locCode: number;
  date: string;
  shiftId: number;
  tripType: number;
}
