import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../shared/lib/api/baseQueryWithReauth";
import type {
    DriverRaw,
    AddressChange,
    Vehicle,
    UserStage,
    PaginatedResponse,
} from "../types/vendor.types";
const requestParams = { page: 1, pageSize: 1000 }
export const vendorDashboardApi = createApi({
    reducerPath: "vendorDashboardApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["DriverStage", "AddressChange", "VehicleStage", "UserStage"],
    endpoints: (builder) => ({

        // GET /api/v1/AddressChanges
        getAllAddressChanges: builder.query<PaginatedResponse<AddressChange>, void>({
            query: () => ({
                url: "/api/v1/AddressChanges",
                params: requestParams,
            }),
            // transformResponse: (response: any): PaginatedResponse<AddressChange> => response,
            providesTags: (result) =>
                result
                    ? [
                        ...result.items.map(({ profileUpdate_Id }) => ({
                            type: "AddressChange" as const,
                            id: profileUpdate_Id,
                        })),
                        { type: "AddressChange", id: "LIST" },
                    ]
                    : [{ type: "AddressChange", id: "LIST" }],
        }),

        // ─── Drivers ─────────────────────────────────────────────────────────────

        // GET /api/v1/DriverStages
        getDriverStages: builder.query<PaginatedResponse<DriverRaw>, void>({
            query: () => ({
                url: "/api/v1/DriverStages",
                params: requestParams,
            }),
            

            providesTags: (result) =>
                result
                    ? [
                        ...result.items.map(({ driver_Id }) => ({
                            type: "DriverStage" as const,
                            id: driver_Id,
                        })),
                        { type: "DriverStage", id: "LIST" },
                    ]
                    : [{ type: "DriverStage", id: "LIST" }],
        }),

        // GET /api/v1/VehicleStages
        getAllStageVehicle: builder.query<PaginatedResponse<Vehicle>, void>({
            query: () => ({
                url: '/api/v1/VehicleStages',
                params: requestParams,
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.items.map(({ vehicle_Id }) => ({
                            type: 'VehicleStage' as const,
                            id: vehicle_Id,
                        })),
                        { type: 'VehicleStage', id: 'LIST' },
                    ]
                    : [{ type: 'VehicleStage', id: 'LIST' }],
        }),

        // GET /api/v1/UserStages
        getUserStages: builder.query<PaginatedResponse<UserStage>, void>({
            query: () => ({
                url: "/api/v1/UserStages",
                params: requestParams,
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

    }),
});

export const {
    useGetAllAddressChangesQuery,
    useGetDriverStagesQuery,
    // Vehicles
    useGetAllStageVehicleQuery,
    // User Stages
    useGetUserStagesQuery,
} = vendorDashboardApi;