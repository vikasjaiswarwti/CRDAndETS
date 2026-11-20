// ============================================================
// SectionContent.tsx — Enterprise SaaS settings fields
//
// Refactored: delegates to LockPanel, FieldWrapper, FormFields.
// All user-editable fields go through onFieldChange (→ modal).
// Tab/toggle/accordion changes go through onLocalChange (UI only).
//
// NO auto-save. NO debounce. NO API calls from this file.
//
// `who` (Employee / Spoc selection per LockPanel) is lifted up to
// OfficeConfigurationCard and threaded through here so it survives
// LockPanel unmounting/remounting during background refetches.
// See LockPanel.tsx's top comment for the full rationale.
// ============================================================

import React from "react";
import {
  type SectionKey,
  SCOPE_OPTIONS,
  ADHOC_REQUEST_RESET_FREQUENCY_OPTIONS,
} from "../constants/Rostertat.constants";
import { LockPanel } from "./Lockpanel";
import { FieldWrapper } from "./Fieldwrapper";
import {
  NumberField,
  SwitchField,
  SelectField,
  // TextField
} from "./Formfields";
import { FieldSaveIndicator, type FieldSaveState } from "./Fieldsaveindicator";
import { FieldHelpPopover } from "./Fieldhelppopover";
// import { getUserAppFieldLabel } from "../constants/UserAppConfig";

// ── Design tokens ─────────────────────────────────────────────────────────────
const TEXT_LABEL = "#374151";
const DIVIDER = "#F3F4F6";

// ── Shared layout helpers ──────────────────────────────────────────────────────
// const SubLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
//   <div
//     style={{
//       width: "100%",
//       fontSize: 13,
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "space-between",
//       fontWeight: 600,
//       color: TEXT_LABEL,
//       marginBottom: 12,
//     }}
//   >
//     {children}
//   </div>
// );

const G2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col gap-2 w-full">{children}</div>
);

const Divider: React.FC = () => (
  <div style={{ height: 1, background: DIVIDER, margin: "20px 0" }} />
);

// ── Toggle row (Switch + label + proper save indicator) ───────────────────────
const TR: React.FC<{
  label: string;
  fkey: string;
  form: Record<string, unknown>;
  onFieldChange: (key: string, val: unknown) => void;
  fieldSaveStates: Record<string, FieldSaveState>;
  Switch: React.ComponentType<Record<string, unknown>>;
}> = ({ label, fkey, form, onFieldChange, fieldSaveStates, Switch }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 0",
      borderBottom: `1px solid ${DIVIDER}`,
    }}
  >
    {/* Label + filled SVG indicator (same GreenTick / RedCross as number fields) */}
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: TEXT_LABEL }}>
        {label} {fkey && <FieldHelpPopover fieldKey={fkey} />}
      </span>
      <FieldSaveIndicator state={fieldSaveStates[fkey] ?? "idle"} />
    </div>
    <SwitchField
      checked={Boolean(form[fkey])}
      onConfirmedChange={(val) => onFieldChange(fkey, val)}
      Switch={Switch}
    />
  </div>
);

// ── Props ──────────────────────────────────────────────────────────────────────
export interface SectionContentProps {
  sectionKey: SectionKey;
  accent?: string;
  form: Record<string, unknown>;
  /** Triggers single-field confirmation modal → API on confirm */
  onFieldChange: (fieldKey: string, newValue: unknown) => void;
  /** Triggers batch confirmation modal → parallel API calls on confirm */
  onMultiFieldSave: (
    payload: {
      title: string;
      description: string;
      fields: Array<{ key: string; value: unknown }>;
    },
    onRevert: () => void,
  ) => void;
  /** Pure local update (tab switches, UI-only changes) */
  onLocalChange: (updates: Record<string, unknown>) => void;
  fieldSaveStates: Record<string, FieldSaveState>;
  /** Current Employee/Spoc selection per LockPanel, keyed by that panel's ltKey */
  whoByPanel: Record<string, "User" | "Spoc">;
  /** Update the Employee/Spoc selection for a given LockPanel (by ltKey) */
  onWhoChange: (ltKey: string, who: "User" | "Spoc") => void;
  Input: React.ComponentType<Record<string, unknown>>;
  Select: React.ComponentType<Record<string, unknown>>;
  Switch: React.ComponentType<Record<string, unknown>>;
  officeOptions: { label: string; value: string | number }[];
  cityOptions: { label: string; value: string | number }[];
}

