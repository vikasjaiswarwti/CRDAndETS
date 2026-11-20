import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DRIVER_FIELD_LABELS,
  DRIVER_SECTIONS,
  toDriverColumnName,
  type DriverConfigField,
  type DriverSectionKey,
} from "../../constants/DriverAppConfig";
import {
  useUpdateDriverAppConfigMutation,
  type DriverAppConfigRawResponse,
} from "../../services/userAppConfigurationApi";
import { useUILibrary } from "../../../../shared/lib/ui-lib/ui-library-context";
import { type FieldSaveState } from "../Fieldsaveindicator";
import { FieldWrapper } from "../Fieldwrapper";
import { NumberField } from "../Formfields";
import { ConfirmationModal } from "../Confirmationmodal";
import { ChevronDown } from "lucide-react";
import { initDriverAppForm } from "../../utils/DriverAppConfig.utils";

// ── Animations (identical to OfficeConfigurationCard's ANIM block) ──────────
const ANIM = `
  @keyframes tat-fade  { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
  @keyframes tat-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
  @keyframes field-spin { to { transform: rotate(360deg); } }
`;

// ── Field-level impact copy shown in the confirmation modal ─────────────────
function getDriverImpactMessage(
  fieldKey: string,
  oldValue: unknown,
  newValue: unknown,
): { title: string; description: string; severity: "info" | "warning" } {
  switch (fieldKey as DriverConfigField) {
    case "MinPickupTripStartBeforeMinutes":
      return {
        title: "Update Pickup TAT",
        description:
          "Drivers will be allowed to start a pickup trip this many minutes " +
          "before the scheduled time. This applies to all future pickup trips " +
          "for this office.",
        severity: "warning",
      };
    case "MinDropTripStartBeforeMinutes":
      return {
        title: "Update Drop TAT",
        description:
          "Drivers will be allowed to start a drop trip this many minutes " +
          "before the scheduled time. This applies to all future drop trips " +
          "for this office.",
        severity: "warning",
      };
    case "Active":
      return {
        title: newValue ? "Activate Driver Config" : "Deactivate Driver Config",
        description: newValue
          ? "Driver app configuration will be enabled for this office."
          : "Driver app configuration will be disabled for this office. " +
            "Drivers may lose access to trip-start TAT enforcement until " +
            "this is re-enabled.",
        severity: newValue ? "info" : "warning",
      };
    default:
      return {
        title: "Update Configuration",
        description: `${fieldKey} will be updated from "${String(
          oldValue,
        )}" to "${String(newValue)}".`,
        severity: "info",
      };
  }
}

function displayValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Enabled" : "Disabled";
  return String(val);
}

// ── Skeleton (identical to OfficeConfigurationCard's SkeletonHeader) ────────
const SkeletonHeader: React.FC = () => (
  <>
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        flexShrink: 0,
        background: "#F1F5F9",
        animation: "tat-pulse 1.5s ease infinite",
      }}
    />
    <div
      style={{
        flex: 1,
        height: 11,
        borderRadius: 4,
        background: "#F1F5F9",
        maxWidth: 160,
        animation: "tat-pulse 1.5s ease infinite",
      }}
    />
  </>
);

interface ModalState {
  open: boolean;
  fieldKey: string;
  oldValue: unknown;
  newValue: unknown;
}

interface Props {
  detailData: DriverAppConfigRawResponse[] | null;
  locCode: number | null;
  isLoading: boolean;
}

