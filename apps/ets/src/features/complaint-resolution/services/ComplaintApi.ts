/**
 * ComplaintApi — RTK Query slice for Complaint Resolution.
 *
 * IMPORTANT: this screen must never show stale data (no websocket backing
 * it), so caching is deliberately neutered:
 *  - keepUnusedDataFor: 0 — nothing is served from cache once unsubscribed
 *  - every call site also calls refetch() explicitly after any state change
 *    (tab switch, employee filter, opening a complaint, after a reply/resolve)
 *    rather than trusting refetchOnMountOrArgChange alone.
 */
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";

import type {
  ComplaintThreadMessage,
  ComplaintListResponse,
  ComplaintListParams,
  UpdateComplaintReplyBody,
} from "../types/complaint.types";

/** transportReply comes back as a JSON string (or null) — parse defensively. */
export function parseComplaintThread(
  transportReply: string | null,
): ComplaintThreadMessage[] {
  if (!transportReply) return [];
  try {
    const parsed = JSON.parse(transportReply);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const complaintApi = createApi({
  reducerPath: "complaintApi",
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 0,
  tagTypes: ["Complaint"],
  endpoints: (builder) => ({
    // GET /ComplaintReply/getComplaintReply
    getComplaintReply: builder.query<
      ComplaintListResponse,
      ComplaintListParams
    >({
      query: ({ locCode, compStatus, empId, page = 1, pageSize = 10 }) => ({
        url: "/api/v1/ComplaintReply/getComplaintReply",
        params: {
          locCode,
          compStatus,
          ...(empId ? { empId } : {}),
          page,
          pageSize,
        },
      }),
      providesTags: ["Complaint"],
    }),

    // POST /ComplaintReply/UpdateComplaintReply
    // Status: false -> normal reply, Status: true -> resolve/close (mandatory message)
    updateComplaintReply: builder.mutation<void, UpdateComplaintReplyBody>({
      query: (body) => ({
        url: "/api/v1/ComplaintReply/UpdateComplaintReply",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Complaint"],
    }),
  }),
});

export const {
  useGetComplaintReplyQuery,
  useLazyGetComplaintReplyQuery,
  useUpdateComplaintReplyMutation,
} = complaintApi;
