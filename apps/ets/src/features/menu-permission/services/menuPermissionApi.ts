import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../shared/lib/api/baseQueryWithReauth";
import type {
    Menu,
    PaginatedMenuResponse,
    AssignMenuPermissionDto,
    Permission,
} from "../types/menuPermission.types";

export const menuPermissionApi = createApi({
    reducerPath: "menuPermissionApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["MenuPermission"],
    endpoints: (builder) => ({
        getAllAdminMenus: builder.query<Menu[], void>({
            query: () => ({
                url: "/api/v1/Menu?pageSize=1000",
            }),
            transformResponse: (response: PaginatedMenuResponse) => {
                return response.items;
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({
                            type: "MenuPermission" as const,
                            id,
                        })),
                        { type: "MenuPermission", id: "LIST" },
                    ]
                    : [{ type: "MenuPermission", id: "LIST" }],
        }),
        getAllPermission: builder.query<Permission[], void>({
            query: () => "/api/v1/Permissions",
            providesTags: () => [{ type: "MenuPermission", id: "LIST" }],
        }),

        assignMenuPermission: builder.mutation<void, AssignMenuPermissionDto>({
            query: (body) => ({
                url: "/api/v1/Permissions/menu-permission",
                method: "POST",
                body,
            }),
            // Intentionally NOT invalidating here — we call this in a loop
            // and invalidate manually after all settle
        }),

        // getAdminMenuById: builder.query<Menu, string>({
        //   query: (id) => `/api/v1/Menu/${id}`,
        //   providesTags: (_, __, id) => [{ type: "AdminMenu", id }],
        // }),

        // // Renamed for convenience
        // createMenu: builder.mutation<Menu, CreateMenuDto>({
        //   // ← changed
        //   query: (body) => ({
        //     url: "/api/v1/Menu",
        //     method: "POST",
        //     body,
        //   }),
        //   invalidatesTags: [{ type: "AdminMenu", id: "LIST" }],
        // }),

        // updateMenu: builder.mutation<Menu, UpdateMenuDto>({
        //   // ← changed
        //   query: ({ id, ...body }) => ({
        //     url: `/api/v1/Menu/${id}`,
        //     method: "PUT",
        //     body,
        //   }),
        //   invalidatesTags: (_, __, { id }) => [
        //     { type: "AdminMenu", id },
        //     { type: "AdminMenu", id: "LIST" },
        //   ],
        // }),
    }),
});

export const {
    useGetAllAdminMenusQuery,
    useGetAllPermissionQuery,
    useAssignMenuPermissionMutation,

    //   useGetAdminMenuByIdQuery,
    //   useCreateMenuMutation, // ← Now you can import this
    //   useUpdateMenuMutation, // ← Now you can import this
} = menuPermissionApi;
