import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../shared/lib/api/baseQueryWithReauth';
import type {
  Penalty,
  PenaltyApplicable,
  PenaltyApplicableOn,
  PenaltyApplicableReason,
  PenaltyCreateDto,
  PenaltyListParams,
  PenaltyReportParams,
  PenaltyListResponse,
  SelectOption,
} from '../types/penalty.types';


export const penaltyApi = createApi({
  reducerPath: 'penaltyApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Penalty'],
  endpoints: (builder) => ({

    getPenaltyApplicable: builder.query<SelectOption[], void>({
      query: () => ({
        url: '/api/v1/LkpPenaltyType/GetPenaltyApplicable',
        method: 'GET',
      }),
      transformResponse: (response: PenaltyApplicable[]): SelectOption[] =>
        response.map((item) => ({
          label: item.ApplicableName,
          value: item.ApplicableID,
        })),
    }),

    getPenaltyApplicableOn: builder.query<
      SelectOption[],
      { locCode: number; applicableID: number }
    >({
      query: ({ locCode, applicableID }) => ({
        url: '/api/v1/LkpPenaltyType/GetPenaltyApplicableOn',
        params: { locCode, applicableID },
        method: 'GET',
      }),
      transformResponse: (response: PenaltyApplicableOn[]): SelectOption[] =>
        response.map((item) => ({
          label: item.PenaltyApplicableOnName,
          value: item.PenaltyApplicableOnID,
        })),
    }),

    getPenaltyApplicableReason: builder.query<
      SelectOption[],
      { applicableID: number }
    >({
      query: ({ applicableID }) => ({
        url: '/api/v1/LkpPenaltyType/PenaltyApplicableReason',
        params: { applicableID },
        method: 'GET',
      }),
      transformResponse: (response: PenaltyApplicableReason[]): SelectOption[] =>
        response.map((item) => ({
          label: item.Penalty_type,
          value: item.PenaltyTypeid,
        })),
    }),

    // ── Main CRUD ──────────────────────────────────────────────────────────────

    getTransPenaltiesList: builder.query<PenaltyListResponse<Penalty>, PenaltyListParams>({
      query: (body) => ({
        url: '/api/v1/LkpPenaltyType/GetTransPenaltiesList',
        method: 'POST',
        body,
      }),
      transformResponse:(response:any)=>{
         return response
      },
      providesTags: (result) =>
        result
          ? [
            ...result.items.map(() => ({ type: 'Penalty' as const })),
            { type: 'Penalty', id: 'LIST' },
          ]
          : [{ type: 'Penalty', id: 'LIST' }],
    }),

    updatePenalties: builder.mutation<void, PenaltyCreateDto>({
      query: (body) => ({
        url: '/api/v1/LkpPenaltyType/UpdatePenalties',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Penalty', id: 'LIST' }],
    }),

    getPenaltyReport: builder.query<unknown, PenaltyReportParams>({
      query: (body) => ({
        url: '/api/v1/LkpPenaltyType/PenaltyReport',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetPenaltyApplicableQuery,
  useGetPenaltyApplicableOnQuery,
  useGetPenaltyApplicableReasonQuery,
  useGetTransPenaltiesListQuery,
  useUpdatePenaltiesMutation,
  useGetPenaltyReportQuery,
} = penaltyApi;
