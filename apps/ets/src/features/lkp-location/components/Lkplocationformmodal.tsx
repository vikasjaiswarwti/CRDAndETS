// import React from 'react';
// import { useUILibrary } from '../../../shared/lib/ui-lib/ui-library-context';
// import { AppForm } from '../../../shared/components/AppForm/AppForm';
// import type { FieldError } from '../../../shared/types/api-error.types';

// import { getLkpLocationFormFields } from '../constants/lkplocationformfields';
// import type { LkpLocation } from '../types/lkpLocation.types';

// // Import the shared lookups hook
// import { useLookups } from '../../../features/lookups/hooks/useLookups';   // or from shared if you put it there

// interface LkpLocationFormModalProps {
//   open: boolean;
//   onClose: () => void;
//   editingRecord: LkpLocation | null;
//   onSubmit: (values: Record<string, unknown>) => Promise<void>;
//   isSubmitting: boolean;
//   serverErrors?: FieldError[] | null;
// }

// const LkpLocationFormModal: React.FC<LkpLocationFormModalProps> = ({
//   open,
//   onClose,
//   editingRecord,
//   onSubmit,
//   isSubmitting,
//   serverErrors,
// }) => {
//   const { Modal } = useUILibrary();

//   // Get city zone options from shared lookups
//   const { cityZoneOptions, isLoading: isCityZoneLoading } = useLookups();

//   // Make fields dynamic
//   const fields = getLkpLocationFormFields(cityZoneOptions);

//   // console.log('editingRecord from update office', editingRecord);

//   // ── Initial values ────────────────────────────────────────────────────────
//   const initialValues = editingRecord
//     ? {
//       locCode: editingRecord.locCode ?? '',
//       cityZone: editingRecord.cityZone ?? '',        // must match value in options
//       locName: editingRecord.locName ?? '',
//       lat: editingRecord.lat ?? '',
//       lng: editingRecord.lng ?? '',
//       address: editingRecord.address ?? '',
//       city: editingRecord.city ?? '',
//       state: editingRecord.state ?? '',
//       dispName: editingRecord.dispName ?? '',
//       locGroup: editingRecord.locGroup ?? '',
//       helpDeskContactNumber: editingRecord.helpDeskContactNumber ?? '',
//       sosContactNumber: editingRecord.sosContactNumber ?? '',
//       driverAppIvrNumber: editingRecord.driverAppIVRNumber ?? '',
//       userAppIvrNumber: editingRecord.userAppIVRNumber ?? '',
//       active: editingRecord.active,
//       isAutoPenalty: editingRecord.isAutoPenalty,
//     }
//     : {
//       locCode: 1,
//       cityZone: '',
//       locName: '',
//       lat: '',
//       lng: '',
//       address: '',
//       city: '',
//       state: '',
//       dispName: '',
//       locGroup: '',
//       helpDeskContactNumber: '',
//       sosContactNumber: '',
//       driverAppIvrNumber: '',
//       userAppIvrNumber: '',
//       active: true,
//       isAutoPenalty: false,
//     };

//   return (
//     <Modal
//       open={open}
//       onCancel={onClose}
//       title={editingRecord ? 'Edit Office' : 'Add Office'}
//       width={760}
//       destroyOnClose
//       footer={null}
//       style={{ borderRadius: 16, top: 10 }}
//       styles={{
//         mask: {
//           backgroundColor: '#163E31E0',
//           backdropFilter: 'blur(2px)',
//         },
//       }}
//     >
//       <AppForm
//         fields={fields}
//         initialValues={initialValues}
//         onSubmit={onSubmit}
//         onCancel={onClose}
//         serverErrors={serverErrors}
//         isSubmitting={isSubmitting || isCityZoneLoading}
//         submitLabel={editingRecord ? 'Save Changes' : 'Create Location'}
//         showCancel
//         resetOnSuccess
//         // twoColumn={true}   // you can enable if AppForm supports it
//         columns={3}
//       />
//     </Modal>
//   );
// };

// export default LkpLocationFormModal;

