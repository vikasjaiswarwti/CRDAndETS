import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../shared/lib/api/baseQueryWithReauth';
import type {
  VendorTripSummaryResponse,
  VendorTripListParams,
} from '../types/vendorTrip.types';

// ─── API tag type ──────────────────────────────────────────────────────────────
const TAG = 'VendorTrip' as const;
export interface AllocateVendorTripRequest {
  dsId: number;
  vehicleId: number;
  driverId: number;
}

export interface AllocateVendorTripResponse {
  success: boolean;
  message: string;
  result: unknown;
}

// ─── Raw API response shape (may differ from PaginatedResponse<T>) ────────────

export const vendorTripApi = createApi({
  reducerPath: 'vendorTripApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [TAG, "MstShift"],

  endpoints: (builder) => ({
    // ── GET LIST ──────────────────────────────────────────────────────────────
    getVendorTrip: builder.query<VendorTripSummaryResponse, VendorTripListParams>({
      query: ({
        fromDate,
        toDate,
        shiftId,
        tripType,
        locCode,
        page,
        pageSize,
      }) => ({
        url: '/api/v1/VendorServices/getVendorTrip',
        params: { fromDate, toDate, shiftId, tripType, locCode, page, pageSize },
      }),
      providesTags: [{ type: TAG, id: 'LIST' }],
    }),
    getMstShift: builder.query<any, { locCode: number }>({
      query: ({ locCode }) => ({
        url: "/api/v1/MstShiftControl/GetUserShiftWeb",
        params: {
          locCode: locCode,
          page: 1,
          pageSize: 1000,
        },
      }),
      transformResponse: (response: { result: any[]; isSuccess: boolean; message: string }) =>
        response.result, // ✅ unwrap — now shiftOptions is directly the array
      providesTags: [{ type: "MstShift" as const, id: "LIST" }],
    }),
    getAvailableDriver: builder.query<any, { dsId: number }>({
      query: ({
        dsId
      }) => ({
        url: `/api/v1/VendorServices/trips/${dsId}/available-drivers`,
      }),
      transformResponse: (
        response: {
          driverId: number;
          driverName: string;
          mobileNo: string;
        }[]
      ) => {
        return response.map((driver) => ({
          label: `${driver.driverName} (${driver.mobileNo})`,
          value: driver.driverId,
        }));
      },
      providesTags: [{ type: TAG, id: 'LIST' }],
    }),
    getAvailableVehicle: builder.query<any, { dsId: number }>({
      query: ({
        dsId
      }) => ({
        url: `/api/v1/VendorServices/trips/${dsId}/available-vehicles`,
      }),
      providesTags: [{ type: TAG, id: 'LIST' }],
    }),
    allocateVendorTrip: builder.mutation<
      AllocateVendorTripResponse,
      AllocateVendorTripRequest
    >({
      query: (body) => ({
        url: "/api/v1/VendorServices/allocate",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "VendorTrip", id: "LIST" }],
    }),
  }),
});

export const {
  useGetVendorTripQuery,
  useLazyGetVendorTripQuery,
  useGetAvailableVehicleQuery,
  useGetAvailableDriverQuery,
  useGetMstShiftQuery,
  useAllocateVendorTripMutation,
} = vendorTripApi;