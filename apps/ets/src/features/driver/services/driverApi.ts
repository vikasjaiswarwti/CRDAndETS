import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../shared/lib/api/baseQueryWithReauth';
import type {
  // Driver,
  DriverRaw,
  DriverListParams,
  CreateDriverDto,
  UpdateDriverDto,
  PaginatedResponse,
} from '../types/driver.types';

export const driverApi = createApi({
  reducerPath: 'driverApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['DriverRaw', 'DriverStage'],
  endpoints: (builder) => ({
    // ── Staging (Pending) Drivers ──────────────────────────────────────────

    getDriverStages: builder.query<PaginatedResponse<DriverRaw>, DriverListParams>({
      query: ({ searchTerm = '', vendorName = "", location = "", sortColumn = '', sortOrder = '', page, pageSize }) => ({
        url: '/api/v1/DriverStages',
        params: { searchTerm, sortColumn, sortOrder, page, pageSize, vendorName, location },
      }),
      transformResponse: (raw: any): PaginatedResponse<DriverRaw> => {
        if (Array.isArray(raw)) {
          // console.log(raw)
          return {
            items: raw,
            page: 1,
            pageSize: raw.length,        // fallback
            totalCount: raw.length,
            hasNextPage: false,
            hasPrevPage: false,
          };
        }
        // console.log(raw)
        return raw;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.items.map(({ driver_Id }) => ({ type: 'DriverStage' as const, id: driver_Id })),
            { type: 'DriverStage', id: 'LIST' },
          ]
          : [{ type: 'DriverStage', id: 'LIST' }],
    }),

    createDriverStage: builder.mutation<DriverRaw, Partial<DriverRaw>>({
      query: (body) => ({
        url: '/api/v1/DriverStages',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'DriverStage', id: 'LIST' }],
    }),

    updateDriverStage: builder.mutation<DriverRaw, CreateDriverDto & { driver_Id: string }>({
      query: ({ driver_Id, ...body }) => ({
        url: `/api/v1/DriverStages/${driver_Id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_, __, { driver_Id }) => [
        { type: 'DriverStage', id: driver_Id },
        { type: 'DriverStage', id: 'LIST' },
      ],
    }),
    approveeDriverStage: builder.mutation<void, string>({
      query: (driver_Id) => ({
        url: `/api/v1/DriverStages/${driver_Id}/approve`,
        method: "POST",
      }),
      invalidatesTags: (_, __, driver_Id) => [
        { type: 'DriverStage', id: driver_Id },
        { type: 'DriverStage', id: 'LIST' },
        { type: 'DriverRaw', id: 'LIST' },
      ],
    }),
    bulkUploadDriverStage: builder.mutation<any, CreateDriverDto[]>({
      query: (body) => ({
        url: "/api/v1/DriverStages/bulk-upload",
        method: "POST",
        body: body,
      }),
      invalidatesTags: [{ type: "DriverStage", id: "LIST" }],
    }),

    //  tag ==  DriverStage
    // ── GET /api/v1/Drivers ──────────────────────────────────────────────────
    getAllDrivers: builder.query<PaginatedResponse<DriverRaw>, DriverListParams>({
      query: ({ searchTerm = '', vendorName = '', location = "", sortColumn = '', sortOrder = '', page, pageSize }) => ({
        url: '/api/v1/Drivers',
        params: { searchTerm, sortColumn, sortOrder, page, pageSize, vendorName, location },
      }),
      transformResponse: (raw: any): PaginatedResponse<DriverRaw> => {
        if (Array.isArray(raw)) {
          console.log('🔍 Raw API Response from /api/v1/State:', raw);
          return {
            items: raw,
            page: 1,
            pageSize: raw.length,        // fallback
            totalCount: raw.length,
            hasNextPage: false,
            hasPrevPage: false,
          };
        }
        return raw;
      },

      providesTags: (result) =>
        result
          ? [
            ...result.items.map(({ driver_Id }) => ({ type: 'DriverRaw' as const, id: driver_Id })),
            { type: 'DriverRaw', id: 'LIST' },
          ]
          : [{ type: 'DriverRaw', id: 'LIST' }],
    }),

    // ── POST /api/v1/Drivers ─────────────────────────────────────────────────
    createDriver: builder.mutation<DriverRaw, CreateDriverDto>({
      query: (body) => ({
        url: '/api/v1/Drivers',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: [{ type: 'DriverRaw', id: 'LIST' }],
    }),

    // ── PUT /api/v1/Drivers/{driver_Id} ──────────────────────────────────────
    updateDriver: builder.mutation<DriverRaw, UpdateDriverDto>({
      query: ({ driver_Id, ...rest }) => ({
        url: `/api/v1/Drivers/${driver_Id}`,
        method: 'PUT',
        body: rest as UpdateDriverDto,
      }),
      invalidatesTags: (_result, _error, { driver_Id }) => [
        { type: 'DriverRaw', id: driver_Id },
        { type: 'DriverRaw', id: 'LIST' },
      ],
    }),

  }),
});

export const {
  useGetDriverStagesQuery,
  useCreateDriverStageMutation,
  useUpdateDriverStageMutation,
  useApproveeDriverStageMutation,
  useBulkUploadDriverStageMutation,
  useGetAllDriversQuery,
  useCreateDriverMutation,
  useUpdateDriverMutation,
} = driverApi;
