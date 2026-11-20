import React, { useEffect, useState } from "react";
import {
  useGetMenuPermissionsQuery,
  useBulkUpdatePermissionsMutation,
  type AvailablePermission,
} from "../services/SystemPermissionApi";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";

interface MenuPermissionModalProps {
  open: boolean;
  onClose: () => void;
  menuId: string;
  menuName: string;
  roleId: string;
  roleName?: string;
}

const PASTEL_PAIRS: Array<{ bg: string; text: string }> = [
  { bg: "#EEF4FF", text: "#3B6EB5" },
  { bg: "#EAFAF1", text: "#1B7A4B" },
  { bg: "#FFFBEA", text: "#A36A00" },
  { bg: "#FEF2F2", text: "#B91C1C" },
  { bg: "#F3F0FF", text: "#6D3AC7" },
  { bg: "#FFF0F6", text: "#9C1B6A" },
  { bg: "#E8F8F5", text: "#0E7C65" },
  { bg: "#FDF3E7", text: "#9A5A00" },
];

function permColor(name: string): { bg: string; text: string } {
  const hash = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PASTEL_PAIRS[hash % PASTEL_PAIRS.length];
}

function permLabel(name: string): string {
  const suffix = name.split(".").pop() ?? name;
  return suffix.charAt(0).toUpperCase() + suffix.slice(1).toLowerCase();
}

// ── Shared pill badge ──────────────────────────────────────────────────────────

const PermBadge: React.FC<{ name: string }> = ({ name }) => {
  const { bg, text } = permColor(name);
  return (
    <span
      style={{
        padding: "2px 9px",
        borderRadius: 50,
        background: bg,
        color: text,
        fontSize: 11,
        fontWeight: 600,
        flexShrink: 0,
        letterSpacing: "0.02em",
      }}
    >
      {permLabel(name)}
    </span>
  );
};

// ── Confirm summary ────────────────────────────────────────────────────────────

const ConfirmSummary: React.FC<{
  menuName: string;
  roleName?: string;
  gaining: AvailablePermission[];
  losing: AvailablePermission[];
}> = ({ menuName, roleName, gaining, losing }) => {
  const role = roleName ?? "This role";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Context banner */}
      <div
        style={{
          padding: "8px 12px",
          background: "#F8FBF9",
          borderRadius: 8,
          border: "0.5px solid #D1EAD9",
        }}
      >
        <p
          style={{ margin: 0, fontSize: 12, color: "#52796F", lineHeight: 1.5 }}
        >
          You are about to change permissions for{" "}
          <strong style={{ color: "#1B4332" }}>{menuName}</strong>
          {roleName && (
            <>
              {" "}
              under the <strong style={{ color: "#1B4332" }}>
                {roleName}
              </strong>{" "}
              role
            </>
          )}
          . This will take effect immediately.
        </p>
      </div>

      {/* Losing */}
      {losing.length > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#B91C1C",
                flexShrink: 0,
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 700,
                color: "#B91C1C",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Losing access ({losing.length})
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {losing.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "#FEF2F2",
                  border: "0.5px solid #FECACA",
                }}
              >
                <PermBadge name={p.name} />
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "#9B1C1C",
                    flex: 1,
                    lineHeight: 1.4,
                  }}
                >
                  <strong>{role}</strong> will no longer be able to{" "}
                  <strong>{permLabel(p.name).toLowerCase()}</strong> this data
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gaining */}
      {gaining.length > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#1B7A4B",
                flexShrink: 0,
              }}
            />
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 700,
                color: "#1B7A4B",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Gaining access ({gaining.length})
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {gaining.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "#EAFAF1",
                  border: "0.5px solid #B7E4C7",
                }}
              >
                <PermBadge name={p.name} />
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: "#1B4332",
                    flex: 1,
                    lineHeight: 1.4,
                  }}
                >
                  <strong>{role}</strong> will now be able to{" "}
                  <strong>{permLabel(p.name).toLowerCase()}</strong> this data
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Empty state ────────────────────────────────────────────────────────────────

