import React from "react";
import { useUILibrary } from "@commutr/ui/ui-lib";
import type { PermissionKey } from "../types/SystemRolePermission.types";
import { PERMISSION_COLUMNS } from "../constants/RolePermissionConstants";
import type { MenuWithResolved } from "../hooks/usePermissionGrid";

import Security from "../assets/security.svg";
import EditBtnIcn from "../assets/edit_square.svg";
// import TreeIcn from "../assets/account_tree.svg";
import { Tooltip } from "antd";

interface PermissionRowProps {
  menu: MenuWithResolved;
  depth: number;
  isExpanded: boolean;
  onToggleExpand: (menuId: string) => void;
  onTogglePermission: (
    menuId: string,
    key: PermissionKey,
    current: boolean,
    mappingId: string | null,
  ) => void;
  onToggleView: (
    menuId: string,
    current: boolean,
    mappingId: string | null,
  ) => void;
  expandedIds: string[];
  onAddSubMenu: (parentMenuId: string) => void;
  onEditMenu: (menu: MenuWithResolved) => void;
  // In PermissionRowProps, add:
  onMapMenu: (menu: MenuWithResolved) => void;
  onPermMenu: (menu: MenuWithResolved) => void;
  isSaving?: boolean;
}

// ─── Permission Checkbox ──────────────────────────────────────────────────────

// Add this component near EditBtn in Permissionrow.tsx
// const MapBtn: React.FC<{ onClick: (e: React.MouseEvent) => void }> = ({
//   onClick,
// }) => (
//   <button
//     title="Map to roles"
//     onClick={onClick}
//     style={{
//       background: "none",
//       border: "none",
//       cursor: "pointer",
//       padding: "3px 6px",
//       borderRadius: 6,
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       color: "#52796F",
//       opacity: 0.55,
//       flexShrink: 0,
//       transition: "opacity 0.15s",
//     }}
//     onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
//     onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}
//   >
//     {/* <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
//       <circle cx="3" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.2" />
//       <circle cx="11" cy="3" r="1.8" stroke="currentColor" strokeWidth="1.2" />
//       <circle cx="11" cy="11" r="1.8" stroke="currentColor" strokeWidth="1.2" />
//       <path
//         d="M4.8 6.2L9.2 3.8M4.8 7.8L9.2 10.2"
//         stroke="currentColor"
//         strokeWidth="1.2"
//         strokeLinecap="round"
//       />
//     </svg> */}

//     <img src={TreeIcn} alt="Security" width={14} height={14} />
//   </button>
// );

// Add PermBtn component (key/lock icon)
const PermBtn: React.FC<{ onClick: (e: React.MouseEvent) => void }> = ({
  onClick,
}) => (
  <button
    title="Set permissions"
    onClick={onClick}
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "3px 6px",
      borderRadius: 6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#52796F",
      opacity: 0.55,
      flexShrink: 0,
      transition: "opacity 0.15s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}
  >
    {/* <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect
        x="2"
        y="6"
        width="10"
        height="7"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M4.5 6V4.5a3.5 3.5 0 117 0V6"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="7" cy="9.5" r="1" fill="currentColor" />
    </svg> */}
    <img src={Security} alt="Security" width={14} height={14} />
  </button>
);

// ─── Edit Button ──────────────────────────────────────────────────────────────

const EditBtn: React.FC<{ onClick: (e: React.MouseEvent) => void }> = ({
  onClick,
}) => (
  <button
    title="Edit menu"
    onClick={onClick}
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "3px 6px",
      borderRadius: 6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#52796F",
      opacity: 0.55,
      flexShrink: 0,
      transition: "opacity 0.15s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}
  >
    {/* <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M8 4l2 2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg> */}

    <img src={EditBtnIcn} alt="Security" width={14} height={14} />

    {/* <Security /> */}
  </button>
);

// ─── Branch line constants ────────────────────────────────────────────────────
// INDENT_PER_DEPTH: must match your padding-left calculation (depth * 32 + 20)
const INDENT_PER_DEPTH = 32;
const BASE_LEFT = 20;
// The vertical line sits at the centre of the chevron/expand area of the parent
const BRANCH_LEFT_OFFSET = 10; // px from the start of the indent block

// ─── Main ─────────────────────────────────────────────────────────────────────

