import React, { useCallback, useEffect, useState } from "react";
import { ChevronDown, Radio } from "lucide-react";
import {
  DRIVER_EVENT_BOOLEAN_FIELDS,
  DRIVER_EVENT_FIELD_LABELS,
  DRIVER_EVENT_NUMBER_FIELDS,
  DRIVER_EVENT_SECTIONS,
  DRIVER_EVENT_TEXT_FIELDS,
} from "../../constants/DriverAppConfig";
import {
  useGetDriverEventsConfigQuery,
  useGetDriverAppEventsQuery,
  useUpdateDriverEventsConfigMutation,
  useUpdateDriverAppEventMutation,
  type DriverAppEvent,
  type DriverEventConfigRawResponse,
} from "../../services/userAppConfigurationApi";
import { useUILibrary } from "../../../../shared/lib/ui-lib/ui-library-context";
import { FieldWrapper } from "../Fieldwrapper";
import {
  NumberField,
  SelectField,
  SwitchField,
  TextField,
} from "../Formfields";
import { ConfirmationModal } from "../Confirmationmodal";

type NewField = "TripType" | "Active";
type LegacyField =
  | (typeof DRIVER_EVENT_BOOLEAN_FIELDS)[number]
  | (typeof DRIVER_EVENT_NUMBER_FIELDS)[number]
  | (typeof DRIVER_EVENT_TEXT_FIELDS)[number];

type ModalState = {
  open: boolean;
  eventCode: number;
  source: "new" | "legacy";
  field: NewField | LegacyField;
  oldValue: unknown;
  newValue: unknown;
};

const emptyModal: ModalState = {
  open: false,
  eventCode: 0,
  source: "new",
  field: "TripType",
  oldValue: undefined,
  newValue: undefined,
};

const toBoolean = (value: unknown) =>
  value === true || value === 1 || value === "1" || value === "true";

const toApiValue = (field: NewField | LegacyField, value: unknown) =>
  field === "Active" ? (toBoolean(value) ? "1" : "0") : String(value ?? "");

const eventTitle = (code: number, events: DriverAppEvent[]) =>
  events.find((event) => event.DriverAppEventCode === code)
    ?.DriverAppEventName ??
  DRIVER_EVENT_SECTIONS.find((section) => section.code === code)?.title ??
  `Event ${code}`;

const asLegacyObject = (
  response:
    | DriverEventConfigRawResponse
    | DriverEventConfigRawResponse[]
    | undefined,
) => {
  const value = Array.isArray(response) ? response[0] : response;
  if (!value) return {};
  if (typeof value.data !== "string") return value;
  try {
    const parsed = JSON.parse(value.data);
    return (Array.isArray(parsed) ? parsed[0] : parsed) ?? {};
  } catch {
    return value;
  }
};

