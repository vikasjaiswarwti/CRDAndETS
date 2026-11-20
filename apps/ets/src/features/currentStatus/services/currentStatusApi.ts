import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../shared/lib/api/baseQueryWithReauth';
import type {
  CurrentStatusRaw,
  CurrentStatusListParams,
  CreateCurrentStatusDto,
  UpdateCurrentStatusDto,
  PaginatedResponse,
} from '../types/currentStatus.types';

// ─── The list endpoint returns a plain array (not paginated envelope) ─────────
// We normalize it into PaginatedResponse<CurrentStatus> via transformResponse.


export const currentStatusApi = createApi({
  reducerPath: 'currentStatusApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['CurrentStatus'],
  endpoints: (builder) => ({

    // ── GET /api/v1/CurrentStatuses ───────────────────────────────────────────
    getAllCurrentStatuses: builder.query<PaginatedResponse<CurrentStatusRaw>, CurrentStatusListParams>({
      query: ({ searchTerm = '', sortColumn = '', sortOrder = '', page, pageSize }) => ({
        url: '/api/v1/CurrentStatuses',
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
      transformResponse: (response: any): PaginatedResponse<CurrentStatusRaw> => {
        return response;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.items.map(({ currentStatus_Id }) => ({ type: 'CurrentStatus' as const, currentStatus_Id })),
            { type: 'CurrentStatus', id: 'LIST' },
          ]
          : [{ type: 'CurrentStatus', id: 'LIST' }],
    }),

    // ── POST /api/v1/CurrentStatuses ──────────────────────────────────────────
    createCurrentStatus: builder.mutation<CurrentStatusRaw, CreateCurrentStatusDto>({
      query: (body) => ({
        url: '/api/v1/CurrentStatuses',
        method: 'POST',
        body: { statusName: body.statusName },
      }),
      invalidatesTags: [{ type: 'CurrentStatus', id: 'LIST' }],
    }),

    // ── PUT /api/v1/CurrentStatuses/{currentStatus_Id} ────────────────────────
    updateCurrentStatus: builder.mutation<CurrentStatusRaw, UpdateCurrentStatusDto>({
      query: ({ currentStatus_Id, statusName, status }) => ({
        url: `/api/v1/CurrentStatuses/${currentStatus_Id}`,
        method: 'PUT',
        body: { statusName, status },
      }),
      invalidatesTags: (_result, _error, { currentStatus_Id }) => [
        { type: 'CurrentStatus', currentStatus_Id },
        { type: 'CurrentStatus', id: 'LIST' },
      ],
    }),

  }),
});

export const {
  useGetAllCurrentStatusesQuery,
  useCreateCurrentStatusMutation,
  useUpdateCurrentStatusMutation,
} = currentStatusApi;