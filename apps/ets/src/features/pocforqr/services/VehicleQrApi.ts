/**
 * VehicleQrApi — standalone RTK Query slice for the new "Vehicle QR" master.
 *
 * This hits a different host/port (13.206.26.255:5002) than the existing
 * compliance APIs, so it's kept as its own createApi instance with its own
 * reducerPath. Wire it into your store like:
 *
 *   import { vehicleQrApi } from "./features/vehicleCompliance/services/VehicleQrApi";
 *   export const store = configureStore({
 *     reducer: {
 *       ...otherReducers,
 *       [vehicleQrApi.reducerPath]: vehicleQrApi.reducer,
 *     },
 *     middleware: (getDefault) => getDefault().concat(vehicleQrApi.middleware),
 *   });
 *
 * If this service needs auth headers, add a `prepareHeaders` to the
 * fetchBaseQuery below (see commented example).
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = `${import.meta.env.VITE_LTRDOMAIN}/api/v1`;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface VehicleQr {
  id: number;
  vendorId: number | string;
  vehicleTypeCode: string;
  vehicleTypeDesc: string;
  driverId: number | string | null;
  currentStatusId: number | string;
  vehicleNumber: string;
  vehicleCompany: string;
  /** NOTE: the API field is literally spelled "modal" (not "model") — kept as-is to match the backend contract */
  modal: string;
  qrUniqueCode: string;
}

