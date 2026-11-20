import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  GlobalUserProfile,
  UpdateGlobalUserProfileDto,
} from "../types/profile.types";
export interface AppScheduleUiConfig {
  isCancellationScheduledAllowed: boolean;
  isEditScheduleAllowed: boolean;
  isAlreadyScheduledNoShow: boolean;
  isCancelledScheduledAllowedAfterTAT: boolean;
  isTrackingScheduledAllowed: boolean;
  IsCreateScheduleAllowed: boolean;
  IsScheduleBulkCancellationEnabled: boolean;
}

export interface AppTripUiConfig {
  isTripTrackingAllowed: boolean;
  isTripChatAllowed: boolean;
  isTripShareCabAllowed: boolean;
  isTripIvrCallAllowed: boolean;
  isTripSafeHomeReach: boolean;
  isTripCancellationAllowed: boolean;
  isTripNoShowAllowed: boolean;
  isDeboardOtpFieldAllowed: boolean;
  isTripSummaryAllowed: boolean;
}

export interface CommonUiConfig {
  IsUserUpdateProfile: boolean;
  AppIcon: string;
  IsAreaDDLEnabled: boolean;
  IsZoneDDlEnabled: boolean;
  BoardingType: number;
  DeboardingType: number;
}

export interface UserAppConfiguration {
  AppScheduleUiConfig: AppScheduleUiConfig;
  AppTripUiConfig: AppTripUiConfig;
  CommonUiConfig: CommonUiConfig;
}

export interface SendOtpRequest {
  mobileNo: string;
  requestType: string;
}

export interface SendOtpResponse {
  success: boolean;
}

export interface VerifyOtpRequest {
  mobileNo: string;
  otp: number;
  requestType: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GUserProfile"],
  endpoints: (builder) => ({
    // GET /api/v1/Users/global/{userId}
    getGlobalUser: builder.query<GlobalUserProfile, string>({
      query: (userId) => `/api/v1/Users/global/${userId}`,
      providesTags: (_result, _err, userId) => [
        { type: "GUserProfile", id: userId },
      ],
    }),
    editProfile: builder.mutation<GlobalUserProfile, { userId: string; payload: UpdateGlobalUserProfileDto }>({
      query: ({ userId, payload }) => ({
        url: `/api/v1/Users/${userId}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (_result, _err, { userId }) => [{ type: 'GUserProfile', id: userId }],
    }),
    // GET /UserAppConfiguration/GetUserAppConfigurationByLocCode?locCode={locCode}
    // Response shape: { result: "<JSON string of { AppScheduleUiConfig, AppTripUiConfig, CommonUiConfig }>" }
    getUserAppConfigByLocCode: builder.query<UserAppConfiguration, number | string>({
      query: (locCode) => ({
        url: "/api/v1/UserAppConfiguration/GetUserAppConfigurationByLocCode",
        params: { locCode },
      }),
      transformResponse: (res: any): UserAppConfiguration => {
        try {
          const raw = res?.result;
          const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
          return (parsed ?? {}) as UserAppConfiguration;
        } catch {
          return {} as UserAppConfiguration;
        }
      },
      // providesTags: (_result, _err, locCode) => [
      //   { type: "UserAppConfig", id: String(locCode) },
      // ],
    }),

    // POST /api/v1/Otp/send  (public — no auth needed)
    sendOtp: builder.mutation<boolean, SendOtpRequest>({
      query: (body) => ({
        url: "/api/v1/Otp/send",
        method: "POST",
        body,
      }),
    }),

    // POST /api/v1/Otp/verify  (public — no auth needed)
    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpRequest>({
      query: (body) => ({
        url: "/api/v1/Otp/verify",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetGlobalUserQuery,
  useEditProfileMutation,
  useGetUserAppConfigByLocCodeQuery,
  useSendOtpMutation,
  useVerifyOtpMutation,
} = profileApi;
