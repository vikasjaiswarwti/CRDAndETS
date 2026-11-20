// features/shift-validation/services/shiftValidationApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  GetShiftManagementParams,
  UpdateShiftManagementParams,
  GetShiftValidationParams,
  UpdateShiftValidationParams,
  ShiftItem,
} from "../types/shiftValidation.types";

// ── Raw API shapes ─────────────────────────────────────────────────────────────

interface RawShiftManagementRow {
  jsonShiftsPick: string; // mode 1 only
  jsonShiftsDrop: string; // mode 1 only
}

// Modes 2–5: single jsonShifts field per call (tripType tells which)
interface RawShiftValidationRow {
  jsonShifts: string;
}

interface ShiftManagementApiResponse {
  result: RawShiftManagementRow[] | null | undefined;
  isSuccess: boolean;
  message: string;
}

interface ShiftValidationApiResponse {
  result: RawShiftValidationRow[] | null | undefined;
  isSuccess: boolean;
  message: string;
}

export interface ParsedShifts {
  pickupShifts: ShiftItem[];
  dropShifts: ShiftItem[];
  serverMessage?: string;
}

// ── Employee list by wise ID ───────────────────────────────────────────────
export interface EmployeeListParams {
  LocCode: number;
  shiftValidationID: number; // same as currentMode (1-5)
  wiseId: string; // "" for user-wise (mode 2)
}

export interface EmployeeListItem {
  CommutrID: number;
  OfficeName: string;
  Name: string;
  MobileNo: string;
  EmailID: string;
  Address: string;
}

// ── Safe JSON parser ──────────────────────────────────────────────────────────

function safeParseJson<T>(raw: string | null | undefined, fallback: T[]): T[] {
  if (!raw || raw.trim() === "" || raw === "null") return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    console.warn("[shiftValidationApi] JSON parse failed:", e);
    return fallback;
  }
}

// ── Mode 1 parser — uses jsonShiftsPick + jsonShiftsDrop ─────────────────────

function parseManagementResponse(
  raw: ShiftManagementApiResponse,
): ParsedShifts {
  const row = raw?.result?.[0];
  return {
    pickupShifts: safeParseJson<ShiftItem>(row?.jsonShiftsPick, []),
    dropShifts: safeParseJson<ShiftItem>(row?.jsonShiftsDrop, []),
    serverMessage: raw?.message,
  };
}

// ── Modes 2–5 parser — uses jsonShifts (single field per tripType call) ───────

export function parseValidationResponse(
  raw: ShiftValidationApiResponse,
): ShiftItem[] {
  const row = raw?.result?.[0];
  return safeParseJson<ShiftItem>(row?.jsonShifts, []);
}

// ── API slice ─────────────────────────────────────────────────────────────────

export const shiftValidationApi = createApi({
  reducerPath: "shiftValidationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["ShiftManagement", "ShiftValidation"],
  endpoints: (builder) => ({
    // ── Mode 1: GET (single call, returns both pick+drop) ─────────────────
    getShiftManagement: builder.mutation<
      ParsedShifts,
      GetShiftManagementParams
    >({
      query: (body) => ({
        url: "/api/v1/MstShiftControl/GetShiftManagement",
        method: "POST",
        body,
      }),
      transformResponse: (raw: ShiftManagementApiResponse) =>
        parseManagementResponse(raw),
    }),

    // ── Mode 1: UPDATE ────────────────────────────────────────────────────
    updateShiftManagement: builder.mutation<
      { isSuccess: boolean; message: string },
      UpdateShiftManagementParams
    >({
      query: (body) => ({
        url: "/api/v1/MstShiftControl/UpdateShiftManagement",
        method: "POST",
        body,
      }),
    }),

    // ── Modes 2–5: GET (called ONCE per tripType — caller does it twice) ──
    //   Returns ShiftItem[] directly (parsed from jsonShifts)
    getShiftValidation: builder.mutation<ShiftItem[], GetShiftValidationParams>(
      {
        query: (body) => ({
          url: "/api/v1/MstShift/GetShiftValidation",
          method: "POST",
          body: {
            ...body,
            wiseID: String(body.wiseID ?? ""),
          },
        }),
        transformResponse: (raw: ShiftValidationApiResponse) =>
          parseValidationResponse(raw),
      },
    ),

    // ── Modes 2–5: UPDATE ─────────────────────────────────────────────────
    updateShiftValidation: builder.mutation<
      { isSuccess: boolean; message: string },
      UpdateShiftValidationParams
    >({
      query: (body) => ({
        url: "/api/v1/MstShift/UpdateShiftValidation",
        method: "POST",
        body: {
          ...body,
          wiseID: String(body.wiseID ?? ""),
        },
      }),
    }),

    getShiftValidationType: builder.query<number, number>({
      query: (locCode) => ({
        url: `/api/v1/AppControl/shift-validation/${locCode}`,
        method: "GET",
      }),
      transformResponse: (response: any): number => {
        let raw: unknown = response;
        if (raw !== null && typeof raw === "object") {
          raw =
            (raw as any).result ??
            (raw as any).data ??
            (raw as any).validateType ??
            (raw as any).validationType ??
            raw;
        }
        const n = Number(raw);
        if (isNaN(n) || n < 1 || n > 5) return 1; // safe fallback
        return n;
      },
    }),

    // inside endpoints: (builder) => ({
    getEmployeeListByWiseId: builder.query<
      EmployeeListItem[],
      EmployeeListParams
    >({
      query: (params) => ({
        url: "/api/v1/Report/UserListbyWiseIdReport",
        method: "POST",
        body: params,
      }),
      transformResponse: (raw: { jsonUserList: string }[]) => {
        try {
          return JSON.parse(
            raw?.[0]?.jsonUserList ?? "[]",
          ) as EmployeeListItem[];
        } catch {
          return [];
        }
      },
    }),
  }),
});

export const {
  useGetShiftManagementMutation,
  useUpdateShiftManagementMutation,
  useGetShiftValidationMutation,
  useUpdateShiftValidationMutation,
  useLazyGetShiftValidationTypeQuery,
  useLazyGetEmployeeListByWiseIdQuery,
} = shiftValidationApi;
