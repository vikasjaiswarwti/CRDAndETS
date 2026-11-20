import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "antd";
import type { ApprovedUser } from "../types/Employee.types";
import {
  useGetRoleAssignmentsQuery,
  useSyncUserRolesMutation,
} from "../services/Employeeapi";

// ─── Config ───────────────────────────────────────────────────────────────────

// Canonical Employee role ID (case-insensitive match used in guard)
// const EMPLOYEE_ROLE_ID = "b2ad6567-ae15-48be-8c90-40d412527790";

type RoleStatus = "current" | "newly_added" | "will_be_removed" | "available";

const ROLE_CFG: Record<
  RoleStatus,
  {
    rowBg: string;
    rowBorder: string;
    checkColor: string;
    badgeBg: string;
    badgeText: string;
    label: string;
  }
> = {
  current: {
    rowBg: "#fffbeb",
    rowBorder: "#fcd34d",
    checkColor: "#b45309",
    badgeBg: "#b45309",
    badgeText: "#fff",
    label: "Current",
  },
  newly_added: {
    rowBg: "#eff6ff",
    rowBorder: "#93c5fd",
    checkColor: "#2563eb",
    badgeBg: "#2563eb",
    badgeText: "#fff",
    label: "Adding",
  },
  will_be_removed: {
    rowBg: "#fef2f2",
    rowBorder: "#fca5a5",
    checkColor: "#dc2626",
    badgeBg: "#dc2626",
    badgeText: "#fff",
    label: "Removing",
  },
  available: {
    rowBg: "#fff",
    rowBorder: "#e5e7eb",
    checkColor: "#d1d5db",
    badgeBg: "",
    badgeText: "",
    label: "",
  },
};

function getRoleStatus(
  id: string,
  original: Set<string>,
  selected: Set<string>,
): RoleStatus {
  const was = original.has(id),
    is = selected.has(id);
  if (was && is) return "current";
  if (!was && is) return "newly_added";
  if (was && !is) return "will_be_removed";
  return "available";
}

// ─── Role Row (unchanged) ─────────────────────────────────────────────────────

