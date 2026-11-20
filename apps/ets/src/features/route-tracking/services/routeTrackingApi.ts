import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  DeviceHealthLog,
  DeviceHealthParams,
  DeviceHealthResponse,
  SignInParams,
  SignOutParams,
  TripDistanceResponse,
  TripResponse,
} from "../types/tracking.types";

// ── Types ──────────────────────────────────────────────────────────────────

export interface TrackingStatusParams {
  DsId: number | string;
}

export interface TrackingStatusResponse {
  // Adjust fields based on actual API response shape
  status: string;
  dsId: number;
  [key: string]: unknown;
}

export interface CabReachedStopParams {
  tripId: number;
  stopId: number;
  lat: number;
  lng: number;
}

// add near other interfaces
export interface IvrRecordingGroup {
  empId: number;
  callSids: string[];
}

export function parseBooleanFields<T extends Record<string, any>>(data: T): T {
  //   const result = { ...data };
  const result = { ...data } as Record<string, any>;

  Object.keys(result).forEach((key) => {
    if (result[key] === "true") {
      result[key] = true;
    } else if (result[key] === "false") {
      result[key] = false;
    }
  });

  return result as T;
}
// ── API Slice ──────────────────────────────────────────────────────────────

export const routeTrackingApi = createApi({
  reducerPath: "routeTrackingApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["RouteTracking"],

  endpoints: (builder) => ({
    // ── POST Tracking Status ─────────────────────────────────────────────
    getTrackingStatus: builder.query<TripResponse, TrackingStatusParams>({
      query: ({ DsId }) => ({
        url: "/api/v1/Tracking/status",
        method: "POST",
        params: { DsId }, // ← DsId goes in query string, not body (matches your curl)
      }),
      providesTags: (_result, _error, { DsId }) => [
        { type: "RouteTracking", id: DsId },
        { type: "RouteTracking", id: "LIST" },
      ],
    }),
    getGPSTrackingStatus: builder.query({
      query: ({ DsId }) => ({
        url: "/api/v1/Tracking/gps-route",
        method: "POST",
        params: { DsId }, // ← DsId goes in query string, not body (matches your curl)
      }),
      providesTags: (_result, _error, { DsId }) => [
        { type: "RouteTracking", id: DsId },
        { type: "RouteTracking", id: "LIST" },
      ],
    }),
    // ── Start Trip ─────────────────────────────────────────────
    startTrip: builder.mutation<any, {
      tripID: number,
      lat: number,
      lng: number,
      mobileNo: string
    }>({
      query: (body) => ({
        url: "/api/v1/DriversApp/start-trip",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RouteTracking", id: "LIST" }],
    }),
    // ── End Trip ─────────────────────────────────────────────
    endTrip: builder.mutation<any, { tripID: number }>({
      query: (body) => ({
        url: "/api/v1/DriversApp/end-trip",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RouteTracking", id: "LIST" }],
    }),
    markNoShow: builder.mutation<
      any,
      {
        dsId: number;
        empID: number;
        tripType: number;
        mobileNo: string;
      }
    >({
      query: (body) => ({
        url: "/api/v1/DriversApp/mark-no-show",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RouteTracking", id: "LIST" }],
    }),
    // ── Sign In ───────────────────────────────────────────────────────────
    signIn: builder.mutation<any, SignInParams>({
      query: (body) => ({
        url: "/api/v1/DriversApp/sign-in",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RouteTracking", id: "LIST" }],
    }),

    // ── Sign Out ──────────────────────────────────────────────────────────
    signOut: builder.mutation<any, SignOutParams>({
      query: (body) => ({
        url: "/api/v1/DriversApp/sign-out",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RouteTracking", id: "LIST" }],
    }),

    cabReachedStop: builder.mutation<any, CabReachedStopParams>({
      query: (body) => ({
        url: "/api/v1/DriversApp/cab-reached-stop",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RouteTracking", id: "LIST" }],
    }),

    getDeviceHealth: builder.query<DeviceHealthLog[], DeviceHealthParams>({
      query: ({ dsid }) => ({
        url: "/api/v1/TripManagement/GetDeviceHealth",
        method: "POST",
        body: { dsid },
      }),
      transformResponse: (response: DeviceHealthResponse) => {
        console.log(response, "API response");
        // return response.result;
        return response.result.map(parseBooleanFields);
      },
      providesTags: (_result, _error, { dsid }) => [
        { type: "RouteTracking", id: `device-health-${dsid}` },
      ],
    }),

    // endpoints
    getIvrRecordings: builder.query<
      IvrRecordingGroup[],
      { dsId: number | string }
    >({
      query: ({ dsId }) => ({
        url: `/api/v1/Ivr/by-dsid/${dsId}`,
        method: "GET",
      }),
    }),

    getIvrRecordingAudio: builder.query<string, { callSid: string }>({
      query: ({ callSid }) => ({
        url: `/api/v1/Ivr/recording/${callSid}`,
        method: "GET",
        responseHandler: async (response: Response) =>
          URL.createObjectURL(await response.blob()),
        cache: "no-cache",
      }),
    }),
    // ---------- Actual distance -----------
    getActualDistance: builder.query<TripDistanceResponse, number>({
      query: (DsId) => ({
        url: "/api/v1/Tracking/actual-distance",
        method: "GET",
        params: { DsId },
      }),
      providesTags: (_result, _error, DsId) => [
        { type: "RouteTracking", id: DsId },
        { type: "RouteTracking", id: "LIST" },
      ],
      transformResponse: (response: any) => {
        // console.log(response, "API response 183");
        return response;
      },
    }),
  }),
});

export const {
  useGetTrackingStatusQuery,
  useGetGPSTrackingStatusQuery,
  useStartTripMutation,
  useEndTripMutation,
  useMarkNoShowMutation,
  useSignInMutation,
  useSignOutMutation,
  useCabReachedStopMutation,
  useGetDeviceHealthQuery,
  useGetActualDistanceQuery,

  useLazyGetIvrRecordingsQuery,
  useLazyGetIvrRecordingAudioQuery,
} = routeTrackingApi;
