import React from "react";
import {
  USER_APP_SECTIONS,
  type UserAppSectionKey,
  BOARDING_TYPE_OPTIONS,
  DEBOARDING_TYPE_OPTIONS,
  getUserAppFieldLabel,
} from "../../constants/UserAppConfig";
import type { BoardingProcessOption } from "../../utils/UserAppConfig.utils";
import { FieldWrapper } from "../Fieldwrapper";
import {
  SwitchField,
  SelectField,
  TextField,
  NumberField,
} from "../Formfields";
import { FieldSaveIndicator, type FieldSaveState } from "../Fieldsaveindicator";
import { FieldHelpPopover } from "../Fieldhelppopover";

const TEXT_LABEL = "#374151";
const DIVIDER = "#F3F4F6";

const ToggleRow: React.FC<{
  fkey: string;
  form: Record<string, unknown>;
  onFieldChange: (key: string, val: unknown) => void;
  fieldSaveStates: Record<string, FieldSaveState>;
  Switch: React.ComponentType<Record<string, unknown>>;
}> = ({ fkey, form, onFieldChange, fieldSaveStates, Switch }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 0",
      borderBottom: `1px solid ${DIVIDER}`,
    }}
  >
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: TEXT_LABEL }}>
        {getUserAppFieldLabel(fkey)} <FieldHelpPopover fieldKey={fkey} />
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

const TextRow: React.FC<{
  fkey: string;
  form: Record<string, unknown>;
  onFieldChange: (key: string, val: unknown) => void;
  fieldSaveStates: Record<string, FieldSaveState>;
  Input: React.ComponentType<Record<string, unknown>>;
}> = ({ fkey, form, onFieldChange, fieldSaveStates, Input }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: "10px 0",
      borderBottom: `1px solid ${DIVIDER}`,
    }}
  >
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: TEXT_LABEL }}>
        {getUserAppFieldLabel(fkey)} <FieldHelpPopover fieldKey={fkey} />
      </span>
      <FieldSaveIndicator state={fieldSaveStates[fkey] ?? "idle"} />
    </div>
    <div style={{ width: 180 }}>
      <TextField
        value={String(form[fkey] ?? "")}
        onConfirmedChange={(val) => onFieldChange(fkey, val)}
        Input={Input}
      />
    </div>
  </div>
);

export interface UserAppSectionContentProps {
  sectionKey: UserAppSectionKey;
  form: Record<string, unknown>;
  onFieldChange: (fieldKey: string, newValue: unknown) => void;
  fieldSaveStates: Record<string, FieldSaveState>;
  Select: React.ComponentType<Record<string, unknown>>;
  Switch: React.ComponentType<Record<string, unknown>>;
  Input: React.ComponentType<Record<string, unknown>>;
  boardingOptions: BoardingProcessOption[];
}

const SCHEDULE_FIELDS = [
  "IsCreateScheduleAllowed",
  "IsEditScheduleAllowed",
  "IsCancellationScheduledAllowed",
  "IsCancelledScheduledAllowedAfterTAT",
  "IsTrackingScheduledAllowed",
  "IsAlreadyScheduledNoShow",
  "IsScheduleBulkCancellationEnabled",
];

const TRIP_FIELDS = [
  "IsTripCancellationAllowed",
  "IsTripChatAllowed",
  "IsTripIvrCallAllowed",
  "IsTripShareCabAllowed",
  "IsTripTrackingAllowed",
  "IsTripAlreadyNoShow",
  "IsTripCancellationAllowedAfterTAT",
  "IsPickupNoShowCancelsDropTripEnabled"
];

const GENERAL_FIELDS = [
  "isDeboardOtpFieldAllowed",
  "isTripNoShowAllowed",
  "isTripSafeHomeReach",
  "isTripSummaryAllowed",
  "IsAreaDDLEnabled",
  "IsZoneDDlEnabled",
  "IsSosIvrEnabled",
];

// Fields rendered inline as pills in the "basic" section (no ToggleRow here)
const BASIC_TOGGLE_FIELDS: [string, string][] = [
  ["IsBoardDeboardOtpSame", "Board/Deboard OTP Same"],
  ["IsTripPublishWithETA", "Publish Trip with ETA"],
  ["IsUserUpdateProfile", "Allow User Profile Update"],
];

export const UserAppSectionContent: React.FC<UserAppSectionContentProps> = ({
  sectionKey,
  form,
  onFieldChange,
  fieldSaveStates,
  Select,
  Switch,
  Input,
  boardingOptions,
}) => {
  if (sectionKey === "basic")
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          padding: "10px 0",
          gap: 16,
        }}
      >
        {BASIC_TOGGLE_FIELDS.map(([fkey, label]) => (
          <div
            key={fkey}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "space-between",
              borderRadius: 8,
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
        ))}{" "}
        <FieldWrapper
          label="Boarding Type"
          saveState={fieldSaveStates["BoardingType"] ?? "idle"}
          fieldKey="BoardingType"
        >
          <SelectField
            value={form.BoardingType}
            options={
              boardingOptions.length ? boardingOptions : BOARDING_TYPE_OPTIONS
            }
            onConfirmedChange={(val) => onFieldChange("BoardingType", val)}
            Select={Select}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Deboarding Type"
          saveState={fieldSaveStates["DeboardingType"] ?? "idle"}
          fieldKey="DeboardingType"
        >
          <SelectField
            value={form.DeboardingType}
            options={
              boardingOptions.length ? boardingOptions : DEBOARDING_TYPE_OPTIONS
            }
            onConfirmedChange={(val) => onFieldChange("DeboardingType", val)}
            Select={Select}
          />
        </FieldWrapper>
      </div>
    );

  if (sectionKey === "schedule")
    return (
      <div>
        {SCHEDULE_FIELDS.map((fkey) => (
          <ToggleRow
            key={fkey}
            fkey={fkey}
            form={form}
            onFieldChange={onFieldChange}
            fieldSaveStates={fieldSaveStates}
            Switch={Switch}
          />
        ))}
      </div>
    );

  if (sectionKey === "trip")
    return (
      <div>
        {TRIP_FIELDS.map((fkey) => (
          <ToggleRow
            key={fkey}
            fkey={fkey}
            form={form}
            onFieldChange={onFieldChange}
            fieldSaveStates={fieldSaveStates}
            Switch={Switch}
          />
        ))}
      </div>
    );

  if (sectionKey === "general")
    return (
      <div>
        {GENERAL_FIELDS.map((fkey) => (
          <ToggleRow
            key={fkey}
            fkey={fkey}
            form={form}
            onFieldChange={onFieldChange}
            fieldSaveStates={fieldSaveStates}
            Switch={Switch}
          />
        ))}
      <div style={{marginTop:"8px"}} />
        <FieldWrapper
          label="SOS IVR Calling Retry Interval(in min)"
          saveState={fieldSaveStates["SosIvrRetryIntervalMinutes"] ?? "idle"}
          fieldKey="SosIvrRetryIntervalMinutes"
        >
          <NumberField
            value={(form.SosIvrRetryIntervalMinutes as number) ?? 0}
            onConfirmedChange={(val) =>
              onFieldChange("SosIvrRetryIntervalMinutes", val)
            }
            Input={Input}
          />
        </FieldWrapper>
        <TextRow
          fkey="AppIcon"
          form={form}
          onFieldChange={onFieldChange}
          fieldSaveStates={fieldSaveStates}
          Input={Input}
        />
      </div>
    );

  return null;
};

export { USER_APP_SECTIONS };
