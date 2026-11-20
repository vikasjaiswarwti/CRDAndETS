import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";

import type {
  UserStage,
  ApprovedUser,
  CreateUserStageDto,
  UpdateUserStageDto,
  BulkCreateDto,
  UserStageListParams,
  ApprovedUserListParams,
  PaginatedResponse,
  ApprovedUsersResponse,
  UpdateApprovedUserDto,
  CreateUserByRoleDto,
} from "../types/Employee.types";

// ─────────────────────────────────────────────────────────────────────────────
// API Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CheckExistsRequest {
  mobile?: string;
  email?: string;
}

export interface CheckExistsResponse {
  result: {
    mobileExists: boolean;
    emailExists: boolean;
  };
  isSuccess: boolean;
  message?: string;
}

export interface RoleOption {
  id: string;
  roleName: string;
  roleCode?: string;
}

export interface UserRolesResponse {
  roles: RoleOption[];
}

export interface RoleAssignment {
  roleId: string;
  roleName: string;
  isAssigned: boolean;
}

export interface UsersLiveCount {
  pending: number;
  approved: number;
  admin: number;
  deactive: number;
}

export interface AreaOption {
  areaId: number;
  areaName: string;
}

export interface ZoneOption {
  zoneId: number;
  zoneName: string;
  billingZone: string;
  zoneRank: number;
}

export interface UserAreaZone {
  areas: AreaOption[];
  zones: ZoneOption[];
}

