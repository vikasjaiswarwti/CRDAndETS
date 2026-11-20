// AddressChangeModal.tsx
import React, { useState, useCallback, useEffect } from "react";
import { useUILibrary } from "../../../../shared/lib/ui-lib/ui-library-context";
import { useGoogleMap } from "../../../../shared/hooks/useGoogleMap";
import type { FieldError } from "../../../../shared/types/api-error.types";
import type { AddressComponents } from "../../../employee";
import {
  EnvironmentOutlined,
  SaveOutlined,
  ApartmentOutlined,
  HomeOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";


import AddressChangeBanner from "./AddressStatusBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddressFormState {
  state: string;
  city: string;
  pin: string;
  address: string;
  nodalPick: string;
  nodalDrop: string;
  geoPoint: string;
  effectiveDate: string;
  remarks: string;
  empLat: number | null;
  empLng: number | null;
}

/** Minimal slice of the employee profile needed by this modal */
export interface AddressModalProfile {
  address?: string | null;
  city?: string | null;
  stateName?: string | null;
  stateCode?: number | null;
  pin?: string | null;
  emp_Lat?: number | null;
  emp_Lng?: number | null;
  nodal_Pick?: string | null;
  nodal_Drop?: string | null;
  mobileNo?: string | null;
  emailId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  empId?: number | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: FieldError[] | null;
  nodalPickOptions?: { label: string; value: string }[];
  nodalDropOptions?: { label: string; value: string }[];
  geocodeOptions?: { label: string; value: string }[];
  /** Pass the full profile so we can show current address & pre-centre map */
  currentProfile?: AddressModalProfile | null;
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const LABEL: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#52796F",
  marginBottom: 4,
  display: "block",
  letterSpacing: 0.2,
};

const FIELD_STYLE: React.CSSProperties = {
  backgroundColor: "#F0FAF4",
  borderRadius: 8,
  fontSize: 12,
  width: "100%",
};

// ─── FieldWrap ────────────────────────────────────────────────────────────────

