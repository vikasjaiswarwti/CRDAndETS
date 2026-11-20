/**
 * FleetDriverApi — RTK Query slice for Driver CRUD (:5002/api/v1/Driver).
 *
 * Named "FleetDriver" (not "Driver") to avoid clashing with the existing
 * compliance module's DrivercomplianceApi — these are two separate driver
 * masters on two separate backends.
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = `${import.meta.env.VITE_LTRDOMAIN}/api/v1`;

export interface FleetDriver {
  id: number;
  vendorId: number | string;
  driverName: string;
  driverNumber: string;
  dob: string;
  licenceNumber: string;
  currentStatusId: number | string;
}

export interface FleetDriverListResponse {
  items: FleetDriver[];
  total: number;
}

export const fleetDriverApi = createApi({
  reducerPath: "fleetDriverApi",

  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),

  tagTypes: ["FleetDriver", "FleetDriverList"],

  endpoints: (builder) => ({
    // GET /Driver
    getFleetDrivers: builder.query<FleetDriverListResponse, void>({
      query: () => "/Driver",
      transformResponse: (response: any): FleetDriverListResponse => {
        const items: FleetDriver[] = Array.isArray(response)
          ? response
          : (response?.result ?? []);
        return { items, total: items.length };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((d) => ({
                type: "FleetDriver" as const,
                id: d.id,
              })),
              { type: "FleetDriverList" as const, id: "LIST" },
            ]
          : [{ type: "FleetDriverList" as const, id: "LIST" }],
    }),

    // GET /Driver/{id}
    getFleetDriverById: builder.query<FleetDriver, number>({
      query: (id) => `/Driver/${id}`,
      providesTags: (_r, _e, id) => [{ type: "FleetDriver", id }],
    }),

    // POST /Driver
    createFleetDriver: builder.mutation<FleetDriver, Partial<FleetDriver>>({
      query: (body) => ({
        url: "/Driver",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "FleetDriverList", id: "LIST" }],
    }),

    // PUT /Driver/{id}
    updateFleetDriver: builder.mutation<
      FleetDriver,
      Partial<FleetDriver> & { id: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/Driver/${id}`,
        method: "PUT",
        body: { id, ...body },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "FleetDriver", id },
        { type: "FleetDriverList", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetFleetDriversQuery,
  useGetFleetDriverByIdQuery,
  useCreateFleetDriverMutation,
  useUpdateFleetDriverMutation,
} = fleetDriverApi;