// src/features/lkp-location/components/LkpLocationFormModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Add / Edit Office modal.
//
// Address flow (same PIN-first pattern as PublicEmployeeSignupForm):
//   1. User searches in the map search box OR drags/clicks the red pin
//   2. Google reverse-geocode fires → fills address, city, state, lat, lng
//   3. Those 5 fields are READ-ONLY — only the map can set them
//   4. lat / lng are also shown as read-only numeric displays (useful for debugging)
//
// Fields kept (everything an "office" actually needs):
//   locName, dispName, locGroup, cityZone
//   address, city, state, lat, lng          ← from Google map
//   helpDeskContactNumber, sosContactNumber
//   driverAppIvrNumber, userAppIvrNumber
//   active, isAutoPenalty
//
// Fields removed:
//   locCode  — server-assigned, never user-editable
// ─────────────────────────────────────────────────────────────────────────────
// src/features/lkp-location/components/LkpLocationFormModal.tsx

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useGoogleMap } from "../../../shared/hooks/useGoogleMap";
import type { AddressComponents } from "../../../shared/hooks/useGoogleMap";
// import { useLookups } from "../../lookups/hooks/useLookups";
import type { FieldError } from "../../../shared/types/api-error.types";
import type { LkpLocation } from "../types/lkpLocation.types";

// ── Types ──────────────────────────────────────────────────────────────────────

interface FormValues {
  locName: string;
  dispName: string;
  locGroup: string;
  cityZone: string | number | "";
  address: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  helpDeskContactNumber: string;
  sosContactNumber: string;
  driverAppIvrNumber: string;
  userAppIvrNumber: string;
  active: boolean;
  isAutoPenalty: boolean;
}

interface FormErrors {
  locName?: string;
  cityZone?: string;
  address?: string;
  helpDeskContactNumber?: string;
  sosContactNumber?: string;
  driverAppIvrNumber?: string;
  userAppIvrNumber?: string;
}

interface LkpLocationFormModalProps {
  open: boolean;
  onClose: () => void;
  editingRecord: LkpLocation | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const PHONE_REGEX = /^[\d\s\-()+]*$/;

const makeEmpty = (): FormValues => ({
  locName: "",
  dispName: "",
  locGroup: "",
  cityZone: "",
  address: "",
  city: "",
  state: "",
  lat: null,
  lng: null,
  helpDeskContactNumber: "",
  sosContactNumber: "",
  driverAppIvrNumber: "",
  userAppIvrNumber: "",
  active: true,
  isAutoPenalty: false,
});

const fromRecord = (r: LkpLocation): FormValues => ({
  locName: r.locName ?? "",
  dispName: r.dispName ?? "",
  locGroup: r.locGroup ?? "",
  cityZone: r.cityZone ?? "",
  address: r.address ?? "",
  city: r.city ?? "",
  state: r.state ?? "",
  lat: r.lat ? Number(r.lat) : null,
  lng: r.lng ? Number(r.lng) : null,
  helpDeskContactNumber: r.helpDeskContactNumber ?? "",
  sosContactNumber: r.sosContactNumber ?? "",
  driverAppIvrNumber: r.driverAppIVRNumber ?? "",
  userAppIvrNumber: r.userAppIVRNumber ?? "",
  active: r.active ?? true,
  isAutoPenalty: r.isAutoPenalty ?? false,
});

// ── Design tokens ──────────────────────────────────────────────────────────────

const C = {
  green: "#1B4332",
  greenMid: "#52796F",
  greenLight: "#B7E4C7",
  inputBg: "#F0FAF4",
  lockedBg: "#eef3f0",
  border: "#B7E4C7",
  borderFocus: "#4CAF82",
  error: "#e53e3e",
  label: "#52796F",
  sectionBorder: "#d0e8d8",
} as const;

// ── Style helpers ──────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: C.label,
  marginBottom: 3,
  display: "block",
};

const baseInput: React.CSSProperties = {
  width: "100%",
  height: 34,
  padding: "0 10px",
  fontSize: 12,
  borderRadius: 7,
  border: `1px solid ${C.border}`,
  background: C.inputBg,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
};

const lockedInput: React.CSSProperties = {
  ...baseInput,
  background: C.lockedBg,
  color: "#555",
  cursor: "not-allowed",
  border: `1px solid ${C.sectionBorder}`,
};

