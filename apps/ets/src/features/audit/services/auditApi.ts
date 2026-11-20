import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";

export interface AuditLogItem {
  auditId: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  entityId: string | null;
  detail: string | null;
  httpMethod: string;
  endpoint: string;
  statusCode: number;
  isSuccess: boolean;
  ipAddress: string;
  timestamp: string;
}

export interface AuditLogResponse {
  items: AuditLogItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditLogQuery {
  module: string;
  page: number;
  userId: string | null;
  pageSize: number;
  from?: string;
  to?: string;
  isSuccess?: boolean;
}

export const auditApi = createApi({
  reducerPath: "auditApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLogResponse, AuditLogQuery>({
      query: ({ module, page, pageSize, from, to, isSuccess, userId }) => ({
        url: `/api/v1/Audit/modules/${encodeURIComponent(module)}`,
        params: {
          page,
          pageSize,
          ...(userId? {userId}: {}),
          ...(from ? { from } : {}),
          ...(to ? { to } : {}),
          ...(isSuccess === undefined ? {} : { isSuccess }),
        },
      }),
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditApi;