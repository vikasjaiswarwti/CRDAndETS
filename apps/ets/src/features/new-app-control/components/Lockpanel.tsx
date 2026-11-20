// ============================================================
// LockPanel.tsx — Configuration panel for lock-type rules
//
// TAB SWITCHING (Cal Days / Day+Time / Weekly / Minutes):
//   → Pure UI optimistic update first (tab highlights immediately)
//   → Opens batch ConfirmationModal with clear human message:
//       "Calendar Days configuration will now apply to this corporate"
//   → On Proceed: API called in parallel (Promise.allSettled) for
//     modeKey + sub-fields
//   → On Cancel: tab reverts to old value instantly
//
// CONFIGURATION FIELDS (Edit groups):
//   → Mode 1 (Cal Days) and Mode 4 (Minutes) each have ONE edit group.
//   → Mode 2 (Day+Time) and Mode 3 (Weekly) EACH split into TWO independent
//     edit groups — Pickup and Drop — with their own "Edit" button and
//     their own "Save". Editing/saving Pickup never touches Drop, and
//     vice versa.
//   → Read-only by default, all fields shown as styled value chips.
//   → "Edit" opens an inline edit panel for that one group only.
//   → User fills inputs / selects day / picks time inside the panel.
//   → "Save" → builds ONE BATCH payload containing:
//        the current lock-type mode key (unchanged value) +
//        every field that changed within that specific group
//     → opens the same batch ConfirmationModal used for tab switches
//     → on Proceed, all fields in the group are sent together via
//       Promise.allSettled (parallel single network round-trip set,
//       not N sequential single-field calls).
//   → "Cancel" → discards draft, back to read-only, nothing reverted
//     (nothing was sent yet)
//   → On batch Cancel (from the modal) → draft + UI revert to the
//     pre-edit snapshot since nothing has been confirmed yet.
//   → FieldSaveIndicator (spinner → green tick / red cross) shown per
//     field — all fields in the group animate together since they're
//     fired in parallel.
//
// USER / SPOC toggle: pure UI, no API, no modal. Resets edit state.
//
// IMPORTANT — `who` is LIFTED to the parent (OfficeConfigurationCard),
// keyed by ltKey, and passed in as a prop along with onWhoChange. It is
// deliberately NOT local useState in this component. Reason: this panel
// can remount when the parent briefly toggles `isLoading` true during a
// background refetch (e.g. right after a successful save invalidates the
// query). A local useState would reset to "User" on every such remount,
// silently flipping the admin back to Employee view after they'd switched
// to Spoc and saved. Lifting `who` to the same tier as `form` keeps it in
// sync with whatever the admin is actually editing, exactly like `form`
// itself already survives those remounts.
//
// FIELD KEY MAP (who = "User" | "Spoc", fp = section prefix):
//   Mode 1 → {fp}LockDays{who}
//   Mode 2 → {fp}PickupDay{who}      {fp}PickupDayTime{who}
//             {fp}DropDay{who}        {fp}DropDayTime{who}
//   Mode 3 → {fp}PickupWeek{who}     {fp}PickupWeekTime{who}
//             {fp}DropWeek{who}       {fp}DropWeekTime{who}
//   Mode 4 → {fp}PickupMinute{who}   {fp}DropMinute{who}
//
// IMPORTANT: Every group save also includes the lock-type mode key
// (e.g. schUpdateLockTypeForUser) in the SAME batch call alongside the
// day/time fields, even though its value is unchanged — this mirrors
// the tab-switch payload shape and is what the backend expects to see
// together in one request (e.g. schUpdateLockTypeForUser: 2,
// schPickupDayUser: 1, schPickupDayTimeUser: "21:03").
// ============================================================

import React, { useRef, useState } from "react";
import { LockTypeTabs } from "./Locktypetabs";
import { RuleTypeToggle } from "./Ruletypetoggle";
import { FieldWrapper } from "./Fieldwrapper";
import { NumberField } from "./Formfields";
import { WEEK_DAY_OPTIONS } from "../constants/Rostertat.constants";
import { LOCK_MODE_LABEL } from "./Configimpactmessages";
import type { FieldSaveState } from "./Fieldsaveindicator";
import { Edit2, Check, X as XIcon } from "lucide-react";
import { FieldHelpPopover } from "./Fieldhelppopover";

