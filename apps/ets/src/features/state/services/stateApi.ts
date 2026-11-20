// FILE 2 — services/stateApi.ts

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../shared/lib/api/baseQueryWithReauth';
import type {
  State,
  CreateStateDto,
  UpdateStateDto,
  StateListParams,
  PaginatedResponse,
} from '../types/state.types';

export const stateApi = createApi({
  reducerPath: 'stateApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['State'],
  endpoints: (builder) => ({
    getAllStates: builder.query<PaginatedResponse<State>, StateListParams>({
      query: ({ searchTerm = '', sortColumn = '', sortOrder = '', page, pageSize }) => ({
        url: '/api/v1/State',
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
      // API returns a plain array — wrap it into PaginatedResponse shape
      transformResponse: (response: any): PaginatedResponse<State> => {
        // Handle both cases: if backend already returns PaginatedResponse OR just array
        if (Array.isArray(response)) {
          console.log('🔍 Raw API Response from /api/v1/State:', response);
          return {
            items: response,
            page: 1,
            pageSize: response.length,        // fallback
            totalCount: response.length,
            hasNextPage: false,
            hasPrevPage: false,
          };
        }

        // If backend returns proper paginated object
        return response;
      },

      providesTags: (result) =>
        result
          ? [
            ...(result.items || []).map(({ id }) => ({ type: 'State' as const, id })),
            { type: 'State', id: 'LIST' },
          ]
          : [{ type: 'State', id: 'LIST' }],
    }),

    getStateById: builder.query<State, string>({
      query: (id) => ({ url: `/api/v1/State/${id}` }),
      providesTags: (_result, _error, id) => [{ type: 'State', id }],
    }),

    createState: builder.mutation<State, CreateStateDto>({
      query: (body) => ({
        url: '/api/v1/State',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'State', id: 'LIST' }],
    }),

    updateState: builder.mutation<State, UpdateStateDto>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/State/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'State', id },
        { type: 'State', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAllStatesQuery,
  useGetStateByIdQuery,
  useCreateStateMutation,
  useUpdateStateMutation,
} = stateApi;