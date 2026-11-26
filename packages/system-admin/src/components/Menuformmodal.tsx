import React, { useMemo } from "react";
import { useUILibrary } from "@commutr/ui/ui-lib";
import { AppForm } from "@commutr/ui/form";
import type { MenuItem } from "../types/SystemRolePermission.types";
import type { FieldError } from "@commutr/ui/api";
import { getMenuFormFields } from "../constants/Rolepermissionformfields";

interface MenuFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: MenuItem | null;
  allMenus: MenuItem[];
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  statusMessage?: string | null;
  serverErrors?: FieldError[] | null;
  defaultParentId?: string | null;
  defaultIcon?: string;
  selectedRoleName?: string;
  parentMenuName?: string | null;
}

type ModalMode = "create-root" | "create-sub" | "edit";

function deriveMode(
  editingRecord: MenuItem | null,
  defaultParentId: string | null | undefined,
): ModalMode {
  if (editingRecord) return "edit";
  if (defaultParentId) return "create-sub";
  return "create-root";
}

const MODAL_TITLES: Record<ModalMode, string> = {
  "create-root": "Add New Menu",
  "create-sub": "Add Sub-Menu",
  edit: "Edit Menu",
};

const MenuFormModal: React.FC<MenuFormModalProps> = ({
  open,
  onClose,
  editingRecord,
  allMenus,
  onSubmit,
  isSubmitting,
  statusMessage,
  serverErrors,
  defaultParentId,
  defaultIcon,
  selectedRoleName,
  parentMenuName,
}) => {
  const { Modal } = useUILibrary();

  console.log("editingRecord from Menu Form", editingRecord);

  const mode = deriveMode(editingRecord, defaultParentId);

  const parentOptions = useMemo(
    () =>
      allMenus
        .filter((m) => !m.parentMenuId && m.menuId !== editingRecord?.menuId)
        .map((m) => ({ label: m.menuName, value: m.menuId })),
    [allMenus, editingRecord?.menuId],
  );

  const fields = useMemo(
    () => getMenuFormFields(parentOptions, mode === "edit"),
    [parentOptions, mode],
  );

  // ── Key forces AppForm to fully remount when the editing target changes ──
  // Without this, switching from editing Menu A to Menu B keeps Menu A's
  // stale values in the form state.
  const formKey = editingRecord
    ? `edit-${editingRecord.menuId}`
    : `create-${defaultParentId ?? "root"}`;

  const initialValues = useMemo(() => {
    if (editingRecord) {
      return {
        menuName: editingRecord.menuName,
        parentMenuId: editingRecord.parentMenuId ?? "",
        routeUrl: editingRecord.routeUrl ?? "",
        icon: editingRecord.icon ?? "-",
        orderNo: editingRecord.orderNo ?? 1,
        isActive: editingRecord.isActive ?? true,
        isShow: Boolean(editingRecord?.isShow),
      };
    }
    return {
      menuName: "",
      parentMenuId: defaultParentId ?? "",
      routeUrl: "",
      icon: defaultIcon ?? "-",
      orderNo: 1,
      isActive: true,
      isShow: true,
    };
  }, [editingRecord, defaultParentId, defaultIcon]);

  // console.log(
  //   "isShow initial:",
  //   initialValues.isShow,
  //   typeof initialValues.isShow,
  // );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span style={{ fontSize: 18, fontWeight: 700, color: "#1B4332" }}>
          {MODAL_TITLES[mode]}
        </span>
      }
      width={580}
      destroyOnClose
      footer={null}
      styles={{
        header: { borderBottom: "none", paddingBottom: 0 },
        mask: { background: "rgba(0, 60, 30, 0.35)" },
      }}
      style={{ borderRadius: 16, top: 20 }}
    >
      <ContextBanner
        mode={mode}
        selectedRoleName={selectedRoleName}
        parentMenuName={parentMenuName}
        editingMenuName={editingRecord?.menuName}
      />

      {mode === "create-sub" && parentMenuName && (
        <LockedParentField parentMenuName={parentMenuName} />
      )}

      {statusMessage && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#52796F",
            fontSize: 13,
            padding: "8px 0",
          }}
        >
          {/* Spinner */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}
          >
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="#B7E4C7"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M8 2a6 6 0 016 6"
              stroke="#1B4332"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          {statusMessage}
        </div>
      )}

      <AppForm
        key={formKey}
        fields={fields}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onClose}
        serverErrors={serverErrors}
        isSubmitting={isSubmitting}
        submitLabel={mode === "edit" ? "Save Changes" : "Add Menu"}
        showCancel
        columns={1}
        resetOnSuccess
      />
    </Modal>
  );
};

