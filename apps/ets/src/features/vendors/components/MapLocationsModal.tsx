import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "antd";
import type { Vendor } from "../types/vendor.types";
import { useUpdateVendorLocationsMutation } from "../services/vendorApi";
import { useLookups } from "../../lookups";

// ─── Types ───────────────────────────────────────────────────────────────────

type OfficeStatus = "current" | "newly_added" | "will_be_removed" | "available";

interface NormalizedOption {
  label: string;
  value: string; // always string locCode
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<
  OfficeStatus,
  {
    label: string;
    cardBg: string;
    cardBorder: string;
    dot: string;
    badgeBg: string;
    badgeColor: string;
  }
> = {
  current: {
    label: "Current",
    cardBg: "#f0fdf4",
    cardBorder: "#86efac",
    dot: "#059669",
    badgeBg: "#059669",
    badgeColor: "#fff",
  },
  newly_added: {
    label: "Adding",
    cardBg: "#eff6ff",
    cardBorder: "#93c5fd",
    dot: "#2563eb",
    badgeBg: "#2563eb",
    badgeColor: "#fff",
  },
  will_be_removed: {
    label: "Removing",
    cardBg: "#fef2f2",
    cardBorder: "#fca5a5",
    dot: "#dc2626",
    badgeBg: "#dc2626",
    badgeColor: "#fff",
  },
  available: {
    label: "",
    cardBg: "#fff",
    cardBorder: "#e5e7eb",
    dot: "#d1d5db",
    badgeBg: "",
    badgeColor: "",
  },
};

const SORT_ORDER: Record<OfficeStatus, number> = {
  will_be_removed: 0,
  current: 1,
  newly_added: 2,
  available: 3,
};

function getStatus(
  code: string,
  original: Set<string>,
  selected: Set<string>,
): OfficeStatus {
  const was = original.has(code),
    is = selected.has(code);
  if (was && is) return "current";
  if (!was && is) return "newly_added";
  if (was && !is) return "will_be_removed";
  return "available";
}

// ─── Office Row ───────────────────────────────────────────────────────────────

interface OfficeRowProps {
  option: NormalizedOption;
  status: OfficeStatus;
  isChecked: boolean;
  onToggle: (code: string) => void;
}

const OfficeRow: React.FC<OfficeRowProps> = ({
  option,
  status,
  isChecked,
  onToggle,
}) => {
  const [hover, setHover] = useState(false);
  const cfg = STATUS_CFG[status];

  return (
    <label
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => {
        e.preventDefault();
        onToggle(option.value);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 12px",
        borderRadius: 7,
        border: `1px solid ${status !== "available" ? cfg.cardBorder : hover ? "#d1d5db" : "#e5e7eb"}`,
        background: hover && status === "available" ? "#fafafa" : cfg.cardBg,
        cursor: "pointer",
        userSelect: "none",
        transition: "all 0.12s",
      }}
    >
      {/* Checkbox */}
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: `1.5px solid ${isChecked ? "#064E3B" : "#d1d5db"}`,
          background: isChecked ? "#064E3B" : "#fff",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.12s",
        }}
      >
        {isChecked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path
              d="M1 3.5L3.2 5.5L8 1"
              stroke="#fff"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Status dot */}
      {status !== "available" && (
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: cfg.dot,
            flexShrink: 0,
          }}
        />
      )}

      {/* Office name */}
      <span
        style={{
          flex: 1,
          fontSize: 12.5,
          fontWeight: isChecked ? 600 : 400,
          color:
            status === "will_be_removed"
              ? "#991b1b"
              : isChecked
                ? "#064E3B"
                : "#374151",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {option.label}
      </span>

      {/* Status badge */}
      {status !== "available" && (
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: "1px 6px",
            borderRadius: 10,
            background: cfg.badgeBg,
            color: cfg.badgeColor,
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

// ─── Modal ────────────────────────────────────────────────────────────────────

interface MapLocationsModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: Vendor | null;
}

export const MapLocationsModal: React.FC<MapLocationsModalProps> = ({
  open,
  onClose,
  editingRecord,
}) => {
  console.log(editingRecord, "editingRecord");
  const transporterId = editingRecord?.transporterId ?? "";
  const fullName = editingRecord
    ? `${editingRecord.vendorName ?? ""}`.trim()
    : "";

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { locationOptions: allOptions, isLoading: allLoading } = useLookups({
    only: ["locationOptions"],
  });
  const [updateLocations, { isLoading: saving }] =
    useUpdateVendorLocationsMutation();

  // ── State ──────────────────────────────────────────────────────────────────
  const [original, setOriginal] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Init from editingRecord.locationList every time modal opens
  useEffect(() => {
    if (open) {
      const codes = new Set((editingRecord?.locCodes ?? []).map(String)); // ← map to string
      setOriginal(codes);
      setSelected(new Set(codes));
    }
  }, [open, editingRecord]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const added = useMemo(
    () => [...selected].filter((c) => !original.has(c)),
    [selected, original],
  );
  const removed = useMemo(
    () => [...original].filter((c) => !selected.has(c)),
    [selected, original],
  );
  const hasChanges = added.length > 0 || removed.length > 0;

  const officeNameMap = useMemo(
    () => new Map(allOptions.map((o) => [String(o.value), o.label])),
    [allOptions],
  );

  // Sort: current/changes first, available last
  const sortedOptions = useMemo<NormalizedOption[]>(() => {
    return allOptions
      .map((o) => ({ label: o.label, value: String(o.value) }))
      .sort((a, b) => {
        const sa = getStatus(a.value, original, selected);
        const sb = getStatus(b.value, original, selected);
        return SORT_ORDER[sa] !== SORT_ORDER[sb]
          ? SORT_ORDER[sa] - SORT_ORDER[sb]
          : a.label.localeCompare(b.label);
      });
  }, [allOptions, original, selected]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const toggle = (code: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(code) ? n.delete(code) : n.add(code);
      return n;
    });

  const handleSave = async () => {
    if (!transporterId) return;
    await updateLocations({ transporterId, locCodes: Array.from(selected) });
    onClose();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes loc-spin { to { transform: rotate(360deg); } }
        .loc-save:hover:not(:disabled) { background: #065f46 !important; }
        .loc-cancel:hover { background: #f3f4f6 !important; }
      `}</style>

      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={500}
        destroyOnClose
        style={{ top: 80 }}
        styles={{
          body: {
            padding: 0,
            display: "flex",
            flexDirection: "column",
            maxHeight: 540,
          },
        }}
        title={null}
        closable={false}
      >
        {/* ── HEADER ──────────────────────────────────────────── */}
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
          {/* Avatar */}
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "linear-gradient(135deg, #064E3B 0%, #065f46 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 800,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {fullName ? fullName.charAt(0).toUpperCase() : "?"}
          </div>

          {/* Title + name */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
              Map Office Access
            </div>
            {fullName && (
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>
                {fullName}
              </div>
            )}
          </div>

          {/* Counts */}
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
              <span style={{ fontSize: 13, fontWeight: 800, color: "#064E3B" }}>
                {original.size}
              </span>
              <span style={{ fontSize: 9.5, color: "#9ca3af", marginLeft: 4 }}>
                assigned
              </span>
            </div>
            <div style={{ padding: "3px 10px", textAlign: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#374151" }}>
                {allOptions.length}
              </span>
              <span style={{ fontSize: 9.5, color: "#9ca3af", marginLeft: 4 }}>
                total
              </span>
            </div>
          </div>

          {/* Close */}
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

        {/* ── HINT ────────────────────────────────────────────── */}
        <div
          style={{
            padding: "6px 16px",
            background: "#fffbeb",
            borderBottom: "1px solid #fde68a",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 11, color: "#92400e" }}>
            <strong>Check</strong> an office to grant access &nbsp;·&nbsp;
            <strong>Uncheck</strong> to remove access &nbsp;·&nbsp; then click{" "}
            <strong>Save</strong>
          </span>
        </div>

        {/* ── OFFICE LIST ─────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "10px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {allLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#9ca3af",
                fontSize: 12,
              }}
            >
              Loading offices…
            </div>
          ) : sortedOptions.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#9ca3af",
                fontSize: 12,
              }}
            >
              No offices available.
            </div>
          ) : (
            sortedOptions.map((opt) => {
              const status = getStatus(opt.value, original, selected);
              return (
                <OfficeRow
                  key={opt.value}
                  option={opt}
                  status={status}
                  isChecked={selected.has(opt.value)}
                  onToggle={toggle}
                />
              );
            })
          )}
        </div>

        {/* ── CHANGES BAR ─────────────────────────────────────── */}
        {hasChanges && (
          <div
            style={{
              padding: "6px 16px",
              borderTop: "1px solid #e5e7eb",
              background: "#f9fafb",
              display: "flex",
              alignItems: "center",
              gap: 8,
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
                {added.map((c) => officeNameMap.get(c) ?? c).join(", ")}
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
                {removed.map((c) => officeNameMap.get(c) ?? c).join(", ")}
              </span>
            )}
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                fontWeight: 700,
                color: "#064E3B",
              }}
            >
              = {selected.size} final
            </span>
          </div>
        )}

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fafafa",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 11, color: "#6b7280" }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#059669",
                display: "inline-block",
                marginRight: 5,
              }}
            />
            Current:&nbsp;
            <strong style={{ color: "#111827" }}>
              {original.size} Office{original.size !== 1 ? "s" : ""}
            </strong>
          </span>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="loc-cancel"
              onClick={onClose}
              disabled={saving}
              style={{
                padding: "7px 16px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                background: "#fff",
                fontSize: 12,
                fontWeight: 600,
                color: "#4b5563",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.5 : 1,
                transition: "background 0.12s",
              }}
            >
              Cancel
            </button>

            <button
              className="loc-save"
              onClick={handleSave}
              disabled={saving || selected.size === 0}
              style={{
                padding: "7px 20px",
                borderRadius: 6,
                border: "none",
                background:
                  saving || selected.size === 0 ? "#9ca3af" : "#064E3B",
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                cursor:
                  saving || selected.size === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                minWidth: 140,
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
                      animation: "loc-spin 0.8s linear infinite",
                    }}
                  />
                  Saving…
                </>
              ) : (
                `Save (${selected.size} Office${selected.size !== 1 ? "s" : ""})`
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MapLocationsModal;