export const DriverAppEventSettingsSection: React.FC = () => {
  const { Input, Select, Switch } = useUILibrary();
  const { data: events = [], isFetching } = useGetDriverAppEventsQuery();
  const [updateEvent] = useUpdateDriverAppEventMutation();
  const [updateLegacyEvent] = useUpdateDriverEventsConfigMutation();
  const legacyQueries = [
    useGetDriverEventsConfigQuery({ DriverAppEventCode: 1 }),
    useGetDriverEventsConfigQuery({ DriverAppEventCode: 2 }),
    useGetDriverEventsConfigQuery({ DriverAppEventCode: 3 }),
    useGetDriverEventsConfigQuery({ DriverAppEventCode: 4 }),
    useGetDriverEventsConfigQuery({ DriverAppEventCode: 5 }),
    useGetDriverEventsConfigQuery({ DriverAppEventCode: 6 }),
    useGetDriverEventsConfigQuery({ DriverAppEventCode: 7 }),
    useGetDriverEventsConfigQuery({ DriverAppEventCode: 8 }),
    useGetDriverEventsConfigQuery({ DriverAppEventCode: 9 }),
    useGetDriverEventsConfigQuery({ DriverAppEventCode: 10 }),
  ];
  const [values, setValues] = useState<Record<number, DriverAppEvent>>({});
  const [legacyValues, setLegacyValues] = useState<
    Record<number, Record<string, unknown>>
  >({});
  const [openCode, setOpenCode] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalState>(emptyModal);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    setValues(
      events.reduce<Record<number, DriverAppEvent>>((result, event) => {
        result[event.DriverAppEventCode] = event;
        return result;
      }, {}),
    );
  }, [events]);

  useEffect(
    () => {
      const next = legacyQueries.reduce<
        Record<number, Record<string, unknown>>
      >((result, query, index) => {
        if (query.data !== undefined)
          result[index + 1] = asLegacyObject(query.data);
        return result;
      }, {});
      if (Object.keys(next).length > 0) setLegacyValues(next);
      // Query result objects are stable enough for this synchronization effect.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    legacyQueries.map((query) => query.data),
  );

  const requestChange = useCallback(
    (eventCode: number, field: NewField, newValue: unknown) => {
      const current = values[eventCode];
      if (!current || current[field] === newValue) return;
      setValues((previous) => ({
        ...previous,
        [eventCode]: { ...current, [field]: newValue },
      }));
      setModal({
        open: true,
        eventCode,
        source: "new",
        field,
        oldValue: current[field],
        newValue,
      });
    },
    [values],
  );

  const requestLegacyChange = useCallback(
    (eventCode: number, field: LegacyField, newValue: unknown) => {
      const current = legacyValues[eventCode];
      if (!current || current[field] === newValue) return;
      setLegacyValues((previous) => ({
        ...previous,
        [eventCode]: { ...current, [field]: newValue },
      }));
      setModal({
        open: true,
        eventCode,
        source: "legacy",
        field,
        oldValue: current[field],
        newValue,
      });
    },
    [legacyValues],
  );

  const cancel = useCallback(() => {
    setValues((previous) => ({
      ...previous,
      ...(modal.source === "new"
        ? {
            [modal.eventCode]: {
              ...previous[modal.eventCode],
              [modal.field]: modal.oldValue,
            },
          }
        : {}),
    }));
    if (modal.source === "legacy") {
      setLegacyValues((previous) => ({
        ...previous,
        [modal.eventCode]: {
          ...previous[modal.eventCode],
          [modal.field]: modal.oldValue,
        },
      }));
    }
    setModal(emptyModal);
  }, [modal]);

  const proceed = useCallback(async () => {
    const { eventCode, field, newValue } = modal;
    setModal(emptyModal);
    setSaving(`${eventCode}:${field}`);
    try {
      if (modal.source === "new") {
        await updateEvent({
          DriverAppEventCode: eventCode,
          ColumnName: field as NewField,
          Value: toApiValue(field, newValue),
        }).unwrap();
      } else {
        await updateLegacyEvent({
          DriverAppEventCode: eventCode,
          ColumnName: field,
          Value: toApiValue(field, newValue),
        }).unwrap();
      }
    } catch {
      if (modal.source === "new") {
        setValues((previous) => ({
          ...previous,
          [eventCode]: { ...previous[eventCode], [field]: modal.oldValue },
        }));
      } else {
        setLegacyValues((previous) => ({
          ...previous,
          [eventCode]: { ...previous[eventCode], [field]: modal.oldValue },
        }));
      }
    } finally {
      setSaving(null);
    }
  }, [modal, updateEvent, updateLegacyEvent]);

  return (
    <section style={{ marginTop: 10 }}>
      <div
        style={{
          marginBottom: 10,
          fontSize: 16,
          fontWeight: 700,
          color: "#111827",
        }}
      >
        Driver App Event Settings
      </div>
      {DRIVER_EVENT_SECTIONS.map(({ code }) => {
        const event = values[code];
        const isOpen = openCode === code;
        return (
          <div
            key={code}
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 10,
              overflow: "hidden",
              marginBottom: 10,
              background: "#fff",
            }}
          >
            <button
              type="button"
              onClick={() => setOpenCode(isOpen ? null : code)}
              disabled={isFetching || !event}
              style={{
                width: "100%",
                minHeight: 56,
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                gap: 14,
                background: isOpen ? "#FAFAFA" : "transparent",
                border: "none",
                cursor: isFetching || !event ? "default" : "pointer",
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#2563EB12",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#2563EB",
                }}
              >
                <Radio size={16} />
              </span>
              <span
                style={{
                  flex: 1,
                  textAlign: "left",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                {eventTitle(code, events)}
              </span>
              <ChevronDown
                size={16}
                style={{
                  color: "#9CA3AF",
                  transform: isOpen ? "rotate(180deg)" : undefined,
                }}
              />
            </button>
            {isOpen && event && (
              <div
                style={{
                  padding: "20px",
                  borderTop: "1px solid #F3F4F6",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <FieldWrapper
                  label="Trip type"
                //   fieldKey="TripType"
                  saveState={saving === `${code}:TripType` ? "saving" : "idle"}
                >
                  <SelectField
                    value={Number(event.TripType)}
                    options={[
                      { value: 0, label: "Both" },
                      { value: 1, label: "Login" },
                      { value: 2, label: "Logout" },
                    ]}
                    onConfirmedChange={(value) =>
                      requestChange(code, "TripType", Number(value))
                    }
                    Select={Select}
                  />
                </FieldWrapper>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 0",
                    borderBottom: "1px solid #F3F4F6",
                  }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}
                  >
                    Active
                  </span>
                  <SwitchField
                    checked={toBoolean(event.Active)}
                    onConfirmedChange={(value) =>
                      requestChange(code, "Active", value)
                    }
                    Switch={Switch}
                  />
                </div>
                {DRIVER_EVENT_BOOLEAN_FIELDS.map((fieldKey) => (
                  <div
                    key={fieldKey}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "9px 0",
                      borderBottom: "1px solid #F3F4F6",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#374151",
                      }}
                    >
                      {DRIVER_EVENT_FIELD_LABELS[fieldKey]}
                    </span>
                    <SwitchField
                      checked={toBoolean(legacyValues[code]?.[fieldKey])}
                      onConfirmedChange={(value) =>
                        requestLegacyChange(code, fieldKey, value)
                      }
                      Switch={Switch}
                    />
                  </div>
                ))}
                {DRIVER_EVENT_NUMBER_FIELDS.map((fieldKey) => (
                  <FieldWrapper
                    key={fieldKey}
                    label={DRIVER_EVENT_FIELD_LABELS[fieldKey]}
                    // fieldKey={fieldKey}
                    saveState="idle"
                  >
                    <NumberField
                      value={Number(legacyValues[code]?.[fieldKey] ?? 0)}
                      onConfirmedChange={(value) =>
                        requestLegacyChange(code, fieldKey, value)
                      }
                      Input={Input}
                    />
                  </FieldWrapper>
                ))}
                {DRIVER_EVENT_TEXT_FIELDS.map((fieldKey) => (
                  <FieldWrapper
                    key={fieldKey}
                    label={DRIVER_EVENT_FIELD_LABELS[fieldKey]}
                    // fieldKey={fieldKey}
                    saveState="idle"
                  >
                    <TextField
                      value={String(legacyValues[code]?.[fieldKey] ?? "")}
                      onConfirmedChange={(value) =>
                        requestLegacyChange(code, fieldKey, value)
                      }
                      Input={Input}
                    />
                  </FieldWrapper>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <ConfirmationModal
        open={modal.open}
        fieldLabel={
          modal.field === "TripType"
            ? "Trip type"
            : modal.field === "Active"
              ? "Active"
              : DRIVER_EVENT_FIELD_LABELS[modal.field]
        }
        backendColumn={modal.field}
        oldDisplay={String(modal.oldValue ?? "—")}
        newDisplay={String(modal.newValue ?? "—")}
        impact={{
          title: "Update Driver App Event",
          description: `${modal.field} will be updated for this driver event.`,
          severity: "warning",
        }}
        onCancel={cancel}
        onProceed={proceed}
      />
    </section>
  );
};
