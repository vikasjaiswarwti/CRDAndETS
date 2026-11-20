/**
 * RTK Query slice for vehicle check sheet API.
 * Matches the VehicleCheckSheet API routes:
 * GET /api/v1/VehicleCheckSheet
 * POST /api/v1/VehicleCheckSheet
 * PUT /api/v1/VehicleCheckSheet/{id}
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  VehicleCheckSheetPayload,
  VehicleCheckSheet,
} from "../types/checkList.types";

const BASE_URL = import.meta.env.VITE_LTRDOMAIN ?? "https://ltr.commutr.in";

export interface VehicleCheckSheetResponse<T> {
  status: boolean;
  message: string;
  result: T;
}

export interface VehicleCheckSheetListParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface VehicleCheckSheetListResponse {
  status: boolean;
  message: string;
  result: VehicleCheckSheet[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface VehicleCheckSheetApiItem {
  id: number;
  inspectionItems?: Array<{
    id?: number;
    itemId?: number | string;
    name: string;
    status: number | boolean | string | null;
    value: string | null;
    uploadedFileKey: string | null;
  }>;
  drivers?: Array<{
    id?: number;
    driverName: string;
    gatePassNo: string;
    aadhaarNo: string;
    driverPNo: string;
    driverSNo: string | null;
    dlNo: string;
    dlIssueDate: string | null;
    dlExpiryDate: string | null;
    complianceItems?: Array<{
      id?: number;
      itemId?: number | string;
      name: string;
      status: number | boolean | string | null;
      value: string | null;
      uploadedFileKey: string | null;
    }>;
  }>;
  [key: string]: unknown;
}

interface VehicleCheckSheetApiListResponse {
  result?: {
    items?: VehicleCheckSheetApiItem[];
    page?: number;
    pageSize?: number;
    totalCount?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
  isSuccess?: boolean;
  message?: string;
}

const mapChecklistItems = (
  items: VehicleCheckSheetApiItem["inspectionItems"] = [],
) =>
  items.map((item) => ({
    id: item.itemId ?? item.id ?? "",
    name: item.name,
    status: item.status,
    value: item.value,
    uploadedFileKey: item.uploadedFileKey,
  }));

const mapVehicleCheckSheet = (
  item: VehicleCheckSheetApiItem,
): VehicleCheckSheet => ({
  ...item,
  id: item.id,
  _id: String(item.id),
  inspection: mapChecklistItems(item.inspectionItems),
  drivers: (item.drivers ?? []).map((driver) => ({
    ...driver,
    driverSNo: driver.driverSNo ?? "",
    driverCompliance: mapChecklistItems(driver.complianceItems),
  })),
  createdAt: String(item.createdOn ?? ""),
  updatedAt: String(item.modifiedOn ?? item.createdOn ?? ""),
  __v: 0,
} as VehicleCheckSheet);

export interface VehicleCheckSheetDto extends Partial<VehicleCheckSheetPayload> { }

export const vehicleCheckSheetApi = createApi({
  reducerPath: "vehicleCheckSheetApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  tagTypes: ["VehicleCheckSheet", "VehicleCheckSheetList"],
  endpoints: (builder) => ({
    getAllVehicleCheckSheet: builder.query<
      VehicleCheckSheetListResponse,
      VehicleCheckSheetListParams
    >({
      query: (params) => ({
        url: "/api/v1/VehicleCheckSheet",
        params: {
          pageNumber: params.page,
          pageSize: params.pageSize,
          vehicleNumber: params.search ?? "",
        },
      }),
      transformResponse: (
        response: VehicleCheckSheetApiListResponse,
      ): VehicleCheckSheetListResponse => ({
        status: response.isSuccess ?? false,
        message: response.message ?? "",
        result: (response.result?.items ?? []).map(mapVehicleCheckSheet),
        page: response.result?.page ?? 1,
        pageSize: response.result?.pageSize ?? 0,
        totalItems: response.result?.totalCount ?? 0,
        totalPages: response.result?.pageSize
          ? Math.ceil(
            (response.result.totalCount ?? 0) / response.result.pageSize,
          )
          : 0,
        hasNextPage: response.result?.hasNextPage ?? false,
        hasPreviousPage: response.result?.hasPrevPage ?? false,
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.result.map((item) => ({
              type: "VehicleCheckSheet" as const,
              id: item.id ?? item._id ?? "unknown",
            })),
            { type: "VehicleCheckSheetList" as const, id: "LIST" },
          ]
          : [{ type: "VehicleCheckSheetList" as const, id: "LIST" }],
    }),

    addVehicleCheckSheet: builder.mutation<
      VehicleCheckSheetResponse<VehicleCheckSheetPayload>,
      VehicleCheckSheetPayload
    >({
      query: (body) => ({
        url: "/api/v1/VehicleCheckSheet",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "VehicleCheckSheetList", id: "LIST" }],
    }),
    editVehicleCheckSheet: builder.mutation<
      VehicleCheckSheetResponse<VehicleCheckSheetPayload>,
      { id: string | number; body: Partial<VehicleCheckSheetPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/api/v1/VehicleCheckSheet/${id}`,
        method: "PUT",
        body: { id, ...body },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "VehicleCheckSheet", id },
        { type: "VehicleCheckSheetList", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllVehicleCheckSheetQuery,
  useAddVehicleCheckSheetMutation,
  useEditVehicleCheckSheetMutation,
} = vehicleCheckSheetApi;
