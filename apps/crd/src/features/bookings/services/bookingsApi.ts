// Bookings API. Static for now: queryFn serves an in-memory copy of the static
// dataset, so components use the real RTK Query hooks (caching, tags, loading
// states) exactly as they will against CrdCore. To go live, replace the two
// queryFn bodies with `query: () => "/bookings"` using crdBaseQuery.

import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Booking, NewBooking } from "../types";
import { STATIC_BOOKINGS } from "../data/bookings.static";

// Module-level store = the "server". Resets on full reload, like a fake backend.
let db: Booking[] = [...STATIC_BOOKINGS];
const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms));

export const bookingsApi = createApi({
  reducerPath: "bookingsApi",
  baseQuery: fakeBaseQuery<{ message: string }>(),
  tagTypes: ["Bookings"],
  endpoints: (builder) => ({
    getBookings: builder.query<Booking[], void>({
      async queryFn() {
        await wait();
        return { data: [...db] };
      },
      providesTags: ["Bookings"],
    }),

    createBooking: builder.mutation<Booking, NewBooking>({
      async queryFn(input) {
        await wait();
        const next = String(1000 + db.length + 1);
        const booking: Booking = { ...input, id: `BK-${next}`, status: "Pending" };
        db = [booking, ...db];
        return { data: booking };
      },
      invalidatesTags: ["Bookings"],
    }),
  }),
});

export const { useGetBookingsQuery, useCreateBookingMutation } = bookingsApi;
