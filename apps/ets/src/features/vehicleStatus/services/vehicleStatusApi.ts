import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../shared/lib/api/baseQueryWithReauth';
import type {
    VehicleStatus,
    CreateVehicleStatusDto,
    UpdateVehicleStatusDto,
    PaginatedResponse,
} from '../types/vehicleStatus.types';

const TAG = 'VehicleStatus' as const;

export const vehicleStatusApi = createApi({
    reducerPath: 'vehicleStatusApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: [TAG],
    endpoints: (builder) => ({
        getAll: builder.query<PaginatedResponse<VehicleStatus>, void>({
            query: () => ({ url: '/api/v1/VehicleStatus' }),
            transformResponse: (response: any): PaginatedResponse<VehicleStatus> => {
                return response;
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.items.map(({ vehicleStatus_Id }) => ({ type: TAG, id: vehicleStatus_Id })),
                        { type: TAG, id: 'LIST' },
                    ]
                    : [{ type: TAG, id: 'LIST' }],
        }),

        create: builder.mutation<VehicleStatus, CreateVehicleStatusDto>({
            query: (body) => ({
                url: '/api/v1/VehicleStatus',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: TAG, id: 'LIST' }],
        }),

        update: builder.mutation<VehicleStatus, UpdateVehicleStatusDto>({
            query: ({ vehicleStatus_Id, ...body }) => ({
                url: `/api/v1/VehicleStatus/${vehicleStatus_Id}`,
                method: 'PUT',
                body,
            }),
            invalidatesTags: (_result, _error, { vehicleStatus_Id }) => [
                { type: TAG, id: vehicleStatus_Id },
                { type: TAG, id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetAllQuery,
    useCreateMutation,
    useUpdateMutation,
} = vehicleStatusApi;