// ─── Context Banner ───────────────────────────────────────────────────────────

interface ContextBannerProps {
  mode: ModalMode;
  selectedRoleName?: string;
  parentMenuName?: string | null;
  editingMenuName?: string;
}

const ContextBanner: React.FC<ContextBannerProps> = ({
  mode,
  selectedRoleName,
  parentMenuName,
  editingMenuName,
}) => {
  const lines: { label: string; value: string }[] = [];

  if (selectedRoleName) lines.push({ label: "Role", value: selectedRoleName });
  if (mode === "create-sub" && parentMenuName)
    lines.push({ label: "Adding under", value: parentMenuName });
  if (mode === "edit" && editingMenuName)
    lines.push({ label: "Editing", value: editingMenuName });
  if (mode === "create-root" && selectedRoleName)
    lines.push({ label: "Level", value: "Root menu" });

  if (!lines.length) return null;

  const bannerColor =
    mode === "create-sub"
      ? { bg: "#F0FAF4", border: "#B7E4C7", dot: "#1B4332" }
      : mode === "edit"
        ? { bg: "#F0F4FA", border: "#B7C4E4", dot: "#1B3243" }
        : { bg: "#F8FAFB", border: "#D1D5DB", dot: "#52796F" };

  return (
    <div
      style={{
        background: bannerColor.bg,
        border: `1px solid ${bannerColor.border}`,
        borderRadius: 10,
        padding: "10px 14px",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: bannerColor.dot,
          flexShrink: 0,
        }}
      />
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {lines.map(({ label, value }) => (
          <div key={label} style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>
              {label}
            </span>
            <span style={{ fontSize: 13, color: "#1B4332", fontWeight: 600 }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Locked Parent Field ──────────────────────────────────────────────────────

const LockedParentField: React.FC<{ parentMenuName: string }> = ({
  parentMenuName,
}) => (
  <div style={{ marginBottom: 16 }}>
    <label
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "#374151",
        display: "block",
        marginBottom: 6,
      }}
    >
      Parent Menu
    </label>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        background: "#F3F4F6",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        cursor: "not-allowed",
      }}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 13 13"
        fill="none"
        style={{ opacity: 0.45, flexShrink: 0 }}
      >
        <rect
          x="2"
          y="5.5"
          width="9"
          height="6.5"
          rx="1.5"
          stroke="#374151"
          strokeWidth="1.2"
        />
        <path
          d="M4.5 5.5V4a2 2 0 114 0v1.5"
          stroke="#374151"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      <span style={{ fontSize: 13, color: "#374151", flex: 1 }}>
        {parentMenuName}
      </span>
      <span
        style={{
          fontSize: 10,
          color: "#9CA3AF",
          background: "#E5E7EB",
          borderRadius: 4,
          padding: "2px 6px",
          letterSpacing: 0.3,
        }}
      >
        LOCKED
      </span>
    </div>
    <p style={{ fontSize: 11, color: "#9CA3AF", margin: "4px 0 0" }}>
      Parent is fixed when adding a sub-menu from a row.
    </p>
  </div>
);

export default MenuFormModal;