// ── Design tokens ─────────────────────────────────────────────────────────────
const TEXT_LABEL = "#374151";
const TEXT_MUTED = "#6B7280";
const DIVIDER = "#F3F4F6";
const PRIMARY = "#2563EB";
const BORDER = "#E5E7EB";
const BG_READONLY = "#FAFAFA";

const SELECT_SX: React.CSSProperties = { width: "100%", fontSize: 14 };
const INPUT_SX: React.CSSProperties = {
  width: "100%",
  height: 36,
  fontSize: 14,
  background: "#fff",
  borderRadius: 8,
};

// ── Layout helpers ────────────────────────────────────────────────────────────

const SubLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: 13,
      fontWeight: 600,
      color: TEXT_LABEL,
      marginBottom: 12,
    }}
  >
    {children}
  </div>
);

const G2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
    {children}
  </div>
);

// ── ReadonlyValue ─────────────────────────────────────────────────────────────
// Displays a field's current saved value as a styled chip.
// Shows inline save indicator (Saving… / ✓ Saved / ✕ Failed) on the right.

const ReadonlyValue: React.FC<{
  label: string;
  value: string;
  saveState: FieldSaveState;
  full?: boolean;
  fieldKey?: string;
}> = ({ label, value, saveState, full, fieldKey }) => (
  <div style={{ gridColumn: full ? "span 2" : undefined }}>
    <div
      style={{
        fontSize: 12,
        fontWeight: 500,
        color: TEXT_MUTED,
        marginBottom: 5,
        letterSpacing: "0.01em",
      }}
    >
      {label} {fieldKey && <FieldHelpPopover fieldKey={fieldKey} />}{" "}
      {/* ← add */}
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "7px 10px",
        borderRadius: 7,
        border: `1px solid ${BORDER}`,
        background: BG_READONLY,
        minHeight: 36,
      }}
    >
      <span style={{ fontSize: 13, color: TEXT_LABEL, fontWeight: 500 }}>
        {value || "—"}
      </span>
      {saveState === "saving" && (
        <span style={{ fontSize: 11, color: PRIMARY, marginLeft: 6 }}>
          Saving…
        </span>
      )}
      {saveState === "success" && (
        <span style={{ fontSize: 11, color: "#16A34A", marginLeft: 6 }}>
          ✓ Saved
        </span>
      )}
      {saveState === "error" && (
        <span style={{ fontSize: 11, color: "#DC2626", marginLeft: 6 }}>
          ✕ Failed
        </span>
      )}
    </div>
  </div>
);

// ── EditGroupHeader ───────────────────────────────────────────────────────────
// Shows "Configuration" label + single Edit button on the right.
// One button controls the whole group — not individual fields.

const EditGroupHeader: React.FC<{
  onEdit: () => void;
}> = ({ onEdit }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    }}
  >
    <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_LABEL }}>
      Configuration
    </div>
    <button
      onClick={onEdit}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        height: 30,
        padding: "0 12px",
        border: `1px solid ${BORDER}`,
        borderRadius: 6,
        background: "#fff",
        fontSize: 12,
        fontWeight: 600,
        color: PRIMARY,
        cursor: "pointer",
      }}
    >
      <Edit2 size={11} />
      Edit
    </button>
  </div>
);

// ── EditActions ───────────────────────────────────────────────────────────────
// Save + Cancel buttons shown inside the edit panel header row.

const EditActions: React.FC<{
  onSave: () => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => (
  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
    <button
      onClick={onCancel}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        height: 30,
        padding: "0 10px",
        borderRadius: 6,
        border: `1px solid ${BORDER}`,
        background: "#fff",
        fontSize: 12,
        fontWeight: 500,
        color: TEXT_MUTED,
        cursor: "pointer",
      }}
    >
      <XIcon size={11} /> Cancel
    </button>
    <button
      onClick={onSave}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        height: 30,
        padding: "0 12px",
        borderRadius: 6,
        border: "none",
        background: PRIMARY,
        fontSize: 12,
        fontWeight: 600,
        color: "#fff",
        cursor: "pointer",
      }}
    >
      <Check size={11} /> Save
    </button>
  </div>
);

// ── Props ─────────────────────────────────────────────────────────────────────

interface MultiFieldSave {
  title: string;
  description: string;
  fields: Array<{ key: string; value: unknown }>;
}

