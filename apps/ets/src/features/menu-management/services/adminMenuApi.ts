import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  Menu,
  CreateMenuDto,
  UpdateMenuDto,
  MenuListParams,
  PaginatedMenuResponse,
} from "../types/menu.types";

export const adminMenuApi = createApi({
  reducerPath: "menuManagementApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["AdminMenu"],
  endpoints: (builder) => ({
    getAllAdminMenus: builder.query<PaginatedMenuResponse, MenuListParams>({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page = 1,
        pageSize = 10,
      }) => ({
        url: "/api/v1/Menu",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "AdminMenu" as const,
                id,
              })),
              { type: "AdminMenu", id: "LIST" },
            ]
          : [{ type: "AdminMenu", id: "LIST" }],
    }),

    getAdminMenuById: builder.query<Menu, string>({
      query: (id) => `/api/v1/Menu/${id}`,
      providesTags: (_, __, id) => [{ type: "AdminMenu", id }],
    }),

    // Renamed for convenience
    createMenu: builder.mutation<Menu, CreateMenuDto>({
      // ← changed
      query: (body) => ({
        url: "/api/v1/Menu",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AdminMenu", id: "LIST" }],
    }),

    updateMenu: builder.mutation<Menu, UpdateMenuDto>({
      // ← changed
      query: ({ id, ...body }) => ({
        url: `/api/v1/Menu/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "AdminMenu", id },
        { type: "AdminMenu", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllAdminMenusQuery,
  useGetAdminMenuByIdQuery,
  useCreateMenuMutation, // ← Now you can import this
  useUpdateMenuMutation, // ← Now you can import this
} = adminMenuApi;
