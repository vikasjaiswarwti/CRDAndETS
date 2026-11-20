// ============================================================
// OfficeConfigurationCard.tsx — Enterprise SaaS settings layout
//
// REFACTORED:
// ✓  No auto-save / debounce
// ✓  Every field change opens ConfirmationModal
// ✓  Cancel → revert field value
// ✓  Proceed → API (only the changed field)
// ✓  Field-level save indicators (spinner → check/cross → 2s → idle)
// ✓  Tab / toggle / accordion changes never call API
// ✓  Unsaved local values survive tab navigation
// ✓  Section header no longer shows loader
// ✓  Batch modal (mode switch) passes fieldLabel = title and
//    oldDisplay / newDisplay = "" so the value grid is hidden,
//    showing only the clear impact description instead.
// ✓  Employee/Spoc selection per LockPanel (whoByPanel) is now lifted
//    to this component, keyed by ltKey, instead of living as local
//    useState inside LockPanel. This is what keeps the Spoc tab in
//    sync: LockPanel can remount when `isLoading` briefly flips true
//    during a background refetch right after a successful save —
//    local state would reset to "User" on that remount, but this
//    lifted state survives exactly like `form` already does.
// ============================================================

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown } from "lucide-react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { SECTIONS, type SectionKey } from "../constants/Rostertat.constants";
import { initForm, toColumnName } from "../utils/Rostertat.utils";
import {
  type ApplicationConfiguration,
  useGetCitiesQuery,
  useUpdateApplicationConfigurationByKeyMutation,
  useUpdateByKeyMutation,
} from "../services/Appcontrolapi";
import { SectionContent } from "./Sectioncontent";
import { ConfirmationModal } from "./Confirmationmodal";
import { getImpactMessage } from "./Configimpactmessages";
import type { FieldSaveState } from "./Fieldsaveindicator";

// ── Animations ────────────────────────────────────────────────────────────────
const ANIM = `
  @keyframes tat-fade  { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
  @keyframes tat-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
  @keyframes field-spin { to { transform: rotate(360deg); } }
`;

// ── Column layout ─────────────────────────────────────────────────────────────
// const LEFT: SectionKey[] = ["basic", "schCancel", "adhocCancel", "features"]; //geofence
// const RIGHT: SectionKey[] = ["sch", "adhoc", "notifications", "tripCancel"];

const TIME_FIELD_SUFFIXES = [
  "PickupDayTime",
  "DropDayTime",
  "PickupWeekTime",
  "DropWeekTime",
];

function formatTime24to12(time: string): string {
  if (!time) return "—";
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}

function isTimeField(key: string): boolean {
  return TIME_FIELD_SUFFIXES.some((s) => key.endsWith(s));
}

// ── Field label lookup ────────────────────────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  IsDPDPA: "DPDPA Consent",
  IsShowVehicleQR: "Show Vehicle QR",
  ScheduleAndAdhocCapping: "Schedule and Adhoc Capping",
  IsAdhocRequestCountAllowed: "Allow Adhoc Request Count",
  AdhocRequestQuota: "Adhoc Request Quota",
  AdhocRequestResetFrequency: "Adhoc Request Reset Frequency",
  ors_Lock_days: "ORS Lock Days",
  ScheduleListTAT: "Schedule List TAT (mins)",
  shiftValidationID: "Shift Validation Scope",
  adhocRequestEnabledForUser: "Adhoc Requests",
  boardDebaordEnabledForUser: "Board / Deboard",
  adhocRequestApproval: "Require Approval",
  adhocRequestPickTAT: "Pick TAT (mins)",
  adhocRequestDropTAT: "Drop TAT (mins)",
  scheduleNotificationReminder: "Schedule Reminder (mins)",
  pickCancelTAT_Minutes: "Pick Cancel TAT (mins)",
  dropCancelTAT_Minutes: "Drop Cancel TAT (mins)",
  geofenceAutoTripClose: "Auto Trip Close (m)",
  geofenceCabReachedHome: "Cab Reached Home (m)",
  geofenceToCallingUSer: "Calling User Radius (m)",
  routingPickupTAT: "Routing Pickup TAT (mins)",
  routingDropTAT: "Routing Drop TAT (mins)",
  configBoardDeboardSMSTATinMinutes: "Board/Deboard SMS (mins)",
  configSendSMSBeforeTripStart: "SMS Before Trip (mins)",
  hybridScheduleEnabled: "Hybrid Schedule",
  mergeShift: "Merge Shift",
  noShowCountIsActive: "No Show Count Active",
  noShowCount: "No Show Count",
  rosterSuspensionDays: "Roster Suspension (days)",

  isScheduleFillForLoginAndLogoutBoth: "Schedule Fill Login & Logout Both",
  isBoardDeBoardOTPSameOrDifferent: "Board/Deboard OTP Same or Different",
  isCancelTripByUserAfterTAT: "Cancel Trip After TAT",
  isCancelScheduleByUserAfterTAT: "Cancel Schedule After TAT",

  isDropTripCancelledWhenUserCancelsPickupTrip:
    "Auto-Cancel Drop on Pickup Cancel",
    IsRosterNotificationEnabled:"Roster Notification Enabled",
};