const EmptyPermissions: React.FC<{ menuName: string }> = ({ menuName }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 20px",
      textAlign: "center",
      gap: 8,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "#F0FAF4",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7.5" stroke="#52796F" strokeWidth="1.3" />
        <path
          d="M9 6v4M9 12v.5"
          stroke="#52796F"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#1B4332" }}>
      No permissions configured
    </p>
    <p
      style={{
        margin: 0,
        fontSize: 12,
        color: "#6B7280",
        maxWidth: 260,
        lineHeight: 1.6,
      }}
    >
      <strong>{menuName}</strong> has no configurable permissions assigned by
      the backend yet.
    </p>
  </div>
);

// ── Error state ────────────────────────────────────────────────────────────────

const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 20px",
      textAlign: "center",
      gap: 8,
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "#FEF2F2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7.5" stroke="#B91C1C" strokeWidth="1.3" />
        <path
          d="M9 5.5v4M9 11.5v.5"
          stroke="#B91C1C"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#B91C1C" }}>
      Failed to load permissions
    </p>
    <p style={{ margin: 0, fontSize: 12, color: "#6B7280", lineHeight: 1.6 }}>
      Something went wrong while fetching. Please try again.
    </p>
    <button
      onClick={onRetry}
      style={{
        marginTop: 4,
        padding: "6px 16px",
        fontSize: 12,
        borderRadius: 50,
        border: "1px solid #FECACA",
        background: "#FEF2F2",
        color: "#B91C1C",
        cursor: "pointer",
        fontWeight: 500,
      }}
    >
      Retry
    </button>
  </div>
);

// ── Loading skeleton ───────────────────────────────────────────────────────────

const LoadingSkeleton: React.FC = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        style={{
          height: 44,
          borderRadius: 10,
          background:
            "linear-gradient(90deg, #F0FAF4 25%, #E8F5EE 50%, #F0FAF4 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s infinite",
          opacity: 1 - i * 0.15,
        }}
      />
    ))}
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
  </div>
);

// ── Summary bar (shown at bottom of permission list) ──────────────────────────

const SelectionBar: React.FC<{
  total: number;
  selected: number;
}> = ({ total, selected }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 12px",
      background: "#F8FBF9",
      borderRadius: 8,
      border: "0.5px solid #D1EAD9",
      marginTop: 4,
    }}
  >
    <span style={{ fontSize: 12, color: "#52796F" }}>
      {selected} of {total} permission{total !== 1 ? "s" : ""} enabled
    </span>
    <span
      style={{
        fontSize: 11,
        fontFamily: "monospace",
        color: "#1B4332",
        fontWeight: 500,
      }}
    >
      {total - selected} disabled
    </span>
  </div>
);

// ── Main modal ─────────────────────────────────────────────────────────────────

