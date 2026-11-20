import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  Vendor,
  CreateVendorDto,
  UpdateVendorDto,
  VendorListParams,
  PaginatedResponse,
} from "../types/vendor.types";

export const vendorApi = createApi({
  reducerPath: "vendorApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Vendor"],
  endpoints: (builder) => ({
    getAllVendors: builder.query<PaginatedResponse<Vendor>, VendorListParams>({
      query: ({
        searchTerm = "",
        location = "",
        vendorName = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/Vendors",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize, location, vendorName },
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.items.map(({ mstVendor_Id }) => ({
              type: "Vendor" as const,
              mstVendor_Id,
            })),
            { type: "Vendor", id: "LIST" },
          ]
          : [{ type: "Vendor", id: "LIST" }],
    }),

    getVendorById: builder.query<Vendor, string>({
      query: (id) => `/api/v1/Vendors/${id}`,
    }),

    createVendor: builder.mutation<Vendor, CreateVendorDto>({
      query: (body) => ({
        url: "/api/v1/Vendors",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Vendor", id: "LIST" }],
    }),

    updateVendor: builder.mutation<Vendor, UpdateVendorDto>({
      query: ({ mstVendor_Id, ...body }) => ({
        url: `/api/v1/Vendors/${mstVendor_Id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Vendor"],
    }),
    // PATCH /api/v1/Users/{userId}/locations — map office locations to a user
    updateVendorLocations: builder.mutation<
      void,
      { transporterId: number; locCodes: string[] }
    >({
      query: ({ transporterId, locCodes }) => ({
        url: `/api/v1/Vendors/${transporterId}/loc-codes`,
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: { locCodes },
      }),
      invalidatesTags: (_, __, { transporterId }) => [
        { type: "Vendor", id: transporterId },
        { type: "Vendor", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllVendorsQuery,
  useGetVendorByIdQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useUpdateVendorLocationsMutation
} = vendorApi;
