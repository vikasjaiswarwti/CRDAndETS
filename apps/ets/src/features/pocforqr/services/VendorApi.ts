/**
 * VendorApi — RTK Query slice for Vendor CRUD (:5002/api/v1/Vendor).
 *
 * Kept as its own standalone createApi (own reducerPath), same pattern as
 * VehicleQrApi — add its reducer + middleware to your store the same way.
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = `${import.meta.env.VITE_LTRDOMAIN}/api/v1`;

export interface Vendor {
  id: number;
  name: string;
  contactNumber: string;
  email?: string | null;
  address?: string | null;
  isActive: boolean;
}

export interface VendorListResponse {
  items: Vendor[];
  total: number;
}

export const vendorApi = createApi({
  reducerPath: "VendorQRFlow",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Vendor", "VendorList"],
  endpoints: (builder) => ({
    // GET /Vendor
    getVendors: builder.query<VendorListResponse, void>({
      query: () => "/Vendor",
      transformResponse: (response: any): VendorListResponse => {
        // Handles either a bare array or the { result: [...] } envelope
        const items: Vendor[] = Array.isArray(response)
          ? response
          : (response?.result ?? []);
        return { items, total: items.length };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((v) => ({
                type: "Vendor" as const,
                id: v.id,
              })),
              { type: "VendorList" as const, id: "LIST" },
            ]
          : [{ type: "VendorList" as const, id: "LIST" }],
    }),

    // GET /Vendor/{id}
    getVendorById: builder.query<Vendor, number>({
      query: (id) => `/Vendor/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Vendor", id }],
    }),

    // POST /Vendor
    createVendor: builder.mutation<Vendor, Partial<Vendor>>({
      query: (body) => ({
        url: "/Vendor",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "VendorList", id: "LIST" }],
    }),

    // PUT /Vendor/{id}
    updateVendor: builder.mutation<Vendor, Partial<Vendor> & { id: number }>({
      query: ({ id, ...body }) => ({
        url: `/Vendor/${id}`,
        method: "PUT",
        body: { id, ...body },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Vendor", id },
        { type: "VendorList", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useGetVendorByIdQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
} = vendorApi;
