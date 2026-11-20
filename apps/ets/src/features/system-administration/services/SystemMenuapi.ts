import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
  CreateMenuResponse,
  MenuItem,
  CreateMenuDto,
  UpdateMenuDto,
  MenuListParams,
  PaginatedResponse,
} from "../types/SystemRolePermission.types";

export const adminMenuApi = createApi({
  reducerPath: "adminMenuApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Menu"],
  endpoints: (builder) => ({
    getAllMenus: builder.query<PaginatedResponse<MenuItem>, MenuListParams>({
      query: ({
        searchTerm = "",
        sortColumn = "",
        sortOrder = "",
        page,
        pageSize,
      }) => ({
        url: "/api/v1/Menu",
        params: { searchTerm, sortColumn, sortOrder, page, pageSize },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ menuId }) => ({
                type: "Menu" as const,
                id: menuId,
              })),
              { type: "Menu", id: "LIST" },
            ]
          : [{ type: "Menu", id: "LIST" }],
    }),

    getMenuById: builder.query<MenuItem, string>({
      query: (id) => ({ url: `/api/v1/Menu/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "Menu", id }],
    }),

    // Change the mutation return type:
    createMenu: builder.mutation<CreateMenuResponse, CreateMenuDto>({
      query: (body) => ({
        url: "/api/v1/Menu",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Menu", id: "LIST" }],
    }),

    updateMenu: builder.mutation<MenuItem, UpdateMenuDto>({
      query: ({ id, ...body }) => ({
        url: `/api/v1/Menu/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Menu", id },
        { type: "Menu", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllMenusQuery,
  useGetMenuByIdQuery,
  useCreateMenuMutation,
  useUpdateMenuMutation,
} = adminMenuApi;
