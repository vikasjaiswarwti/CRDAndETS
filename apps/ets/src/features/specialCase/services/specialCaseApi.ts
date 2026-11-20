import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../shared/lib/api/baseQueryWithReauth';
import type {
  SpecialCase,
  CreateSpecialCaseDto,
  SpecialCaseListParams,
  PaginatedResponse,
} from '../types/specialCase.types';

export const specialCaseApi = createApi({
  reducerPath: 'specialCaseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['SpecialCase'],
  endpoints: (builder) => ({
    getAll: builder.query<PaginatedResponse<SpecialCase>, SpecialCaseListParams>({
      query: ({ searchTerm = '', sortColumn = '', sortOrder = '', page, pageSize }) => ({
        url: '/api/v1/SpecialCases',
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
      // API returns array — transform to PaginatedResponse shape
      transformResponse: (raw:any) => {
       return raw
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ specialCase_Id }) => ({ type: 'SpecialCase' as const, id: specialCase_Id })),
              { type: 'SpecialCase', id: 'LIST' },
            ]
          : [{ type: 'SpecialCase', id: 'LIST' }],
    }),

    getById: builder.query<SpecialCase, string>({
      query: (id) => `/api/v1/SpecialCases/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'SpecialCase', id }],
    }),

    create: builder.mutation<SpecialCase, CreateSpecialCaseDto>({
      query: (body) => ({
        url: '/api/v1/SpecialCases',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'SpecialCase', id: 'LIST' }],
    }),

    update: builder.mutation<{ message: string }, { id: string; body: CreateSpecialCaseDto }>({
      query: ({ id, body }) => ({
        url: `/api/v1/SpecialCases/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'SpecialCase', id },
        { type: 'SpecialCase', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetAllQuery,
  useGetByIdQuery,
  useCreateMutation,
  useUpdateMutation,
} = specialCaseApi;