export const DriverConfigurationCard: React.FC<Props> = ({
  detailData,
  locCode,
  isLoading,
}) => {
  const { Input } = useUILibrary();
  const [updateDriverAppConfig] = useUpdateDriverAppConfigMutation();

  const [form, setForm] = useState<Record<string, unknown>>(() =>
    initDriverAppForm(detailData),
  );
  const confirmedForm = useRef<Record<string, unknown>>(
    initDriverAppForm(detailData),
  );

  // ── Accordion state (same as OfficeConfigurationCard) ─────────────────────
  const [openSections, setOpenSections] = useState<Set<DriverSectionKey>>(
    new Set(),
  );
  const [hoverSection, setHoverSection] = useState<DriverSectionKey | null>(
    null,
  );

  const [fieldSaveStates, setFieldSaveStates] = useState<
    Record<string, FieldSaveState>
  >({});
  const saveStateTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );

  const [modal, setModal] = useState<ModalState>({
    open: false,
    fieldKey: "",
    oldValue: undefined,
    newValue: undefined,
  });

  // ── Reset on office change ────────────────────────────────────────────────
  useEffect(() => {
    setOpenSections(new Set());
    setFieldSaveStates({});
    Object.values(saveStateTimers.current).forEach(clearTimeout);
    saveStateTimers.current = {};
    setModal({
      open: false,
      fieldKey: "",
      oldValue: undefined,
      newValue: undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locCode]);

  // ── Sync form from API ────────────────────────────────────────────────────
  useEffect(() => {
    if (detailData) {
      const f = initDriverAppForm(detailData);
      setForm(f);
      confirmedForm.current = f;
    }
  }, [detailData]);

  // ── Accordion toggle ───────────────────────────────────────────────────────
  const toggleSection = (key: DriverSectionKey) => {
    if (!locCode || isLoading) return;
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // ── Field change → open single-field modal ────────────────────────────────
  const handleFieldChange = useCallback(
    (fieldKey: string, newValue: unknown) => {
      const oldValue = form[fieldKey];
      if (oldValue === newValue) return;
      setForm((prev) => ({ ...prev, [fieldKey]: newValue }));
      setModal({ open: true, fieldKey, oldValue, newValue });
    },
    [form],
  );

  const setFieldState = useCallback(
    (key: string, state: FieldSaveState, clearAfterMs?: number) => {
      setFieldSaveStates((prev) => ({ ...prev, [key]: state }));
      if (clearAfterMs) {
        clearTimeout(saveStateTimers.current[key]);
        saveStateTimers.current[key] = setTimeout(() => {
          setFieldSaveStates((prev) => ({ ...prev, [key]: "idle" }));
        }, clearAfterMs);
      }
    },
    [],
  );

  // ── Modal: Cancel → revert to last confirmed value ────────────────────────
  const handleModalCancel = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      [modal.fieldKey]: confirmedForm.current[modal.fieldKey],
    }));
    setModal({
      open: false,
      fieldKey: "",
      oldValue: undefined,
      newValue: undefined,
    });
  }, [modal.fieldKey]);

  // ── Modal: Proceed → single API call for just this field ──────────────────
  const handleModalProceed = useCallback(async () => {
    const { fieldKey, newValue } = modal;
    setModal({
      open: false,
      fieldKey: "",
      oldValue: undefined,
      newValue: undefined,
    });
    setFieldState(fieldKey, "saving");
    try {
      await updateDriverAppConfig({
        LocCode: locCode!,
        ColumnName: toDriverColumnName(fieldKey),
        Value:
          typeof newValue === "boolean"
            ? newValue
              ? "1"
              : "0"
            : String(newValue),
      }).unwrap();
      confirmedForm.current = {
        ...confirmedForm.current,
        [fieldKey]: newValue,
      };
      setFieldState(fieldKey, "success", 2000);
    } catch {
      setForm((prev) => ({
        ...prev,
        [fieldKey]: confirmedForm.current[fieldKey],
      }));
      setFieldState(fieldKey, "error", 3000);
    }
  }, [modal, locCode, updateDriverAppConfig, setFieldState]);

  const disabled = !locCode;

  // ── Section body content ───────────────────────────────────────────────────
  // Only one section (driverTat) today. If DRIVER_SECTIONS grows, branch on
  // `key` here the same way SectionContent.tsx branches on sectionKey.
  const renderSectionContent = (_key: DriverSectionKey) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
      >
        <FieldWrapper
          label={DRIVER_FIELD_LABELS.MinPickupTripStartBeforeMinutes}
          saveState={
            fieldSaveStates["MinPickupTripStartBeforeMinutes"] ?? "idle"
          }
          fieldKey="MinPickupTripStartBeforeMinutes"
        >
          <NumberField
            value={(form.MinPickupTripStartBeforeMinutes as number) ?? 0}
            onConfirmedChange={(val) =>
              handleFieldChange("MinPickupTripStartBeforeMinutes", val)
            }
            Input={Input}
          />
        </FieldWrapper>

        <FieldWrapper
          label={DRIVER_FIELD_LABELS.MinDropTripStartBeforeMinutes}
          saveState={fieldSaveStates["MinDropTripStartBeforeMinutes"] ?? "idle"}
          fieldKey="MinDropTripStartBeforeMinutes"
        >
          <NumberField
            value={(form.MinDropTripStartBeforeMinutes as number) ?? 0}
            onConfirmedChange={(val) =>
              handleFieldChange("MinDropTripStartBeforeMinutes", val)
            }
            Input={Input}
          />
        </FieldWrapper>
        {/* <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "6px 12px",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            background: "#FAFAFA",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>
              {DRIVER_FIELD_LABELS.Active}
            </span>{" "}
            <FieldHelpPopover fieldKey={"isActiveDriverTATconfig"} />
            <FieldSaveIndicator state={fieldSaveStates["Active"] ?? "idle"} />
          </div>

          <SwitchField
            checked={Boolean(form.Active)}
            onConfirmedChange={(val) => handleFieldChange("Active", val)}
            Switch={Switch}
          />
        </div> */}
      </div>
    </div>
  );

  // ── Render one accordion section ───────────────────────────────────────────
  // Straight port of OfficeConfigurationCard's renderSection().
  const renderSection = (key: DriverSectionKey) => {
    const def = DRIVER_SECTIONS.find((s) => s.key === key)!;
    const isOpen = openSections.has(key);
    const isHov = hoverSection === key && !isOpen && !disabled;

    return (
      <div
        key={key}
        style={{
          border: `1px solid ${isOpen ? "#D1D5DB" : "#E5E7EB"}`,
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: 10,
          background: "#fff",
          boxShadow: isOpen
            ? "0 4px 20px rgba(0,0,0,0.08)"
            : isHov
              ? "0 2px 8px rgba(0,0,0,0.06)"
              : "0 1px 3px rgba(0,0,0,0.04)",
          opacity: disabled ? 0.4 : 1,
          transition:
            "box-shadow 0.2s ease, border-color 0.2s ease, opacity 0.2s ease",
        }}
      >
        {/* Accordion header */}
        <button
          onClick={() => toggleSection(key)}
          onMouseEnter={() => setHoverSection(key)}
          onMouseLeave={() => setHoverSection(null)}
          disabled={disabled || isLoading}
          style={{
            width: "100%",
            minHeight: 56,
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            gap: 14,
            background: isOpen ? "#FAFAFA" : isHov ? "#F9FAFB" : "transparent",
            border: "none",
            cursor: disabled || isLoading ? "default" : "pointer",
            transition: "background 0.15s ease",
          }}
        >
          {isLoading ? (
            <SkeletonHeader />
          ) : (
            <>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: def.accent + "12",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: def.accent,
                  flexShrink: 0,
                }}
              >
                {def.icon}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#111827",
                  textAlign: "left",
                  lineHeight: 1.4,
                }}
              >
                {def.title}
              </span>
              <ChevronDown
                size={16}
                style={{
                  color: "#9CA3AF",
                  flexShrink: 0,
                  transform: isOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s ease",
                }}
              />
            </>
          )}
        </button>

        {/* Section body */}
        {isOpen && !disabled && !isLoading && (
          <div
            style={{
              padding: "20px 20px 24px",
              borderTop: "1px solid #F3F4F6",
              animation: "tat-fade 0.18s ease",
            }}
          >
            {renderSectionContent(key)}
          </div>
        )}
      </div>
    );
  };

  const modalImpact = getDriverImpactMessage(
    modal.fieldKey,
    modal.oldValue,
    modal.newValue,
  );

  return (
    <>
      <style>{ANIM}</style>

      {!locCode && (
        <div
          style={{
            padding: "40px 0",
            textAlign: "center",
            color: "#9CA3AF",
            fontSize: 14,
          }}
        >
          Select an office above to configure driver settings.
        </div>
      )}

      {DRIVER_SECTIONS.map((s) => renderSection(s.key))}

      <ConfirmationModal
        open={modal.open}
        fieldLabel={
          DRIVER_FIELD_LABELS[modal.fieldKey as DriverConfigField] ??
          modal.fieldKey
        }
        backendColumn={toDriverColumnName(modal.fieldKey)}
        oldDisplay={displayValue(modal.oldValue)}
        newDisplay={displayValue(modal.newValue)}
        impact={modalImpact}
        onCancel={handleModalCancel}
        onProceed={handleModalProceed}
      />
    </>
  );
};