const sectionHead: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: C.green,
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  borderBottom: `2px solid ${C.greenLight}`,
  paddingBottom: 5,
  marginBottom: 10,
  marginTop: 14,
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const Field: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  locked?: boolean;
  hint?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ label, required, error, hint, style, children }) => (
  <div style={{ marginBottom: 10, ...style }}>
    <label style={labelStyle}>
      {label}
      {required && <span style={{ color: C.error, marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {hint && !error && (
      <div style={{ fontSize: 10, color: C.greenMid, marginTop: 2 }}>
        {hint}
      </div>
    )}
    {error && (
      <div style={{ fontSize: 10, color: C.error, marginTop: 2 }}>{error}</div>
    )}
  </div>
);

const TextInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  maxLength?: number;
  type?: string;
  error?: boolean;
  disabled?: boolean;
}> = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  maxLength,
  type = "text",
  error,
  disabled,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      disabled={disabled}
      readOnly={disabled}
      tabIndex={disabled ? -1 : undefined}
      value={value}
      onChange={(e) => !disabled && onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      maxLength={maxLength}
      style={
        disabled
          ? lockedInput
          : {
              ...baseInput,
              borderColor: error ? C.error : focused ? C.borderFocus : C.border,
              boxShadow: focused ? `0 0 0 3px ${C.borderFocus}22` : "none",
            }
      }
    />
  );
};

const ToggleRow: React.FC<{
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, checked, onChange }) => {
  const { Switch } = useUILibrary();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: C.inputBg,
        border: `1px solid ${C.border}`,
        borderRadius: 7,
        padding: "7px 12px",
        marginBottom: 6,
      }}
    >
      <span style={{ fontSize: 12, color: C.green, fontWeight: 500 }}>
        {label}
      </span>
      <Switch
        checked={checked}
        onChange={onChange}
        style={checked ? { background: C.green } : undefined}
      />
    </div>
  );
};

const CoordDisplay: React.FC<{ lat: number | null; lng: number | null }> = ({
  lat,
  lng,
}) => (
  <div
    style={{
      display: "flex",
      gap: 8,
      padding: "6px 10px",
      background: C.lockedBg,
      border: `1px solid ${C.sectionBorder}`,
      borderRadius: 7,
      fontSize: 11,
      color: "#444",
      fontFamily: "monospace",
    }}
  >
    <span style={{ color: C.greenMid, fontWeight: 600 }}>Lat:</span>
    <span>{lat?.toFixed(6) ?? "—"}</span>
    <span style={{ color: C.greenMid, fontWeight: 600, marginLeft: 8 }}>
      Lng:
    </span>
    <span>{lng?.toFixed(6) ?? "—"}</span>
    {!lat && !lng && (
      <span style={{ color: "#aaa", fontStyle: "italic" }}>
        Pick location on map
      </span>
    )}
  </div>
);

// ── Validation ─────────────────────────────────────────────────────────────────

function validate(f: FormValues): FormErrors {
  const e: FormErrors = {};
  if (!f.locName.trim()) e.locName = "Office name is required";
  else if (f.locName.trim().length > 120) e.locName = "Max 120 characters";
  // if (!f.cityZone && f.cityZone !== 0) e.cityZone = "City zone is required";
  if (!f.address.trim())
    e.address = "Pick a location on the map — address is required";

  const phoneFields = [
    ["helpDeskContactNumber", f.helpDeskContactNumber],
    ["sosContactNumber", f.sosContactNumber],
    ["driverAppIvrNumber", f.driverAppIvrNumber],
    ["userAppIvrNumber", f.userAppIvrNumber],
  ] as const;

  for (const [key, val] of phoneFields) {
    if (val && !PHONE_REGEX.test(val))
      (e as Record<string, string>)[key] = "Digits, spaces, - and () only";
    if (val && val.replace(/\D/g, "").length > 15)
      (e as Record<string, string>)[key] = "Too long (max 15 digits)";
  }
  return e;
}

const allowPhoneKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) return;
  if (!/[\d\s\-()+]/.test(e.key)) e.preventDefault();
};

// ── MapPanel — isolated so it can be keyed independently ──────────────────────
//
// FIX: By giving this component a `key` that changes every time the modal opens
// (we use a counter bumped in onClose/onOpen), React fully unmounts and remounts
// it. That means useGoogleMap()'s useEffect runs fresh each time — no stale
// initCalledRef, no orphaned map instances, no blank tiles.
//
// This is the cleanest fix because it matches how destroyOnClose works: the modal
// already destroys the DOM on close, so a fresh mount on open is consistent.