function getFieldLabel(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  const lk = key.toLowerCase();
  if (lk.includes("lockdays")) return "Lock Days";
  if (lk.includes("pickupday") && lk.includes("time")) return "Pickup Day Time";
  if (lk.includes("pickupday")) return "Pickup Day";
  if (lk.includes("pickup") && lk.includes("week") && lk.includes("time"))
    return "Pickup Weekly Time";
  if (lk.includes("pickup") && lk.includes("week")) return "Pickup Week Day";
  if (lk.includes("pickupminute")) return "Pickup Before (mins)";
  if (lk.includes("dropday") && lk.includes("time")) return "Drop Day Time";
  if (lk.includes("dropday")) return "Drop Day";
  if (lk.includes("drop") && lk.includes("week") && lk.includes("time"))
    return "Drop Weekly Time";
  if (lk.includes("drop") && lk.includes("week")) return "Drop Week Day";
  if (lk.includes("dropminute")) return "Drop Before (mins)";
  return key;
}

function displayValue(
  val: unknown,
  fieldKey?: string,
  form?: Record<string, unknown>,
): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "Enabled" : "Disabled";
  // For time fields, convert 24h → 12h
  if (fieldKey && form && isTimeField(fieldKey)) {
    return formatTime24to12(String(val));
  }
  return String(val);
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
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

// ── Types ─────────────────────────────────────────────────────────────────────
interface ModalState {
  open: boolean;
  fieldKey: string;
  oldValue: unknown;
  newValue: unknown;
}

interface MultiModalState {
  open: boolean;
  title: string;
  description: string;
  fields: Array<{ key: string; value: unknown }>;
  onRevert: () => void;
}

interface Props {
  detailData: Array<Record<string, string>> | null;
  applicationConfiguration: ApplicationConfiguration | null;
  locCode: number | null;
  officeOptions: { label: string; value: string | number }[];
  isLoading: boolean;
}

const APPLICATION_CONFIGURATION_FIELDS = new Set([
  "IsDPDPA",
  "IsShowVehicleQR",
  "ScheduleAndAdhocCapping",
  "IsAdhocRequestCountAllowed",
  "AdhocRequestQuota",
  "AdhocRequestResetFrequency",
  "IsSpeedServiceEnabled",
  "ScheduleBlockDays",
  "CityID",
  "IsRoutingCancelWindowCheckEnabled",
]);

