import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../app/store";

import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useApiMutation } from "../../../shared/hooks/useApiMutation";

import { useGetAllRolesQuery } from "../services/SystemRoleApi";
import {
  useGetAllMenusQuery,
  useCreateMenuMutation,
  useUpdateMenuMutation,
} from "../services/SystemMenuapi";
import {
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from "../services/SystemRoleApi";
import {
  useGetRoleMenuTreeQuery,
  useBulkAssignMenusToRoleMutation,
  useCreateRoleMenuMappingMutation,
} from "../services/Systemrolemenumappingapi";

import { selectRole, setActiveTab } from "../slice/RolePermissionSlice";
import { useRoleModal } from "../hooks/useRoleModal";
import {
  usePermissionGrid,
  type MenuWithResolved,
} from "../hooks/usePermissionGrid";

import RoleSidebar from "../components/Rolesidebar";
import RoleFormModal from "../components/Roleformmodal";
import MenuFormModal from "../components/Menuformmodal";
import MenuAccessTab from "../components/Menuaccesstab";

import {
  ROLE_PAGE_SIZE,
  MENU_PAGE_SIZE,
  ENABLE_AUTO_ROLE_MAPPING,
} from "../constants/RolePermissionConstants";
import type {
  MenuItem,
  PermissionTab,
} from "../types/SystemRolePermission.types";
import type { RoleMenuTreeItem } from "../services/Systemrolemenumappingapi";
import type { CreateMenuDto } from "../types/SystemRolePermission.types";
import { ContentContainer } from "../../../shared/components/ContentContainer/ContentContainer";
import MapToRoleModal from "../components/MapToRoleModal";

import MenuPermissionModal from "../components/MenuPermissionModal";

// import { Divider } from "antd";

// ─── Menu modal state ─────────────────────────────────────────────────────────

interface MenuModalState {
  open: boolean;
  editing: MenuItem | null;
  defaultParentId: string | null;
  defaultIcon: string;
}

const MENU_MODAL_CLOSED: MenuModalState = {
  open: false,
  editing: null,
  defaultParentId: null,
  defaultIcon: "-",
};

// ── Map-to-role modal state ────────────────────────────────────────────────
interface MapModalState {
  open: boolean;
  menu: MenuWithResolved | null;
}

// ─── Tab button ───────────────────────────────────────────────────────────────

const TabBtn: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: "none",
      border: "none",
      padding: "4px",
      marginRight: 28,
      fontSize: 14,
      fontWeight: active ? 600 : 400,
      color: active ? "#1B4332" : "#52796F",
      borderBottom: active ? "2px solid #1B4332" : "2px solid transparent",
      cursor: "pointer",
      transition: "all 0.15s",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </button>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const RolePermissionPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { message } = useUILibrary();

  const { selectedRoleId, activeTab, expandedMenuIds, isDirty } = useSelector(
    (state: RootState) => state.rolePermissionUi,
  );

  // ── Local state ────────────────────────────────────────────────────────────
  const [menuModalState, setMenuModalState] =
    useState<MenuModalState>(MENU_MODAL_CLOSED);
  const [isMenuSubmitting, setIsMenuSubmitting] = useState(false);
  const [isRoleTransitioning, setIsRoleTransitioning] = useState(false);

  // ── Handler: Menu submit (create + edit) ───────────────────────────────────
  const [menuStatusMsg, setMenuStatusMsg] = useState<string | null>(null);

  const [mapModalState, setMapModalState] = useState<MapModalState>({
    open: false,
    menu: null,
  });
  const [mapStatusMsg, setMapStatusMsg] = useState<string | null>(null);
  const [isMapSubmitting, setIsMapSubmitting] = useState(false);

  // Add state inside the component
  const [permModalState, setPermModalState] = useState<{
    open: boolean;
    menuId: string;
    menuName: string;
  } | null>(null);

  const handleOpenPermModal = useCallback((menu: MenuWithResolved) => {
    setPermModalState({
      open: true,
      menuId: menu.menuId,
      menuName: menu.menuName,
    });
  }, []);

  const handleClosePermModal = useCallback(() => {
    setPermModalState(null);
  }, []);

  const handleCloseMapModal = useCallback(() => {
    setMapModalState({ open: false, menu: null });
    setMapStatusMsg(null);
  }, []);

  // ── Role modal ─────────────────────────────────────────────────────────────
  const {
    isOpen: isRoleModalOpen,
    editingRecord: editingRole,
    openCreate: openCreateRole,
    openEdit: openEditRole,
    close: closeRoleModal,
  } = useRoleModal();

  // ── API queries ────────────────────────────────────────────────────────────
  const { data: rolesData, isLoading: rolesLoading } = useGetAllRolesQuery({
    page: 1,
    pageSize: ROLE_PAGE_SIZE,
  });

  const { data: menusData } = useGetAllMenusQuery({
    page: 1,
    pageSize: MENU_PAGE_SIZE,
  });

  const {
    data: roleMenuTree,
    isFetching: treeFetching,
    error: treeError,
    refetch: refetchTree,
  } = useGetRoleMenuTreeQuery(selectedRoleId!, { skip: !selectedRoleId });

  // ── Permission grid ────────────────────────────────────────────────────────
  const treeMenus: RoleMenuTreeItem[] = roleMenuTree ?? [];

  const {
    mergedMenus,
    handleTogglePermission,
    handleToggleView,
    handleExpandMenu,
    handleResetDraft,
    buildSavePayload,
  } = usePermissionGrid(treeMenus);

  // ── Mutations: Role ────────────────────────────────────────────────────────
  const createRoleApi = useApiMutation(useCreateRoleMutation, {
    successMessage: "Role created",
    onSuccess: closeRoleModal,
  });
  const updateRoleApi = useApiMutation(useUpdateRoleMutation, {
    successMessage: "Role updated",
    onSuccess: closeRoleModal,
  });

  // ── Mutations: Menu ────────────────────────────────────────────────────────
  // Raw hook — we manage loading/success/close ourselves
  const [createMenuRaw] = useCreateMenuMutation();

  // updateMenuApi — onSuccess intentionally left empty here;
  // the handleMenuSubmit finally block closes the modal after await resolves.
  const updateMenuApi = useApiMutation(useUpdateMenuMutation, {
    successMessage: "Menu updated",
  });

  // ── Mutations: Role-menu mapping ───────────────────────────────────────────
  const [createRoleMenuMapping] = useCreateRoleMenuMappingMutation();
  const [bulkAssignMenus, { isLoading: isSaving }] =
    useBulkAssignMenusToRoleMutation();

  // ── Derived ────────────────────────────────────────────────────────────────
  const roles = rolesData?.items ?? [];
  const flatMenus = menusData?.items ?? [];
  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const selectedRoleName = selectedRole?.roleName;
  const roleSubmitting = createRoleApi.isLoading || updateRoleApi.isLoading;
  const isTreeLoading = isRoleTransitioning || treeFetching;

  const roleServerErrors = editingRole
    ? updateRoleApi.error?.fieldErrors
    : createRoleApi.error?.fieldErrors;

  const menuServerErrors = menuModalState.editing
    ? updateMenuApi.error?.fieldErrors
    : null;

  // const parentMenuName = useMemo(() => {
  //   if (!menuModalState.defaultParentId) return null;
  //   return (
  //     flatMenus.find((m) => m.menuId === menuModalState.defaultParentId)
  //       ?.menuName ?? null
  //   );
  // }, [menuModalState.defaultParentId, flatMenus]);
  const parentMenuName = useMemo(() => {
    // console.log("defaultParentId:", menuModalState.defaultParentId);

    // console.log(
    //   "flatMenus:",
    //   flatMenus.map((m) => ({
    //     menuId: m.menuId,
    //     menuName: m.menuName,
    //   })),
    // );

    if (!menuModalState.defaultParentId) {
      // console.log("No defaultParentId found");
      return null;
    }

    const matchedMenu = flatMenus.find(
      (m) => m.menuId === menuModalState.defaultParentId,
    );

    // console.log("Matched Menu:", matchedMenu);

    return matchedMenu?.menuName ?? null;
  }, [menuModalState.defaultParentId, flatMenus]);

  const TABS: Array<{ key: PermissionTab; label: string }> = [
    { key: "menu", label: "Menu Access" },
    // { key: "api", label: "API Permissions" },
    // { key: "data", label: "Data Access" },
  ];

  const handleOpenMapModal = useCallback((menu: MenuWithResolved) => {
    setMapModalState({ open: true, menu });
  }, []);

  // ── Effects ────────────────────────────────────────────────────────────────
  // useEffect(() => {
  //   if (!selectedRoleId) return;
  //   setIsRoleTransitioning(true);
  // }, [selectedRoleId]);

  // useEffect(() => {
  //   if (!treeFetching) setIsRoleTransitioning(false);
  // }, [treeFetching]);

  useEffect(() => {
    setIsRoleTransitioning(treeFetching);
  }, [treeFetching, selectedRoleId]);

  // ← add here
  useEffect(() => {
    if (!selectedRoleId) return;
    handleResetDraft();
  }, [selectedRoleId]);

  // ── Handlers: Role ─────────────────────────────────────────────────────────
  const handleRoleSelect = useCallback(
    (roleId: string) => dispatch(selectRole(roleId)),
    [dispatch],
  );

  const handleMapToRoles = useCallback(
    async (selectedRoleIds: string[]) => {
      if (!mapModalState.menu) return;
      setIsMapSubmitting(true);
      const menuId = mapModalState.menu.menuId;
      let successCount = 0;
      let failCount = 0;

      for (const roleId of selectedRoleIds) {
        setMapStatusMsg(
          `Mapping to role ${successCount + failCount + 1} of ${selectedRoleIds.length}…`,
        );
        try {
          await createRoleMenuMapping({
            roleId,
            menuId,
            isActive: true,
          }).unwrap();
          successCount++;
        } catch {
          failCount++;
        }
      }

      setMapStatusMsg(null);
      setIsMapSubmitting(false);

      if (failCount === 0) {
        message.success(
          `Mapped to ${successCount} role${successCount !== 1 ? "s" : ""} successfully`,
        );
      } else {
        message.warning(`${successCount} mapped, ${failCount} failed`);
      }

      handleCloseMapModal();
    },
    [mapModalState.menu, createRoleMenuMapping, message, handleCloseMapModal],
  );

  const handleRoleSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      if (editingRole) {
        await updateRoleApi.mutate({ id: editingRole.id, ...values } as any);
      } else {
        await createRoleApi.mutate(values as any);
      }
    },
    [editingRole, createRoleApi, updateRoleApi],
  );

  // ── Handlers: Menu modal open ──────────────────────────────────────────────

  const handleAddNewMenu = useCallback(() => {
    setMenuModalState({
      open: true,
      editing: null,
      defaultParentId: "",
      defaultIcon: "-",
    });
  }, []);

  const handleAddSubMenu = useCallback((parentMenuId: string) => {
    setMenuModalState({
      open: true,
      editing: null,
      defaultParentId: parentMenuId,
      defaultIcon: "-",
    });
  }, []);

  // Edit icon clicked on any row — opens modal pre-filled with that menu's data
  // const handleEditMenu = useCallback((menu: MenuWithResolved) => {
  //   // Cast: MenuWithResolved has all fields MenuItem has (it extends RoleMenuTreeItem
  //   // which mirrors MenuItem). Explicit mapping avoids type cast issues.

  //   const fullMenu = flatMenus.find((m) => m.menuId === menu.menuId);

  //   const asMenuItem: MenuItem = {
  //     menuId: menu.menuId,
  //     menuName: menu.menuName,
  //     parentMenuId: menu.parentMenuId,
  //     orderNo: menu.orderNo,
  //     isAssigned: menu.isAssigned,
  //     routeUrl: menu.routeUrl,
  //     icon: menu.icon,
  //     isActive: menu.isActive,
  //     // isShow: menu.isShow,
  //     isShow: fullMenu?.isShow ?? menu.isShow,
  //   };
  //   setMenuModalState({
  //     open: true,
  //     editing: asMenuItem,
  //     defaultParentId: null, // ignored in edit mode
  //     defaultIcon: menu.icon ?? "-",
  //   });
  // }, []);

  // ✅ Fix
  const handleEditMenu = useCallback(
    (menu: MenuWithResolved) => {
      const fullMenu = flatMenus.find((m) => m.menuId === menu.menuId);

      const asMenuItem: MenuItem = {
        menuId: menu.menuId,
        menuName: menu.menuName,
        parentMenuId: menu.parentMenuId,
        orderNo: menu.orderNo,
        isAssigned: menu.isAssigned,
        routeUrl: menu.routeUrl,
        icon: menu.icon,
        isActive: menu.isActive,
        isShow: fullMenu?.isShow ?? menu.isShow,
      };
      setMenuModalState({
        open: true,
        editing: asMenuItem,
        defaultParentId: null,
        defaultIcon: menu.icon ?? "-",
      });
    },
    [flatMenus],
  ); // ← add flatMenus

  const handleMenuClose = useCallback(() => {
    setMenuModalState(MENU_MODAL_CLOSED);
  }, []);

  const handleMenuSubmit = useCallback(
    async (values: Record<string, unknown>) => {
      setIsMenuSubmitting(true);
      try {
        // ── EDIT path ────────────────────────────────────────────────
        if (menuModalState.editing) {
          const { menuId, isActive } = menuModalState.editing;
          setMenuStatusMsg("Updating menu, please wait…");
          await updateMenuApi.mutate({
            id: menuId,
            menuName: values.menuName as string,
            parentMenuId: (values.parentMenuId as string) || "",
            routeUrl: (values.routeUrl as string) ?? "",
            icon: (values.icon as string) || "-",
            orderNo: Number(values.orderNo) || 1,
            isActive: isActive ?? true,
            isShow: Boolean(values.isShow),
          } as any);
          setMenuStatusMsg(null);
          setMenuModalState(MENU_MODAL_CLOSED);
          return;
        }

        // ── CREATE path ──────────────────────────────────────────────
        const parentMenuId = (() => {
          if (menuModalState.defaultParentId)
            return menuModalState.defaultParentId;
          const v = values.parentMenuId;
          return v === "" || v === undefined ? "" : (v as string);
        })();

        const payload: CreateMenuDto = {
          menuName: values.menuName as string,
          parentMenuId,
          routeUrl: (values.routeUrl as string) ?? "",
          icon: (values.icon as string) || "-",
          orderNo: Number(values.orderNo) || 1,
          isActive: true,
          isShow: Boolean(values.isShow),
        };

        // Step 1 — create menu
        const createdMenu = await createMenuRaw(payload).unwrap();
        console.log("createdMenu keys:", Object.keys(createdMenu), createdMenu);
        const newMenuId =
          (createdMenu as any).id ?? (createdMenu as any).menuId;

        // Step 2 — auto role-menu mapping
        if (ENABLE_AUTO_ROLE_MAPPING && selectedRoleId && newMenuId) {
          setMenuStatusMsg("Mapping menu to role, please wait…");
          try {
            await createRoleMenuMapping({
              roleId: selectedRoleId,
              menuId: newMenuId,
              isActive: true,
            }).unwrap();
            setMenuStatusMsg("Mapping complete!");
            // brief pause so user sees the success state
            await new Promise((res) => setTimeout(res, 800));
            message.success("Menu created and mapped to role");
          } catch {
            setMenuStatusMsg(null);
            message.warning(
              "Menu created but could not be mapped to this role automatically.",
            );
          }
        } else {
          message.success("Menu created");
        }

        setMenuStatusMsg(null);
        setMenuModalState(MENU_MODAL_CLOSED);
      } catch {
        setMenuStatusMsg(null);
      } finally {
        setIsMenuSubmitting(false);
      }
    },
    [
      menuModalState,
      createMenuRaw,
      updateMenuApi,
      createRoleMenuMapping,
      selectedRoleId,
      message,
    ],
  );

  // ── Handler: Save permissions ──────────────────────────x`────────────────────
  const handleSavePermissions = useCallback(async () => {
    if (!selectedRoleId) {
      message.warning("Please select a role first");
      return;
    }
    try {
      await bulkAssignMenus({
        roleId: selectedRoleId,
        menuIds: buildSavePayload(),
      }).unwrap();
      message.success("Permissions saved successfully");
      handleResetDraft();
    } catch {
      message.error("Failed to save permissions. Please try again.");
    }
  }, [
    selectedRoleId,
    buildSavePayload,
    bulkAssignMenus,
    handleResetDraft,
    message,
  ]);

  // Auto-select the first role (e.g. Admin) when roles load
  useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      dispatch(selectRole(roles[0].id));
    }
  }, [roles, selectedRoleId, dispatch]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ContentContainer>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          border: "1px solid #E8F5EE",
          borderRadius: 16,
          padding: 12,
        }}
      >
        {/* Main panel */}
        <div
          style={{
            background: "#fff",
            // borderRadius: 16,
            // border: "1px solid #E8F5EE",
            // padding: 12,
            display: "flex",
            gap: 20,
            minHeight: 600,
          }}
        >
          {/* Left: Role Sidebar */}
          <RoleSidebar
            roles={roles}
            selectedRoleId={selectedRoleId}
            onSelectRole={handleRoleSelect}
            onAddRole={openCreateRole}
            onEditRole={openEditRole}
            isLoading={rolesLoading}
          />

          {/* Right: Permission Panel */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {selectedRole ? (
              <>
                {/* Role header + action buttons */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 4,
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#1B4332",
                        margin: 0,
                      }}
                    >
                      {selectedRole.roleName} Role
                    </h2>
                    <p
                      style={{
                        color: "#52796F",
                        fontSize: 13,
                        margin: "4px 0 0",
                      }}
                    >
                      Roles permissions &amp; menu access
                    </p>
                  </div>

                  <div
                    style={{ display: "flex", gap: 10, alignItems: "center" }}
                  >
                    {/* <button style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        background: "#fff", border: "1.5px solid #B7E4C7",
                                        borderRadius: 50, padding: "8px 16px",
                                        color: "#1B4332", fontSize: 13, fontWeight: 500, cursor: "pointer",
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <circle cx="7" cy="7" r="6" stroke="#1B4332" strokeWidth="1.2" />
                                            <path d="M7 4v3.5l2 2" stroke="#1B4332" strokeWidth="1.2" strokeLinecap="round" />
                                        </svg>
                                        Audit log
                                    </button> */}

                    {/* <button style={{
                                        display: "flex", alignItems: "center", gap: 6,
                                        background: "#fff", border: "1.5px solid #B7E4C7",
                                        borderRadius: 50, padding: "8px 16px",
                                        color: "#1B4332", fontSize: 13, fontWeight: 500, cursor: "pointer",
                                    }}>
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <rect x="1" y="4" width="9" height="9" rx="2" stroke="#1B4332" strokeWidth="1.2" />
                                            <path d="M4 4V3a2 2 0 012-2h5a2 2 0 012 2v5a2 2 0 01-2 2h-1"
                                                stroke="#1B4332" strokeWidth="1.2" strokeLinecap="round" />
                                        </svg>
                                        Clone
                                    </button> */}

                    <button
                      onClick={handleSavePermissions}
                      disabled={!isDirty || isSaving}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background:
                          isDirty && !isSaving ? "#1B4332" : "#6B9E85",
                        color: "#fff",
                        border: "none",
                        borderRadius: 50,
                        padding: "9px 20px",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: isDirty && !isSaving ? "pointer" : "default",
                        transition: "background 0.2s",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M13 2H4L2 4v9a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1z"
                          stroke="#fff"
                          strokeWidth="1.3"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M5 2v4h6V2M5 13v-4h6v4"
                          stroke="#fff"
                          strokeWidth="1.3"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {isSaving ? "Saving…" : "Save Change"}
                    </button>
                  </div>
                </div>

                {/* Tab bar */}
                <div
                  style={{
                    display: "flex",
                    borderBottom: "1.5px solid #E8F5EE",
                    marginBottom: 4,
                  }}
                >
                  {TABS.map((tab) => (
                    <TabBtn
                      key={`tab-${tab.key}`}
                      label={tab.label}
                      active={activeTab === tab.key}
                      onClick={() => dispatch(setActiveTab(tab.key))}
                    />
                  ))}
                </div>

                {/* Tab content */}
                {activeTab === "menu" && (
                  <MenuAccessTab
                    menus={mergedMenus as any}
                    isLoading={isTreeLoading}
                    error={treeError}
                    refetch={refetchTree}
                    expandedIds={expandedMenuIds}
                    onToggleExpand={handleExpandMenu}
                    onTogglePermission={handleTogglePermission}
                    onToggleView={handleToggleView}
                    onAddSubMenu={handleAddSubMenu}
                    onAddNewMenu={handleAddNewMenu}
                    onEditMenu={handleEditMenu}
                    onMapMenu={handleOpenMapModal}
                    onPermMenu={handleOpenPermModal}
                    isSaving={isSaving}
                  />
                )}
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#52796F",
                  gap: 12,
                }}
              >
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle
                    cx="24"
                    cy="24"
                    r="22"
                    stroke="#B7E4C7"
                    strokeWidth="2"
                  />
                  <path
                    d="M16 24h16M24 16v16"
                    stroke="#52796F"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <p style={{ fontSize: 15, margin: 0 }}>
                  Select a role from the sidebar to manage permissions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Role modal */}
      <RoleFormModal
        open={isRoleModalOpen}
        onClose={closeRoleModal}
        editingRecord={editingRole}
        onSubmit={handleRoleSubmit}
        isSubmitting={roleSubmitting}
        serverErrors={roleServerErrors}
      />

      {/* Menu modal — single instance handles create-root, create-sub, edit */}
      {menuModalState.open && (
        <MenuFormModal
          open={menuModalState.open}
          onClose={handleMenuClose}
          editingRecord={menuModalState.editing}
          allMenus={flatMenus}
          onSubmit={handleMenuSubmit}
          isSubmitting={isMenuSubmitting}
          statusMessage={menuStatusMsg}
          serverErrors={menuServerErrors}
          defaultParentId={menuModalState.defaultParentId}
          defaultIcon={menuModalState.defaultIcon}
          selectedRoleName={selectedRoleName}
          parentMenuName={parentMenuName}
        />
      )}

      {/* At the bottom of the render, alongside RoleFormModal and MenuFormModal: */}
      <MapToRoleModal
        open={mapModalState.open}
        onClose={handleCloseMapModal}
        menuName={mapModalState.menu?.menuName ?? ""}
        roles={roles}
        currentRoleId={selectedRoleId}
        isSubmitting={isMapSubmitting}
        statusMessage={mapStatusMsg}
        onConfirm={handleMapToRoles}
      />

      {permModalState?.open && selectedRoleId && (
        <MenuPermissionModal
          open={permModalState.open}
          onClose={handleClosePermModal}
          menuId={permModalState.menuId}
          menuName={permModalState.menuName}
          roleId={selectedRoleId}
          roleName={selectedRoleName}
        />
      )}
    </ContentContainer>
  );
};

export default RolePermissionPage;
