import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useUILibrary } from "../../../../shared/lib/ui-lib/ui-library-context";
import {
  USER_APP_SECTIONS,
  type UserAppSectionKey,
  getUserAppFieldLabel,
  BOARDING_TYPE_OPTIONS,
  DEBOARDING_TYPE_OPTIONS,
} from "../../constants/UserAppConfig";
import {
  initUserAppForm,
  toUserAppColumnName,
  toUserAppApiValue,
  getBoardingProcessOptions,
} from "../../utils/UserAppConfig.utils";
import {
  useUpdateUserAppConfigurationByKeyMutation,
  type UserAppConfigRawResponse,
} from "../../services/userAppConfigurationApi";
import { UserAppSectionContent } from "./UserAppSectionContent";
import { ConfirmationModal } from "../Confirmationmodal";
import { getUserAppImpactMessage } from "./UserAppConfigImpactMessages";
import type { FieldSaveState } from "../Fieldsaveindicator";

const ANIM = `
  @keyframes tat-fade  { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
  @keyframes tat-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
`;

function displayValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Enabled" : "Disabled";
  return String(val);
}

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
  detailData: UserAppConfigRawResponse[] | null;
  locCode: number | null;
  isLoading: boolean;
}

const UserAppConfigurationCard: React.FC<Props> = ({
  detailData,
  locCode,
  isLoading,
}) => {
  const { Select, Switch, Input } = useUILibrary();
  const [updateByKey] = useUpdateUserAppConfigurationByKeyMutation();

  const [form, setForm] = useState<Record<string, unknown>>(() =>
    initUserAppForm(detailData),
  );
  const boardingOptions = useMemo(
    () => getBoardingProcessOptions(detailData),
    [detailData],
  );

  // BoardingType/DeboardingType are stored as numeric codes — resolve them to
  // their option label (e.g. "OTP", "QR") so the confirmation modal reads
  // "OTP → QR" instead of "1 → 3".
  const resolveFieldDisplay = useCallback(
    (fieldKey: string, val: unknown): string => {
      if (fieldKey === "BoardingType" || fieldKey === "DeboardingType") {
        const options = boardingOptions.length
          ? boardingOptions
          : fieldKey === "BoardingType"
            ? BOARDING_TYPE_OPTIONS
            : DEBOARDING_TYPE_OPTIONS;
        const match = options.find((o) => String(o.value) === String(val));
        if (match) return match.label;
      }
      return displayValue(val);
    },
    [boardingOptions],
  );
  const confirmedForm = useRef<Record<string, unknown>>(
    initUserAppForm(detailData),
  );

  const [openSections, setOpenSections] = useState<Set<UserAppSectionKey>>(
    new Set(),
  );
  const [hoverSection, setHoverSection] = useState<UserAppSectionKey | null>(
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

  // Reset local UI state on office change (same rationale as OfficeConfigurationCard)
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
  }, [locCode]);

  useEffect(() => {
    if (detailData) {
      const f = initUserAppForm(detailData);
      setForm(f);
      confirmedForm.current = f;
    }
  }, [detailData]);

  const toggleSection = (key: UserAppSectionKey) => {
    if (!locCode || isLoading) return;
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

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
      await updateByKey({
        LocCode: locCode!,
        ColumnName: toUserAppColumnName(fieldKey),
        Value: toUserAppApiValue(newValue),
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
  }, [modal, locCode, updateByKey, setFieldState]);

  const disabled = !locCode;

  const renderSection = (key: UserAppSectionKey) => {
    const def = USER_APP_SECTIONS.find((s) => s.key === key)!;
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

        {isOpen && !disabled && !isLoading && (
          <div
            style={{
              padding: "20px 20px 24px",
              borderTop: "1px solid #F3F4F6",
              animation: "tat-fade 0.18s ease",
            }}
          >
            <UserAppSectionContent
              sectionKey={key}
              form={form}
              onFieldChange={handleFieldChange}
              fieldSaveStates={fieldSaveStates}
              Select={Select as React.ComponentType<Record<string, unknown>>}
              Switch={Switch as React.ComponentType<Record<string, unknown>>}
              Input={Input as React.ComponentType<Record<string, unknown>>}
              boardingOptions={boardingOptions}
            />
          </div>
        )}
      </div>
    );
  };

  const modalImpact = getUserAppImpactMessage(
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
          Select an office above to configure its settings.
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        {renderSection("basic")}
        {renderSection("schedule")}
        {renderSection("trip")}
        {renderSection("general")}
      </div>

      <ConfirmationModal
        open={modal.open}
        fieldLabel={getUserAppFieldLabel(modal.fieldKey)}
        backendColumn={toUserAppColumnName(modal.fieldKey)}
        oldDisplay={resolveFieldDisplay(modal.fieldKey, modal.oldValue)}
        newDisplay={resolveFieldDisplay(modal.fieldKey, modal.newValue)}
        impact={modalImpact}
        onCancel={handleModalCancel}
        onProceed={handleModalProceed}
      />
    </>
  );
};

export default UserAppConfigurationCard;
