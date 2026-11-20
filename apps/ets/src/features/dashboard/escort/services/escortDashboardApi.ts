import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../shared/lib/api/baseQueryWithReauth";
import type {
  EscortDashboardRequest,
  EscortDashboardRawResponse,
  ParsedEscortDashboard,
  EscortUpdateInTripRequest,
} from "../types/escort.types";
import { parseEscortDashboardResponse } from "../config/parsers";
import type { ShiftOption } from "../../../report-analytics/types/reports.types";

export const escortDashboardApi = createApi({
  reducerPath: "escortDashboardApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["EscortDashboard"],
  endpoints: (builder) => ({
    getEscortDashboardReport: builder.query<ParsedEscortDashboard, EscortDashboardRequest>({
      query: (body) => ({
        url: "/api/v1/Report/EscortDashboardReport",
        method: "POST",
        body,
      }),
      transformResponse: (raw: unknown) => {
        console.log(raw, "raw");
        const data = Array.isArray(raw) ? raw[0] : raw;
        return parseEscortDashboardResponse(data as EscortDashboardRawResponse);
      },
      providesTags: (_result, _err, { LocCode, ShiftId, tripType }) => [
        { type: "EscortDashboard", id: `${LocCode}-${ShiftId}-${tripType}` },
      ],
    }),

    // POST /api/v1/Escorts/EscortUpdateInTrip
    updateEscortInTrip: builder.mutation<void, EscortUpdateInTripRequest>({
      query: (body) => ({
        url: "/api/v1/Escorts/EscortUpdateInTrip",
        method: "POST",
        body,
      }),
      // Refresh the dashboard so the assigned escort shows on the trip row
      invalidatesTags: ["EscortDashboard"],
    }),
    getMyOfficeShift: builder.query<ShiftOption[], { locCode: number, tripType: number, tripdate: string }>({
      query: ({ locCode, tripType, tripdate }) => ({
        url: "/api/v1/MstShiftControl/GetShiftFilterWise",
        params: { locCode, tripType, tripdate },
      }),
      transformResponse: (response: any) => {
        console.log("API RESPONSE", response);
        const jsonShift = response.result?.[0]?.jsonShift;
        if (!jsonShift) return [];
        return JSON.parse(jsonShift) as ShiftOption[];
      },
    }),
  }),
});

export const {
  useGetEscortDashboardReportQuery,
  useLazyGetEscortDashboardReportQuery,
  useUpdateEscortInTripMutation,
  useGetMyOfficeShiftQuery,
} = escortDashboardApi;