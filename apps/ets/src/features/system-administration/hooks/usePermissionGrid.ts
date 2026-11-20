import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../app/store";
import {
  togglePermission,
  toggleMenuAssigned,
  setAllPermissions,
  toggleMenuExpanded,
  expandAllMenus,
  resetDraft,
  removeDraftEntries,
} from "../slice/RolePermissionSlice";
import type { PermissionKey } from "../types/SystemRolePermission.types";
import type { RoleMenuTreeItem } from "../services/Systemrolemenumappingapi";
import { DEFAULT_PERMISSIONS } from "../constants/RolePermissionConstants";

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface MenuWithResolved extends RoleMenuTreeItem {
  isShow?: boolean;
  resolvedAssigned: boolean;
  resolvedPermissions: Record<PermissionKey, boolean>;
  children?: MenuWithResolved[];
}

// function filterAssigned(
//   items: RoleMenuTreeItem[],
//   isRoot = true,
// ): RoleMenuTreeItem[] {
//   return items
//     .filter((item) => isRoot || item.isAssigned)
//     .map((item) => ({
//       ...item,
//       children: filterAssigned(item.children ?? [], false),
//     }));
// }

// ─── Filter helper ─────────────────────────────────────────────────────────────
// Rules:
//   - A child row shows only if isAssigned === true
//   - A root row shows only if it has at least one assigned child (after filtering)
//     OR if the root itself is assigned (edge case: root with no children but assigned)
// function filterAssigned(
//   items: RoleMenuTreeItem[],
//   isRoot = true,
// ): RoleMenuTreeItem[] {
//   return items
//     .map((item) => ({
//       ...item,
//       children: filterAssigned(item.children ?? [], false), // filter children first
//     }))
//     .filter((item) => {
//       if (!isRoot) {
//         // Child/sub-menu: only show if assigned
//         return item.isAssigned;
//       }
//       // Root: show if it has at least one assigned child after filtering,
//       // OR if the root itself is assigned (childless root that's mapped)
//       return item.children.length > 0 || item.isAssigned;
//     });
// }

function flattenAll(items: RoleMenuTreeItem[]): RoleMenuTreeItem[] {
  return items.flatMap((m) => [m, ...flattenAll(m.children ?? [])]);
}

// ─── Merge helper ──────────────────────────────────────────────────────────────
function mergeWithDraft(
  item: RoleMenuTreeItem,
  draft: RootState["rolePermissionUi"]["permissionDraft"],
): MenuWithResolved {
  const draftEntry = draft[item.menuId];

  const resolvedAssigned = draftEntry ? draftEntry.isAssigned : item.isAssigned;

  const serverPerms: Record<PermissionKey, boolean> = {
    view: item.isAssigned,
    create: false,
    edit: false,
    delete: false,
    export: false,
  };

  const resolvedPermissions = draftEntry
    ? { ...serverPerms, ...draftEntry.permissions }
    : serverPerms;

  return {
    ...item,
    resolvedAssigned,
    resolvedPermissions,
    children: item.children?.map((child) => mergeWithDraft(child, draft)),
  };
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export const usePermissionGrid = (rawMenus: RoleMenuTreeItem[]) => {
  const dispatch = useDispatch<AppDispatch>();
  const { permissionDraft, isDirty, expandedMenuIds } = useSelector(
    (state: RootState) => state.rolePermissionUi,
  );

  // ✅ Filter isAssigned:false BEFORE merging — business rule, not UI concern
  // const assignedMenus = useMemo(() => filterAssigned(rawMenus), [rawMenus]);

  // ✅ Use assignedMenus (not rawMenus) for everything downstream
  // const mergedMenus = useMemo(
  //   () => assignedMenus.map((m) => mergeWithDraft(m, permissionDraft)),
  //   [assignedMenus, permissionDraft],
  // );

  const mergedMenus = useMemo(
    () => rawMenus.map((m) => mergeWithDraft(m, permissionDraft)),
    [rawMenus, permissionDraft],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────────

  // ✅ Fixed: 3-arg signature matches MenuAccessTabProps.onToggleView
  // mappingId is looked up internally from the draft, not passed from the UI layer
  const handleToggleView = (menuId: string, current: boolean) => {
    // Find mappingId from draft if it exists (UI doesn't need to know about it)
    const mappingId = permissionDraft[menuId]?.mappingId ?? null;

    const found = flattenAll(rawMenus).find((m) => m.menuId === menuId);
    const descendants = found?.children?.length
      ? flattenAll(found.children)
      : [];

    if (current) {
      // Turning OFF — clear all permissions
      dispatch(
        setAllPermissions({
          menuId,
          permissions: { ...DEFAULT_PERMISSIONS },
          mappingId,
        }),
      );
      descendants.forEach((child) => {
        const childMappingId = permissionDraft[child.menuId]?.mappingId ?? null;
        dispatch(
          setAllPermissions({
            menuId: child.menuId,
            permissions: { ...DEFAULT_PERMISSIONS },
            mappingId: childMappingId,
          }),
        );
      });
    } else {
      // Turning ON
      dispatch(
        toggleMenuAssigned({ menuId, currentValue: current, mappingId }),
      );
      if (descendants.length) {
        // Remove draft overrides → mergeWithDraft falls back to rawMenus isAssigned
        dispatch(removeDraftEntries(descendants.map((c) => c.menuId)));
      }
    }
  };

  // ✅ Fixed: 3-arg signature matches MenuAccessTabProps.onTogglePermission
  // mappingId resolved internally — UI layer only knows menuId + key + current
  const handleTogglePermission = (
    menuId: string,
    key: PermissionKey,
    current: boolean,
  ) => {
    const mappingId = permissionDraft[menuId]?.mappingId ?? null;
    dispatch(
      togglePermission({ menuId, key, currentValue: current, mappingId }),
    );
  };

  const handleExpandMenu = (menuId: string) => {
    dispatch(toggleMenuExpanded(menuId));
  };

  const handleExpandAll = (ids: string[]) => {
    dispatch(expandAllMenus(ids));
  };

  const handleResetDraft = () => {
    dispatch(resetDraft());
  };

  const buildSavePayload = (): string[] => {
    const assignedSet = new Set<string>(
      flattenAll(rawMenus)
        .filter((m) => m.isAssigned)
        .map((m) => m.menuId),
    );
    for (const [menuId, entry] of Object.entries(permissionDraft)) {
      if (entry.isAssigned) assignedSet.add(menuId);
      else assignedSet.delete(menuId);
    }
    return Array.from(assignedSet);
  };

  return {
    mergedMenus,
    isDirty,
    expandedMenuIds,
    handleTogglePermission, // (menuId, key, current) — 3 args ✅
    handleToggleView, // (menuId, current)      — 2 args ✅
    handleExpandMenu,
    handleExpandAll,
    handleResetDraft,
    buildSavePayload,
  };
};