interface MapPanelProps {
  defaultLat: number;
  defaultLng: number;
  onAddressChange: (c: AddressComponents) => void;
  onMapLoaded: (controls: {
    moveMarker: (lat: number, lng: number) => void;
  }) => void;
  formLat: number | null;
  formLng: number | null;
  formAddress: string; // ADD THIS
  addressError?: string;
  isGeocoding: boolean; // passed up after mount
}

// We keep MapPanel as a named inner component so it can use the hook cleanly.
const MapPanel: React.FC<MapPanelProps> = ({
  defaultLat,
  defaultLng,
  onAddressChange,
  onMapLoaded,
  formLat,
  formLng,
  formAddress, // ADD THIS
  addressError,
}) => {
  const {
    mapRef,
    searchInputRef,
    isLoaded,
    isGeocoding,
    moveMarker,
    refreshMap,
  } = useGoogleMap({ onAddressChange, defaultLat, defaultLng });

  // Expose moveMarker & refreshMap to parent via callback once loaded
  const reportedRef = useRef(false);
  useEffect(() => {
    if (isLoaded && !reportedRef.current) {
      reportedRef.current = true;
      onMapLoaded({ moveMarker });
    }
  }, [isLoaded, moveMarker, onMapLoaded]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={sectionHead}>📍 Office Location</div>

      {/* Search box */}
      <div style={{ position: "relative", marginBottom: 8 }}>
        <label style={labelStyle}>
          Search Office here
          <span style={{ color: C.error, marginLeft: 2 }}>*</span>
        </label>
        <input
          ref={searchInputRef as React.RefObject<HTMLInputElement>}
          type="text"
          placeholder="🔍  Search office address…"
          style={{
            ...baseInput,
            background: C.inputBg,
            border: `1px solid ${C.border}`,
          }}
        />
        {isGeocoding && (
          <span
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 10,
              color: C.greenMid,
            }}
          >
            ⏳
          </span>
        )}
      </div>

      <div style={{ fontSize: 10, color: C.greenMid, marginBottom: 8 }}>
        Search, click on the map, or drag the 📍 pin — address auto-fills below.
      </div>

      {/* Map container */}
      <div
        style={{
          borderRadius: 10,
          overflow: "hidden",
          border: `1px solid ${C.border}`,
          //height: 278,
          minHeight: 270,
          flex: 1,
          background: "#e8f5e9",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div
          ref={mapRef as React.RefObject<HTMLDivElement>}
          style={{ width: "100%", height: "100%" }}
        />

        {!isLoaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#F0FAF4",
              color: C.greenMid,
              fontSize: 12,
              gap: 6,
              flexDirection: "column",
            }}
          >
            <span>🗺 Loading map…</span>
          </div>
        )}

        {/* ── FIX: Refresh button — always visible in bottom-right corner ───── */}
        <button
          type="button"
          onClick={refreshMap}
          title="Reload map"
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            zIndex: 3,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: `1px solid ${C.border}`,
            background: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 15,
            boxShadow: "0 1px 6px rgba(0,0,0,0.15)",
            padding: 0,
            lineHeight: 1,
          }}
        >
          🔄
        </button>
      </div>

      {/* Coordinates */}
      <div style={{ marginTop: 8 }}>
        <CoordDisplay lat={formLat} lng={formLng} />
      </div>

      <div style={sectionHead}>Review Address</div>
      {/* Auto-filled address fields */}
      <div style={{ marginTop: 10 }}>
        <Field label="Address" required locked={!!formLat} error={addressError}>
          <textarea
            readOnly
            tabIndex={-1}
            value={formAddress}
            placeholder="Auto-filled from map"
            rows={4}
            style={{
              ...lockedInput,
              height: "auto",
              minHeight: 52,
              padding: "6px 10px",
              resize: "none",
              lineHeight: 1.5,
              borderColor: addressError ? C.error : C.sectionBorder,
            }}
          />
        </Field>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const LkpLocationFormModal: React.FC<LkpLocationFormModalProps> = ({
  open,
  onClose,
  editingRecord,
  onSubmit,
  isSubmitting,
  serverErrors,
}) => {
  const { Modal, 
    // Select, 
    Button } = useUILibrary();
  // const { cityZoneOptions, isLoading: isCityZoneLoading } = useLookups();

  const [form, setForm] = useState<FormValues>(makeEmpty);
  const [errors, setErrors] = useState<FormErrors>({});

  // ── FIX: mapKey ensures MapPanel fully remounts on every modal open ────────
  // We bump this whenever open transitions false→true so the hook always starts
  // fresh — no stale initCalledRef from a previous open/close cycle.
  const [mapKey, setMapKey] = useState(0);
  const prevOpen = useRef(false);
  useEffect(() => {
    if (open && !prevOpen.current) {
      setMapKey((k) => k + 1);
    }
    prevOpen.current = open;
  }, [open]);

  // Seed form on open
  useEffect(() => {
    if (!open) return;
    setForm(editingRecord ? fromRecord(editingRecord) : makeEmpty());
    setErrors({});
  }, [open, editingRecord]);

  const set = useCallback(
    <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const n = { ...prev };
        delete (n as Record<string, string>)[key];
        return n;
      });
    },
    [],
  );

  const handleAddressChange = useCallback((components: AddressComponents) => {
    setForm((prev) => ({
      ...prev,
      address: components.fullAddress,
      city: components.city || prev.city,
      state: components.state || prev.state,
      lat: components.lat,
      lng: components.lng,
    }));
    setErrors((prev) => {
      const n = { ...prev };
      delete n.address;
      return n;
    });
  }, []);

  const defaultLat = editingRecord?.lat ? Number(editingRecord.lat) : 28.6139;
  const defaultLng = editingRecord?.lng ? Number(editingRecord.lng) : 77.209;

  // moveMarker ref — populated once MapPanel mounts and map loads
  const moveMarkerRef = useRef<((lat: number, lng: number) => void) | null>(
    null,
  );
  const handleMapLoaded = useCallback(
    ({ moveMarker }: { moveMarker: (lat: number, lng: number) => void }) => {
      moveMarkerRef.current = moveMarker;
      // If editing, fly to the record's location as soon as map is ready
      if (editingRecord?.lat && editingRecord?.lng) {
        moveMarker(Number(editingRecord.lat), Number(editingRecord.lng));
      }
    },
    [editingRecord],
  );

  const handleSubmit = async () => {
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload: Record<string, unknown> = {
      ...(editingRecord ? { locCode: editingRecord.locCode } : {}),
      locName: form.locName.trim(),
      dispName: form.dispName.trim() || form.locName.trim(),
      locGroup: null,
      cityZone: null,
      address: form.address,
      city: form.city,
      state: form.state,
      lat: form.lat,
      lng: form.lng,
      helpDeskContactNumber: form.helpDeskContactNumber.trim() || null,
      sosContactNumber: form.sosContactNumber.trim() || null,
      driverAppIVRNumber: form.driverAppIvrNumber.trim() || null,
      userAppIVRNumber: form.userAppIvrNumber.trim() || null,
      active: form.active,
      isAutoPenalty: form.isAutoPenalty,
    };

    await onSubmit(payload);
  };

  const isEdit = !!editingRecord;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.green }}>
            {isEdit ? "Edit Office" : "Add Office"}
          </div>
          <div
            style={{
              fontSize: 11,
              color: C.greenMid,
              fontWeight: 400,
              marginTop: 2,
            }}
          >
            {isEdit
              ? "Update office details and location."
              : "Fill in office details and pin the exact location on the map."}
          </div>
        </div>
      }
      width={820}
      destroyOnClose
      footer={null}
      style={{ borderRadius: 16, top: 20 }}
      styles={{
        mask: { background: "rgba(0,60,30,0.35)", backdropFilter: "blur(2px)" },
        header: { borderBottom: "none", paddingBottom: 0 },
        body: { paddingTop: 0 },
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "stretch",
        }}
      >
        {/* LEFT: form fields */}
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <div style={sectionHead}>Office Identity</div>

          <Field label="Office Name" required error={errors.locName}>
            <TextInput
              value={form.locName}
              onChange={(v) => set("locName", v)}
              placeholder="e.g. Western Union — Pune"
              maxLength={120}
              error={!!errors.locName}
            />
          </Field>

          <Field
            label="Display Office Name"
            hint="Short label shown in dropdowns (defaults to location name)"
          >
            <TextInput
              value={form.dispName}
              onChange={(v) => set("dispName", v)}
              placeholder="e.g. WU Pune"
              maxLength={80}
            />
          </Field>

          {/* <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 12px",
            }}
          >
            <Field label="City Zone" required error={errors.cityZone}>
              <Select
                value={form.cityZone || undefined}
                onChange={(v: string | number) => set("cityZone", v)}
                options={cityZoneOptions}
                loading={isCityZoneLoading}
                placeholder="Select zone"
                showSearch
                allowClear
                style={{ width: "100%" }}
              />
            </Field>

            <Field label="Office Group" hint="Optional grouping tag">
              <TextInput
                value={form.locGroup}
                onChange={(v) => set("locGroup", v)}
                placeholder="e.g. North Cluster"
                maxLength={60}
              />
            </Field>
          </div> */}

          <div style={sectionHead}>Contact Numbers</div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 12px",
            }}
          >
            <Field label="Help Desk" error={errors.helpDeskContactNumber}>
              <TextInput
                value={form.helpDeskContactNumber}
                onChange={(v) => set("helpDeskContactNumber", v)}
                onKeyDown={allowPhoneKey}
                placeholder="011 23456789"
                maxLength={20}
                error={!!errors.helpDeskContactNumber}
              />
            </Field>

            <Field label="SOS Contact" error={errors.sosContactNumber}>
              <TextInput
                value={form.sosContactNumber}
                onChange={(v) => set("sosContactNumber", v)}
                onKeyDown={allowPhoneKey}
                placeholder="9876543210"
                maxLength={20}
                error={!!errors.sosContactNumber}
              />
            </Field>

            <Field label="Driver App IVR" error={errors.driverAppIvrNumber}>
              <TextInput
                value={form.driverAppIvrNumber}
                onChange={(v) => set("driverAppIvrNumber", v)}
                onKeyDown={allowPhoneKey}
                placeholder="IVR number"
                maxLength={20}
                error={!!errors.driverAppIvrNumber}
              />
            </Field>

            <Field label="User App IVR" error={errors.userAppIvrNumber}>
              <TextInput
                value={form.userAppIvrNumber}
                onChange={(v) => set("userAppIvrNumber", v)}
                onKeyDown={allowPhoneKey}
                placeholder="IVR number"
                maxLength={20}
                error={!!errors.userAppIvrNumber}
              />
            </Field>
          </div>

          <div style={sectionHead}>Settings</div>
          <ToggleRow
            label="Active"
            checked={form.active}
            onChange={(v) => set("active", v)}
          />
          <ToggleRow
            label="Auto Penalty"
            checked={form.isAutoPenalty}
            onChange={(v) => set("isAutoPenalty", v)}
          />
        </div>

        {/* RIGHT: map panel
            FIX: key={mapKey} guarantees full remount on every open, so
            useGoogleMap's useEffect always starts from a clean slate.        */}
        <MapPanel
          key={mapKey}
          defaultLat={defaultLat}
          defaultLng={defaultLng}
          onAddressChange={handleAddressChange}
          onMapLoaded={handleMapLoaded}
          formLat={form.lat}
          formLng={form.lng}
          formAddress={form.address}
          addressError={errors.address}
          isGeocoding={false}
        />
      </div>

      {/* Server errors */}
      {serverErrors && serverErrors.length > 0 && (
        <div
          style={{
            background: "#fff5f5",
            border: "1px solid #fc8181",
            borderRadius: 8,
            padding: "8px 14px",
            marginTop: 10,
          }}
        >
          {serverErrors.map((e, i) => (
            <div key={i} style={{ color: "#c53030", fontSize: 11 }}>
              • {e.message}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          marginTop: 16,
        }}
      >
        <Button
          onClick={onClose}
          style={{
            borderRadius: 50,
            borderColor: C.green,
            color: C.green,
            fontWeight: 500,
          }}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          loading={isSubmitting}
          onClick={handleSubmit}
          style={{
            borderRadius: 50,
            background: C.green,
            borderColor: C.green,
            fontWeight: 600,
            paddingInline: 28,
          }}
        >
          {isEdit ? "Save Changes" : "Create Office"}
        </Button>
      </div>
    </Modal>
  );
};

export default LkpLocationFormModal;
