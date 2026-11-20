// import { createApi } from "@reduxjs/toolkit/query/react";
// import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
// import type {
//   PaginatedResponse,
//   VendorSupervisor,
//   CreateVendorSupervisorDto,
//   UpdateVendorSupervisorDto,
//   VendorSupervisorListParams,
//   MyTransporterIdResponse,
// } from "../types/vendorSupervisor.types";

// const TAG = "VendorSupervisor" as const;

// export const vendorSupervisorApi = createApi({
//   reducerPath: "vendorSupervisorApi",
//   baseQuery: baseQueryWithReauth,
//   tagTypes: [TAG],
//   endpoints: (builder) => ({
//     // ── POST /VendorSuperVisors ───────────────────────────────────────────────
//     // Body: { firstName, lastName, mobileNo, emailId, locCode, transporterIds: number[] }
//     createVendorSupervisor: builder.mutation<void, CreateVendorSupervisorDto>({
//       query: (body) => ({
//         url: "/api/v1/VendorSuperVisors",
//         method: "POST",
//         body,
//       }),
//       invalidatesTags: [{ type: TAG, id: "LIST" }],
//     }),

//     // ── PUT /VendorSuperVisors/{empId} ──────────────────────────────────────
//     // Path param is empId (number).
//     // Body: { transporterIds: number[], active?: boolean }
//     updateVendorSupervisor: builder.mutation<
//       void,
//       { empId: number; body: UpdateVendorSupervisorDto }
//     >({
//       query: ({ empId, body }) => ({
//         url: `/api/v1/VendorSuperVisors/${empId}`,
//         method: "PUT",
//         body,
//       }),
//       invalidatesTags: [{ type: TAG, id: "LIST" }],
//     }),

//     // ── GET /VendorSuperVisors/vendor-supervisors ─────────────────────────────
//     getAll: builder.query<
//       PaginatedResponse<VendorSupervisor>,
//       VendorSupervisorListParams
//     >({
//       query: ({
//         searchTerm = "",
//         sortColumn = "",
//         sortOrder = "",
//         page,
//         pageSize,
//       }) => ({
//         url: "/api/v1/VendorSuperVisors/vendor-supervisors",
//         params: { searchTerm, sortColumn, sortOrder, page, pageSize },
//       }),
//       transformResponse: (raw: any): PaginatedResponse<VendorSupervisor> => ({
//         items: raw.items ?? raw.data ?? [],
//         total: raw.total ?? raw.totalCount ?? 0,
//         page: raw.page ?? 1,
//         pageSize: raw.pageSize ?? 10,
//       }),
//       providesTags: (result) =>
//         result
//           ? [
//               ...result.items.map(({ supervisorTransporterMap_Id }) => ({
//                 type: TAG,
//                 id: supervisorTransporterMap_Id,
//               })),
//               { type: TAG, id: "LIST" },
//             ]
//           : [{ type: TAG, id: "LIST" }],
//     }),

//     // ── GET /VendorSuperVisors/my-transporter-id ──────────────────────────────
//     // Called once after login when role = "vendor".
//     // Returns the transporter(s) this vendor supervisor is mapped to.
//     getMyTransporterId: builder.query<MyTransporterIdResponse, void>({
//       query: () => "/api/v1/VendorSuperVisors/my-transporter-id",
//       transformResponse: (raw: any): MyTransporterIdResponse => {
//         // Handle all possible response shapes from the backend
//         if (Array.isArray(raw)) {
//           return { transporterIds: raw, transporterId: raw[0] ?? null };
//         }
//         return {
//           transporterId: raw?.transporterId ?? raw?.id ?? null,
//           transporterIds:
//             raw?.transporterIds ??
//             (raw?.transporterId ? [raw.transporterId] : null),
//         };
//       },
//       keepUnusedDataFor: Infinity,
//     }),
//   }),
// });

// export const {
//   useCreateVendorSupervisorMutation,
//   useUpdateVendorSupervisorMutation,
//   useGetAllQuery,
//   useGetMyTransporterIdQuery,
// } = vendorSupervisorApi;

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  PaginatedResponse,
  VendorSupervisor,
  CreateVendorSupervisorDto,
  UpdateVendorSupervisorDto,
  VendorSupervisorListParams,
  MyTransporterIdResponse,
} from "../types/vendorSupervisor.types";

const TAG = "VendorSupervisor" as const;

export const vendorSupervisorApi = createApi({
  reducerPath: "vendorSupervisorApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [TAG],
  endpoints: (builder) => ({
    // ── POST /VendorSuperVisors ───────────────────────────────────────────────
    // Body: { firstName, lastName, mobileNo, emailId, locCode, transporterIds: number[] }
    createVendorSupervisor: builder.mutation<void, CreateVendorSupervisorDto>({
      query: (body) => ({
        url: "/api/v1/VendorSuperVisors",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: TAG, id: "LIST" }],
    }),

    // ── PUT /VendorSuperVisors/{empId} ──────────────────────────────────────
    // Path param is empId (number).
    // Body: { transporterIds: number[], active?: boolean }
    updateVendorSupervisor: builder.mutation<
      void,
      { empId: number; body: UpdateVendorSupervisorDto }
    >({
      query: ({ empId, body }) => ({
        url: `/api/v1/VendorSuperVisors/${empId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: TAG, id: "LIST" }],
    }),

    // ── GET /VendorSuperVisors/vendor-supervisors ─────────────────────────────
    getAll: builder.query<
      PaginatedResponse<VendorSupervisor>,
      VendorSupervisorListParams
    >({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/VendorSuperVisors/vendor-supervisors",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
      transformResponse: (raw: any): PaginatedResponse<VendorSupervisor> => ({
        items: raw.items ?? raw.data ?? [],
        total: raw.total ?? raw.totalCount ?? 0,
        page: raw.page ?? 1,
        pageSize: raw.pageSize ?? 10,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ supervisorTransporterMap_Id }) => ({
                type: TAG,
                id: supervisorTransporterMap_Id,
              })),
              { type: TAG, id: "LIST" },
            ]
          : [{ type: TAG, id: "LIST" }],
    }),

    // ── GET /VendorSuperVisors/my-transporter-id ──────────────────────────────
    // Called once after login when role = "vendor".
    // Returns the transporter(s) this vendor supervisor is mapped to.
    getMyTransporterId: builder.query<MyTransporterIdResponse, void>({
      query: () => "/api/v1/VendorSuperVisors/my-transporter-id",
      transformResponse: (raw: any): MyTransporterIdResponse => {
        // Handle all possible response shapes from the backend
        if (Array.isArray(raw)) {
          return {
            transporterIds: raw,
            transporterId: raw[0] ?? null,
            transporters: [],
          };
        }
        const ids: number[] =
          raw?.transporterIds ??
          (raw?.transporterId ? [raw.transporterId] : []);
        return {
          transporterId: ids[0] ?? raw?.transporterId ?? null,
          transporterIds: ids.length ? ids : null,
          // Capture the full named list — used to build vendor-side selector
          transporters: raw?.transporters ?? [],
        };
      },
      keepUnusedDataFor: Infinity,
    }),
  }),
});

export const {
  useCreateVendorSupervisorMutation,
  useUpdateVendorSupervisorMutation,
  useGetAllQuery,
  useGetMyTransporterIdQuery,
} = vendorSupervisorApi;
