import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../shared/lib/api/baseQueryWithReauth';
import type {
    Vehicle,
    CreateVehicleDto,
    UpdateVehicleDto,
    VehicleListParams,
    PaginatedResponse,
} from '../types/vehicle.types';

export const vehicleApi = createApi({
    reducerPath: 'vehicleApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Vehicle', 'VehicleStage'],
    endpoints: (builder) => ({
        getAllVehicles: builder.query<PaginatedResponse<Vehicle>, VehicleListParams>({
            query: ({ searchTerm = '', vendorName = "", location = "", sortColumn = '', sortOrder = '', page, pageSize }) => ({
                url: '/api/v1/Vehicles',
                params: { searchTerm, sortColumn, sortOrder, page, pageSize, vendorName, location, },
            }),
            // API returns a plain array — normalize to PaginatedResponse
            transformResponse: (response: any): PaginatedResponse<Vehicle> => {
                return response;
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.items.map(({ vehicle_Id }) => ({
                            type: 'Vehicle' as const,
                            id: vehicle_Id,
                        })),
                        { type: 'Vehicle', id: 'LIST' },
                    ]
                    : [{ type: 'Vehicle', id: 'LIST' }],
        }),

        createVehicle: builder.mutation<{ message: string; vehicleId: string }, CreateVehicleDto>({
            query: (body) => ({
                url: '/api/v1/Vehicles',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Vehicle', id: 'LIST' }],
        }),

        updateVehicle: builder.mutation<{ message: string }, UpdateVehicleDto>({
            query: ({ vehicle_Id, ...body }) => ({
                url: `/api/v1/Vehicles/${vehicle_Id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_result, _error, { vehicle_Id }) => [
                { type: 'Vehicle', id: vehicle_Id },
                { type: 'Vehicle', id: 'LIST' },
            ],
        }),
        // ------ stage Api's
        getAllStageVehicle: builder.query<PaginatedResponse<Vehicle>, VehicleListParams>({
            query: ({ searchTerm = '', vendorName = "", location = "", sortColumn = '', sortOrder = '', page, pageSize }) => ({
                url: '/api/v1/VehicleStages',
                params: { searchTerm, sortColumn, sortOrder, page, pageSize, vendorName, location },
            }),
            // API returns a plain array — normalize to PaginatedResponse
            transformResponse: (response: any): PaginatedResponse<Vehicle> => {
                return response;
            },
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

        createStageVehicle: builder.mutation<{ message: string; vehicleId: string }, CreateVehicleDto>({
            query: (body) => ({
                url: '/api/v1/VehicleStages',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'VehicleStage', id: 'LIST' }],
        }),

        updateStageVehicle: builder.mutation<{ message: string }, UpdateVehicleDto>({
            query: ({ vehicle_Id, ...body }) => ({
                url: `/api/v1/VehicleStages/${vehicle_Id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_result, _error, { vehicle_Id }) => [
                { type: 'VehicleStage', id: vehicle_Id },
                { type: 'VehicleStage', id: 'LIST' },
            ],
        }),

        approveVehicleStage: builder.mutation<void, string>({
            query: (vehicle_Id) => ({
                url: `/api/v1/VehicleStages/${vehicle_Id}/approve`,
                method: "POST",
            }),
            invalidatesTags: (_, __, vehicle_Id) => [
                { type: 'VehicleStage', id: vehicle_Id },
                { type: 'VehicleStage', id: 'LIST' },
            ],
        }),

        bulkUploadVehicleStage: builder.mutation<any, CreateVehicleDto[]>({
            query: (body) => ({
                url: "/api/v1/VehicleStages/bulk-upload",
                method: "POST",
                body: body,
            }),
            invalidatesTags: [{ type: "VehicleStage", id: "LIST" }],
        }),

    }),
});

export const {
    useGetAllVehiclesQuery,
    useCreateVehicleMutation,
    useUpdateVehicleMutation,
    useGetAllStageVehicleQuery,
    useCreateStageVehicleMutation,
    useUpdateStageVehicleMutation,
    useApproveVehicleStageMutation,
    useBulkUploadVehicleStageMutation
} = vehicleApi;