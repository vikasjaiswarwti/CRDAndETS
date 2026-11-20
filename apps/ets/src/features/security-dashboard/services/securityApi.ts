import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth"; // adjust path if needed
import type {
  AlertFiltersResponse,
  AlertSummaryResponse,
  PaginatedAlertsResponse,
} from "../types/Security.types";

// ── Alert ─────────────────────────────────────────────────────────────────────

// ── Query Params ──────────────────────────────────────────────────────────────

export interface GetAlertsParams {
  page?: number; // default: 1
  pageSize?: number; // default: 20, max: 100
  isResolved?: boolean;
  priorityCodes?: number[];
  moduleCodes?: number[];
  from?: string; // ISO datetime  e.g. "2026-06-19T00:00:00"
  to?: string; // ISO datetime  e.g. "2026-06-26T23:59:59"
}

// ── Mutation Params ───────────────────────────────────────────────────────────

export interface AcknowledgeAlertParams {
  alertId: string;
  actionBy: string;
}

export interface ResolveAlertParams {
  alertId: string;
  actionBy: string;
  remarks?: string | null;
}

export interface AcknwledgeAlertParams {
  actionBy: string;
}
// ─────────────────────────────────────────────────────────────────────────────
// HELPER
// Builds URLSearchParams from GetAlertsParams.
// Multi-value arrays (priorityCodes, moduleCodes) use repeated keys so the
// server receives  ?priorityCodes=1&priorityCodes=2  not  ?priorityCodes[]=1
// ─────────────────────────────────────────────────────────────────────────────

function buildAlertsQueryString(params: GetAlertsParams): string {
  const query = new URLSearchParams();

  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.pageSize !== undefined)
    query.set("pageSize", String(params.pageSize));
  if (params.isResolved !== undefined)
    query.set("isResolved", String(params.isResolved));
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);

  params.priorityCodes?.forEach((code) =>
    query.append("priorityCodes", String(code)),
  );
  params.moduleCodes?.forEach((code) =>
    query.append("moduleCodes", String(code)),
  );

  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

// ─────────────────────────────────────────────────────────────────────────────
// API SLICE
// ─────────────────────────────────────────────────────────────────────────────

export const securityApi = createApi({
  reducerPath: "securityApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Alerts", "AlertSummary"],

  endpoints: (builder) => ({
    // ── 1. GET /alerts/filters ──────────────────────────────────────────────
    getAlertFilters: builder.query<AlertFiltersResponse, void>({
      query: () => ({
        url: "/api/v1/alerts/filters",
        method: "GET",
      }),
      keepUnusedDataFor: 60, // filter options are static; cache for 1 min
      // transformResponse: (response: any) => {
      //     // console.log(response, "API response");
      //     return response;
      // },
    }),

    // ── 2. GET /alerts/summary ──────────────────────────────────────────────
    getAlertSummary: builder.query<AlertSummaryResponse, void>({
      query: () => ({
        url: "/api/v1/alerts/summary",
        method: "GET",
      }),
      keepUnusedDataFor: 120,
      providesTags: [{ type: "AlertSummary", id: "SUMMARY" }],
    }),

    // ── 3. GET /alerts (paginated + filtered) ───────────────────────────────
    getAlerts: builder.query<PaginatedAlertsResponse, GetAlertsParams>({
      query: (params) => ({
        url: `/api/v1/alerts${buildAlertsQueryString(params)}`,
        method: "GET",
        // params:{}
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ alertId }) => ({
                type: "Alerts" as const,
                id: alertId,
              })),
              { type: "Alerts" as const, id: "LIST" },
            ]
          : [{ type: "Alerts" as const, id: "LIST" }],
    }),

    acknowledgeAlert: builder.mutation<any, AcknowledgeAlertParams>({
      query: ({ alertId, actionBy }) => ({
        url: `/api/v1/alerts/${alertId}/acknowledge`,
        method: "PUT",
        body: { actionBy },
      }),
      invalidatesTags: (_result, _error, { alertId }) => [
        { type: "Alerts", id: alertId },
        { type: "Alerts", id: "LIST" },
        { type: "AlertSummary", id: "SUMMARY" },
      ],
    }),

    resolveAlert: builder.mutation<any, ResolveAlertParams>({
      query: ({ alertId, actionBy, remarks }) => ({
        url: `/api/v1/alerts/${alertId}/resolve`,
        method: "PUT",
        body: { actionBy, remarks: remarks ?? null },
      }),
      invalidatesTags: (_result, _error, { alertId }) => [
        { type: "Alerts", id: alertId },
        { type: "Alerts", id: "LIST" },
        { type: "AlertSummary", id: "SUMMARY" },
      ],
    }),
  }),
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export const {
  useGetAlertFiltersQuery,
  useGetAlertSummaryQuery,
  useGetAlertsQuery,
  useResolveAlertMutation,
  useAcknowledgeAlertMutation,
 
} = securityApi;
