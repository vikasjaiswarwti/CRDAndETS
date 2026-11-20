import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  DefineShiftPayload,
  UpdateShiftPayload,
  ShiftSlot,
  ShiftListParams,
  PaginatedResponse,
  ShiftDropDownItem,
} from "../types/shift.mangement.types";
import type {
  CreateShiftIntervalDto,
  ShiftInterval,
} from "../../shiftinterval";

// ── Shared slot parser ────────────────────────────────────────
// Converts one raw JSON string (jsonLoginShiftDefinition or
// jsonLogoutShiftDefinition) into a typed ShiftSlot[].
function parseShiftSlots(jsonStr: string | undefined): ShiftSlot[] {
  if (!jsonStr) return [];
  try {
    const parsed: any[] = JSON.parse(jsonStr);
    return parsed.map((slot: any) => ({
      id: slot.id,
      shiftId: slot.SHIFTID,
      locCode: slot.LOCCODE,
      shiftTime: slot.SHIFTTIME,
      shiftDesc: slot.shiftDesc ?? null,
      dropDayShift: Boolean(slot.DROPDAYSHIFT),
      pickDayShift: Boolean(slot.PICKDAYSHIFT),
      peakHour: Boolean(slot.PEAK_HOUR),
      unsPickAllwd: Boolean(slot.UNS_PICK_ALLWD),
      unsDropAllwd: Boolean(slot.UNS_DROP_ALLWD),
      pickOccupancy: Number(slot.PICK_OCCUPANCY) || 1,
      dropOccupancy: Number(slot.DROP_OCCUPANCY) || 1,
      dropShift: slot.DropShift ?? null,
      isGuardPick: Boolean(slot.IsGuardPick),
      isGuardDrop: Boolean(slot.IsGuardDrop),
      isSafeReachedMale: Boolean(slot.IsSafeReachedMale),
      isSafeReachedFemale: Boolean(slot.IsSafeReachedFemale),
      avgSpeed: Number(slot.Avg_Speed) || 60,
      createdBy: slot.createdBy ?? "",
      createdOn: slot.createdOn ?? "",
    }));
  } catch (err) {
    console.error("Failed to parse shift slots:", err);
    return [];
  }
}

// ── API response shape returned by getShiftDefinition ─────────
// Both datasets live in one mutation call; the page picks which
// array to show based on the Login / Logout tab selection.
export interface ShiftDefinitionData {
  login: ShiftSlot[];
  logout: ShiftSlot[];
}

export const shiftApi = createApi({
  reducerPath: "shiftApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Shift", "ShiftInterval"],
  endpoints: (builder) => ({
    // ── GET list of slots for a location ─────────────────────────
    getShiftSlots: builder.query<PaginatedResponse<ShiftSlot>, ShiftListParams>(
      {
        query: ({
          locCode,
          searchTerm = "",
          sortColumn = "",
          sortOrder = "",
          page,
          pageSize,
        }) => ({
          url: "/api/v1/MstShift",
          params: {
            locCode,
            searchTerm,
            sortColumn,
            sortOrder,
            page,
            pageSize,
          },
        }),
        providesTags: (result) =>
          result
            ? [
                ...result.items.map(({ id }) => ({
                  type: "Shift" as const,
                  id,
                })),
                { type: "Shift", id: "LIST" },
              ]
            : [{ type: "Shift", id: "LIST" }],
      },
    ),

    // ── POST — generate slots for a location + interval ───────────
    defineShift: builder.mutation<ShiftSlot[], DefineShiftPayload>({
      query: (body) => ({
        url: "/api/v1/MstShift/DefineShift",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Shift", id: "LIST" }],
    }),

    // ── POST — fetch shift definition (login + logout) ────────────
    // Returns BOTH login and logout slot arrays in one call.
    // Client-side tab toggle in ShiftManagementPage picks which to show.
    getShiftDefinition: builder.mutation<
      ShiftDefinitionData,
      { locCode: number; wiseID?: string }
    >({
      query: ({ locCode, wiseID = "0" }) => ({
        url: "/api/v1/MstShift/GetShiftDefinition",
        method: "POST",
        body: { locCode, WiseID: wiseID }, // ← API expects capital WiseID
      }),
      transformResponse: (response: any): ShiftDefinitionData => {
        const result0 = response?.result?.[0];
        return {
          login: parseShiftSlots(result0?.jsonLoginShiftDefinition),
          logout: parseShiftSlots(result0?.jsonLogoutShiftDefinition),
        };
      },
    }),

    // ── PUT — update a single slot by its GUID id ─────────────────
    updateShiftSlot: builder.mutation<
      ShiftSlot,
      { id: string; body: UpdateShiftPayload }
    >({
      query: ({ id, body }) => ({
        url: `/api/v1/MstShift/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Shift", id },
        { type: "Shift", id: "LIST" },
      ],
    }),

    createShiftInterval: builder.mutation<
      ShiftInterval,
      CreateShiftIntervalDto
    >({
      query: (body) => ({
        url: "/api/v1/LkpShiftInterval",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ShiftInterval", id: "LIST" }],
    }),

    shiftLockUpdate: builder.mutation<
      { isSuccess: boolean; message: string },
      { lockType: string; locCode: number; shiftID: number; dropShift: string }
    >({
      query: (body) => ({
        url: "/api/v1/MstShift/ShiftLockUpdate",
        method: "POST",
        body,
      }),
    }),

    shiftDropDown: builder.mutation<
      ShiftDropDownItem[],
      { locCode: number; lockType: string }
    >({
      queryFn: async (arg, _queryApi, _extraOptions, baseQuery) => {
        console.log("[shiftDropDown] payload →", arg);

        const result = await baseQuery({
          url: "/api/v1/MstShift/ShiftDropDown",
          method: "POST",
          body: arg,
        });

        console.log("[shiftDropDown] response ←", result);

        if (result.error) return { error: result.error };
        return { data: result.data as ShiftDropDownItem[] };
      },
    }),
  }),
});

export const {
  useGetShiftSlotsQuery,
  useDefineShiftMutation,
  useGetShiftDefinitionMutation,
  useUpdateShiftSlotMutation,
  useCreateShiftIntervalMutation,

  useShiftLockUpdateMutation,

  useShiftDropDownMutation,
} = shiftApi;
