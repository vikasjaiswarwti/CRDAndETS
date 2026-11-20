import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import { NOTIFICATION_MANAGEMENT_ENDPOINTS as EP } from "../config";
import type {
  SosEscalation,
  CreateSosEscalationDto,
  UpdateSosEscalationDto,
  EventNotification,
  CreateEventNotificationDto,
  UpdateEventNotificationDto,
} from "../types/notificationManagement.types";

// List endpoints return the full list; accept either a bare array or a
// paginated { items } envelope so the UI doesn't break if the shape changes.
const toList = <T>(response: T[] | { items?: T[] } | null | undefined): T[] =>
  Array.isArray(response) ? response : (response?.items ?? []);

export const notificationManagementApi = createApi({
  reducerPath: "notificationManagementApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["SosEscalation", "EventNotification"],
  endpoints: (builder) => ({
    // ── SOS Escalation Hierarchy ──────────────────────────────────────────────
    getAllSosEscalations: builder.query<SosEscalation[], void>({
      query: () => EP.sosEscalation,
      transformResponse: toList<SosEscalation>,
      providesTags: (result) => [
        ...(result ?? []).map(({ id }) => ({
          type: "SosEscalation" as const,
          id,
        })),
        { type: "SosEscalation", id: "LIST" },
      ],
    }),

    createSosEscalation: builder.mutation<SosEscalation, CreateSosEscalationDto>(
      {
        query: (body) => ({ url: EP.sosEscalation, method: "POST", body }),
        invalidatesTags: [{ type: "SosEscalation", id: "LIST" }],
      },
    ),

    updateSosEscalation: builder.mutation<SosEscalation, UpdateSosEscalationDto>(
      {
        query: ({ id, ...body }) => ({
          url: `${EP.sosEscalation}/${id}`,
          method: "PUT",
          body,
        }),
        invalidatesTags: (_result, _err, { id }) => [
          { type: "SosEscalation", id },
          { type: "SosEscalation", id: "LIST" },
        ],
      },
    ),

    // DELETE only deactivates (isActive: false) — the row stays.
    deactivateSosEscalation: builder.mutation<SosEscalation, string>({
      query: (id) => ({ url: `${EP.sosEscalation}/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _err, id) => [
        { type: "SosEscalation", id },
        { type: "SosEscalation", id: "LIST" },
      ],
    }),

    // ── Event Notification Config ─────────────────────────────────────────────
    getAllEventNotifications: builder.query<EventNotification[], void>({
      query: () => EP.eventNotification,
      transformResponse: toList<EventNotification>,
      providesTags: (result) => [
        ...(result ?? []).map(({ id }) => ({
          type: "EventNotification" as const,
          id,
        })),
        { type: "EventNotification", id: "LIST" },
      ],
    }),

    createEventNotification: builder.mutation<
      EventNotification,
      CreateEventNotificationDto
    >({
      query: (body) => ({ url: EP.eventNotification, method: "POST", body }),
      invalidatesTags: [{ type: "EventNotification", id: "LIST" }],
    }),

    updateEventNotification: builder.mutation<
      EventNotification,
      UpdateEventNotificationDto
    >({
      query: ({ id, ...body }) => ({
        url: `${EP.eventNotification}/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "EventNotification", id },
        { type: "EventNotification", id: "LIST" },
      ],
    }),

    deactivateEventNotification: builder.mutation<EventNotification, string>({
      query: (id) => ({
        url: `${EP.eventNotification}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _err, id) => [
        { type: "EventNotification", id },
        { type: "EventNotification", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllSosEscalationsQuery,
  useCreateSosEscalationMutation,
  useUpdateSosEscalationMutation,
  useDeactivateSosEscalationMutation,
  useGetAllEventNotificationsQuery,
  useCreateEventNotificationMutation,
  useUpdateEventNotificationMutation,
  useDeactivateEventNotificationMutation,
} = notificationManagementApi;
