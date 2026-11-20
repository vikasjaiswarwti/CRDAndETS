/**
 * BookingApi — RTK Query slice for Booking (:5002/api/v1/Booking).
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = `${import.meta.env.VITE_LTRDOMAIN}/api/v1`;

export interface Booking {
  id: number;
  userId: number;
  vehicleId: number;
  tripId: number;
  vehicleNumber: string;
  modal: string;
  driverNumber: string;
  driverName: string;
  pickLatitude: number;
  pickLongitude: number;
  dropLatitude: number;
  dropLongitude: number;
  status: string;
  purpose?: string | null;
  startTime: string;
  endTime: string;
  bookedOn: string;
  modifiedOn: string;
  userName: string;
  employeeCode: string;
  userMobileNumber: string;
}

export interface BookingListParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}

export interface BookingListResponse {
  items: Booking[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const bookingApi = createApi({
  reducerPath: "bookingApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["Booking", "BookingList"],
  endpoints: (builder) => ({
    // GET /Booking?pageNumber=&pageSize=&search= — paginated, searchable bookings
    getBookings: builder.query<BookingListResponse, BookingListParams | void>({
      query: (params) => ({
        url: "/Booking",
        params: {
          pageNumber: params?.pageNumber ?? 1,
          pageSize: params?.pageSize ?? 10,
          search: params?.search ?? "",
        },
      }),
      // API shape: { result: { items, page, pageSize, totalCount, hasNextPage, hasPrevPage }, isSuccess, message }
      transformResponse: (response: any): BookingListResponse => {
        const result = response?.result ?? {};
        const items: Booking[] = Array.isArray(result)
          ? result
          : (result?.items ?? []);
        return {
          items,
          page: result?.page ?? 1,
          pageSize: result?.pageSize ?? items.length,
          totalCount: result?.totalCount ?? items.length,
          hasNextPage: result?.hasNextPage ?? false,
          hasPrevPage: result?.hasPrevPage ?? false,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((b) => ({
                type: "Booking" as const,
                id: b.id,
              })),
              { type: "BookingList" as const, id: "LIST" },
            ]
          : [{ type: "BookingList" as const, id: "LIST" }],
    }),

    // GET /Booking/export?search= — all matching bookings as an .xlsx file (no pagination)
    exportBookings: builder.query<Blob, { search?: string } | void>({
      query: (params) => ({
        url: "/Booking/export",
        params: { search: params?.search ?? "" },
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
  }),
});

export const { useGetBookingsQuery, useLazyExportBookingsQuery } = bookingApi;
