import React from "react";
// import { useDispatch } from "react-redux";
// import type { AppDispatch } from "../../../app/store";

import PermissionRow from "./Permissionrow";
import type { MenuWithResolved } from "../hooks/usePermissionGrid";
// import { expandAllMenus } from "../slice/RolePermissionSlice";
import type { PermissionKey } from "../types/SystemRolePermission.types";

interface MenuAccessTabProps {
  menus: MenuWithResolved[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
  expandedIds: string[];
  isSaving: boolean;

  onToggleExpand: (menuId: string) => void;
  onTogglePermission: (
    menuId: string,
    key: PermissionKey,
    current: boolean,
  ) => void;
  onToggleView: (menuId: string, current: boolean) => void;
  onAddSubMenu: (parentMenuId: string) => void;
  onAddNewMenu: () => void;
  onEditMenu: (menu: MenuWithResolved) => void;
  // In PermissionRowProps, add:
  onMapMenu: (menu: MenuWithResolved) => void;
  onPermMenu: (menu: MenuWithResolved) => void; // add this
}

const SkeletonRow: React.FC<{ isRoot?: boolean }> = ({ isRoot }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      padding: isRoot ? "14px 20px" : "12px 20px 12px 52px",
      background: isRoot ? "#FCFCFC" : "#fff",
      borderRadius: isRoot ? 10 : 0,
      marginBottom: isRoot ? 2 : 0,
      borderBottom: isRoot ? "none" : "1px solid #F0FAF4",
      gap: 10,
    }}
  >
    {isRoot && (
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 4,
          background: "#E8F5EE",
          flexShrink: 0,
        }}
      />
    )}
    <div
      style={{
        flex: 1,
        height: 14,
        borderRadius: 6,
        background: "#E8F5EE",
        maxWidth: isRoot ? 160 : 120,
      }}
    />
    <div
      style={{
        width: 28,
        height: 16,
        borderRadius: 8,
        background: "#E8F5EE",
        flexShrink: 0,
      }}
    />
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: 4,
        background: "#E8F5EE",
        flexShrink: 0,
      }}
    />
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: 4,
        background: "#E8F5EE",
        flexShrink: 0,
      }}
    />
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: 4,
        background: "#E8F5EE",
        flexShrink: 0,
      }}
    />
  </div>
);

const PermissionSkeleton: React.FC = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 4,
      animation: "pulse 1.4s ease-in-out infinite",
    }}
  >
    <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    {[0, 1, 2].map((i) => (
      <div key={i}>
        <SkeletonRow isRoot />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    ))}
  </div>
);

const MenuAccessTab: React.FC<MenuAccessTabProps> = ({
  menus,
  isLoading,
  isSaving,
  refetch,
  expandedIds,
  onToggleExpand,
  onTogglePermission,
  onToggleView,
  onAddSubMenu,
  onAddNewMenu,
  onEditMenu,
  onMapMenu,
  onPermMenu,
}) => {
  // const dispatch = useDispatch<AppDispatch>();

  // useEffect(() => {
  //     if (menus.length > 0) {
  //         const rootIds = menus.map((m) => m.menuId);
  //         dispatch(expandAllMenus(rootIds));
  //     }
  // }, [menus[0]?.menuId]);

  return (
    // <div style={{ position: "relative" }}>

    //   {/* Menu rows */}
    //   <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    //     {menus.map((menu) => (
    //       <PermissionRow
    //         key={`root-${menu.menuId}`}
    //         menu={menu}
    //         depth={0}
    //         isExpanded={expandedIds.includes(menu.menuId)}
    //         onToggleExpand={onToggleExpand}
    //         onTogglePermission={onTogglePermission}
    //         onToggleView={onToggleView}
    //         expandedIds={expandedIds}
    //         onAddSubMenu={onAddSubMenu}
    //         onEditMenu={onEditMenu}
    //         onMapMenu={onMapMenu}
    //         onPermMenu={onPermMenu}
    //       />
    //     ))}
    //   </div>

    //   {/* Add New Menu button */}
    //   <div
    //     style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}
    //   >
    //     <button
    //       onClick={onAddNewMenu}
    //       style={{
    //         display: "flex",
    //         alignItems: "center",
    //         gap: 8,
    //         background: "#1B4332",
    //         color: "#fff",
    //         border: "none",
    //         borderRadius: 50,
    //         padding: "10px 20px",
    //         fontSize: 14,
    //         fontWeight: 600,
    //         cursor: "pointer",
    //       }}
    //     >
    //       <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    //         <circle cx="8" cy="8" r="7.5" stroke="#fff" strokeOpacity="0.4" />
    //         <path
    //           d="M8 4.5v7M4.5 8h7"
    //           stroke="#fff"
    //           strokeWidth="1.6"
    //           strokeLinecap="round"
    //         />
    //       </svg>
    //       Add New Menu
    //     </button>
    //   </div>
    // </div>

    <div style={{ position: "relative" }}>
      {/* Save overlay — blocks interaction while saving */}
      {isSaving && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            background: "rgba(255,255,255,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            backdropFilter: "blur(1px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#fff",
              padding: "10px 20px",
              borderRadius: 50,
              border: "1px solid #B7E4C7",
              boxShadow: "0 2px 12px rgba(27,67,50,0.08)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{ animation: "spin 0.8s linear infinite" }}
            >
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <circle cx="8" cy="8" r="6" stroke="#B7E4C7" strokeWidth="2" />
              <path
                d="M8 2a6 6 0 016 6"
                stroke="#1B4332"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1B4332" }}>
              Saving…
            </span>
          </div>
        </div>
      )}

      {/* Skeleton while loading */}
      {isLoading ? (
        <PermissionSkeleton />
      ) : menus.length === 0 ? (
        <div
          style={{
            padding: "40px 0",
            textAlign: "center",
            color: "#52796F",
            fontSize: 14,
          }}
        >
          No menus configured yet.{" "}
          <button
            onClick={refetch}
            style={{
              color: "#1B4332",
              fontWeight: 600,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {menus.map((menu) => (
            <PermissionRow
              key={`root-${menu.menuId}`}
              menu={menu}
              depth={0}
              isExpanded={expandedIds.includes(menu.menuId)}
              onToggleExpand={onToggleExpand}
              onTogglePermission={onTogglePermission}
              onToggleView={onToggleView}
              expandedIds={expandedIds}
              onAddSubMenu={onAddSubMenu}
              onEditMenu={onEditMenu}
              onMapMenu={onMapMenu}
              onPermMenu={onPermMenu}
              isSaving={isSaving} // ← pass down
            />
          ))}
        </div>
      )}

      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}
      >
        <button
          onClick={onAddNewMenu}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#1B4332",
            color: "#fff",
            border: "none",
            borderRadius: 50,
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7.5" stroke="#fff" strokeOpacity="0.4" />
            <path
              d="M8 4.5v7M4.5 8h7"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          Add New Menu
        </button>
      </div>
    </div>
  );
};

export default MenuAccessTab;
