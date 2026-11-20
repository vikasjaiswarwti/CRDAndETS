import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../shared/lib/api/baseQueryWithReauth';
import type {
    SelectOption,
    BillingCalculationResponse,
    DynamicTariffSlab,
    PenaltyReportRequest,
} from '../types/billing.types';

// Request type for the new report endpoints
export interface BillingReportRequest {
    LocCode: number;
    fromDate: string;
    toDate: string;
}
export interface GenerateBillingSixRequest {
    LocCode: number;
    VendorId: number;
    BillingId: number;
}
export interface BillingCycleResponse {
    billingId: number;
    locName: string;
    billingCycle: string;
}

export type BillingCalculationResponseList = BillingCalculationResponse[];
export const billingApi = createApi({
    reducerPath: 'billingApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['BillingRateCard', "BillingCycle"],
    endpoints: (builder) => ({
        // -----------------------------------------
        // ── POST /Report/BillingDetailsReport ───────────────────────
        getBillingDetailsReport: builder.mutation<any, BillingReportRequest>({
            query: (body) => ({
                url: '/api/v1/Report/BillingDetailsReport',
                method: 'POST',
                body,
            }),
        }),

        // ── POST /Report/BillingSummaryReport ────────────────────────
        getBillingSummaryReport: builder.mutation<any, BillingReportRequest>({
            query: (body) => ({
                url: '/api/v1/Report/BillingSummaryReport',
                method: 'POST',
                body,
            }),
        }),

        // ── POST /Report/TechnologyUsageDetailsReport ────────────────
        getTechnologyUsageDetailsReport: builder.mutation<any, BillingReportRequest>({
            query: (body) => ({
                url: '/api/v1/Report/TechnologyUsageDetailsReport',
                method: 'POST',
                body,
            }),
        }),

        // ── POST /Report/TechnologyUsageSummaryReport ───────────────
        getTechnologyUsageSummaryReport: builder.mutation<any, BillingReportRequest>({
            query: (body) => ({
                url: '/api/v1/Report/TechnologyUsageSummaryReport',
                method: 'POST',
                body,
            }),
        }),
        // ── POST /MstBillPlanRateCardsSix/GenerateBillingSix ───────────────────
        generateBillingSix: builder.mutation<BillingCalculationResponse, GenerateBillingSixRequest>({
            query: (body) => ({
                url: '/api/v1/MstBillPlanRateCardsSix/GenerateBilling',
                method: 'POST',
                body,
            }),
            transformResponse: (response: any) => {
                // console.log(response, "response from generate billing six");
                // const data = JSON.parse(response) as BillingCalculationResponseList;
                return response[0] as BillingCalculationResponse;
            },
            invalidatesTags: [{ type: 'BillingCycle' }],
        }),

        // ── GET /MstBillPlanRateCardsSix/billing-cycle/{locCode} ───────────────
        getBillingCycle: builder.query<SelectOption[], number>({
            query: (locCode) => ({
                url: `/api/v1/MstBillPlanRateCardsSix/billing-cycle/${locCode}`,
            }),
            transformResponse: (response: string): SelectOption[] => {
                const data = JSON.parse(response) as BillingCycleResponse[];

                return data.map((item) => ({
                    label: item.billingCycle,
                    value: item.billingId,
                }));
            },
            providesTags: (_result, _err, locCode) => [
                { type: "BillingCycle", id: locCode },
            ],
        }),
        getRateCards: builder.query<DynamicTariffSlab[], number>({
            query: (id) => ({
                url: `/api/v1/MstBillPlanRateCardsSix/GetRateCards/${id}`,
            }),
            transformResponse: (response: any) => {
                const data = typeof response === "string"
                    ? JSON.parse(response)
                    : response;
                return data as DynamicTariffSlab[];
            },
        }),
        getPenaltyReport: builder.mutation<any, PenaltyReportRequest>({
            query: (body) => ({
                url: '/api/v1/LkpPenaltyType/PenaltyReport',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const {
    useGenerateBillingSixMutation,
    useGetBillingCycleQuery,
    // ----------------- MIS REPORT
    useGetBillingDetailsReportMutation,
    useGetBillingSummaryReportMutation,
    useGetTechnologyUsageDetailsReportMutation,
    useGetTechnologyUsageSummaryReportMutation,
    useGetRateCardsQuery,
    useGetPenaltyReportMutation,
} = billingApi;