const FieldWrap: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required, error, children }) => (
  <div style={{ marginBottom: 10 }}>
    <label style={LABEL}>
      {label}
      {required && <span style={{ color: "#E53E3E", marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {error && (
      <span
        style={{
          fontSize: 10,
          color: "#E53E3E",
          marginTop: 3,
          display: "block",
        }}
      >
        {error}
      </span>
    )}
  </div>
);

// ─── CurrentAddressCard ───────────────────────────────────────────────────────

const CurrentAddressCard: React.FC<{ profile: AddressModalProfile }> = ({
  profile,
}) => {
  const hasAddress = profile.address || profile.city || profile.stateName;
  return (
    <div
      style={{
        background: "#F8FFFE",
        border: "1px solid #D4EDE1",
        borderRadius: 10,
        padding: "10px 14px",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#52796F",
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        <HomeOutlined style={{ fontSize: 11 }} />
        Current Address on Record
      </div>

      {hasAddress ? (
        <>
          <div
            style={{
              fontSize: 12,
              color: "#1B4332",
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            {profile.address}
          </div>
          <div
            style={{ marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap" }}
          >
            {profile.city && (
              <span
                style={{
                  fontSize: 11,
                  color: "#52796F",
                  background: "#E8F5EE",
                  borderRadius: 4,
                  padding: "1px 7px",
                }}
              >
                {profile.city}
              </span>
            )}
            {profile.stateName && (
              <span
                style={{
                  fontSize: 11,
                  color: "#52796F",
                  background: "#E8F5EE",
                  borderRadius: 4,
                  padding: "1px 7px",
                }}
              >
                {profile.stateName}
              </span>
            )}
            {profile.pin && (
              <span
                style={{
                  fontSize: 11,
                  color: "#52796F",
                  background: "#E8F5EE",
                  borderRadius: 4,
                  padding: "1px 7px",
                }}
              >
                PIN: {profile.pin}
              </span>
            )}
          </div>
          {profile.emp_Lat && profile.emp_Lng && (
            <div style={{ fontSize: 10, color: "#8A9E99", marginTop: 4 }}>
              {profile.emp_Lat.toFixed(5)}, {profile.emp_Lng.toFixed(5)}
            </div>
          )}
        </>
      ) : (
        <div style={{ fontSize: 12, color: "#A0AEC0", fontStyle: "italic" }}>
          No address on record — please select a location on the map.
        </div>
      )}
    </div>
  );
};

// ─── MapPanel ─────────────────────────────────────────────────────────────────

interface MapPanelProps {
  onAddressChange: (components: AddressComponents) => void;
  defaultLat?: number;
  defaultLng?: number;
}

const MapPanel: React.FC<MapPanelProps> = ({
  onAddressChange,
  defaultLat = 28.6139,
  defaultLng = 77.209,
}) => {
  const { Spin } = useUILibrary();

  const { mapRef, searchInputRef, isLoaded, isGeocoding } = useGoogleMap({
    onAddressChange,
    defaultLat,
    defaultLng,
  });

  return (
    <div
      style={{
        padding: "16px 16px 16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        height: "100%",
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#1B4332",
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 2,
          }}
        >
          <EnvironmentOutlined style={{ color: "#40916C" }} />
          Pick New Location on Map{" "}
          <span style={{ color: "#E53E3E", marginLeft: 2 }}>*</span>
        </div>
        <div style={{ fontSize: 11, color: "#8A9E99" }}>
          Search or drag the marker — address fields fill automatically
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative" }}>
        <input
          ref={searchInputRef as React.RefObject<HTMLInputElement>}
          type="text"
          placeholder="Search address, landmark or area…"
          style={{
            width: "100%",
            padding: "9px 12px 9px 34px",
            borderRadius: 8,
            border: "1px solid #D4EDE1",
            background: "#F0FAF4",
            fontSize: 12,
            color: "#1B4332",
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
        <EnvironmentOutlined
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#52796F",
            fontSize: 13,
            pointerEvents: "none",
          }}
        />
        {isGeocoding && (
          <div
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <Spin size="small" />
          </div>
        )}
      </div>

      {/* Map container — fills remaining height */}
      <div
        style={{
          flex: 1,
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #D4EDE1",
          position: "relative",
          background: "#E8F5E9",
          minHeight: 0,
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
              color: "#52796F",
              fontSize: 13,
              gap: 8,
            }}
          >
            <Spin size="small" /> Loading map…
          </div>
        )}
      </div>

      <div style={{ fontSize: 10, color: "#A0AEC0", textAlign: "center" }}>
        💡 Click on the map or drag the marker to set the exact location
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const AddressChangeModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  serverErrors,
  currentProfile,
}) => {
  // console.log("currentProfile", currentProfile);

  const { Input, Button, Modal } = useUILibrary();

  const [form, setForm] = useState<AddressFormState>({
    state: "",
    city: "",
    pin: "",
    address: "",
    nodalPick: "",
    nodalDrop: "",
    geoPoint: "",
    effectiveDate: "",
    remarks: "",
    empLat: null,
    empLng: null,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressFormState, string>>
  >({});

  // ── Pre-fill form from profile when modal opens ───────────────────────────
  useEffect(() => {
    if (open && currentProfile) {
      setForm({
        state: currentProfile.stateName ?? "",
        city: currentProfile.city ?? "",
        pin: currentProfile.pin ?? "",
        address: currentProfile.address ?? "",
        nodalPick: currentProfile.nodal_Pick ?? "",
        nodalDrop: currentProfile.nodal_Drop ?? "",
        geoPoint: "",
        effectiveDate: "",
        remarks: "",
        empLat: currentProfile.emp_Lat ?? null,
        empLng: currentProfile.emp_Lng ?? null,
      });
      setErrors({});
    }
    if (!open) {
      // reset on close
      setErrors({});
    }
  }, [open]);

  const set = useCallback(
    <K extends keyof AddressFormState>(key: K, value: AddressFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
    },
    [],
  );

  // ── Auto-fill from map pick ───────────────────────────────────────────────
  const handleAddressFromMap = useCallback((components: AddressComponents) => {
    setForm((prev) => ({
      ...prev,
      address: components.fullAddress ?? prev.address,
      city: components.city ?? prev.city,
      state: components.state ?? prev.state,
      pin: components.pin ?? prev.pin,
      empLat: components.lat,
      empLng: components.lng,
    }));
    setErrors((prev) => {
      const n = { ...prev };
      delete n.address;
      delete n.city;
      delete n.pin;
      delete n.state;
      return n;
    });
  }, []);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof AddressFormState, string>> = {};
    if (!form.state.trim()) errs.state = "State is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.pin.trim()) errs.pin = "PIN code is required";
    if (!form.address.trim()) errs.address = "Address is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit({
      address: form.address,
      city: form.city,
      state: form.state,
      pin: form.pin,
      nodalPick: form.nodalPick || null,
      nodalDrop: form.nodalDrop || null,
      geoPoint: form.geoPoint || null,
      effectiveDate: form.effectiveDate || null,
      remarks: form.remarks || null,
      empLat: form.empLat,
      empLng: form.empLng,
    });
  };

  const mapDefaultLat = currentProfile?.emp_Lat ?? 28.6139;
  const mapDefaultLng = currentProfile?.emp_Lng ?? 77.209;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={1020}
      destroyOnClose
      footer={null}
      styles={{
        mask: { background: "rgba(0, 60, 30, 0.35)" },
        content: { borderRadius: 16, padding: 0, overflow: "hidden" },
        header: {
          padding: "16px 24px 12px",
          borderBottom: "1px solid #F0F7F4",
          marginBottom: 0,
        },
        body: { padding: 0, overflow: "hidden" },
      }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "#F0FAF4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ApartmentOutlined style={{ color: "#1B4332", fontSize: 15 }} />
          </div>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#1B4332",
                lineHeight: 1.3,
              }}
            >
              Update Address
            </div>
            <div style={{ fontSize: 11, color: "#8A9E99", fontWeight: 400 }}>
              Select location on the map — fields fill automatically
            </div>
          </div>

          {/* Employee name badge */}
          {currentProfile?.firstName && (
            <div
              style={{
                marginLeft: "auto",
                background: "#F0FAF4",
                border: "1px solid #D4EDE1",
                borderRadius: 20,
                padding: "4px 12px",
                fontSize: 12,
                color: "#1B4332",
                fontWeight: 500,
              }}
            >
              {currentProfile.firstName} {currentProfile.lastName}
            </div>
          )}
        </div>
      }
      style={{ top: 24 }}
    >
      {currentProfile?.empId != null && (
        <div style={{ padding: "10px 20px 0", overflow: "hidden" }}>
          <AddressChangeBanner empId={currentProfile.empId} />
        </div>
      )}
      {/* ── Body: Map (60%) | Form (40%) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          height: 500,
        }}
      >
        {/* ── LEFT: Map (hero) ── */}
        <div style={{ borderRight: "1px solid #F0F7F4" }}>
          {open && (
            <MapPanel
              onAddressChange={handleAddressFromMap}
              defaultLat={mapDefaultLat}
              defaultLng={mapDefaultLng}
            />
          )}
        </div>

        {/* ── RIGHT: Current address + new address form ── */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
          }}
        >
          {/* Current address card */}
          {currentProfile && <CurrentAddressCard profile={currentProfile} />}

          {/* Arrow separator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <div style={{ flex: 1, height: 1, background: "#E8F5EE" }} />
            <div
              style={{
                fontSize: 10,
                color: "#52796F",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              <ArrowRightOutlined /> New Address
            </div>
            <div style={{ flex: 1, height: 1, background: "#E8F5EE" }} />
          </div>

          {/* Scrollable form */}
          <div style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "0 8px",
              }}
            >
              <FieldWrap label="State" required error={errors.state}>
                <Input
                  value={form.state}
                  readOnly
                  onChange={(e: any) => set("state", e.target.value)}
                  placeholder="e.g. Kerala"
                  style={FIELD_STYLE}
                  size="small"
                />
              </FieldWrap>

              <FieldWrap label="City" required error={errors.city}>
                <Input
                  value={form.city}
                  readOnly
                  onChange={(e: any) => set("city", e.target.value)}
                  placeholder="e.g. Kochi"
                  style={FIELD_STYLE}
                  size="small"
                />
              </FieldWrap>

              <FieldWrap label="Pincode" required error={errors.pin}>
                <Input
                  value={form.pin}
                  readOnly
                  onChange={(e: any) => set("pin", e.target.value)}
                  placeholder="682001"
                  maxLength={6}
                  style={FIELD_STYLE}
                  size="small"
                />
              </FieldWrap>
            </div>

            <FieldWrap label="Address" required error={errors.address}>
              <Input.TextArea
                value={form.address}
                readOnly
                onChange={(e: any) => set("address", e.target.value)}
                placeholder="Full address auto-fills when you pick on the map…"
                rows={3}
                style={{ ...FIELD_STYLE, resize: "none" }}
              />
            </FieldWrap>

            <FieldWrap label="Remarks (optional)">
              <Input
                value={form.remarks}
                onChange={(e: any) => set("remarks", e.target.value)}
                placeholder="Reason for change"
                style={FIELD_STYLE}
                size="small"
              />
            </FieldWrap>

            {/* Lat/Lng status badge */}
            <div
              style={{
                background: form.empLat !== null ? "#F0FAF4" : "#FFFBEB",
                border: `1px solid ${form.empLat !== null ? "#B7E4C7" : "#FDE68A"}`,
                borderRadius: 8,
                padding: "7px 10px",
                marginBottom: 8,
                fontSize: 11,
                color: form.empLat !== null ? "#1B4332" : "#92400E",
                fontFamily: "monospace",
              }}
            >
              {form.empLat !== null ? (
                <>
                  ✅ {form.empLat.toFixed(5)}, {form.empLng?.toFixed(5)}
                </>
              ) : (
                <>⚠️ Interact with the map to set location</>
              )}
            </div>

            {serverErrors && serverErrors.length > 0 && (
              <div
                style={{
                  background: "#FFF5F5",
                  border: "1px solid #FC8181",
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginBottom: 8,
                }}
              >
                {serverErrors.map((e, i) => (
                  <div key={i} style={{ color: "#C53030", fontSize: 12 }}>
                    • {e.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* ── Footer ── */}
      <div
        style={{
          padding: "12px 24px",
          borderTop: "1px solid #F0F7F4",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          type="primary"
          loading={isSubmitting}
          onClick={handleSubmit}
          icon={<SaveOutlined />}
          style={{
            borderRadius: 999,
            background: "#1B4332",
            borderColor: "#1B4332",
            fontWeight: 600,
            paddingInline: 28,
            height: 40,
            minWidth: 160,
            boxShadow: "0 4px 12px rgba(27,67,50,0.18)",
          }}
        >
          Save Changes
        </Button>
      </div>
    </Modal>
  );
};

export default AddressChangeModal;