const RoleRow: React.FC<{
  id: string;
  label: string;
  status: RoleStatus;
  checked: boolean;
  onToggle: (id: string) => void;
}> = ({ id, label, status, checked, onToggle }) => {
  const [hover, setHover] = useState(false);
  const cfg = ROLE_CFG[status];

  return (
    <label
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => {
        e.preventDefault();
        onToggle(id);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: 7,
        border: `1px solid ${
          status !== "available" ? cfg.rowBorder : hover ? "#d1d5db" : "#e5e7eb"
        }`,
        background: hover && status === "available" ? "#fafafa" : cfg.rowBg,
        cursor: "pointer",
        userSelect: "none",
        transition: "all 0.12s",
      }}
    >
      <div
        style={{
          width: 15,
          height: 15,
          borderRadius: 4,
          border: `1.5px solid ${checked ? cfg.checkColor : "#d1d5db"}`,
          background: checked ? cfg.checkColor : "transparent",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.12s",
        }}
      >
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path
              d="M1 3L2.8 4.8L7 1"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {status !== "available" && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: cfg.checkColor,
            flexShrink: 0,
          }}
        />
      )}

      <span
        style={{
          flex: 1,
          fontSize: 12.5,
          fontWeight: checked ? 600 : 400,
          color:
            status === "will_be_removed"
              ? "#991b1b"
              : checked
                ? "#78350f"
                : "#374151",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>

      {status !== "available" && (
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: "1px 6px",
            borderRadius: 10,
            background: cfg.badgeBg,
            color: cfg.badgeText,
            flexShrink: 0,
            textTransform: "uppercase" as const,
            letterSpacing: 0.3,
          }}
        >
          {cfg.label}
        </span>
      )}
    </label>
  );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface ChangeRoleModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: ApprovedUser | null;
}

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  open,
  onClose,
  editingRecord,
}) => {
  const userId = editingRecord?.user_Id ?? "";
  const fullName = editingRecord
    ? `${editingRecord.firstName ?? ""} ${editingRecord.lastName ?? ""}`.trim()
    : "";

  // ── Single query: all roles + assignment state per user ──────────────────
  const {
    data: roleAssignments = [],
    isLoading,
    isFetching,
  } = useGetRoleAssignmentsQuery(userId, { skip: !open || !userId });

  const [syncUserRoles, { isLoading: saving }] = useSyncUserRolesMutation();

  // ── Local selection state ────────────────────────────────────────────────
  const [original, setOriginal] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);
  const [guardError, setGuardError] = useState<string | null>(null);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setInitialized(false);
      setGuardError(null);
    }
  }, [open]);

  // Initialise from API once loaded
  useEffect(() => {
    if (open && !isFetching && !initialized && roleAssignments.length > 0) {
      const assigned = new Set(
        roleAssignments
          .filter((r) => r.isAssigned)
          .map((r) => r.roleId.toLowerCase()),
      );
      setOriginal(assigned);
      setSelected(new Set(assigned));
      setInitialized(true);
    }
  }, [open, isFetching, initialized, roleAssignments]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const added = useMemo(
    () => [...selected].filter((id) => !original.has(id)),
    [selected, original],
  );
  const removed = useMemo(
    () => [...original].filter((id) => !selected.has(id)),
    [selected, original],
  );
  const hasChanges = added.length > 0 || removed.length > 0;

  const roleNameMap = useMemo(
    () =>
      new Map(roleAssignments.map((r) => [r.roleId.toLowerCase(), r.roleName])),
    [roleAssignments],
  );

  // ── Toggle ───────────────────────────────────────────────────────────────
  const toggle = (id: string) => {
    setGuardError(null); // clear error on any change
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Save with Employee-role guard ────────────────────────────────────────
  // const handleSave = async () => {
  //   if (!userId) return;

  //   // const hasEmployeeRole = [...selected].some(
  //   //   (id) => id.toLowerCase() === EMPLOYEE_ROLE_ID.toLowerCase(),
  //   // );

  //   // if (!hasEmployeeRole) {
  //   //   setGuardError(
  //   //     "A user must have at least the Employee role. Please keep Employee selected or the save will not proceed.",
  //   //   );
  //   //   return;
  //   // }

  //   // Send the full list of selected roleIds (original casing from API)
  //   const roleIds = roleAssignments
  //     .filter((r) => selected.has(r.roleId.toLowerCase()))
  //     .map((r) => r.roleId);

  //   await syncUserRoles({ userId, roleIds });
  //   onClose();
  // };

  const handleSave = async () => {
    if (!userId) return;
    if (selected.size === 0) {
      setGuardError("At least one role must be assigned.");
      return;
    }
    const roleIds = roleAssignments
      .filter((r) => selected.has(r.roleId.toLowerCase()))
      .map((r) => r.roleId);
    await syncUserRoles({ userId, roleIds });
    onClose();
  };

  const isLoadingAny = isLoading || isFetching || !initialized;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`@keyframes cr-spin { to { transform: rotate(360deg); } }`}</style>

      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={480}
        destroyOnClose
        style={{ top: 80 }}
        styles={{
          body: {
            padding: 0,
            display: "flex",
            flexDirection: "column",
            maxHeight: "80vh",
          },
        }}
        title={null}
        closable={false}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #92400e 0%, #b45309 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {fullName ? fullName.charAt(0).toUpperCase() : "?"}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
              Change / Add Role
            </span>
            {fullName && (
              <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 8 }}>
                <strong style={{ color: "#374151" }}>{fullName}</strong>
              </span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: "3px 10px",
                borderRight: "1px solid #e5e7eb",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 800, color: "#b45309" }}>
                {original.size}
              </span>
              <span style={{ fontSize: 9.5, color: "#9ca3af", marginLeft: 4 }}>
                current
              </span>
            </div>
            <div style={{ padding: "3px 10px", textAlign: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#374151" }}>
                {roleAssignments.length}
              </span>
              <span style={{ fontSize: 9.5, color: "#9ca3af", marginLeft: 4 }}>
                total
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              fontSize: 15,
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* ── ROLE LIST ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          {isLoadingAny ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "#9ca3af",
                fontSize: 12,
              }}
            >
              Loading roles…
            </div>
          ) : roleAssignments.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "#9ca3af",
                fontSize: 12,
              }}
            >
              No roles found.
            </div>
          ) : (
            roleAssignments.map((role) => {
              const id = role.roleId.toLowerCase();
              const status = getRoleStatus(id, original, selected);
              return (
                <RoleRow
                  key={role.roleId}
                  id={id}
                  label={role.roleName}
                  status={status}
                  checked={selected.has(id)}
                  onToggle={toggle}
                />
              );
            })
          )}
        </div>

        {/* ── GUARD ERROR ── */}
        {guardError && (
          <div
            style={{
              margin: "0 16px 0",
              padding: "8px 12px",
              borderRadius: 7,
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              color: "#991b1b",
              fontSize: 11.5,
              fontWeight: 500,
              display: "flex",
              alignItems: "flex-start",
              gap: 7,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>
              ⚠
            </span>
            {guardError}
          </div>
        )}

        {/* ── CHANGES BAR ── */}
        {hasChanges && (
          <div
            style={{
              padding: "5px 16px",
              borderTop: "1px solid #e5e7eb",
              background: "#f9fafb",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                color: "#6b7280",
                textTransform: "uppercase" as const,
                letterSpacing: 0.4,
              }}
            >
              Changes:
            </span>
            {added.length > 0 && (
              <span style={{ fontSize: 11, color: "#1d4ed8" }}>
                <span
                  style={{
                    padding: "1px 5px",
                    borderRadius: 10,
                    background: "#2563eb",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    marginRight: 4,
                  }}
                >
                  +{added.length}
                </span>
                {added.map((id) => roleNameMap.get(id) ?? id).join(", ")}
              </span>
            )}
            {removed.length > 0 && (
              <span style={{ fontSize: 11, color: "#991b1b" }}>
                <span
                  style={{
                    padding: "1px 5px",
                    borderRadius: 10,
                    background: "#dc2626",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    marginRight: 4,
                  }}
                >
                  −{removed.length}
                </span>
                {removed.map((id) => roleNameMap.get(id) ?? id).join(", ")}
              </span>
            )}
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                fontWeight: 700,
                color: "#b45309",
              }}
            >
              = {selected.size} final
            </span>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div
          style={{
            padding: "9px 16px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fafafa",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#b45309",
                display: "inline-block",
              }}
            />
            Current:&nbsp;
            <strong style={{ color: "#111827" }}>
              {original.size} Role{original.size !== 1 ? "s" : ""}
            </strong>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={onClose}
              disabled={saving}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                background: "#fff",
                fontSize: 12,
                fontWeight: 600,
                color: "#4b5563",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.5 : 1,
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              style={{
                padding: "6px 16px",
                borderRadius: 6,
                border: "none",
                background: saving || !hasChanges ? "#9ca3af" : "#b45309",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                cursor: saving || !hasChanges ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                minWidth: 130,
                justifyContent: "center",
                transition: "background 0.12s",
              }}
            >
              {saving ? (
                <>
                  <span
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      display: "inline-block",
                      animation: "cr-spin 0.8s linear infinite",
                    }}
                  />
                  Saving…
                </>
              ) : (
                `Save ${selected.size} Role${selected.size !== 1 ? "s" : ""}`
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ChangeRoleModal;