const MenuPermissionModal: React.FC<MenuPermissionModalProps> = ({
  open,
  onClose,
  menuId,
  menuName,
  roleId,
  roleName,
}) => {
  const { message } = useUILibrary();

  const { data, isFetching, isError, refetch } = useGetMenuPermissionsQuery(
    { menuId, roleId },
    { skip: !open || !menuId || !roleId },
  );

  const [bulkUpdate, { isLoading: isSaving }] =
    useBulkUpdatePermissionsMutation();

  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [summary, setSummary] = useState<{
    gaining: AvailablePermission[];
    losing: AvailablePermission[];
  }>({ gaining: [], losing: [] });

  useEffect(() => {
    if (data) {
      setCheckedIds(
        new Set(
          data.availablePermissions
            .filter((p) => p.isAssigned)
            .map((p) => p.id),
        ),
      );
      setShowConfirm(false);
    }
  }, [data]);

  // Reset fully when modal closes
  useEffect(() => {
    if (!open) {
      setShowConfirm(false);
      setSummary({ gaining: [], losing: [] });
    }
  }, [open]);

  const toggle = (id: number) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleRequestSave = () => {
    if (!data) return;
    const gaining = data.availablePermissions.filter(
      (p) => !p.isAssigned && checkedIds.has(p.id),
    );
    const losing = data.availablePermissions.filter(
      (p) => p.isAssigned && !checkedIds.has(p.id),
    );
    if (gaining.length === 0 && losing.length === 0) {
      message.info("No changes to save");
      return;
    }
    setSummary({ gaining, losing });
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    try {
      await bulkUpdate({
        roleId,
        menuId,
        permissionIds: [...checkedIds],
      }).unwrap();
      message.success("Permissions updated successfully");
      setShowConfirm(false);
      onClose();
    } catch {
      message.error("Failed to update permissions. Please try again.");
    }
  };

  if (!open) return null;

  const perms = data?.availablePermissions ?? [];
  const hasPerms = perms.length > 0;
  const showFooter = !isFetching && !isError && hasPerms;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && !isSaving && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: 480,
          maxWidth: "92vw",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            padding: "16px 18px 12px",
            borderBottom: "0.5px solid #E8F5EE",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexShrink: 0,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 15,
                color: "#1B4332",
                lineHeight: 1.3,
              }}
            >
              {showConfirm ? "Confirm changes" : "Menu permissions"}
            </p>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#52796F" }}>
              {menuName}
              {roleName && (
                <>
                  {" "}
                  <span style={{ opacity: 0.5 }}>·</span>{" "}
                  <span style={{ color: "#1B4332", fontWeight: 500 }}>
                    {roleName} role
                  </span>
                </>
              )}
            </p>
          </div>
          <button
            onClick={() => !isSaving && onClose()}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 20,
              color: "#52796F",
              lineHeight: 1,
              padding: "0 2px",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* ── Body — scrollable ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {isFetching ? (
            <LoadingSkeleton />
          ) : isError ? (
            <ErrorState onRetry={refetch} />
          ) : !hasPerms ? (
            <EmptyPermissions menuName={menuName} />
          ) : showConfirm ? (
            <ConfirmSummary
              menuName={menuName}
              roleName={roleName}
              gaining={summary.gaining}
              losing={summary.losing}
            />
          ) : (
            <>
              {perms.map((perm) => {
                const checked = checkedIds.has(perm.id);
                const { bg, text } = permColor(perm.name);
                const label = permLabel(perm.name);

                return (
                  <label
                    key={perm.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: 9,
                      border: checked
                        ? "0.5px solid rgba(15,110,86,0.35)"
                        : "0.5px solid #E8F5EE",
                      background: checked ? "rgba(27,67,50,0.035)" : "#fff",
                      cursor: "pointer",
                      gap: 10,
                      transition: "border-color 0.15s, background 0.15s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          padding: "2px 9px",
                          borderRadius: 50,
                          background: bg,
                          color: text,
                          fontSize: 11,
                          fontWeight: 600,
                          flexShrink: 0,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {label}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "monospace",
                          color: "#8A9E96",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {perm.name}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(perm.id)}
                      style={{
                        width: 15,
                        height: 15,
                        cursor: "pointer",
                        accentColor: "#1B4332",
                        flexShrink: 0,
                      }}
                    />
                  </label>
                );
              })}

              <SelectionBar total={perms.length} selected={checkedIds.size} />
            </>
          )}
        </div>

        {/* ── Footer ── */}
        {showFooter && (
          <div
            style={{
              padding: "12px 18px",
              borderTop: "0.5px solid #E8F5EE",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
              gap: 10,
            }}
          >
            {/* Left: step indicator */}
            <p style={{ margin: 0, fontSize: 11, color: "#A0B4A8" }}>
              {showConfirm
                ? "Step 2 of 2 — review & confirm"
                : "Step 1 of 2 — configure"}
            </p>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={showConfirm ? () => setShowConfirm(false) : onClose}
                disabled={isSaving}
                style={{
                  padding: "7px 16px",
                  fontSize: 13,
                  borderRadius: 50,
                  border: "0.5px solid #B7E4C7",
                  background: "#fff",
                  color: "#1B4332",
                  cursor: isSaving ? "default" : "pointer",
                  opacity: isSaving ? 0.6 : 1,
                }}
              >
                {showConfirm ? "← Back" : "Cancel"}
              </button>
              <button
                onClick={showConfirm ? handleConfirmSave : handleRequestSave}
                disabled={isSaving}
                style={{
                  padding: "7px 18px",
                  fontSize: 13,
                  borderRadius: 50,
                  border: "none",
                  background: isSaving
                    ? "#6B9E85"
                    : showConfirm
                      ? "#991B1B"
                      : "#1B4332",
                  color: "#fff",
                  cursor: isSaving ? "default" : "pointer",
                  fontWeight: 600,
                  transition: "background 0.2s",
                  minWidth: 120,
                }}
              >
                {isSaving
                  ? "Saving…"
                  : showConfirm
                    ? "Yes, apply changes"
                    : "Review changes →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPermissionModal;
