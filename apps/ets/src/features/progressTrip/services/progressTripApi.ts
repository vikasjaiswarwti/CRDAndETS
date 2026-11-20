import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type { OngoingTripsResult, TripPassenger, MultitripResponse, RawTripLifeCycleResponse, TripLifeCycleRequest, TripLifeCycleResponse, TripLifeCycleDetailsResponse } from "../types/progressTrip.types";

// ─── Request contract ──────────────────────────────────────────────────────
// Frontend-facing shape stays camelCase (idiomatic TS) — mapped to the
// backend's actual PascalCase querystring param names at the query boundary
// below. Confirmed against:
//   curl '.../api/v1/Tracking/ongoing?FromDate=&ToDate=&FilterId=&SearchDsId=1' --request POST
export interface OngoingTripsRequest {
    fromDate?: string;
    toDate?: string;
    filterId?: string;
    searchDsId?: string | null;
    tripType?: string | number | null;
    locCode?: string | number | null;
    shiftId?: number | null;
}
export interface PolylineMultiRequest {
    dsIds: number[];
}

export const progressTripApi = createApi({
    reducerPath: "progressTripApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["ProgressTrip"],
    endpoints: (builder) => ({
        getOngoingTrips: builder.query<OngoingTripsResult, OngoingTripsRequest>({
            query: ({ fromDate, toDate, filterId, tripType, shiftId, locCode }) => ({
                url: "/api/v1/Tracking/ongoing",
                method: "POST",
                body: {
                    FromDate: fromDate ?? "",
                    ToDate: toDate ?? "",
                    FilterId: filterId ?? "",
                    SearchDsId: null, // searchDsId ?? "",
                    tripType: tripType,
                    shiftId: shiftId,
                    locCode: locCode,
                },
            }),
            transformResponse: (res: any) => {
                return res;
            },
            providesTags: ["ProgressTrip"],
        }),
        getPassengerDetails: builder.query<TripPassenger[], number | string>({
            query: (dsId) => ({
                url: "/api/v1/Tracking/passengers",
                params: {
                    DsId: dsId,
                },
            }),
        }),
        getPolylineMulti: builder.query<MultitripResponse, PolylineMultiRequest>({
            query: ({ dsIds }) => ({
                url: "/api/v1/Tracking/polyline-multi",
                method: "POST",
                body: {
                    dsIds,
                },
            }),
        }),
        getTripLifeCycle: builder.query<TripLifeCycleResponse, TripLifeCycleRequest>({
            query: (body) => ({
                url: "/api/v1/Tracking/TripLifeCycle",
                method: "POST",
                body,
            }),
            transformResponse: (
                response: RawTripLifeCycleResponse[],
            ): TripLifeCycleResponse => {
                const item = response[0];

                return {
                    stages: [
                        JSON.parse(item.routing),
                        JSON.parse(item.generation),
                        JSON.parse(item.pre_Trip),
                        JSON.parse(item.in_Progress),
                        JSON.parse(item.completed),
                    ],

                    kpis: {
                        womenTravellingAlone: item.womenTravellingAlone,
                        adhocTrips: item.adhocTrips,
                        pendingDropVerification: item.pendingDropVerification,
                    },
                };
            },
        }),
        getTripLifeCycleDetails: builder.query<TripLifeCycleDetailsResponse, TripLifeCycleRequest>({
            query: (body) => ({
                url: "/api/v1/Tracking/TripLifeCycleDetails",
                method: "POST",
                body,
            }),
            transformResponse: (response: unknown): TripLifeCycleDetailsResponse => {
                const payload = Array.isArray(response)
                    ? response[0]
                    : (response as { result?: unknown })?.result ?? response;
                const data = Array.isArray(payload) ? payload[0] : payload;
                const kpis = (data ?? {}) as Record<string, unknown>;
                const parseDetails = (value: unknown) => {
                    if (Array.isArray(value)) return value as TripLifeCycleDetailsResponse["adhocTripDetails"];
                    if (typeof value === "number") return [];
                    if (typeof value !== "string" || !value.trim()) return [];
                    try {
                        const parsed = JSON.parse(value);
                        return Array.isArray(parsed) ? parsed : [];
                    } catch {
                        return [];
                    }
                };
                const womenTravellingAloneDetails = parseDetails(kpis.womenTravellingAlone);
                const adhocTripDetails = parseDetails(kpis.adhocTrips);
                const escortTripDetails = parseDetails(kpis.escortTrips);
                const delayedVehicleCompletedTripDetails = parseDetails(
                    kpis.delayedVehicleCompletedTrips,
                );

                return {
                    womenTravellingAlone:
                        typeof kpis.womenTravellingAlone === "number"
                            ? kpis.womenTravellingAlone
                            : typeof kpis.womenTravellingAlone === "string" &&
                                /^\d+$/.test(kpis.womenTravellingAlone.trim())
                              ? Number(kpis.womenTravellingAlone)
                            : womenTravellingAloneDetails.length,
                    adhocTrips:
                        typeof kpis.adhocTrips === "number"
                            ? kpis.adhocTrips
                            : typeof kpis.adhocTrips === "string" &&
                                /^\d+$/.test(kpis.adhocTrips.trim())
                              ? Number(kpis.adhocTrips)
                            : adhocTripDetails.length,
                    pendingDropVerification:
                        Number(kpis.pendingDropVerification ?? 0) || 0,
                    escortTrips: escortTripDetails.length,
                    delayedVehicleCompletedTrips:
                        delayedVehicleCompletedTripDetails.length,
                    womenTravellingAloneDetails,
                    adhocTripDetails,
                    escortTripDetails,
                    delayedVehicleCompletedTripDetails,
                };
            },
        }),
    }),
});

export const {
    useGetOngoingTripsQuery,
    useGetPassengerDetailsQuery,
    useLazyGetPassengerDetailsQuery,
    useGetPolylineMultiQuery,
    useGetTripLifeCycleQuery,
    useGetTripLifeCycleDetailsQuery,
} = progressTripApi;