export interface LockPanelProps {
  ltKey: string;
  fp: string;
  form: Record<string, unknown>;
  /** Currently selected rule type for this panel. Lifted to the parent
   *  (keyed by ltKey) so it survives this component unmounting/remounting
   *  — e.g. when a background refetch briefly flips `isLoading` true after
   *  a successful save. Local useState here would reset to "User" on every
   *  remount, which is the bug this prop fixes. */
  who: "User" | "Spoc";
  onWhoChange: (ltKey: string, who: "User" | "Spoc") => void;
  onFieldChange?: (fieldKey: string, newValue: unknown) => void;
  onMultiFieldSave: (payload: MultiFieldSave, onRevert: () => void) => void;
  onLocalChange: (updates: Record<string, unknown>) => void;
  fieldSaveStates: Record<string, FieldSaveState>;
  Input: React.ComponentType<Record<string, unknown>>;
  Select: React.ComponentType<Record<string, unknown>>;
}

// ── buildModeSwitchPayload ────────────────────────────────────────────────────
// Builds the batch payload for a lock-type tab switch.
// Always includes modeKey + all sub-fields for the new mode at their defaults.
// The description clearly tells the admin what will now apply to this corporate.

function buildModeSwitchPayload(
  modeKey: string,
  newMode: number,
  fp: string,
  who: string,
  oldMode: number,
): MultiFieldSave {
  const fk = (field: string) => `${fp}${field}${who}`;
  const fromLabel = LOCK_MODE_LABEL[oldMode] ?? `Mode ${oldMode}`;
  const toLabel = LOCK_MODE_LABEL[newMode] ?? `Mode ${newMode}`;

  // Sub-field defaults per mode
  const subFields: Record<number, Array<{ key: string; value: unknown }>> = {
    1: [{ key: fk("LockDays"), value: 0 }],
    2: [
      { key: fk("PickupDay"), value: 1 },
      { key: fk("PickupDayTime"), value: "18:00" },
      { key: fk("DropDay"), value: 1 },
      { key: fk("DropDayTime"), value: "18:00" },
    ],
    3: [
      { key: fk("PickupWeek"), value: 1 },
      { key: fk("PickupWeekTime"), value: "18:00" },
      { key: fk("DropWeek"), value: 1 },
      { key: fk("DropWeekTime"), value: "18:00" },
    ],
    4: [
      { key: fk("PickupMinute"), value: 120 },
      { key: fk("DropMinute"), value: 120 },
    ],
  };

  return {
    title: `Switch to ${toLabel}`,
    description:
      `You are switching from "${fromLabel}" to "${toLabel}". ` +
      `The ${toLabel} lock configuration will now apply for ${who} scheduling. ` +
      `All sub-fields will reset to defaults. ` +
      `.. Please complete any edits in the current tab before switching — ` +
      `unsaved field edits will be discarded and defaults will be saved instead.`,
    fields: [{ key: modeKey, value: newMode }, ...(subFields[newMode] ?? [])],
  };
}

// ── buildGroupSavePayload ──────────────────────────────────────────────────────
// Builds the batch payload for an in-place edit-group "Save" action
// (Pickup, Drop, Weekly, Cal Days, Minutes). Unlike buildModeSwitchPayload,
// this does NOT change the mode — it always re-sends the CURRENT mode value
// together with whichever sub-fields actually changed in that group, so the
// backend receives the lock-type key + the day/time fields in one request,
// exactly like:
//   schUpdateLockTypeForUser: 2, schPickupDayUser: 1, schPickupDayTimeUser: "21:03"
//
// `changedFields` should only contain fields whose value actually differs
// from the confirmed form value — but the modeKey is always included
// regardless, since the backend expects it alongside the sub-fields.

