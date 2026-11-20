// Appcontrolapi.ts — App Control RTK Query API
//
// Two endpoints only:
//   getAppControlByLocCode — GET nested config for one location
//   updateByKey            — POST per-field key-value update
//
// Response shape for getAppControlByLocCode:
//   Array<Record<string, string>>   (array of 1 object; each value is a JSON string)
//   e.g. [{ basicSetting: '[{"ShiftValidationID":2,...}]', ... }]

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";

export const appControlApi = createApi({
  reducerPath: "appControlApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AppControl"],
  endpoints: (builder) => ({
    // GET /AppControl/GetAppControlJsonbyLocCode?LocCode={n}
    getAppControlByLocCode: builder.query<
      Array<Record<string, string>>,
      { LocCode: number }
    >({
      query: ({ LocCode }) =>
        `/api/v1/AppControl/GetAppControlJsonbyLocCode?LocCode=${LocCode}`,
      providesTags: (_r, _e, { LocCode }) => [
        { type: "AppControl", id: LocCode },
      ],
    }),

    // GET /AppControl/GetApplicationConfiguration/{LocCode}
    getApplicationConfiguration: builder.query<
      ApplicationConfiguration,
      { LocCode: number }
    >({
      query: ({ LocCode }) =>
        `/api/v1/AppControl/GetApplicationConfiguration/${LocCode}`,
      providesTags: (_result, _error, { LocCode }) => [
        { type: "AppControl", id: `application-${LocCode}` },
      ],
    }),

    // POST /AppControl/UpdateApplicationConfigurationByKey
    updateApplicationConfigurationByKey: builder.mutation<
      void,
      ApplicationConfigurationUpdate
    >({
      query: (body) => ({
        url: "/api/v1/AppControl/UpdateApplicationConfigurationByKey",
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { LocCode }) => [
        { type: "AppControl", id: `application-${LocCode}` },
      ],
    }),

    // GET /CitySpeed/cities
    getCities: builder.query<City[], void>({
      query: () => "/api/v1/CitySpeed/cities",
    }),

    // POST /AppControl/AppControlUpdateByKey
    // updateByKey: builder.mutation<
    //   void,
    //   { LocCode: number; ColumnName: string; Value: string }
    // >({
    //   query: (body) => ({
    //     url: "/api/v1/AppControl/AppControlUpdateByKey",
    //     method: "POST",
    //     body,
    //   }),
    // }),

    updateByKey: builder.mutation<
      void,
      { LocCode: number; ColumnName: string; Value: string }
    >({
      query: (body) => ({
        url: "/api/v1/AppControl/AppControlUpdateByKey",
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { LocCode }) => [
        { type: "AppControl", id: LocCode },
      ],
    }),
  }),
});

export const { useGetAppControlByLocCodeQuery, useUpdateByKeyMutation } =
  appControlApi;

export interface ApplicationConfiguration {
  BasicSetting: {
    IsDPDPA: boolean;
    IsShowVehicleQR: boolean;
    IsSpeedServiceEnabled: boolean,
    CityID: number
  };
  SchedulingSetting: {
    ScheduleAndAdhocCapping: number;
    ScheduleBlockDays: number;
  };
  AdhocSetting: {
    IsAdhocRequestCountAllowed: boolean;
    AdhocRequestQuota: number;
    AdhocRequestResetFrequency: string;
  };
  RouteSetting: {
    IsRoutingCancelWindowCheckEnabled: boolean;
  };
}

export interface City {
  cityID: number;
  cityName: string;
}

export interface ApplicationConfigurationUpdate {
  LocCode: number;
  ColumnName: string;
  Value: string;
}

export const {
  useGetApplicationConfigurationQuery,
  useUpdateApplicationConfigurationByKeyMutation,
  useGetCitiesQuery,
} = appControlApi;