// ── SectionContent ─────────────────────────────────────────────────────────────
export const SectionContent: React.FC<SectionContentProps> = ({
  sectionKey,
  // accent,
  form,
  onFieldChange,
  onMultiFieldSave,
  onLocalChange,
  fieldSaveStates,
  whoByPanel,
  onWhoChange,
  Input,
  Select,
  Switch,
  cityOptions,
}) => {
  // Default to "User" the first time a given ltKey is seen (no entry yet).
  const whoFor = (ltKey: string): "User" | "Spoc" =>
    whoByPanel[ltKey] ?? "User";

  // ── basic ──────────────────────────────────────────────────────────────────
  if (sectionKey === "basic")
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Row 1 — 3 fields in one row */}
        <div className="grid grid-cols-[2fr_1fr] gap-6">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            {(
              [
                [
                  "isScheduleFillForLoginAndLogoutBoth",
                  "Fill Login & Logout Both",
                ],
                [
                  "isBoardDeBoardOTPSameOrDifferent",
                  "Board/Deboard OTP Different",
                ],
                ["isCancelTripByUserAfterTAT", "Cancel Trip After TAT"],
                ["isCancelScheduleByUserAfterTAT", "Cancel Schedule After TAT"],
                [
                  "isDropTripCancelledWhenUserCancelsPickupTrip",
                  "Auto-Cancel Drop on Pickup Cancel",
                ],
                ["boardDebaordEnabledForUser", "Show Board / Deboard Button"],
                ["IsDPDPA", "DPDPA"],
                ["IsShowVehicleQR", "Show Vehicle QR"],
              ] as [string, string][]
            ).map(([fkey, label]) => (
              <div
                key={fkey}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "8px 12px",
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  background: "#FAFAFA",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: TEXT_LABEL,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label} <FieldHelpPopover fieldKey={fkey} />
                </span>

                <SwitchField
                  checked={Boolean(form[fkey])}
                  onConfirmedChange={(val) => onFieldChange(fkey, val)}
                  Switch={Switch}
                />
                <FieldSaveIndicator state={fieldSaveStates[fkey] ?? "idle"} />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <FieldWrapper
              label="Shift Configuration Scope"
              saveState={fieldSaveStates["shiftValidationID"] ?? "idle"}
              fieldKey="shiftValidationID"
            >
              <SelectField
                value={form.shiftValidationID}
                options={SCOPE_OPTIONS}
                onConfirmedChange={(val) =>
                  onFieldChange("shiftValidationID", val)
                }
                Select={Select}
              />
            </FieldWrapper>
            <FieldWrapper
              label="Admin Fill TAT (inc. Excel)"
              saveState={fieldSaveStates["ors_Lock_days"] ?? "idle"}
              fieldKey="ors_Lock_days"
            >
              <NumberField
                value={(form.ors_Lock_days as number) ?? 0}
                onConfirmedChange={(val) => onFieldChange("ors_Lock_days", val)}
                Input={Input}
              />
            </FieldWrapper>
            <FieldWrapper
              label="Schedule List TAT (Days)"
              saveState={fieldSaveStates["ScheduleListTAT"] ?? "idle"}
              fieldKey="ScheduleListTAT"
            >
              <NumberField
                value={(form.ScheduleListTAT as number) ?? 0}
                onConfirmedChange={(val) =>
                  onFieldChange("ScheduleListTAT", val)
                }
                Input={Input}
              />
            </FieldWrapper>
          </div>
        </div>
      </div>
    );

  // ── sch ────────────────────────────────────────────────────────────────────
  if (sectionKey === "sch")
    return (
      <div style={{ padding: "10px 0" }}>
        <div className="flex flex-col gap-2">
          <FieldWrapper
            label="Schedule and Adhoc Capping"
            saveState={fieldSaveStates.ScheduleAndAdhocCapping ?? "idle"}
            fieldKey="ScheduleAndAdhocCapping"
          >
            <NumberField
              value={(form.ScheduleAndAdhocCapping as number) ?? 0}
              onConfirmedChange={(val) =>
                onFieldChange("ScheduleAndAdhocCapping", val)
              }
              Input={Input}
            />
          </FieldWrapper>
          <FieldWrapper
            label="Schedule Block Days"
            saveState={fieldSaveStates.ScheduleBlockDays ?? "idle"}
            fieldKey="ScheduleBlockDays"
          >
            <NumberField
              value={(form.ScheduleBlockDays as number) ?? 0}
              onConfirmedChange={(val) =>
                onFieldChange("ScheduleBlockDays", val)
              }
              Input={Input}
            />
          </FieldWrapper>
        </div>
        <Divider />
        <LockPanel
          ltKey="schUpdateLockTypeFor"
          fp="sch"
          form={form}
          who={whoFor("schUpdateLockTypeFor")}
          onWhoChange={onWhoChange}
          onFieldChange={onFieldChange}
          onMultiFieldSave={onMultiFieldSave}
          onLocalChange={onLocalChange}
          fieldSaveStates={fieldSaveStates}
          Input={Input}
          Select={Select}
        />
      </div>
    );

  // ── schCancel ──────────────────────────────────────────────────────────────
  if (sectionKey === "schCancel")
    return (
      <LockPanel
        ltKey="schCancelLockTypeFor"
        fp="schCancel"
        form={form}
        who={whoFor("schCancelLockTypeFor")}
        onWhoChange={onWhoChange}
        onFieldChange={onFieldChange}
        onMultiFieldSave={onMultiFieldSave}
        onLocalChange={onLocalChange}
        fieldSaveStates={fieldSaveStates}
        Input={Input}
        Select={Select}
      />
    );

  // ── adhoc ──────────────────────────────────────────────────────────────────
  if (sectionKey === "adhoc")
    return (
      <div>
        <TR
          label="Adhoc Requests"
          fkey="adhocRequestEnabledForUser"
          form={form}
          onFieldChange={onFieldChange}
          fieldSaveStates={fieldSaveStates}
          Switch={Switch}
        />
        <TR
          label="Require Approval"
          fkey="adhocRequestApproval"
          form={form}
          onFieldChange={onFieldChange}
          fieldSaveStates={fieldSaveStates}
          Switch={Switch}
        />
        <TR
          label="Allow Adhoc Request Count"
          fkey="IsAdhocRequestCountAllowed"
          form={form}
          onFieldChange={onFieldChange}
          fieldSaveStates={fieldSaveStates}
          Switch={Switch}
        />
        <div style={{ marginTop: 6 }} />
        <G2>
          <FieldWrapper
            label="Adhoc Request Quota"
            saveState={fieldSaveStates.AdhocRequestQuota ?? "idle"}
            fieldKey="AdhocRequestQuota"
          >
            <NumberField
              value={(form.AdhocRequestQuota as number) ?? 0}
              onConfirmedChange={(val) =>
                onFieldChange("AdhocRequestQuota", val)
              }
              Input={Input}
            />
          </FieldWrapper>
          <FieldWrapper
            label="Adhoc Request Reset Frequency"
            saveState={fieldSaveStates["AdhocRequestResetFrequency"] ?? "idle"}
            fieldKey="AdhocRequestResetFrequency"
          >
            <SelectField
              value={form.AdhocRequestResetFrequency}
              options={ADHOC_REQUEST_RESET_FREQUENCY_OPTIONS}
              onConfirmedChange={(val) =>
                onFieldChange("AdhocRequestResetFrequency", val)
              }
              Select={Select}
            />
          </FieldWrapper>
        </G2>
        <div style={{ marginTop: 16 }} />

        {/* <Divider /> */}
        <LockPanel
          ltKey="adhocLockTypeFor"
          fp="adhoc"
          form={form}
          who={whoFor("adhocLockTypeFor")}
          onWhoChange={onWhoChange}
          onFieldChange={onFieldChange}
          onMultiFieldSave={onMultiFieldSave}
          onLocalChange={onLocalChange}
          fieldSaveStates={fieldSaveStates}
          Input={Input}
          Select={Select}
        />
      </div>
    );

  // ── adhocCancel ────────────────────────────────────────────────────────────
  if (sectionKey === "adhocCancel")
    return (
      <LockPanel
        ltKey="adhocCancelLockTypeFor"
        fp="adhocCancel"
        form={form}
        who={whoFor("adhocCancelLockTypeFor")}
        onWhoChange={onWhoChange}
        onFieldChange={onFieldChange}
        onMultiFieldSave={onMultiFieldSave}
        onLocalChange={onLocalChange}
        fieldSaveStates={fieldSaveStates}
        Input={Input}
        Select={Select}
      />
    );

  // ── notifications ──────────────────────────────────────────────────────────
  if (sectionKey === "notifications")
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {(
          [["IsRosterNotificationEnabled", "Roster Notification Enabled"]] as [
            string,
            string,
          ][]
        ).map(([fkey, label]) => (
          <div
            key={fkey}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              padding: "8px 0px",
              // border: "1px solid #E5E7EB",
              borderRadius: 8,
              // background: "#FAFAFA",
              width: "100%",
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: TEXT_LABEL,
                whiteSpace: "nowrap",
              }}
            >
              {label} <FieldHelpPopover fieldKey={fkey} />
            </span>

            <SwitchField
              checked={Boolean(form[fkey])}
              onConfirmedChange={(val) => onFieldChange(fkey, val)}
              Switch={Switch}
            />
            <FieldSaveIndicator state={fieldSaveStates[fkey] ?? "idle"} />
          </div>
        ))}
        <FieldWrapper
          label="Schedule Reminder (minutes)"
          saveState={fieldSaveStates["scheduleNotificationReminder"] ?? "idle"}
        >
          <NumberField
            value={(form.scheduleNotificationReminder as number) ?? 15}
            onConfirmedChange={(val) =>
              onFieldChange("scheduleNotificationReminder", val)
            }
            Input={Input}
          />
        </FieldWrapper>
        {/* <G2>
          <FieldWrapper
            label="Login Cancel TAT (minutes)"
            saveState={fieldSaveStates["pickCancelTAT_Minutes"] ?? "idle"}
            fieldKey={"pickCancelTAT_Minutes"}
          >
            <NumberField
              value={(form.pickCancelTAT_Minutes as number) ?? 60}
              onConfirmedChange={(val) =>
                onFieldChange("pickCancelTAT_Minutes", val)
              }
              Input={Input}
            />
          </FieldWrapper>
          <FieldWrapper
            label="Logout Cancel TAT (minutes)"
            saveState={fieldSaveStates["dropCancelTAT_Minutes"] ?? "idle"}
            fieldKey={"dropCancelTAT_Minutes"}
          >
            <NumberField
              value={(form.dropCancelTAT_Minutes as number) ?? 60}
              onConfirmedChange={(val) =>
                onFieldChange("dropCancelTAT_Minutes", val)
              }
              Input={Input}
            />
          </FieldWrapper>
        </G2> */}
      </div>
    );

  // new tile
  if (sectionKey === "tripCancel")
    return (
      <G2>
        <FieldWrapper
          label="Login Cancel TAT (minutes)"
          saveState={fieldSaveStates["pickCancelTAT_Minutes"] ?? "idle"}
          fieldKey="pickCancelTAT_Minutes"
        >
          <NumberField
            value={(form.pickCancelTAT_Minutes as number) ?? 60}
            onConfirmedChange={(val) =>
              onFieldChange("pickCancelTAT_Minutes", val)
            }
            Input={Input}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Logout Cancel TAT (minutes)"
          saveState={fieldSaveStates["dropCancelTAT_Minutes"] ?? "idle"}
          fieldKey="dropCancelTAT_Minutes"
        >
          <NumberField
            value={(form.dropCancelTAT_Minutes as number) ?? 60}
            onConfirmedChange={(val) =>
              onFieldChange("dropCancelTAT_Minutes", val)
            }
            Input={Input}
          />
        </FieldWrapper>
      </G2>
    );

  // ── geofence ───────────────────────────────────────────────────────────────
  if (sectionKey === "geofence")
    return (
      // CityID
      <div className="flex flex-col gap-1.5 w-full">
        {(
          [
            ["IsSpeedServiceEnabled", "Tom-Tom Speed Service"],
            [
              "IsRoutingCancelWindowCheckEnabled",
              "Create Route After Sch. Cancellation TAT Expiry",
            ],
          ] as [string, string][]
        ).map(([fkey, label]) => (
          <div
            key={fkey}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              padding: "8px 0px",
              // border: "1px solid #E5E7EB",
              borderRadius: 8,
              // background: "#FAFAFA",
              width: "100%",
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: TEXT_LABEL,
                whiteSpace: "nowrap",
              }}
            >
              {label} <FieldHelpPopover fieldKey={fkey} />
            </span>

            <SwitchField
              checked={Boolean(form[fkey])}
              onConfirmedChange={(val) => onFieldChange(fkey, val)}
              Switch={Switch}
            />
            <FieldSaveIndicator state={fieldSaveStates[fkey] ?? "idle"} />
          </div>
        ))}
        <FieldWrapper
          label="City"
          saveState={fieldSaveStates["CityID"] ?? "idle"}
          fieldKey="CityID"
        >
          <SelectField
            value={form.CityID}
            options={cityOptions}
            onConfirmedChange={(val) => onFieldChange("CityID", val)}
            Select={Select}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Auto Trip Close (meter)"
          saveState={fieldSaveStates["geofenceAutoTripClose"] ?? "idle"}
          fieldKey={"geofenceAutoTripClose"}
        >
          <NumberField
            value={(form.geofenceAutoTripClose as number) ?? 0}
            onConfirmedChange={(val) =>
              onFieldChange("geofenceAutoTripClose", val)
            }
            Input={Input}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Cab Reached Home (meter)"
          saveState={fieldSaveStates["geofenceCabReachedHome"] ?? "idle"}
          fieldKey={"geofenceCabReachedHome"}
        >
          <NumberField
            value={(form.geofenceCabReachedHome as number) ?? 0}
            onConfirmedChange={(val) =>
              onFieldChange("geofenceCabReachedHome", val)
            }
            Input={Input}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Calling User Radius (meter)"
          saveState={fieldSaveStates["geofenceToCallingUSer"] ?? "idle"}
          fieldKey={"geofenceToCallingUSer"}
        >
          <NumberField
            value={(form.geofenceToCallingUSer as number) ?? 0}
            onConfirmedChange={(val) =>
              onFieldChange("geofenceToCallingUSer", val)
            }
            Input={Input}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Routing Login TAT (minutes)"
          saveState={fieldSaveStates["routingPickupTAT"] ?? "idle"}
          fieldKey={"routingPickupTAT"}
        >
          <NumberField
            value={(form.routingPickupTAT as number) ?? 0}
            onConfirmedChange={(val) => onFieldChange("routingPickupTAT", val)}
            Input={Input}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Routing Logout TAT (minutes)"
          saveState={fieldSaveStates["routingDropTAT"] ?? "idle"}
          fieldKey={"routingDropTAT"}
        >
          <NumberField
            value={(form.routingDropTAT as number) ?? 0}
            onConfirmedChange={(val) => onFieldChange("routingDropTAT", val)}
            Input={Input}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Schedule Board/Deboard SMS (minutes)"
          saveState={
            fieldSaveStates["configBoardDeboardSMSTATinMinutes"] ?? "idle"
          }
        >
          <NumberField
            value={(form.configBoardDeboardSMSTATinMinutes as number) ?? 0}
            onConfirmedChange={(val) =>
              onFieldChange("configBoardDeboardSMSTATinMinutes", val)
            }
            Input={Input}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Schedule SMS Before Start Trip (minutes)"
          saveState={fieldSaveStates["configSendSMSBeforeTripStart"] ?? "idle"}
          full
        >
          <NumberField
            value={(form.configSendSMSBeforeTripStart as number) ?? 0}
            onConfirmedChange={(val) =>
              onFieldChange("configSendSMSBeforeTripStart", val)
            }
            Input={Input}
          />
        </FieldWrapper>
      </div>
    );

  // ── features ───────────────────────────────────────────────────────────────
  if (sectionKey === "features")
    return (
      <div>
        <TR
          label="Hybrid Schedule"
          fkey="hybridScheduleEnabled"
          form={form}
          onFieldChange={onFieldChange}
          fieldSaveStates={fieldSaveStates}
          Switch={Switch}
        />
        <TR
          label="Merge Shift"
          fkey="mergeShift"
          form={form}
          onFieldChange={onFieldChange}
          fieldSaveStates={fieldSaveStates}
          Switch={Switch}
        />
        <TR
          label="No Show Count Active"
          fkey="noShowCountIsActive"
          form={form}
          onFieldChange={onFieldChange}
          fieldSaveStates={fieldSaveStates}
          Switch={Switch}
        />

        <div style={{ marginTop: 6 }} />
        <G2>
          <FieldWrapper
            label="No Show Count"
            saveState={fieldSaveStates["noShowCount"] ?? "idle"}
            fieldKey={"noShowCount"}
          >
            <NumberField
              value={(form.noShowCount as number) ?? 0}
              onConfirmedChange={(val) => onFieldChange("noShowCount", val)}
              Input={Input}
            />
          </FieldWrapper>
          <FieldWrapper
            label="Roster Suspension (days)"
            saveState={fieldSaveStates["rosterSuspensionDays"] ?? "idle"}
            fieldKey={"rosterSuspensionDays"}
          >
            <NumberField
              value={(form.rosterSuspensionDays as number) ?? 0}
              onConfirmedChange={(val) =>
                onFieldChange("rosterSuspensionDays", val)
              }
              Input={Input}
            />
          </FieldWrapper>
        </G2>
      </div>
    );

  return null;
};
