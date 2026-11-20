import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../shared/lib/api/baseQueryWithReauth";
import type {
  GlobalUserProfile,
  UpdateMobileRequest,
  AddressChangeRequest,
  AddressChangeResponse,
  PasswordChangeRequest,
  ParsedDashboardData,
  TeamCabTrackResponse,
  CreateComplaintRequest,
  ComplaintLookupResponse,
  ComplaintLookup,
  ComplaintOption,
  TripHomeGroup,
  UserTripCancelConfirmationResponse,
  UserTripCancelConfirmationRequest,
  UserCancelTripRequest,
  UserCancelTripResponse,
  AppScheduleConfig,
  UserBoardDeboardRequest,
  UserBoardDeboardResponse,
  ReachedHomeRequest,
  CreateUserFeedbackRequest,
  CreateUserFeedbackResponse,
  AppControlSettingsResponse,
  // ReachedHomeResponse,
} from "../types/employeeProfile.types";

import { parseDashboardResponse } from "../config/parsers";

export interface AddressChange {
  empId: number;
  empName: string;
  status: "Pending" | "Approved" | "Rejected" | "NoRecord";
  requestedOn: string;
  address: string;
  city: string;
  state: string;
  stateCode: number;
  pin: string;
  mobileNo: string;
  emerContactNo: string;
  emp_Lat: number;
  emp_Lng: number;
  geocodeId: number;
  locCode: number;
  effectiveDate: string | null;
  remarks: string | null;
  rejectionRemark: string | null;
  actionType: "A" | "R" | "P"; // Approved / Rejected / Pending
  profileUpdate_Id?: number; // keep if already used as rowKey
}

// Generic API response wrapper — adjust to match your actual backend shape
export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data: T;
}