function buildGroupSavePayload(
  group:
    | "caldays"
    | "pickup"
    | "drop"
    | "weeklyPickup"
    | "weeklyDrop"
    | "minutes",
  modeKey: string,
  mode: number,
  who: "User" | "Spoc",
  changedFields: Array<{ key: string; value: unknown }>,
): MultiFieldSave {
  const modeLabel = LOCK_MODE_LABEL[mode] ?? `Mode ${mode}`;

  const GROUP_META: Record<
    typeof group,
    { title: string; description: string }
  > = {
    caldays: {
      title: "Update Lock Days",
      description: `The ${modeLabel} lock configuration will be updated for ${who} scheduling. The new lock window will apply to all future roster changes.`,
    },
    pickup: {
      title: "Update Pickup Configuration",
      description: `The pickup cutoff day and time will be updated together for ${who} scheduling under the ${modeLabel} configuration. This applies to all future pickup cutoffs.`,
    },
    drop: {
      title: "Update Drop Configuration",
      description: `The drop cutoff day and time will be updated together for ${who} scheduling under the ${modeLabel} configuration. This applies to all future drop cutoffs.`,
    },
    weeklyPickup: {
      title: "Update Weekly Pickup Configuration",
      description: `The weekly pickup cutoff day and time will be updated together for ${who} scheduling under the ${modeLabel} configuration. This applies to all future weekly pickup cutoffs.`,
    },
    weeklyDrop: {
      title: "Update Weekly Drop Configuration",
      description: `The weekly drop cutoff day and time will be updated together for ${who} scheduling under the ${modeLabel} configuration. This applies to all future weekly drop cutoffs.`,
    },
    minutes: {
      title: "Update Minutes-Before Configuration",
      description: `The pickup and drop lead times (in minutes) will be updated together for ${who} scheduling under the ${modeLabel} configuration.`,
    },
  };

  const meta = GROUP_META[group];

  return {
    title: meta.title,
    description: meta.description,
    // Mode key always travels with the group's changed fields in one batch,
    // even though its value is unchanged here (no mode switch happening).
    fields: [{ key: modeKey, value: mode }, ...changedFields],
  };
}

// ── LockPanel ─────────────────────────────────────────────────────────────────

