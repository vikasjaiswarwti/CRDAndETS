import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  Process,
  CreateProcessDto,
  UpdateProcessDto,
  ProcessListParams,
  PaginatedResponse,
} from "../types/process.types";

export const processApi = createApi({
  reducerPath: "processApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Process"],
  endpoints: (builder) => ({
    getAllProcesses: builder.query<
      PaginatedResponse<Process>,
      ProcessListParams
    >({
      query: (args) => {
        const params = {
          searchTerm: args.searchTerm ?? "",
          sortColumn: args.sortColumn ?? "",
          sortOrder: args.sortOrder ?? "",
          page: args.page ?? 1,
          pageSize: args.pageSize ?? 10,
        };
        console.log("🌐 Making API request with params:", params);
        return {
          url: "/api/v1/LkpProcess",
          params,
        };
      },

      // Important: Add this to ensure the query runs
      keepUnusedDataFor: 60, // Keep data in cache for 60 seconds

      // More defensive transformResponse
      transformResponse: (raw: any): PaginatedResponse<Process> => {
        console.log("🔥 RAW API RESPONSE:", raw);

        // Ensure we're returning the correct structure
        const response = {
          items: Array.isArray(raw?.items) ? raw.items : [],
          total: typeof raw?.totalCount === "number" ? raw.totalCount : 0,
          page: typeof raw?.page === "number" ? raw.page : 1,
          pageSize: typeof raw?.pageSize === "number" ? raw.pageSize : 10,
        };

        console.log("✅ TRANSFORMED RESPONSE:", response);

        // IMPORTANT: Return the response directly
        return response;
      },

      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ id }) => ({
                type: "Process" as const,
                id,
              })),
              { type: "Process", id: "LIST" },
            ]
          : [{ type: "Process", id: "LIST" }],
    }),

    // ... other endpoints

    getProcessById: builder.query<Process, string>({
      query: (id) => ({ url: `/api/v1/LkpProcess/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "Process", id }],
    }),

    createProcess: builder.mutation<Process, CreateProcessDto>({
      query: (body) => ({ url: "/api/v1/LkpProcess", method: "POST", body }),
      invalidatesTags: [{ type: "Process", id: "LIST" }],
    }),

    updateProcess: builder.mutation<Process, UpdateProcessDto>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/LkpProcess/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Process", id },
        { type: "Process", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllProcessesQuery,
  useGetProcessByIdQuery,
  useCreateProcessMutation,
  useUpdateProcessMutation,
} = processApi;
