import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type { CreateUSVDto } from "../type/userSupervisor.types";

export const userSupervisorApi = createApi({
  reducerPath: "userSupervisorApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["UserSupervisor"],
  endpoints: (builder) => ({
    bulkUploadUserSupervisor: builder.mutation<any, CreateUSVDto>({
      query: (body) => ({
        url: "/api/v1/Users/supervisors/assignments/bulk",
        method: "POST",
        body: body,
      }),
      invalidatesTags: [{ type: "UserSupervisor", id: "LIST" }],
    }),
  }),
});

export const { useBulkUploadUserSupervisorMutation } = userSupervisorApi;