const PermissionRow: React.FC<PermissionRowProps> = ({
  menu,
  depth,
  isExpanded,
  onToggleExpand,
  onTogglePermission,
  onToggleView,
  expandedIds,
  onAddSubMenu,
  onEditMenu,
  onMapMenu,
  onPermMenu,
  isSaving = false,
}) => {
  const { Switch } = useUILibrary();
  const hasChildren = (menu.children?.length ?? 0) > 0;
  const isRoot = depth === 0;
  const childCount = menu.children?.length ?? 0;
  const viewOn = menu.resolvedAssigned;
  const mappingId = menu.mappingId ?? null;

  // ── Root row ───────────────────────────────────────────────────────────────
  if (isRoot) {
    return (
      <div style={{ position: "relative" }}>
        {/* Root header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 20px",
            // background: "#F8FBF9",
            background: "#FCFCFC",
            borderRadius: 10,
            marginBottom: 2,
            cursor: "pointer", // hasChildren ? "pointer" : "default",
          }}
          onClick={() => onToggleExpand(menu.menuId)}
          // onClick={() => hasChildren && onToggleExpand(menu.menuId)}
        >
          <div
            style={{
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
              transition: "transform 0.2s",
              transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
              opacity: 1, //hasChildren ? 1 : 0,
              flexShrink: 0,
            }}
          >
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path
                d="M1 1.5L6 6.5L11 1.5"
                stroke="#52796F"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <span
            style={{ fontWeight: 700, color: "#2C3437", fontSize: 15, flex: 1 }}
          >
            {menu.menuName}

            {childCount > 0 && (
              <span
                style={{
                  fontSize: 12,
                  color: "#52796F",
                  // background: "#E8F5EE",
                  borderRadius: 50,
                  padding: "2px 10px",
                  marginLeft: 8,
                  marginRight: 12,
                }}
              >
                ({childCount} sub-menu{childCount !== 1 ? "s" : ""})
              </span>
            )}
          </span>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexShrink: 0,
              marginRight: 8,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Tooltip
              title={viewOn ? "Permitted" : "Not Permitted"}
              placement="top"
              mouseEnterDelay={0.4}
            >
              <span style={{ display: "inline-flex" }}>
                <Switch
                  checked={viewOn}
                  onChange={() => {
                    onToggleView(menu.menuId, viewOn, mappingId);
                  }}
                  style={{ background: viewOn ? "#1B4332" : undefined }}
                  size="small"
                  disabled={isSaving}
                />
              </span>
            </Tooltip>
          </div>

          <EditBtn
            onClick={(e) => {
              e.stopPropagation();
              onEditMenu(menu);
            }}
          />

          {/* <MapBtn
            onClick={(e) => {
              e.stopPropagation();
              onMapMenu(menu);
            }}
          /> */}

          <PermBtn
            onClick={(e) => {
              e.stopPropagation();
              onPermMenu(menu);
            }}
          />

          {/* {PERMISSION_COLUMNS.map((col) => (
            <div key={col.key} style={{ width: col.width, flexShrink: 0 }} />
          ))} */}
        </div>

        {/* Children + branch lines */}
        {/* {isExpanded && hasChildren && ( */}
        {isExpanded && (
          <div style={{ position: "relative" }}>
            {/*
             * Vertical trunk line — runs from the top of the first child
             * down to the centre of the last child row.
             * Positioned at depth=1 indent level minus a small offset.
             */}
            <div
              style={{
                position: "absolute",
                left: BASE_LEFT + BRANCH_LEFT_OFFSET,
                // start just below the root header (2px gap)
                top: 0,
                // stop at the centre of the last child (approx 24px = half row height)
                bottom: 24,
                width: 1.5,
                background: "#B7E4C7",
                zIndex: 10,
                borderRadius: 1,
              }}
            />

            {menu.children!.map((child) => (
              <div
                key={`wrapper-${child.menuId}`}
                style={{ position: "relative" }}
              >
                {/*
                 * Horizontal branch — connects vertical trunk to child row label.
                 * Width = one indent unit minus the trunk offset.
                 */}
                <div
                  style={{
                    position: "absolute",
                    left: BASE_LEFT + BRANCH_LEFT_OFFSET,
                    // vertically centred on the row (row padding 12px top + ~10px to text centre)
                    top: 22,
                    width: INDENT_PER_DEPTH - BRANCH_LEFT_OFFSET - 4,
                    height: 1.5,
                    background: "#B7E4C7",
                    zIndex: 10,
                    borderRadius: 2,
                  }}
                />

                <PermissionRow
                  menu={child}
                  depth={depth + 1}
                  isExpanded={expandedIds.includes(child.menuId)}
                  onToggleExpand={onToggleExpand}
                  onTogglePermission={onTogglePermission}
                  onToggleView={onToggleView}
                  expandedIds={expandedIds}
                  onAddSubMenu={onAddSubMenu}
                  onEditMenu={onEditMenu}
                  onMapMenu={onMapMenu}
                  onPermMenu={onPermMenu}
                  isSaving={isSaving}
                />
              </div>
            ))}
            {/* Add sub-menu */}
            <div
              style={{
                padding: "8px 20px 12px 52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                cursor: "pointer",
                // background:"#f8f8f9",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onAddSubMenu(menu.menuId);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6.5" stroke="#3E9B73" />
                <path
                  d="M7 4v6M4 7h6"
                  stroke="#52796F"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              <span style={{ color: "#3E9B73", fontSize: 12, fontWeight: 500 }}>
                Add a sub-menu to ({menu.menuName})
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Leaf / nested row ──────────────────────────────────────────────────────
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 20px",
          paddingLeft: BASE_LEFT + depth * INDENT_PER_DEPTH,
          borderBottom: "1px solid #F0FAF4",
          background: viewOn ? "#fff" : "#FAFAFA",
          transition: "background 0.15s",
        }}
      >
        <span
          style={{
            flex: 1,
            color: viewOn ? "#1B4332" : "#A0AEA8",
            fontSize: 14,
            fontWeight: 500,
            transition: "color 0.15s",
          }}
        >
          {menu.menuName}
        </span>

        <div
          style={{
            width: PERMISSION_COLUMNS[0].width,
            display: "flex",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Tooltip
            title={viewOn ? "Permitted" : "Not Permitted"}
            placement="top"
            mouseEnterDelay={0.4}
          >
            <span style={{ display: "inline-flex" }}>
              <Switch
                checked={viewOn}
                onChange={() => onToggleView(menu.menuId, viewOn, mappingId)}
                style={{ background: viewOn ? "#1B4332" : undefined }}
                size="small"
                disabled={isSaving}
              />
            </span>
          </Tooltip>
        </div>

        <EditBtn
          onClick={(e) => {
            e.stopPropagation();
            onEditMenu(menu);
          }}
        />

        {/* <MapBtn
          onClick={(e) => {
            e.stopPropagation();
            onMapMenu(menu);
          }}
        /> */}
        <PermBtn
          onClick={(e) => {
            e.stopPropagation();
            onPermMenu(menu);
          }}
        />

        {/* VIEW switch */}
      </div>

      {/* Nested children with their own branch lines */}
      {hasChildren && isExpanded && (
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: BASE_LEFT + depth * INDENT_PER_DEPTH + BRANCH_LEFT_OFFSET,
              top: 0,
              bottom: 24,
              width: 1.5,
              background: "#B7E4C7",
              borderRadius: 1,
            }}
          />

          {menu.children!.map((child) => (
            <div
              key={`wrapper-${child.menuId}`}
              style={{ position: "relative" }}
            >
              <div
                style={{
                  position: "absolute",
                  left:
                    BASE_LEFT + depth * INDENT_PER_DEPTH + BRANCH_LEFT_OFFSET,
                  top: 22,
                  width: INDENT_PER_DEPTH - BRANCH_LEFT_OFFSET - 4,
                  height: 1.5,
                  background: "#B7E4C7",
                  borderRadius: 1,
                }}
              />
              <PermissionRow
                menu={child}
                depth={depth + 1}
                isExpanded={expandedIds.includes(child.menuId)}
                onToggleExpand={onToggleExpand}
                onTogglePermission={onTogglePermission}
                onToggleView={onToggleView}
                expandedIds={expandedIds}
                onAddSubMenu={onAddSubMenu}
                onEditMenu={onEditMenu}
                onMapMenu={onMapMenu}
                onPermMenu={onPermMenu}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PermissionRow;