export const LockPanel: React.FC<LockPanelProps> = ({
  ltKey,
  fp,
  form,
  who,
  onWhoChange,
  // onFieldChange,
  onMultiFieldSave,
  onLocalChange,
  fieldSaveStates,
  Input,
  Select,
}) => {
  // editingGroup: which mode's edit panel is open. null = all read-only.
  const [editingGroup, setEditingGroup] = useState<
    | "caldays"
    | "pickup"
    | "drop"
    | "weeklyPickup"
    | "weeklyDrop"
    | "minutes"
    | null
  >(null);

  // draft: local values being edited before the user hits Save
  const [draft, setDraft] = useState<Record<string, unknown>>({});

  // Snapshot of the form values for the group at the moment editing started.
  // Used to revert local UI state if the batch confirmation modal is cancelled
  // (nothing has been sent to the backend yet, so we just discard the draft
  // and make sure any optimistic local state matches the pre-edit values).
  const preEditSnapshot = useRef<Record<string, unknown>>({});

  // Derived values
  const modeKey = `${ltKey}${who}`;
  const mode = (form[modeKey] as number) || 1;

  // Field key builder: prefix + field name + who suffix
  const fk = (field: string) => `${fp}${field}${who}`;

  // Current saved value from form
  const v = (field: string) => form[fk(field)];

  // Save state for a field (drives spinner / green tick / red cross)
  const ss = (field: string): FieldSaveState =>
    fieldSaveStates[fk(field)] ?? "idle";

  // ── Display helpers ───────────────────────────────────────────────────────
  const dayLabel = (val: unknown): string =>
    WEEK_DAY_OPTIONS.find((o) => o.value === val)?.label ?? "—";

  const timeLabel = (val: unknown): string => (val ? String(val) : "—");

  // ── Tab switch ────────────────────────────────────────────────────────────
  // 1. Optimistically update tab UI immediately so user sees the new tab lit
  // 2. Close any open edit panel so stale draft doesn't persist
  // 3. Open batch confirmation modal with clear message about what changes
  // 4. On Cancel → revert tab back to old mode

  const handleModeChange = (newMode: number) => {
    if (newMode === mode) return;

    const oldMode = mode;

    // Close any open edit panel
    setEditingGroup(null);
    setDraft({});

    // Optimistic: show new tab highlighted immediately
    onLocalChange({ [modeKey]: newMode });

    // Open batch modal
    onMultiFieldSave(
      buildModeSwitchPayload(modeKey, newMode, fp, who, oldMode),
      () => {
        // Revert: restore old tab if user cancels
        onLocalChange({ [modeKey]: oldMode });
      },
    );
  };

  // ── Who toggle ────────────────────────────────────────────────────────────
  // Pure UI — just switches whose config is displayed. Resets edit state.
  const handleWhoChange = (w: "User" | "Spoc") => {
    onWhoChange(ltKey, w);
    setEditingGroup(null);
    setDraft({});
  };

  // ── Edit group helpers ────────────────────────────────────────────────────

  // Open edit panel with initial draft values seeded from current form state
  const startEdit = (
    group:
      | "caldays"
      | "pickup"
      | "drop"
      | "weeklyPickup"
      | "weeklyDrop"
      | "minutes",
    initial: Record<string, unknown>,
  ) => {
    setEditingGroup(group);
    setDraft(initial);
    preEditSnapshot.current = initial;
  };

  // Discard draft and go back to read-only
  const cancelEdit = () => {
    setEditingGroup(null);
    setDraft({});
    preEditSnapshot.current = {};
  };

  // Update a single draft field locally (no API, no modal)
  const setDraftField = (key: string, val: unknown) =>
    setDraft((d) => ({ ...d, [key]: val }));

  // ── Save (group-aware, batched) ───────────────────────────────────────────
  // Instead of firing onFieldChange per field (which opens N sequential
  // single-field modals/API calls), this builds ONE batch payload for the
  // whole group — the current mode key + every field that actually changed —
  // and routes it through onMultiFieldSave, which fires all of them together
  // via Promise.allSettled in OfficeConfigurationCard.
  //
  // If nothing in the group changed, just close the panel — no modal, no API.
  const saveDraft = () => {
    if (!editingGroup) return;

    const changed = Object.entries(draft).filter(([k, val]) => form[k] !== val);

    if (changed.length === 0) {
      cancelEdit();
      return;
    }

    const group = editingGroup;
    const snapshot = preEditSnapshot.current;

    const payload = buildGroupSavePayload(
      group,
      modeKey,
      mode,
      who,
      changed.map(([key, value]) => ({ key, value })),
    );

    // Close the edit panel immediately — the batch modal takes over from here.
    setEditingGroup(null);
    setDraft({});

    onMultiFieldSave(payload, () => {
      // On Cancel from the batch modal: nothing was sent to the backend,
      // so just make sure any optimistic local UI reflects the pre-edit
      // snapshot (covers the case where some other local-only state may
      // have been touched). Form values for these fields were never
      // mutated outside the draft, so this is effectively a no-op safety
      // net, but kept symmetric with the tab-switch revert behaviour.
      onLocalChange(snapshot);
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* ── User / Spoc toggle ─────────────────────────────────────────────── */}
      <SubLabel>
        <span>Rule Type</span>
        <RuleTypeToggle value={who} onChange={handleWhoChange} />
      </SubLabel>

      {/* ── Lock type tabs ──────────────────────────────────────────────────── */}
      {/* Clicking a different tab opens the batch confirmation modal */}
      <LockTypeTabs value={mode} onChange={handleModeChange} />

      <div style={{ height: 1, background: DIVIDER, margin: "20px 0" }} />

      {/* ════════════════════════════════════════════════════════════════════
          MODE 1 — Calendar Days
          Single field: LockDays (number of days before shift)
      ════════════════════════════════════════════════════════════════════ */}
      {mode === 1 && (
        <div>
          {editingGroup === "caldays" ? (
            /* ── Edit panel ─────────────────────────────────── */
            <>
              <SubLabel>
                <span>Configuration</span>
                <EditActions onSave={saveDraft} onCancel={cancelEdit} />
              </SubLabel>
              <FieldWrapper
                label="Lock Days"
                saveState={ss("LockDays")}
                full
                fieldKey={fk("LockDays")}
              >
                <NumberField
                  value={
                    (draft[fk("LockDays")] as number) ??
                    (v("LockDays") as number) ??
                    0
                  }
                  onConfirmedChange={(val) =>
                    setDraftField(fk("LockDays"), val)
                  }
                  Input={Input}
                />
              </FieldWrapper>
            </>
          ) : (
            /* ── Read-only view ──────────────────────────────── */
            <>
              <EditGroupHeader
                onEdit={() =>
                  startEdit("caldays", {
                    [fk("LockDays")]: v("LockDays") ?? 0,
                  })
                }
              />
              <G2>
                <ReadonlyValue
                  label="Lock Days"
                  value={String(v("LockDays") ?? 0)}
                  saveState={ss("LockDays")}
                  full
                  fieldKey={fk("LockDays")}
                />
              </G2>
            </>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODE 2 — Day + Time
          Fields: PickupDay (number), PickupDayTime (time input)
                  DropDay   (number), DropDayTime   (time input)
          Two separate edit groups — Pickup and Drop — each with own Edit btn.
          Each group's Save fires ONE batch call: modeKey + that group's
          day + time fields together (Promise.allSettled, parallel).
      ════════════════════════════════════════════════════════════════════ */}
      {mode === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* ── PICKUP group ─────────────────────────────────────────────── */}
          <div>
            {editingGroup === "pickup" ? (
              <>
                <SubLabel>
                  <span>Pickup Configuration</span>
                  <EditActions onSave={saveDraft} onCancel={cancelEdit} />
                </SubLabel>
                <G2>
                  <FieldWrapper
                    label="Pickup Day Count"
                    saveState={ss("PickupDay")}
                    fieldKey={fk("PickupDay")}
                  >
                    <NumberField
                      value={
                        (draft[fk("PickupDay")] as number) ??
                        (v("PickupDay") as number) ??
                        0
                      }
                      onConfirmedChange={(val) =>
                        setDraftField(fk("PickupDay"), val)
                      }
                      Input={Input}
                    />
                  </FieldWrapper>
                  <FieldWrapper
                    label="Pickup Time"
                    saveState={ss("PickupDayTime")}
                    fieldKey={fk("PickupDayTime")}
                  >
                    <Input
                      type="time"
                      value={
                        (draft[fk("PickupDayTime")] ??
                          v("PickupDayTime") ??
                          "18:00") as string
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftField(fk("PickupDayTime"), e.target.value)
                      }
                      style={INPUT_SX}
                    />
                  </FieldWrapper>
                </G2>
              </>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{ fontSize: 13, fontWeight: 600, color: TEXT_LABEL }}
                  >
                    Login Configuration.
                  </div>
                  <button
                    onClick={() =>
                      startEdit("pickup", {
                        [fk("PickupDay")]: v("PickupDay") ?? 0,
                        [fk("PickupDayTime")]: v("PickupDayTime") ?? "18:00",
                      })
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      height: 30,
                      padding: "0 12px",
                      border: `1px solid ${BORDER}`,
                      borderRadius: 6,
                      background: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                      color: PRIMARY,
                      cursor: "pointer",
                    }}
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                </div>
                <G2>
                  <ReadonlyValue
                    label="Login Day Count"
                    value={String(v("PickupDay") ?? 0)}
                    saveState={ss("PickupDay")}
                    fieldKey={fk("PickupDay")}
                  />
                  <ReadonlyValue
                    label="Login Time"
                    value={timeLabel(v("PickupDayTime"))}
                    saveState={ss("PickupDayTime")}
                    fieldKey={fk("PickupDayTime")}
                  />
                </G2>
              </>
            )}
          </div>

          {/* ── Divider between groups ────────────────────────────────────── */}
          <div style={{ height: 1, background: DIVIDER }} />

          {/* ── DROP group ───────────────────────────────────────────────── */}
          <div>
            {editingGroup === "drop" ? (
              <>
                <SubLabel>
                  <span>Logout Configuration</span>
                  <EditActions onSave={saveDraft} onCancel={cancelEdit} />
                </SubLabel>
                <G2>
                  <FieldWrapper
                    label="Logout Day Count"
                    saveState={ss("DropDay")}
                    fieldKey={fk("DropDay")}
                  >
                    <NumberField
                      value={
                        (draft[fk("DropDay")] as number) ??
                        (v("DropDay") as number) ??
                        0
                      }
                      onConfirmedChange={(val) =>
                        setDraftField(fk("DropDay"), val)
                      }
                      Input={Input}
                    />
                  </FieldWrapper>
                  <FieldWrapper
                    label="Logout Time"
                    saveState={ss("DropDayTime")}
                    fieldKey={fk("DropDayTime")}
                  >
                    <Input
                      type="time"
                      value={
                        (draft[fk("DropDayTime")] ??
                          v("DropDayTime") ??
                          "18:00") as string
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftField(fk("DropDayTime"), e.target.value)
                      }
                      style={INPUT_SX}
                    />
                  </FieldWrapper>
                </G2>
              </>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{ fontSize: 13, fontWeight: 600, color: TEXT_LABEL }}
                  >
                    Logout Configuration .
                  </div>
                  <button
                    onClick={() =>
                      startEdit("drop", {
                        [fk("DropDay")]: v("DropDay") ?? 0,
                        [fk("DropDayTime")]: v("DropDayTime") ?? "18:00",
                      })
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      height: 30,
                      padding: "0 12px",
                      border: `1px solid ${BORDER}`,
                      borderRadius: 6,
                      background: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                      color: PRIMARY,
                      cursor: "pointer",
                    }}
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                </div>
                <G2>
                  <ReadonlyValue
                    label="Logout Day Count"
                    value={String(v("DropDay") ?? 0)}
                    saveState={ss("DropDay")}
                    fieldKey={fk("DropDay")}
                  />
                  <ReadonlyValue
                    label="Logout Time"
                    value={timeLabel(v("DropDayTime"))}
                    saveState={ss("DropDayTime")}
                    fieldKey={fk("DropDay")}
                  />
                </G2>
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODE 3 — Weekly
          Fields: PickupWeek (day dropdown), PickupWeekTime (time input)
                  DropWeek   (day dropdown), DropWeekTime   (time input)
          Two separate edit groups — Weekly Pickup and Weekly Drop — each
          with its own Edit button, same as Mode 2 (Day + Time).
          Each group's Save fires ONE batch call: modeKey + that group's
          day + time fields together (Promise.allSettled, parallel).
      ════════════════════════════════════════════════════════════════════ */}
      {mode === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* ── WEEKLY PICKUP group ──────────────────────────────────────── */}
          <div>
            {editingGroup === "weeklyPickup" ? (
              <>
                <SubLabel>
                  <span>Login Configuration</span>
                  <EditActions onSave={saveDraft} onCancel={cancelEdit} />
                </SubLabel>
                <G2>
                  {/* Pickup Week Day — dropdown */}
                  <FieldWrapper
                    label="Login Day"
                    saveState={ss("PickupWeek")}
                    fieldKey={fk("PickupWeek")}
                  >
                    <Select
                      value={draft[fk("PickupWeek")] ?? v("PickupWeek") ?? 1}
                      onChange={(val: unknown) =>
                        setDraftField(fk("PickupWeek"), val)
                      }
                      options={WEEK_DAY_OPTIONS}
                      style={SELECT_SX}
                    />
                  </FieldWrapper>

                  {/* Pickup Week Time — time input */}
                  <FieldWrapper
                    label="Login Time"
                    saveState={ss("PickupWeekTime")}
                    fieldKey={fk("PickupWeekTime")}
                  >
                    <Input
                      type="time"
                      value={
                        (draft[fk("PickupWeekTime")] ??
                          v("PickupWeekTime") ??
                          "18:00") as string
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftField(fk("PickupWeekTime"), e.target.value)
                      }
                      style={INPUT_SX}
                    />
                  </FieldWrapper>
                </G2>
              </>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{ fontSize: 13, fontWeight: 600, color: TEXT_LABEL }}
                  >
                    Login Configuration
                  </div>
                  <button
                    onClick={() =>
                      startEdit("weeklyPickup", {
                        [fk("PickupWeek")]: v("PickupWeek") ?? 1,
                        [fk("PickupWeekTime")]: v("PickupWeekTime") ?? "18:00",
                      })
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      height: 30,
                      padding: "0 12px",
                      border: `1px solid ${BORDER}`,
                      borderRadius: 6,
                      background: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                      color: PRIMARY,
                      cursor: "pointer",
                    }}
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                </div>
                <G2>
                  <ReadonlyValue
                    label="Login Day"
                    value={dayLabel(v("PickupWeek") || 1)}
                    saveState={ss("PickupWeek")}
                    fieldKey={fk("PickupWeek")}
                  />
                  <ReadonlyValue
                    label="Login Time"
                    value={timeLabel(v("PickupWeekTime"))}
                    saveState={ss("PickupWeekTime")}
                    fieldKey={fk("PickupWeekTime")}
                  />
                </G2>
              </>
            )}
          </div>

          {/* ── Divider between groups ────────────────────────────────────── */}
          <div style={{ height: 1, background: DIVIDER }} />

          {/* ── WEEKLY DROP group ────────────────────────────────────────── */}
          <div>
            {editingGroup === "weeklyDrop" ? (
              <>
                <SubLabel>
                  <span>Logout Configuration</span>
                  <EditActions onSave={saveDraft} onCancel={cancelEdit} />
                </SubLabel>
                <G2>
                  {/* Drop Week Day — dropdown */}
                  <FieldWrapper
                    label="Logout Day"
                    saveState={ss("DropWeek")}
                    fieldKey={fk("DropWeek")}
                  >
                    <Select
                      value={draft[fk("DropWeek")] ?? v("DropWeek") ?? 1}
                      onChange={(val: unknown) =>
                        setDraftField(fk("DropWeek"), val)
                      }
                      options={WEEK_DAY_OPTIONS}
                      style={SELECT_SX}
                    />
                  </FieldWrapper>

                  {/* Drop Week Time — time input */}
                  <FieldWrapper
                    label="Logout Time"
                    saveState={ss("DropWeekTime")}
                    fieldKey={fk("DropWeekTime")}
                  >
                    <Input
                      type="time"
                      value={
                        (draft[fk("DropWeekTime")] ??
                          v("DropWeekTime") ??
                          "18:00") as string
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftField(fk("DropWeekTime"), e.target.value)
                      }
                      style={INPUT_SX}
                    />
                  </FieldWrapper>
                </G2>
              </>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{ fontSize: 13, fontWeight: 600, color: TEXT_LABEL }}
                  >
                    Logout Configuration
                  </div>
                  <button
                    onClick={() =>
                      startEdit("weeklyDrop", {
                        [fk("DropWeek")]: v("DropWeek") ?? 1,
                        [fk("DropWeekTime")]: v("DropWeekTime") ?? "18:00",
                      })
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      height: 30,
                      padding: "0 12px",
                      border: `1px solid ${BORDER}`,
                      borderRadius: 6,
                      background: "#fff",
                      fontSize: 12,
                      fontWeight: 600,
                      color: PRIMARY,
                      cursor: "pointer",
                    }}
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                </div>
                <G2>
                  <ReadonlyValue
                    label="Logout Day"
                    value={dayLabel(v("DropWeek") || 1)}
                    saveState={ss("DropWeek")}
                    fieldKey={fk("DropWeek")}
                  />
                  <ReadonlyValue
                    label="Logout Time"
                    value={timeLabel(v("DropWeekTime"))}
                    saveState={ss("DropWeekTime")}
                    fieldKey={fk("DropWeekTime")}
                  />
                </G2>
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODE 4 — Minutes Before Shift
          Fields: PickupMinute (number), DropMinute (number)
          Keys:   {fp}PickupMinute{who}, {fp}DropMinute{who}
          Single "minutes" edit group → Save fires ONE batch call:
          modeKey + PickupMinute + DropMinute together.
      ════════════════════════════════════════════════════════════════════ */}
      {mode === 4 && (
        <div>
          {editingGroup === "minutes" ? (
            /* ── Edit panel ─────────────────────────────────── */
            <>
              <SubLabel>
                <span>Configuration</span>
                <EditActions onSave={saveDraft} onCancel={cancelEdit} />
              </SubLabel>
              <G2>
                <FieldWrapper
                  label="Login Before (minutes)"
                  saveState={ss("PickupMinute")}
                  fieldKey={fk("PickupMinute")}
                >
                  <NumberField
                    value={
                      (draft[fk("PickupMinute")] as number) ??
                      (v("PickupMinute") as number) ??
                      120
                    }
                    onConfirmedChange={(val) =>
                      setDraftField(fk("PickupMinute"), val)
                    }
                    Input={Input}
                  />
                </FieldWrapper>
                <FieldWrapper
                  label="Logout Before (minutes)"
                  saveState={ss("DropMinute")}
                  fieldKey={fk("DropMinute")}
                >
                  <NumberField
                    value={
                      (draft[fk("DropMinute")] as number) ??
                      (v("DropMinute") as number) ??
                      120
                    }
                    onConfirmedChange={(val) =>
                      setDraftField(fk("DropMinute"), val)
                    }
                    Input={Input}
                  />
                </FieldWrapper>
              </G2>
            </>
          ) : (
            /* ── Read-only view ──────────────────────────────── */
            <>
              <EditGroupHeader
                onEdit={() =>
                  startEdit("minutes", {
                    [fk("PickupMinute")]: v("PickupMinute") ?? 120,
                    [fk("DropMinute")]: v("DropMinute") ?? 120,
                  })
                }
              />
              <G2>
                <ReadonlyValue
                  label="Login Before (minutes)"
                  value={String(v("PickupMinute") ?? 120)}
                  saveState={ss("PickupMinute")}
                  fieldKey={fk("PickupMinute")}
                />
                <ReadonlyValue
                  label="Logout Before (minutes)"
                  value={String(v("DropMinute") ?? 120)}
                  saveState={ss("DropMinute")}
                  fieldKey={fk("DropMinute")}
                />
              </G2>
            </>
          )}
        </div>
      )}
    </div>
  );
};
