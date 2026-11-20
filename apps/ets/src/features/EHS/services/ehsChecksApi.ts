import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../shared/lib/api/baseQueryWithReauth';
import type {
    EhsCheck,
    CreateEhsCheckDto,
    PaginatedResponse,
    EhsCheckListParams,
} from '../types/ehsChecks.types';

// ─── Tag Type ─────────────────────────────────────────────────────────────────
const TAG = 'EhsCheck' as const;

// ─── API Slice ────────────────────────────────────────────────────────────────
export const ehsChecksApi = createApi({
    reducerPath: 'ehsChecksApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: [TAG],

    endpoints: (builder) => ({
        // ── GET list (array → normalised to PaginatedResponse) ──────────────────
        // The API returns a raw array, NOT a paginated envelope.
        // We use transformResponse to normalise it so the rest of the app
        // always works with { items, total, page, pageSize }.
        getAll: builder.query<PaginatedResponse<EhsCheck>, EhsCheckListParams>({
            query: ({
                searchTerm = "",
                sortColumn = "",
                sortOrder = "",
                page = 1,
                pageSize = 10,
            }) => ({
                url: '/api/v1/EhsChecks',
                params: { searchTerm, sortColumn, sortOrder, page, pageSize },
            }),
            // Normalise raw array → paginated envelope
            transformResponse: (raw: any): PaginatedResponse<EhsCheck> => {
                return raw;
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.items.map(({ ehs_Id }) => ({
                            type: TAG,
                            id: ehs_Id,
                        })),
                        { type: TAG, id: 'LIST' },
                    ]
                    : [{ type: TAG, id: 'LIST' }],
        }),

        // ── POST create ─────────────────────────────────────────────────────────
        create: builder.mutation<EhsCheck, CreateEhsCheckDto>({
            query: (body) => ({
                url: '/api/v1/EhsChecks',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: TAG, id: 'LIST' }],
        }),

    }),
});

export const {
    useGetAllQuery,
    useCreateMutation,
} = ehsChecksApi;