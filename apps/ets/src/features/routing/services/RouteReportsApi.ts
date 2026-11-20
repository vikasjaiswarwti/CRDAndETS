// src/features/routeManagement/services/routeReportsApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";

export interface ShiftReportParams {
  LocCode: number;
  fromDate: string;
  toDate: string;
  tripType: number;
  ShiftId: number;
}

export interface RouteAnalysisRecord {
  [key: string]: unknown;
}

export interface VehicleDeploymentRecord {
  [key: string]: unknown;
}

export interface SummaryReportParams {
  LocCode: number;
  fromDate: string;
  toDate: string;
  tripType: number;
}

export interface TripSummaryReportParams {
  LocCode: number;
  fromDate: string;
  toDate: string;
}

// Params type
export interface OnTimeArrivalParams {
  LocCode: number;
  fromDate: string;
  toDate: string;
  ShiftID: number;
}

export const routeReportsApi = createApi({
  reducerPath: "routeReportsApi",
  baseQuery: baseQueryWithReauth,

  endpoints: (builder) => ({
    // POST /api/v1/Report/RouteAnalysisReport
    downloadRouteAnalysisReport: builder.mutation<
      RouteAnalysisRecord[],
      ShiftReportParams
    >({
      query: (body) => ({
        url: "/api/v1/Report/RouteAnalysisReport",
        method: "POST",
        body,
      }),
    }),

    // POST /api/v1/Report/VehicleDeploymentReport
    downloadVehicleDeploymentReport: builder.mutation<
      VehicleDeploymentRecord[],
      ShiftReportParams
    >({
      query: (body) => ({
        url: "/api/v1/Report/VehicleDeploymentReport",
        method: "POST",
        body,
      }),
    }),

    // POST /api/v1/Report/SummaryReport
    downloadSummaryReport: builder.mutation<
      Record<string, unknown>[],
      SummaryReportParams
    >({
      query: (body) => ({
        url: "/api/v1/Report/SummaryReport",
        method: "POST",
        body,
      }),
    }),

    // POST /api/v1/Report/TripSummaryReport  (Employee Trip Report)
    downloadTripSummaryReport: builder.mutation<
      Record<string, unknown>[],
      TripSummaryReportParams
    >({
      query: (body) => ({
        url: "/api/v1/Report/TripSummaryReport",
        method: "POST",
        body,
      }),
    }),

    // Inside endpoints builder:
    downloadOnTimeArrivalReport: builder.mutation<
      Record<string, unknown>[],
      OnTimeArrivalParams
    >({
      query: (body) => ({
        url: "/api/v1/Report/ShiftWiseOnTimeArrivalTripDetailsReport",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  // Routing panel table
  useDownloadRouteAnalysisReportMutation,
  useDownloadVehicleDeploymentReportMutation,

  // Trip publish table
  useDownloadSummaryReportMutation,
  useDownloadTripSummaryReportMutation,

  useDownloadOnTimeArrivalReportMutation,
} = routeReportsApi;
