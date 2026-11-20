// UserAppConfigurationapi.ts — User App Configuration RTK Query API
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";

// Alias for readability at call sites — same shape as appControlApi's response:
// an array of 1 object, where each value is itself a JSON-stringified array/object.
export type UserAppConfigRawResponse = Record<string, string>;
export type DriverAppConfigRawResponse = Record<string, string>;
export type DriverEventConfigRawResponse = Record<string, unknown>;

export interface UpdateDriverConfigPayload {
  LocCode: number;
  ColumnName: string;
  Value: string;
}
export interface DriverConfigRow {
  LocCode: number;
  MinPickupTripStartBeforeMinutes: string | number;
  MinDropTripStartBeforeMinutes: string | number;
  Active: string | number | boolean;
}

export interface DriverEventConfigQuery {
  DriverAppEventCode: number;
}

export interface UpdateDriverEventConfigPayload {
  DriverAppEventCode: number;
  ColumnName: string;
  Value: string;
}

export interface DriverAppEvent {
  DriverAppEventCode: number;
  DriverAppEventName: string;
  TripType: number;
  Active: boolean;
}

export interface UpdateDriverAppEventPayload {
  DriverAppEventCode: number;
  ColumnName: "TripType" | "Active";
  Value: string;
}

export const userAppConfigurationApi = createApi({
  reducerPath: "userAppConfigurationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["UserAppConfiguration", "DriverAppConfig", "DriverEventConfig"],
  endpoints: (builder) => ({
    getUserAppConfigurationByLocCode: builder.query<
      Array<UserAppConfigRawResponse>,
      { LocCode: number }
    >({
      query: ({ LocCode }) =>
        `/api/v1/UserAppConfiguration/GetUserAppConfigurationSettingByLocCode?LocCode=${LocCode}`,
      providesTags: (_r, _e, { LocCode }) => [
        { type: "UserAppConfiguration", id: LocCode },
      ],
    }),
    updateUserAppConfigurationByKey: builder.mutation<
      void,
      { LocCode: number; ColumnName: string; Value: string }
    >({
      query: (body) => ({
        url: "/api/v1/UserAppConfiguration/UpdateUserAppConfigurationByKey",
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { LocCode }) => [
        { type: "UserAppConfiguration", id: LocCode },
      ],
    }),
    // ---------------------- Driver 
    getDriverAppConfigByLocCode: builder.query<
       Array<DriverAppConfigRawResponse>,
      { LocCode: number }
    >({
      query: ({ LocCode }) =>
        `/api/v1/DriverAppConfig/GetDriverAppConfig?locCode=${LocCode}`,
      providesTags: (_result, _err, arg) => [
        { type: "DriverAppConfig", id: arg.LocCode },
      ],
    }),
    updateDriverAppConfig: builder.mutation<void, UpdateDriverConfigPayload>({
      query: (body) => ({
        url: "/api/v1/DriverAppConfig/UpdateDriverAppConfig",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _err, arg) => [
        { type: "DriverAppConfig", id: arg.LocCode },
      ],
    }),
    getDriverEventsConfig: builder.query<
      DriverEventConfigRawResponse | DriverEventConfigRawResponse[],
      DriverEventConfigQuery
    >({
      query: ({ DriverAppEventCode }) =>
        `/api/v1/DriverAppEvent/GetDriverEventsConfig/${DriverAppEventCode}`,
      providesTags: (_result, _error, arg) => [
        { type: "DriverEventConfig", id: arg.DriverAppEventCode },
      ],
    }),
    updateDriverEventsConfig: builder.mutation<
      void,
      UpdateDriverEventConfigPayload
    >({
      query: (body) => ({
        url: "/api/v1/DriverAppEvent/UpdateDriverEventsConfig",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "DriverEventConfig", id: arg.DriverAppEventCode },
      ],
    }),
    getDriverAppEvents: builder.query<DriverAppEvent[], void>({
      query: () => "/api/v1/DriverAppEvent/GetDriverAppEvent/0",
      providesTags: [{ type: "DriverEventConfig", id: "APP_EVENTS" }],
    }),
    updateDriverAppEvent: builder.mutation<
      void,
      UpdateDriverAppEventPayload
    >({
      query: (body) => ({
        url: "/api/v1/DriverAppEvent/UpdateDriverAppEvent",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "DriverEventConfig", id: "APP_EVENTS" }],
    }),
  }),
});

export const {
  useGetUserAppConfigurationByLocCodeQuery,
  useUpdateUserAppConfigurationByKeyMutation,
  useGetDriverAppConfigByLocCodeQuery,
  useUpdateDriverAppConfigMutation,
  useGetDriverEventsConfigQuery,
  useUpdateDriverEventsConfigMutation,
  useGetDriverAppEventsQuery,
  useUpdateDriverAppEventMutation,
} = userAppConfigurationApi;