export const employeeProfileApi = createApi({
  reducerPath: "employeeProfileApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GlobalUser", "AddressChange"],
  endpoints: (builder) => ({
    // GET /api/v1/Users/global/{userId}
    getGlobalUser: builder.query<GlobalUserProfile, string>({
      query: (userId) => `/api/v1/Users/global/${userId}`,
      providesTags: (_result, _err, userId) => [
        { type: "GlobalUser", id: userId },
      ],
    }),

    // PATCH /api/v1/Users/{userId}/mobile
    updateMobile: builder.mutation<void, { userId: string; mobileNo: string }>({
      query: ({ userId, mobileNo }) => ({
        url: `/api/v1/Users/${userId}/mobile`,
        method: "PATCH",
        body: { mobileNo } satisfies UpdateMobileRequest,
      }),
      // Refetch profile after mobile update so the form pre-fill stays fresh
      invalidatesTags: (_result, _err, { userId }) => [
        { type: "GlobalUser", id: userId },
      ],
    }),

    // POST /api/v1/AddressChanges
    requestAddressChange: builder.mutation<
      AddressChangeResponse,
      AddressChangeRequest
    >({
      query: (body) => ({
        url: "/api/v1/AddressChanges",
        method: "POST",
        body: { ...body, "Platform": "WEB" },
      }),
    }),

    // POST /api/v1/change-password
    requestPasswordChange: builder.mutation<any, PasswordChangeRequest>({
      query: (body) => ({
        url: "/api/v1/Users/change-password",
        method: "POST",
        body,
      }),
    }),
    getUserDashboardReport: builder.query<
      ParsedDashboardData,
      { TodayDate: string }
    >({
      query: (body) => ({
        url: "/api/v1/Report/UserDashboardReport",
        method: "POST",
        body,
      }),
      transformResponse: (raw: unknown) => {
        const data = Array.isArray(raw) ? raw[0] : raw;
        const response = parseDashboardResponse(data);
        return response;
      },
    }),
    getTeamCabTrack: builder.query<
      TeamCabTrackResponse,
      { empId: number; date: string }
    >({
      query: ({ empId, date }) => ({
        url: "/api/v1/Tracking/team-tracking-panel",
        method: "GET",
        params: { empId, date },
      }),

      transformResponse: (response: TeamCabTrackResponse) => {
        return response;
      },
    }),

    getAddressStatus: builder.query<AddressChange | null, number>({
      query: (empId) => `/api/v1/AddressChanges/employee/${empId}/status`,
      transformResponse: (response: AddressChange | null) => response ?? null,
      providesTags: (_result, _error, empId) => [
        { type: "AddressChange", id: empId },
      ],
    }),


    getComplaintList: builder.query<ComplaintOption[], void>({
      query: () => "/api/v1/UserApp/ComplaintLookup",
      transformResponse: (response: ComplaintLookupResponse[]): ComplaintOption[] => {
        const result: string = response?.[0]?.result;
        if (!result) return [];
        const complaints = JSON.parse(result) as ComplaintLookup[];
        return complaints.map((item) => ({
          label: item.ComplainName,
          value: item.ComplaintType,
        }));
      },
    }),
    requestCreateComplaint: builder.mutation<void, CreateComplaintRequest>({
      query: (body) => ({
        url: "/api/v1/UserApp/CreateComplaint",
        method: "POST",
        body: { ...body, "Platform": "WEB" },
      }),
    }),

    createUserFeedback: builder.mutation<
      CreateUserFeedbackResponse,
      CreateUserFeedbackRequest
    >({
      query: (body) => ({
        url: "/api/v1/UserApp/CreateUserFeedback",
        method: "POST",
        body,
      }),
    }),
    getTripHomePage: builder.query<TripHomeGroup[], void>({
      query: () => ({ url: "/api/v1/UserApp/GetTripHomePage" }),
      transformResponse: (res: unknown): TripHomeGroup[] => {
        const first = Array.isArray(res) ? res[0] : res;
        if (!first || typeof first !== "object") return [];

        if ("result" in (first as Record<string, unknown>)) {
          const wrapped = first as { errorCode?: number; result?: unknown };
          if (wrapped.errorCode !== undefined && wrapped.errorCode !== 0) {
            return [];
          }
          try {
            const parsed =
              typeof wrapped.result === "string"
                ? JSON.parse(wrapped.result)
                : wrapped.result;
            return Array.isArray(parsed) ? (parsed as TripHomeGroup[]) : [];
          } catch {
            return [];
          }
        }

        return Array.isArray(res) ? (res as TripHomeGroup[]) : [];
      },
    }),

    // ── 1. UserTripCancelConfirmation ──────────────────────────────────────
    userTripCancelConfirmation: builder.mutation<
      UserTripCancelConfirmationResponse,
      UserTripCancelConfirmationRequest
    >({
      query: (body) => ({
        url: "/api/v1/UserApp/UserTripCancelConfirmation",
        method: "POST",
        body,
      }),
      transformResponse: (response: any): UserTripCancelConfirmationResponse => {
        const result = response.result?.[0]?.result;
        return {
          ...response,
          result: JSON.parse(result)?.[0] ?? null,
        };
      },
    }),

    // ── 2. UserCancelTrip ──────────────────────────────────────────────────
    userCancelTrip: builder.mutation<
      UserCancelTripResponse,
      UserCancelTripRequest
    >({
      query: (body) => ({
        url: "/api/v1/UserApp/UserCancelTrip",
        method: "POST",
        body,
      }),
      transformResponse: (response: any): UserCancelTripResponse => ({
        ...response,
        result: response.result?.[0] ?? {
          errorCode: 0,
          dB_Response: "",
        },
      }),
    }),
    getUserAppConfigurationByLocCode: builder.query<
      AppControlSettingsResponse,
      number
    >({
      query: (locCode) =>
        `/api/v1/UserAppConfiguration/GetUserAppConfigurationByLocCode?locCode=${locCode}`,
      transformResponse: (response: { result: string }) => {
        return JSON.parse(response.result);
      },
    }),
    getAppControlSettingsByLocCode: builder.query<
      AppScheduleConfig,
      number
    >({
      query: (locCode) =>
        `/api/v1/AppControl/GetAppControlSettingsByLocCode/${locCode}`,
      transformResponse: (response: any) => {
        return response;
      }
    }),
    userBoardDeboard: builder.mutation<
      UserBoardDeboardResponse,
      UserBoardDeboardRequest
    >({
      query: (body) => ({
        url: "/api/v1/UserApp/UserBoardDeboard",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => {
        console.log(response, "response board/deboard");
        return response;
      }
    }),
    safeReachedHome: builder.mutation<
      UserBoardDeboardResponse,
      ReachedHomeRequest
    >({
      query: (body) => ({
        url: "/api/v1/UserApp/ReachedHome",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => {
        console.log(response, "response reach Home");
        return response;
      }
    }),
  }),
});

export const {
  useGetGlobalUserQuery,
  useUpdateMobileMutation,
  useRequestAddressChangeMutation,
  useRequestPasswordChangeMutation,
  useLazyGetUserDashboardReportQuery,
  useLazyGetTeamCabTrackQuery,

  useGetAddressStatusQuery,
  useGetComplaintListQuery,
  useRequestCreateComplaintMutation,
  useGetTripHomePageQuery,
  useUserTripCancelConfirmationMutation,
  useUserCancelTripMutation,
  useGetUserAppConfigurationByLocCodeQuery,
  useGetAppControlSettingsByLocCodeQuery,
  useUserBoardDeboardMutation,
  useSafeReachedHomeMutation,
  useCreateUserFeedbackMutation,
} = employeeProfileApi;
