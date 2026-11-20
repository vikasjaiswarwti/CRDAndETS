import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../shared/lib/api/baseQueryWithReauth';
import type {
  RouteTableItem,
  RouteTableCreateDto,
  RouteTableUpdateDto,
  RouteTableListParams,
  CoreResponse,
} from '../types/routeTable.types';

export const routeTableApi = createApi({
  reducerPath: 'routeTableApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['RouteTable'],
  endpoints: (builder) => ({
    getRoutes: builder.query<RouteTableItem[], RouteTableListParams | void>({
      query: (params) => ({ url: '/api/v1/routetable/filter', params: params ?? {} }),
      transformResponse: (res: CoreResponse<RouteTableItem[]>) => res.result,
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({ type: 'RouteTable' as const, id: r.routeId })),
              { type: 'RouteTable', id: 'LIST' },
            ]
          : [{ type: 'RouteTable', id: 'LIST' }],
    }),

    getRouteById: builder.query<RouteTableItem, number>({
      query: (routeId) => `/api/v1/RouteTable/${routeId}`,
      transformResponse: (res: CoreResponse<RouteTableItem>) => res.result,
      providesTags: (_r, _e, routeId) => [{ type: 'RouteTable', id: routeId }],
    }),

    createRoute: builder.mutation<RouteTableItem, RouteTableCreateDto>({
      query: (body) => ({ url: '/api/v1/RouteTable', method: 'POST', body }),
      transformResponse: (res: CoreResponse<RouteTableItem>) => res.result,
      invalidatesTags: [{ type: 'RouteTable', id: 'LIST' }],
    }),

    updateRoute: builder.mutation<RouteTableItem, RouteTableUpdateDto>({
      query: ({ routeId, ...body }) => ({
        url: `/api/v1/RouteTable/${routeId}`,
        method: 'PUT',
        body: { routeId, ...body },
      }),
      transformResponse: (res: CoreResponse<RouteTableItem>) => res.result,
      invalidatesTags: (_r, _e, { routeId }) => [
        { type: 'RouteTable', id: routeId },
        { type: 'RouteTable', id: 'LIST' },
      ],
    }),

    deleteRoute: builder.mutation<void, number>({
      query: (routeId) => ({ url: `/api/v1/RouteTable/${routeId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, routeId) => [
        { type: 'RouteTable', id: routeId },
        { type: 'RouteTable', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetRoutesQuery,
  useGetRouteByIdQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
} = routeTableApi;