function getInitialForm(
  detailData: Array<Record<string, string>> | null,
  applicationConfiguration: ApplicationConfiguration | null,
): Record<string, unknown> {
  return {
    ...initForm(detailData),
    ...(applicationConfiguration
      ? {
          IsDPDPA: applicationConfiguration.BasicSetting.IsDPDPA,
          IsShowVehicleQR:
            applicationConfiguration.BasicSetting.IsShowVehicleQR,
          ScheduleAndAdhocCapping:
            applicationConfiguration.SchedulingSetting.ScheduleAndAdhocCapping,
          ScheduleBlockDays:
            applicationConfiguration.SchedulingSetting.ScheduleBlockDays,
          IsAdhocRequestCountAllowed:
            applicationConfiguration.AdhocSetting.IsAdhocRequestCountAllowed,
          AdhocRequestQuota:
            applicationConfiguration.AdhocSetting.AdhocRequestQuota,
          AdhocRequestResetFrequency:
            applicationConfiguration.AdhocSetting.AdhocRequestResetFrequency,
          IsSpeedServiceEnabled:
            applicationConfiguration.BasicSetting.IsSpeedServiceEnabled,
          CityID: applicationConfiguration.BasicSetting.CityID,
          IsRoutingCancelWindowCheckEnabled:
            applicationConfiguration.RouteSetting
              .IsRoutingCancelWindowCheckEnabled,
        }
      : {}),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
export const OfficeConfigurationCard: React.FC<Props> = ({
  detailData,
  applicationConfiguration,
  locCode,
  officeOptions,
  isLoading,
}) => {
  const { Input, Select, Switch } = useUILibrary();
  const [updateByKey] = useUpdateByKeyMutation();
  const [updateApplicationConfigurationByKey] =
    useUpdateApplicationConfigurationByKeyMutation();
  const { data: cities } = useGetCitiesQuery();
  const cityOptions = useMemo(
    () => (cities ?? []).map((c) => ({ label: c.cityName, value: c.cityID })),
    [cities],
  );

  const [form, setForm] = useState<Record<string, unknown>>(() =>
    getInitialForm(detailData, applicationConfiguration),
  );
  const confirmedForm = useRef<Record<string, unknown>>(
    getInitialForm(detailData, applicationConfiguration),
  );

  // ── Employee/Spoc selection per LockPanel, keyed by that panel's ltKey ────
  // Lifted here (same tier as `form`) so it survives LockPanel remounting —
  // e.g. when `isLoading` briefly flips true during a background refetch
  // right after a successful save. See LockPanel.tsx's top comment.
  const [whoByPanel, setWhoByPanel] = useState<Record<string, "User" | "Spoc">>(
    {},
  );

  const handleWhoChange = useCallback((ltKey: string, who: "User" | "Spoc") => {
    setWhoByPanel((prev) => ({ ...prev, [ltKey]: who }));
  }, []);

  const [openSections, setOpenSections] = useState<Set<SectionKey>>(new Set());
  const [hoverSection, setHoverSection] = useState<SectionKey | null>(null);
  const [fieldSaveStates, setFieldSaveStates] = useState<
    Record<string, FieldSaveState>
  >({});
  const saveStateTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );

  // ── Single-field modal ────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalState>({
    open: false,
    fieldKey: "",
    oldValue: undefined,
    newValue: undefined,
  });

  // ── Batch modal (mode switches) ───────────────────────────────────────────
  const EMPTY_MULTI: MultiModalState = {
    open: false,
    title: "",
    description: "",
    fields: [],
    onRevert: () => {},
  };
  const [multiModal, setMultiModal] = useState<MultiModalState>(EMPTY_MULTI);

  // ── Reset on office change ────────────────────────────────────────────────
  // Note: whoByPanel intentionally resets here too — switching to a
  // different office is a real context change, unlike a background
  // refetch of the SAME office's data, so resetting to "User" per panel
  // is the right behaviour here.
  useEffect(() => {
    setOpenSections(new Set());
    setFieldSaveStates({});
    setWhoByPanel({});
    Object.values(saveStateTimers.current).forEach(clearTimeout);
    saveStateTimers.current = {};
    setModal({
      open: false,
      fieldKey: "",
      oldValue: undefined,
      newValue: undefined,
    });
    setMultiModal(EMPTY_MULTI);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locCode]);

  // ── Sync form from API ────────────────────────────────────────────────────
  useEffect(() => {
    if (detailData || applicationConfiguration) {
      const f = getInitialForm(detailData, applicationConfiguration);
      setForm(f);
      confirmedForm.current = f;
    }
  }, [detailData, applicationConfiguration]);

  // ── Accordion ─────────────────────────────────────────────────────────────
  const toggleSection = (key: SectionKey) => {
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
      // Optimistic UI update so input reflects user intent while modal is open
      setForm((prev) => ({ ...prev, [fieldKey]: newValue }));
      setModal({ open: true, fieldKey, oldValue, newValue });
    },
    [form],
  );

  // ── Local-only change (tabs, toggles) — no modal, no API ─────────────────
  const handleLocalChange = useCallback((updates: Record<string, unknown>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  // ── Per-field save state with auto-clear ──────────────────────────────────
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

  // ── Single-field modal: Cancel ────────────────────────────────────────────
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

  // ── Single-field modal: Proceed ───────────────────────────────────────────
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
      if (APPLICATION_CONFIGURATION_FIELDS.has(fieldKey)) {
        await updateApplicationConfigurationByKey({
          LocCode: locCode!,
          ColumnName: fieldKey,
          Value: String(newValue),
        }).unwrap();
      } else {
        await updateByKey({
          LocCode: locCode!,
          ColumnName: toColumnName(fieldKey),
          Value: String(newValue),
        }).unwrap();
      }
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
  }, [
    modal,
    locCode,
    updateByKey,
    updateApplicationConfigurationByKey,
    setFieldState,
  ]);

  // ── Batch modal: open (called by LockPanel on tab switch / group save) ────
  // payload.title  = e.g. "Switch to Calendar Days" / "Update Pickup Configuration"
  // payload.description = clear human sentence about what will now apply
  // payload.fields = [modeKey, ...subFields]
  const handleMultiFieldSave = useCallback(
    (
      payload: {
        title: string;
        description: string;
        fields: Array<{ key: string; value: unknown }>;
      },
      onRevert: () => void,
    ) => {
      setMultiModal({ open: true, ...payload, onRevert });
    },
    [],
  );

  // ── Batch modal: Cancel ───────────────────────────────────────────────────
  const handleMultiModalCancel = useCallback(() => {
    multiModal.onRevert();
    setMultiModal(EMPTY_MULTI);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multiModal]);

  // ── Batch modal: Proceed — save all fields in parallel ─────────────────────
  // Marks every field "saving" together, fires all API calls via
  // Promise.allSettled (one network round-trip set, not N sequential
  // single-field calls), then resolves each field's state independently.
  const handleMultiModalProceed = useCallback(async () => {
    const { fields } = multiModal;
    setMultiModal(EMPTY_MULTI);

    // Mark all fields as saving simultaneously
    fields.forEach(({ key }) => setFieldState(key, "saving"));

    // Fire all API calls in parallel — no sequential re-renders between saves
    const results = await Promise.allSettled(
      fields.map(({ key, value }) =>
        (APPLICATION_CONFIGURATION_FIELDS.has(key)
          ? updateApplicationConfigurationByKey({
              LocCode: locCode!,
              ColumnName: key,
              Value: String(value),
            })
          : updateByKey({
              LocCode: locCode!,
              ColumnName: toColumnName(key),
              Value: String(value),
            })
        )
          .unwrap()
          .then(() => ({ key, value, ok: true }))
          .catch(() => ({ key, value, ok: false })),
      ),
    );

    // Update confirmed form and field states in a single pass
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const { key, value, ok } = result.value;
        if (ok) {
          confirmedForm.current = { ...confirmedForm.current, [key]: value };
          setFieldState(key, "success", 2000);
        } else {
          // Revert failed fields to last confirmed value
          setForm((prev) => ({ ...prev, [key]: confirmedForm.current[key] }));
          setFieldState(key, "error", 3000);
        }
      }
    });
  }, [
    multiModal,
    locCode,
    updateByKey,
    updateApplicationConfigurationByKey,
    setFieldState,
  ]);

  // ── Render one accordion section ──────────────────────────────────────────
  const disabled = !locCode;

  const renderSection = (key: SectionKey) => {
    const def = SECTIONS.find((s) => s.key === key)!;
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
            <SectionContent
              sectionKey={key}
              accent={def.accent}
              form={form}
              onFieldChange={handleFieldChange}
              onLocalChange={handleLocalChange}
              onMultiFieldSave={handleMultiFieldSave}
              fieldSaveStates={fieldSaveStates}
              whoByPanel={whoByPanel}
              onWhoChange={handleWhoChange}
              Input={Input as React.ComponentType<Record<string, unknown>>}
              Select={Select as React.ComponentType<Record<string, unknown>>}
              Switch={Switch as React.ComponentType<Record<string, unknown>>}
              officeOptions={officeOptions}
              cityOptions={cityOptions}
            />
          </div>
        )}
      </div>
    );
  };

  // Build single-field modal impact message
  const modalImpact = getImpactMessage(
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

      {/* 2-column grid */}
      {/* <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div>{LEFT.map(renderSection)}</div>
        <div>{RIGHT.map(renderSection)}</div>
      </div> */}

      {/* 2-column grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div style={{ gridColumn: "span 2" }}>{renderSection("basic")}</div>
        {renderSection("sch")}
        {renderSection("schCancel")}
        {renderSection("adhoc")}
        {renderSection("adhocCancel")}
        {renderSection("tripCancel")}
        {renderSection("features")}
        {renderSection("geofence")}
        {renderSection("notifications")}
      </div>

      {/* ── Single-field confirmation modal ─────────────────────────────────
          Shows field label, old value, new value, impact description.
      ─────────────────────────────────────────────────────────────────── */}
      <ConfirmationModal
        open={modal.open}
        fieldLabel={getFieldLabel(modal.fieldKey)}
        backendColumn={toColumnName(modal.fieldKey)}
        oldDisplay={displayValue(modal.oldValue)}
        newDisplay={displayValue(modal.newValue)}
        impact={modalImpact}
        onCancel={handleModalCancel}
        onProceed={handleModalProceed}
      />

      {/* ── Batch modal for mode switches + group saves ─────────────────────
          fieldLabel = multiModal.title  e.g. "Switch to Calendar Days" or
          "Update Pickup Configuration".
          oldDisplay + newDisplay = "" so the value grid is hidden.
          The impact description carries the full clear explanation.
      ─────────────────────────────────────────────────────────────────── */}

      <ConfirmationModal
        open={multiModal.open}
        fieldLabel={multiModal.title}
        oldDisplay=""
        newDisplay=""
        impact={{
          title: multiModal.title,
          description: multiModal.description,
          severity: "warning",
        }}
        onCancel={handleMultiModalCancel}
        onProceed={handleMultiModalProceed}
      />
    </>
  );
};
