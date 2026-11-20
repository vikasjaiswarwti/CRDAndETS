import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../shared/lib/api/baseQueryWithReauth';
import type {
  NodalPoint,
  NodalPointCreateDto,
  NodalPointListParams,
  NodalPointEmployeeMapping,
  MappingCreateDto,
  MappingListParams,
  MappedEmployee,
  UnmappedEmployee,
  CoreResponse,
} from '../types/nodalPoint.types';

export const nodalPointApi = createApi({
  reducerPath: 'nodalPointApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['NodalPoint', 'NodalPointEmployee'],
  endpoints: (builder) => ({
    getNodalPoints: builder.query<NodalPoint[], NodalPointListParams | void>({
      query: (params) => ({ url: '/api/v1/NodalPoint', params: params ?? {} }),
      transformResponse: (res: CoreResponse<NodalPoint[]>) => res.result,
      providesTags: (result) =>
        result
          ? [...result.map((n) => ({ type: 'NodalPoint' as const, id: n.id })), { type: 'NodalPoint', id: 'LIST' }]
          : [{ type: 'NodalPoint', id: 'LIST' }],
    }),

    getNodalPointById: builder.query<NodalPoint, number>({
      query: (id) => `/api/v1/NodalPoint/${id}`,
      transformResponse: (res: CoreResponse<NodalPoint>) => res.result,
      providesTags: (_r, _e, id) => [{ type: 'NodalPoint', id }],
    }),

    createNodalPoint: builder.mutation<NodalPoint, NodalPointCreateDto>({
      query: (body) => ({ url: '/api/v1/NodalPoint', method: 'POST', body }),
      transformResponse: (res: CoreResponse<NodalPoint>) => res.result,
      invalidatesTags: [{ type: 'NodalPoint', id: 'LIST' }],
    }),

    updateNodalPoint: builder.mutation<NodalPoint, { id: number; body: NodalPointCreateDto }>({
      query: ({ id, body }) => ({ url: `/api/v1/NodalPoint/${id}`, method: 'PUT', body }),
      transformResponse: (res: CoreResponse<NodalPoint>) => res.result,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'NodalPoint', id }, { type: 'NodalPoint', id: 'LIST' }],
    }),

    deleteNodalPoint: builder.mutation<void, number>({
      query: (id) => ({ url: `/api/v1/NodalPoint/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'NodalPoint', id }, { type: 'NodalPoint', id: 'LIST' }],
    }),

    // ── Employee mapping (toggle-driven) ──
    getMappings: builder.query<NodalPointEmployeeMapping[], MappingListParams | void>({
      query: (params) => ({ url: '/api/v1/NodalPointEmployee', params: params ?? {} }),
      transformResponse: (res: CoreResponse<NodalPointEmployeeMapping[]>) => res.result,
      providesTags: (result) =>
        result
          ? [...result.map((m) => ({ type: 'NodalPointEmployee' as const, id: m.id })), { type: 'NodalPointEmployee', id: 'LIST' }]
          : [{ type: 'NodalPointEmployee', id: 'LIST' }],
    }),
    // Employees already mapped to a given nodal point (drives the mapped list)
    getMappedEmployees: builder.query<MappedEmployee[], number>({
      query: (nodalPointId) => ({
        url: '/api/v1/NodalPointEmployee/mapped',
        params: { nodalPointId },
      }),
      transformResponse: (res: CoreResponse<MappedEmployee[]>) => res.result,
      providesTags: (result) =>
        result
          ? [...result.map((m) => ({ type: 'NodalPointEmployee' as const, id: m.empId })), { type: 'NodalPointEmployee', id: 'LIST' }]
          : [{ type: 'NodalPointEmployee', id: 'LIST' }],
    }),

    // Employees not yet mapped to a given nodal point (drives the dropdown)
    getUnmappedEmployees: builder.query<UnmappedEmployee[], number>({
      query: (nodalPointId) => ({
        url: '/api/v1/NodalPointEmployee/unmapped',
        params: { nodalPointId },
      }),
      transformResponse: (res: CoreResponse<UnmappedEmployee[]>) => res.result,
      providesTags: [{ type: 'NodalPointEmployee', id: 'LIST' }],
    }),

    createMapping: builder.mutation<
      NodalPointEmployeeMapping & { message: string },
      MappingCreateDto
    >({
      query: (body) => ({ url: '/api/v1/NodalPointEmployee', method: 'POST', body }),
      transformResponse: (res: CoreResponse<NodalPointEmployeeMapping>) => ({
        ...res.result,
        message: res.message,
      }),
      invalidatesTags: [{ type: 'NodalPointEmployee', id: 'LIST' }],
    }),

    unmapEmployee: builder.mutation<string, { nodalPointId: number; empId: number }>({
      query: ({ nodalPointId, empId }) => ({
        url: '/api/v1/NodalPointEmployee',
        method: 'DELETE',
        params: { nodalPointId, empId },
      }),
      transformResponse: (res: CoreResponse<string>) => res.message,
      invalidatesTags: [{ type: 'NodalPointEmployee', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetNodalPointsQuery,
  useGetNodalPointByIdQuery,
  useCreateNodalPointMutation,
  useUpdateNodalPointMutation,
  useDeleteNodalPointMutation,
  useGetMappingsQuery,
  useGetMappedEmployeesQuery,
  useGetUnmappedEmployeesQuery,
  useCreateMappingMutation,
  useUnmapEmployeeMutation,
} = nodalPointApi;