export interface VehicleQrListParams {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

export interface VehicleQrListResponse {
  items: VehicleQr[];
  total: number;
}

export interface DriverHistoryEntry {
  id: number;
  vehicleId: number;
  vehicleNumber?: string;
  vehicleCompany?: string;
  modal?: string;
  vendorId: number | string;
  oldDriverId: number | string | null;
  oldDriverName?: string | null;
  oldDriverNumber?: string | null;
  oldLicenceNumber?: string | null;
  newDriverId: number | string | null;
  changedOn: string;
}

// ─── Lookup types ─────────────────────────────────────────────────────────────
// Field names are guessed defensively (name/label/code/id) since the exact
// response shape wasn't provided — adjust once you see a real payload.
export interface LookupItem {
  id: number;
  name?: string;
  label?: string;
  code?: string;
  [key: string]: any;
}

export interface LookupListResponse {
  items: LookupItem[];
}

// ─── API slice ────────────────────────────────────────────────────────────────
export const vehicleQrApi = createApi({
  reducerPath: "vehicleQrApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    // prepareHeaders: (headers, { getState }) => {
    //   const token = (getState() as RootState).auth.token;
    //   if (token) headers.set("authorization", `Bearer ${token}`);
    //   return headers;
    // },
  }),
  tagTypes: ["Vehicle", "VehicleList", "DriverHistory"],
  endpoints: (builder) => ({
    // GET /Vehicle — list (with search/pagination params, if the API supports them)
    getVehicles: builder.query<
      VehicleQrListResponse,
      VehicleQrListParams | void
    >({
      query: (params) => ({
        url: "/Vehicle",
        params: params ?? undefined,
      }),
      transformResponse: (response: any): VehicleQrListResponse => {
        // API shape: { result: [...], isSuccess, message } — no pagination fields,
        // so total is just the item count.
        const items: VehicleQr[] = response?.result ?? [];
        return { items, total: items.length };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((v) => ({
                type: "Vehicle" as const,
                id: v.id,
              })),
              { type: "VehicleList" as const, id: "LIST" },
            ]
          : [{ type: "VehicleList" as const, id: "LIST" }],
    }),

    // GET /Vehicle/{id}
    getVehicleById: builder.query<VehicleQr, number>({
      query: (id) => `/Vehicle/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Vehicle", id }],
    }),

    // GET /Vehicle/qr/{qrCode}
    getVehicleByQrCode: builder.query<VehicleQr, string>({
      query: (qrCode) => `/Vehicle/qr/${encodeURIComponent(qrCode)}`,
    }),

    // POST /Vehicle
    createVehicle: builder.mutation<VehicleQr, Partial<VehicleQr>>({
      query: (body) => ({
        url: "/Vehicle",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "VehicleList", id: "LIST" }],
    }),

    // PUT /Vehicle/{id}
    updateVehicle: builder.mutation<
      VehicleQr,
      Partial<VehicleQr> & { id: number }
    >({
      query: ({ id, ...body }) => ({
        url: `/Vehicle/${id}`,
        method: "PUT",
        body: { id, ...body },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Vehicle", id },
        { type: "VehicleList", id: "LIST" },
      ],
    }),

    // POST /Vehicle/{id}/qr/regenerate
    // regenerateQr: builder.mutation<VehicleQr, number>({
    //   query: (id) => ({
    //     url: `/Vehicle/${id}/qr/regenerate`,
    //     method: "POST",
    //   }),
    //   invalidatesTags: (_r, _e, id) => [
    //     { type: "Vehicle", id },
    //     { type: "VehicleList", id: "LIST" },
    //   ],
    // }),

    regenerateQr: builder.mutation<VehicleQr, number>({
      query: (id) => ({
        url: `/Vehicle/${id}/qr/regenerate`,
        method: "POST",
      }),
      // API shape: { result: {...VehicleQr}, isSuccess, message }
      transformResponse: (response: any): VehicleQr =>
        response?.result ?? response,
      invalidatesTags: (_r, _e, id) => [
        { type: "Vehicle", id },
        { type: "VehicleList", id: "LIST" },
      ],
    }),

    // GET /Vehicle/{id}/qr-image — fetched as a blob, exposed as an object URL
    getVehicleQrImage: builder.query<string, number>({
      query: (id) => ({
        url: `/Vehicle/${id}/qr-image`,
        responseHandler: (response: Response) => response.blob(),
      }),
      transformResponse: (blob: Blob) => URL.createObjectURL(blob),
      // Revoke the object URL once this cache entry is dropped, to avoid leaking memory
      async onCacheEntryAdded(
        _id,
        { cacheDataLoaded, cacheEntryRemoved, getCacheEntry },
      ) {
        try {
          await cacheDataLoaded;
        } catch {
          return;
        }
        await cacheEntryRemoved;
        const url = getCacheEntry().data;
        if (url) URL.revokeObjectURL(url);
      },
    }),

    // PUT /Vehicle/{id}/driver
    assignDriver: builder.mutation<
      VehicleQr,
      { id: number; driverId: number | string }
    >({
      query: ({ id, driverId }) => ({
        url: `/Vehicle/${id}/driver`,
        method: "PUT",
        body: { driverId },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Vehicle", id },
        { type: "VehicleList", id: "LIST" },
        { type: "DriverHistory", id },
      ],
    }),

    // GET /Vehicle/{id}/driver-history
    // getDriverHistory: builder.query<DriverHistoryEntry[], number>({
    //   query: (id) => `/Vehicle/${id}/driver-history`,
    //   transformResponse: (response: any): DriverHistoryEntry[] =>
    //     Array.isArray(response) ? response : (response?.items ?? []),
    //   providesTags: (_r, _e, id) => [{ type: "DriverHistory", id }],
    // }),
    // GET /Vehicle/{id}/driver-history
    getDriverHistory: builder.query<DriverHistoryEntry[], number>({
      query: (id) => `/Vehicle/${id}/driver-history`,
      // API shape: { result: [...], isSuccess, message }
      transformResponse: (response: any): DriverHistoryEntry[] =>
        Array.isArray(response)
          ? response
          : (response?.result ?? response?.items ?? []),
      providesTags: (_r, _e, id) => [{ type: "DriverHistory", id }],
    }),

    // GET /CurrentStatus
    getCurrentStatuses: builder.query<LookupListResponse, void>({
      query: () => "/CurrentStatus",
      transformResponse: (response: any): LookupListResponse => {
        const items = Array.isArray(response)
          ? response
          : (response?.result ?? []);
        return { items };
      },
    }),

    // GET /VehicleType
    getVehicleTypes: builder.query<LookupListResponse, void>({
      query: () => "/VehicleType",
      transformResponse: (response: any): LookupListResponse => {
        const items = Array.isArray(response)
          ? response
          : (response?.result ?? []);
        return { items };
      },
    }),
  }),
});

export const {
  useGetVehiclesQuery,
  useGetVehicleByIdQuery,
  useLazyGetVehicleByQrCodeQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useRegenerateQrMutation,
  useGetVehicleQrImageQuery,
  useAssignDriverMutation,
  useGetDriverHistoryQuery,

  useGetCurrentStatusesQuery,
  useGetVehicleTypesQuery,
} = vehicleQrApi;
