import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  PermissionKey,
  PermissionTab,
} from "../types/SystemRolePermission.types";

// ─── Draft entry ──────────────────────────────────────────────────────────────

/**
 * One entry per menu in the draft.
 * - `isAssigned`  : desired on/off state
 * - `mappingId`   : the RoleMenuMapping.id from the server (null if not yet created)
 * - `permissions` : the five granular flags (view/create/edit/delete/export)
 */
export interface DraftEntry {
  isAssigned: boolean;
  mappingId: string | null;
  permissions: Record<PermissionKey, boolean>;
}

export type PermissionDraft = Record<string, DraftEntry>;

// ─── State ────────────────────────────────────────────────────────────────────

interface RolePermissionUiState {
  selectedRoleId: string | null;
  activeTab: PermissionTab;
  expandedMenuIds: string[];
  permissionDraft: PermissionDraft;
  isDirty: boolean;
}

const initialState: RolePermissionUiState = {
  selectedRoleId: null,
  activeTab: "menu",
  expandedMenuIds: [],
  permissionDraft: {},
  isDirty: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const rolePermissionSlice = createSlice({
  name: "rolePermissionUi",
  initialState,
  reducers: {
    /** Select a role — resets draft so the new role's tree is shown clean */
    selectRole(state, action: PayloadAction<string>) {
      state.selectedRoleId = action.payload;
      state.permissionDraft = {};
      state.isDirty = false;
      state.expandedMenuIds = [];
    },

    setActiveTab(state, action: PayloadAction<PermissionTab>) {
      state.activeTab = action.payload;
    },

    // ── Expand / collapse ─────────────────────────────────────────────────────

    toggleMenuExpanded(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.expandedMenuIds.indexOf(id);
      if (idx === -1) {
        state.expandedMenuIds.push(id);
      } else {
        state.expandedMenuIds.splice(idx, 1);
      }
    },

    expandAllMenus(state, action: PayloadAction<string[]>) {
      const set = new Set(state.expandedMenuIds);
      action.payload.forEach((id) => set.add(id));
      state.expandedMenuIds = Array.from(set);
    },

    // ── Toggle the top-level isAssigned (VIEW switch) ─────────────────────────

    /**
     * Toggle whether a menu is assigned to the selected role.
     * Carries the mappingId from the server so we know whether to POST or PUT.
     */
    toggleMenuAssigned(
      state,
      action: PayloadAction<{
        menuId: string;
        currentValue: boolean;
        mappingId: string | null;
      }>,
    ) {
      const { menuId, currentValue, mappingId } = action.payload;
      const existing = state.permissionDraft[menuId];

      if (existing) {
        existing.isAssigned = !currentValue;
        // turning off → clear all granular perms too
        if (currentValue) {
          existing.permissions = {
            view: false,
            create: false,
            edit: false,
            delete: false,
            export: false,
          };
        }
      } else {
        state.permissionDraft[menuId] = {
          isAssigned: !currentValue,
          mappingId,
          permissions: currentValue
            ? {
                view: false,
                create: false,
                edit: false,
                delete: false,
                export: false,
              }
            : {
                view: true,
                create: false,
                edit: false,
                delete: false,
                export: false,
              },
        };
      }

      state.isDirty = true;
    },

    // ── Toggle a single granular permission checkbox ──────────────────────────

    togglePermission(
      state,
      action: PayloadAction<{
        menuId: string;
        key: PermissionKey;
        currentValue: boolean;
        mappingId: string | null;
      }>,
    ) {
      const { menuId, key, currentValue, mappingId } = action.payload;
      const existing = state.permissionDraft[menuId];

      if (existing) {
        existing.permissions[key] = !currentValue;
      } else {
        state.permissionDraft[menuId] = {
          isAssigned: true, // checking any perm implies view is on
          mappingId,
          permissions: {
            view: true,
            create: false,
            edit: false,
            delete: false,
            export: false,
            [key]: !currentValue,
          },
        };
      }

      state.isDirty = true;
    },

    // ── Set all permissions at once (used when turning view OFF) ──────────────

    setAllPermissions(
      state,
      action: PayloadAction<{
        menuId: string;
        permissions: Record<PermissionKey, boolean>;
        mappingId: string | null;
      }>,
    ) {
      const { menuId, permissions, mappingId } = action.payload;
      const existing = state.permissionDraft[menuId];

      if (existing) {
        existing.isAssigned = false;
        existing.permissions = permissions;
      } else {
        state.permissionDraft[menuId] = {
          isAssigned: false,
          mappingId,
          permissions,
        };
      }

      state.isDirty = true;
    },

    /** Clear the draft after a successful save */
    resetDraft(state) {
      state.permissionDraft = {};
      state.isDirty = false;
    },

    removeDraftEntries: (state, action: PayloadAction<string[]>) => {
      for (const menuId of action.payload) {
        delete state.permissionDraft[menuId];
      }
      state.isDirty = Object.keys(state.permissionDraft).length > 0;
    },
  },
});

export const {
  selectRole,
  setActiveTab,
  toggleMenuExpanded,
  expandAllMenus,
  toggleMenuAssigned,
  togglePermission,
  setAllPermissions,
  resetDraft,
  removeDraftEntries,
} = rolePermissionSlice.actions;

export default rolePermissionSlice.reducer;
