import { useState, useMemo, useCallback } from "react";
import { useGetAllAdminMenusQuery, useGetAllPermissionQuery, useAssignMenuPermissionMutation } from "../services/menuPermissionApi";
import type { PermissionGroup, AssignMenuPermissionResult } from "../types/menuPermission.types";

export function useMenuPermission() {
    const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>(new Set());

    const {
        data: menuData,
        isLoading: menusLoading,
        isError: menusError,
    } = useGetAllAdminMenusQuery();

    const {
        data: permissionsData,
        isLoading: permissionsLoading,
        isError: permissionsError,
    } = useGetAllPermissionQuery();

    const [assignPermission] = useAssignMenuPermissionMutation();

    // Group permissions by the prefix before "." e.g. "Bookings.View" → "Bookings"
    const permissionGroups: PermissionGroup[] = useMemo(() => {
        if (!permissionsData) return [];

        const map = new Map<string, PermissionGroup>();

        for (const perm of permissionsData) {
            const dotIndex = perm.name.indexOf(".");
            const groupName = dotIndex !== -1 ? perm.name.slice(0, dotIndex) : perm.name;

            if (!map.has(groupName)) {
                map.set(groupName, { groupName, permissions: [] });
            }
            map.get(groupName)!.permissions.push(perm);
        }

        return Array.from(map.values()).sort((a, b) =>
            a.groupName.localeCompare(b.groupName)
        );
    }, [permissionsData]);

    const togglePermission = useCallback((id: number) => {
        setSelectedPermissionIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const toggleGroup = useCallback(
        (groupName: string) => {
            const group = permissionGroups.find((g) => g.groupName === groupName);
            if (!group) return;

            const allSelected = group.permissions.every((p) =>
                selectedPermissionIds.has(p.id)
            );

            setSelectedPermissionIds((prev) => {
                const next = new Set(prev);
                if (allSelected) {
                    group.permissions.forEach((p) => next.delete(p.id));
                } else {
                    group.permissions.forEach((p) => next.add(p.id));
                }
                return next;
            });
        },
        [permissionGroups, selectedPermissionIds]
    );

    const isGroupFullySelected = useCallback(
        (groupName: string) => {
            const group = permissionGroups.find((g) => g.groupName === groupName);
            if (!group || group.permissions.length === 0) return false;
            return group.permissions.every((p) => selectedPermissionIds.has(p.id));
        },
        [permissionGroups, selectedPermissionIds]
    );

    const isGroupPartiallySelected = useCallback(
        (groupName: string) => {
            const group = permissionGroups.find((g) => g.groupName === groupName);
            if (!group) return false;
            const selectedCount = group.permissions.filter((p) =>
                selectedPermissionIds.has(p.id)
            ).length;
            return selectedCount > 0 && selectedCount < group.permissions.length;
        },
        [permissionGroups, selectedPermissionIds]
    );

    const handleSubmit = useCallback(async (): Promise<AssignMenuPermissionResult[]> => {
        if (!selectedMenuId || selectedPermissionIds.size === 0) return [];

        const permissionsMap = new Map(
            (permissionsData ?? []).map((p) => [p.id, p.name])
        );

        const results = await Promise.allSettled(
            Array.from(selectedPermissionIds).map((permissionId) =>
                assignPermission({ menuId: selectedMenuId, permissionId }).unwrap()
            )
        );

        return results.map((result, index) => {
            const permId = Array.from(selectedPermissionIds)[index];
            return {
                permissionId: permId,
                permissionName: permissionsMap.get(permId) ?? String(permId),
                success: result.status === "fulfilled",
                error:
                    result.status === "rejected"
                        ? String((result.reason as Error)?.message ?? "Unknown error")
                        : undefined,
            };
        });
    }, [selectedMenuId, selectedPermissionIds, assignPermission, permissionsData]);

    const resetForm = useCallback(() => {
        setSelectedMenuId(null);
        setSelectedPermissionIds(new Set());
    }, []);

    const isValid = !!selectedMenuId && selectedPermissionIds.size > 0;

    return {
        // state
        selectedMenuId,
        setSelectedMenuId,
        selectedPermissionIds,
        isValid,
        // data
        menus: menuData ?? [],
        permissionGroups,
        // loading/error
        menusLoading,
        permissionsLoading,
        menusError,
        permissionsError,
        // actions
        togglePermission,
        toggleGroup,
        isGroupFullySelected,
        isGroupPartiallySelected,
        handleSubmit,
        resetForm,
    };
}