import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../shared/lib/api/baseQueryWithReauth';
import type { CreateTransEhsDto, TransEhsResponse } from '../types/transEhs.types';

export const transEhsApi = createApi({
  reducerPath: 'transEhsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['TransEhs', 'Tansporter'],
  endpoints: (builder) => ({
    // ── POST /api/v1/TransEhs ──────────────────────────────────────────────────
    createTransEhs: builder.mutation<TransEhsResponse, CreateTransEhsDto>({
      query: (body) => ({
        url: '/api/v1/TransEhs',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'TransEhs', id: 'LIST' }],
    }),
    // ── GET /api/v1/Vehicles/{id} ─────────────────────
    getVehicleByRegNo: builder.query<any, string>({
      query: (vehicleRegNo) => ({
        url: `/api/v1/Vehicles/details?registrationNo=${vehicleRegNo}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => response.result,
      providesTags: (_result, _error, id) => [{ type: 'Tansporter', id }],
    }),

  }),
});

export const { useCreateTransEhsMutation, useGetVehicleByRegNoQuery } = transEhsApi;