export const employeeApi = createApi({
  reducerPath: "employeeApi",

  baseQuery: baseQueryWithReauth,

  tagTypes: ["UserStage", "ApprovedUser", "UserDeactivate", "UserRole"],

  endpoints: (builder) => ({
    // ─────────────────────────────────────────────────────────────
    // USER STAGES (PENDING USERS)
    // ─────────────────────────────────────────────────────────────

    getUserStages: builder.query<
      PaginatedResponse<UserStage>,
      UserStageListParams
    >({
      query: ({ searchTerm, sortColumn, sortOrder, page, pageSize }) => ({
        url: "/api/v1/UserStages",
        params: {
          ...(searchTerm ? { searchTerm } : {}),
          ...(sortColumn ? { sortColumn } : {}),
          ...(sortOrder ? { sortOrder } : {}),
          page,
          pageSize,
        },
      }),

      transformResponse: (raw: any): PaginatedResponse<UserStage> => ({
        items: raw?.items ?? raw?.data ?? [],
        total: raw?.total ?? raw?.totalCount ?? 0,
        page: raw?.page ?? 1,
        pageSize: raw?.pageSize ?? 10,
      }),

      providesTags: (result) =>
        result
          ? [
            ...result.items.map((item) => ({
              type: "UserStage" as const,
              id: item.id,
            })),
            { type: "UserStage" as const, id: "LIST" },
          ]
          : [{ type: "UserStage" as const, id: "LIST" }],
    }),

    createUserStage: builder.mutation<UserStage, CreateUserStageDto>({
      query: (body) => ({
        url: "/api/v1/UserStages",
        method: "POST",
        body,
      }),

      invalidatesTags: [{ type: "UserStage", id: "LIST" }],
    }),

    updateUserStage: builder.mutation<UserStage, UpdateUserStageDto>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/UserStages/${id}`,
        method: "PUT",
        body,
      }),

      invalidatesTags: (_, __, { id }) => [
        { type: "UserStage", id },
        { type: "UserStage", id: "LIST" },
      ],
    }),

    bulkCreateUserStages: builder.mutation<{ created: number }, BulkCreateDto>({
      query: (body) => ({
        url: "/api/v1/UserStages/bulk-create",
        method: "POST",
        body,
      }),

      invalidatesTags: [{ type: "UserStage", id: "LIST" }],
    }),

    approveUserStage: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/UserStages/${id}/approve`,
        method: "POST",
      }),

      invalidatesTags: (_, __, id) => [
        { type: "UserStage", id },
        { type: "UserStage", id: "LIST" },
        { type: "ApprovedUser", id: "LIST" },
      ],
    }),

    rejectUserStage: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/UserStages/${id}/reject`,
        method: "POST",
      }),

      invalidatesTags: (_, __, id) => [
        { type: "UserStage", id },
        { type: "UserStage", id: "LIST" },
      ],
    }),

    // ─────────────────────────────────────────────────────────────
    // CHECK MOBILE / EMAIL EXISTS
    // ─────────────────────────────────────────────────────────────

    checkExists: builder.query<CheckExistsResponse, CheckExistsRequest>({
      query: ({ mobile, email }) => ({
        url: "/api/v1/Users/check-exists",

        params: {
          ...(mobile ? { mobile } : {}),
          ...(email ? { email } : {}),
        },
      }),

      keepUnusedDataFor: 0,
    }),

    // ─────────────────────────────────────────────────────────────
    // APPROVED USERS
    // ─────────────────────────────────────────────────────────────

    // GET /api/v1/Users/live-count — live tab counts (pending/approved/admin/deactive)
    getUsersLiveCount: builder.query<UsersLiveCount, void>({
      query: () => ({
        url: "/api/v1/Users/live-count",
      }),
    }),

    getApprovedUsers: builder.query<
      ApprovedUsersResponse,
      ApprovedUserListParams
    >({
      query: ({
        searchTerm,
        sortColumn,
        sortOrder,
        page,
        pageSize,
        isSystem = false,
        locCode,
      }) => ({
        url: "/api/v1/Users",

        params: {
          ...(searchTerm ? { searchTerm } : {}),
          ...(sortColumn ? { sortColumn } : {}),
          ...(sortOrder ? { sortOrder } : {}),
          page,
          pageSize,
          isSystem,
          ...(locCode ? { locCode } : {}),
        },
      }),

      transformResponse: (raw: any): ApprovedUsersResponse => ({
        items: raw?.items ?? raw?.data ?? [],
        total: raw?.total ?? raw?.totalCount ?? 0,
        page: raw?.page ?? 1,
        pageSize: raw?.pageSize ?? 10,
        isAreaDDLEnabled: raw?.isAreaDDLEnabled ?? false,
        isZoneDDlEnabled: raw?.isZoneDDlEnabled ?? false,
      }),

      providesTags: (result) =>
        result
          ? [
            ...result.items.map((item) => ({
              type: "ApprovedUser" as const,
              id: item.id,
            })),
            { type: "ApprovedUser" as const, id: "LIST" },
          ]
          : [{ type: "ApprovedUser" as const, id: "LIST" }],
    }),
    updateUserStatus: builder.mutation<
      void,
      { userId: string; isActive: boolean }
    >({
      query: ({ userId, isActive }) => ({
        url: `/api/v1/Users/${userId}/status`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: { isActive },
      }),

      invalidatesTags: (_, __, { userId }) => [
        { type: "ApprovedUser", id: userId },
        { type: "ApprovedUser", id: "LIST" },
        { type: "UserDeactivate", id: userId },
        { type: "UserDeactivate", id: "LIST" },
      ],
    }),
    getDeactivateUser: builder.query<
      PaginatedResponse<ApprovedUser>,
      ApprovedUserListParams
    >({
      query: ({ searchTerm, page, pageSize }) => ({
        url: "/api/v1/Users/deactivated",
        params: {
          ...(searchTerm ? { searchTerm } : {}),
          page,
          pageSize,
        },
      }),

      transformResponse: (raw: any): PaginatedResponse<ApprovedUser> => ({
        items: raw?.items ?? raw?.data ?? [],
        total: raw?.total ?? raw?.totalCount ?? 0,
        page: raw?.page ?? 1,
        pageSize: raw?.pageSize ?? 10,
      }),

      providesTags: (result) =>
        result
          ? [
            ...result.items.map((item) => ({
              type: "UserDeactivate" as const,
              id: item.id,
            })),
            { type: "UserDeactivate" as const, id: "LIST" },
          ]
          : [{ type: "UserDeactivate" as const, id: "LIST" }],
    }),
    updateUserTransport: builder.mutation<
      void,
      {
        userId: string;
        transport: boolean;
        ownTransport: boolean;
        deleted: boolean;
      }
    >({
      query: ({ userId, transport, ownTransport, deleted }) => ({
        url: `/api/v1/Users/${userId}/transport`,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: { transport, ownTransport, deleted },
      }),

      invalidatesTags: (_, __, { userId }) => [
        { type: "ApprovedUser", id: userId },
        { type: "ApprovedUser", id: "LIST" },
      ],
    }),

    // inside APPROVED USERS section
    updateApprovedUser: builder.mutation<void, UpdateApprovedUserDto>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/Users/${id}`,
        method: "PUT",
        body,
      }),

      invalidatesTags: (_, __, { id }) => [
        { type: "ApprovedUser", id },
        { type: "ApprovedUser", id: "LIST" },
      ],
    }),

    // ─────────────────────────────────────────────────────────────
    // AREA / ZONE LOOKUP
    // ─────────────────────────────────────────────────────────────

    // GET /api/v1/Users/GetUserAreaZone — area & zone dropdown lookup
    // Raw shape: [{ area: "[{...}]" (JSON string), zone: "[{...}]" (JSON string) }]
    getUserAreaZone: builder.query<UserAreaZone, void>({
      query: () => ({
        url: "/api/v1/Users/GetUserAreaZone",
      }),
      transformResponse: (raw: any): UserAreaZone => {
        const first = Array.isArray(raw) ? raw[0] : raw;

        const rawAreas = first?.area
          ? typeof first.area === "string"
            ? JSON.parse(first.area)
            : first.area
          : [];
        const rawZones = first?.zone
          ? typeof first.zone === "string"
            ? JSON.parse(first.zone)
            : first.zone
          : [];

        return {
          areas: (rawAreas as any[]).map((a) => ({
            areaId: a.AreaID,
            areaName: a.AreaName,
          })),
          zones: (rawZones as any[]).map((z) => ({
            zoneId: z.ZoneID,
            zoneName: z.ZoneName,
            billingZone: z.BillingZone,
            zoneRank: z.ZoneRank,
          })),
        };
      },
    }),

    // ─────────────────────────────────────────────────────────────
    // ROLES
    // ─────────────────────────────────────────────────────────────

    // GET /api/v1/Roles — all available roles for the dropdown
    getAllRoles: builder.query<RoleOption[], void>({
      query: () => ({
        url: "/api/v1/RoleManagement",
      }),
      transformResponse: (raw: any): RoleOption[] =>
        Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []),
      providesTags: [{ type: "UserRole", id: "ROLE_LIST" }],
    }),

    // GET /api/v1/Users/{userId}/roles — current roles assigned to a user
    getUserRoles: builder.query<RoleOption[], string>({
      query: (userId) => ({
        url: `/api/v1/Users/${userId}/roles`,
      }),
      transformResponse: (raw: any): RoleOption[] =>
        Array.isArray(raw)
          ? raw
          : (raw?.roles ?? raw?.data ?? raw?.items ?? []),
      providesTags: (_, __, userId) => [{ type: "UserRole", id: userId }],
    }),

    // PATCH /api/v1/Users/{userId}/roles — assign / replace roles for a user
    // updateUserRoles: builder.mutation<
    //   void,
    //   { userId: string; roleIds: string[] }
    // >({
    //   query: ({ userId, roleIds }) => ({
    //     url: `/api/v1/Users/${userId}/roles`,
    //     method: "PATCH",
    //     headers: { "Content-Type": "application/json" },
    //     body: { roleIds },
    //   }),
    //   invalidatesTags: (_, __, { userId }) => [
    //     { type: "UserRole", id: userId },
    //     { type: "ApprovedUser", id: userId },
    //     { type: "ApprovedUser", id: "LIST" },
    //   ],
    // }),

    updateUserRole: builder.mutation<void, { userId: string; roleId: string }>({
      query: ({ userId, roleId }) => ({
        url: "/api/v1/UserRole",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          userId,
          roleId,
        },
      }),
      invalidatesTags: (_, __, { userId }) => [
        { type: "UserRole", id: userId },
        { type: "ApprovedUser", id: userId },
        { type: "ApprovedUser", id: "LIST" },
      ],
    }),

    // ─────────────────────────────────────────────────────────────
    // LOCATIONS
    // ─────────────────────────────────────────────────────────────

    // PATCH /api/v1/Users/{userId}/locations — map office locations to a user
    updateUserLocations: builder.mutation<
      void,
      { userId: string; locations: string[] }
    >({
      query: ({ userId, locations }) => ({
        url: `/api/v1/Users/${userId}/locations`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: { locations },
      }),
      invalidatesTags: (_, __, { userId }) => [
        { type: "ApprovedUser", id: userId },
        { type: "ApprovedUser", id: "LIST" },
      ],
    }),

    // Add inside endpoints(builder), after updateUserLocations:
    createUserByRole: builder.mutation<void, CreateUserByRoleDto>({
      query: (body) => ({
        url: "/api/v1/Users/create-by-role",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "ApprovedUser", id: "LIST" },
        { type: "UserRole", id: "ROLE_LIST" },
      ],
    }),

    sendCredentials: builder.mutation<void, { user_Id: string }>({
      query: (body) => ({
        url: "/api/v1/TripBatchNotification/send-credentials",
        method: "POST",
        body,
      }),
    }),

    getRoleAssignments: builder.query<RoleAssignment[], string>({
      query: (userId) => ({
        url: `/api/v1/UserRole/role-assignments/${userId}`,
      }),
      transformResponse: (raw: any): RoleAssignment[] =>
        Array.isArray(raw?.result) ? raw.result : [],
      providesTags: (_, __, userId) => [{ type: "UserRole", id: userId }],
    }),

    // POST /api/v1/UserRole/sync-roles
    syncUserRoles: builder.mutation<
      void,
      { userId: string; roleIds: string[] }
    >({
      query: (body) => ({
        url: "/api/v1/UserRole/sync-roles",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      invalidatesTags: (_, __, { userId }) => [
        { type: "UserRole", id: userId },
        { type: "ApprovedUser", id: userId },
        { type: "ApprovedUser", id: "LIST" },
      ],
    }),

    resetNoShow: builder.mutation<void, { empID: number }>({
      query: (body) => ({
        url: "/api/v1/users/reset-no-show",
        method: "POST",
        body,
      }),
      invalidatesTags: (_, __, { empID }) => [
        { type: "ApprovedUser", id: empID },
        { type: "ApprovedUser", id: "LIST" },
      ],
    }),
    resetAdhocCount: builder.mutation<void, { empID: number }>({
      query: (body) => ({
        url: "/api/v1/users/reset-adhoc-request-count",
        method: "POST",
        body,
      }),
      invalidatesTags: (_, __, { empID }) => [
        { type: "ApprovedUser", id: empID },
        { type: "ApprovedUser", id: "LIST" },
      ],
    }),
    resetUserPassword: builder.mutation<
      void,
      { userId: string; newPassword: string }
    >({
      query: ({ userId, newPassword }) => ({
        url: `/api/v1/Users/${userId}/reset-password`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: { newPassword },
      }),
    }),
  }),
});

export const {
  // User Stages
  useGetUserStagesQuery,
  useCreateUserStageMutation,
  useUpdateUserStageMutation,
  useBulkCreateUserStagesMutation,
  useApproveUserStageMutation,
  useRejectUserStageMutation,

  // Check Exists
  useCheckExistsQuery,
  useLazyCheckExistsQuery,

  // Live tab counts
  useGetUsersLiveCountQuery,

  // Area / Zone lookup
  useGetUserAreaZoneQuery,

  // Approved Users
  useGetApprovedUsersQuery,
  useUpdateApprovedUserMutation, // ← add this
  useUpdateUserStatusMutation,
  useResetUserPasswordMutation,
  useUpdateUserTransportMutation,

  // Deactivated
  useGetDeactivateUserQuery,

  // Roles
  useGetAllRolesQuery,
  useGetUserRolesQuery,
  useUpdateUserRoleMutation,

  // Locations
  useUpdateUserLocationsMutation,

  useCreateUserByRoleMutation,

  useSendCredentialsMutation,

  useGetRoleAssignmentsQuery,
  useSyncUserRolesMutation,

  useResetNoShowMutation, // ← add
  useResetAdhocCountMutation, // ← add
} = employeeApi;
