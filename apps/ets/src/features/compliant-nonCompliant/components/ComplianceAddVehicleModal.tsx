/**
 * ComplianceAddVehicleModal — 3-step vehicle form
 *
 * Vendor name + office name shown as a persistent badge strip above all form steps.
 * locCode is resolved to an office label via locationOptions (useLookups).
 * The Office select field is removed; locCode is injected via form.setFieldValue on open.
 */
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Upload,
  Button,
  Steps,
  Spin,
  Tooltip,
  Segmented,
  message,
} from "antd";
import { useFileUpload } from "../../../shared/customHooks/useFileUpload";
import { useLookups } from "../../lookups/hooks/useLookups";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../constants/tokens";
import {
  useAddVehicleStageForm,
  VEHICLE_DOC_FIELDS,
  REQUIRED_INDIVIDUAL_DOCS,
  type VehicleDocState,
} from "../hooks/useAddVehicleStageForm";
import { v, normalize } from "../utils/Formvalidation";

import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

const GPS_PROVIDER_OPTIONS = [
  { value: 1, label: "Dhanuka" },
  { value: 2, label: "TRAQR" },
];
const OWNER_TYPE_OPTIONS = ["Owned", "Attached"].map((x) => ({
  label: x,
  value: x,
}));

const S = {
  label: {
    fontSize: 11,
    fontWeight: 500,
    marginBottom: 2,
    color: "#374151",
    display: "block",
  } as React.CSSProperties,
  input: { height: 32, fontSize: 12 } as React.CSSProperties,
  select: { width: "100%", fontSize: 12 } as React.CSSProperties,
  date: { width: "100%", height: 32, fontSize: 12 } as React.CSSProperties,
  item: { margin: 0 } as React.CSSProperties,
};

const DATE_PICKER_PROPS = {
  size: "small" as const,
  format: "DD/MM/YYYY",
  style: S.date,
  getPopupContainer: () => document.body,
};

interface FieldProps {
  label: string;
  name: string;
  required?: boolean;
  rules?: any[];
  span?: number;
  tooltip?: string;
  children: React.ReactNode;
  normalize?: (v: any) => any;
  dependencies?: string[];
}
const Field: React.FC<FieldProps> = ({
  label,
  name,
  required,
  rules = [],
  span = 1,
  tooltip,
  children,
  normalize: norm,
  dependencies,
}) => (
  <div style={{ gridColumn: `span ${span}` }}>
    <label style={S.label}>
      {label}
      {required && <span style={{ color: "#ef4444" }}> *</span>}
      {tooltip && (
        <Tooltip title={tooltip}>
          <span
            style={{
              marginLeft: 4,
              color: "#9ca3af",
              cursor: "help",
              fontSize: 10,
            }}
          >
            ⓘ
          </span>
        </Tooltip>
      )}
    </label>
    <Form.Item
      name={name}
      rules={rules}
      style={S.item}
      normalize={norm}
      dependencies={dependencies}
      validateTrigger={["onChange", "onBlur"]}
    >
      {children}
    </Form.Item>
  </div>
);

// ─── Persistent info banner — vendor + office pills, shown on every step ──────
const InfoBanner: React.FC<{
  vendorLabel?: string;
  officeLabel?: string;
  locCode?: number;
  isMobile?: boolean;
}> = ({ vendorLabel, officeLabel, locCode, isMobile }) => {
  const officeName = officeLabel ?? (locCode ? `Office ${locCode}` : null);
  if (!vendorLabel && !officeName) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
        padding: isMobile ? "8px 16px" : "8px 24px",
        background: "#f0faf4",
        borderBottom: "1px solid #d1fae5",
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>
        Uploading for:
      </span>
      {vendorLabel && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "#fff",
            border: "1px solid #b7e4c7",
            borderRadius: 20,
            padding: "3px 10px",
            fontSize: 12,
            color: "#1B4332",
            fontWeight: 600,
          }}
        >
          {" "}
          Vendor :-
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#3E9B73",
              flexShrink: 0,
            }}
          />
          {vendorLabel}
        </span>
      )}
      {officeName && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "#fff",
            border: "1px solid #b7e4c7",
            borderRadius: 20,
            padding: "3px 10px",
            fontSize: 12,
            color: "#1B4332",
            fontWeight: 600,
          }}
        >
          📍Office :- {officeName}
        </span>
      )}
    </div>
  );
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const EyeIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const XIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── DocUploadRow ──────────────────────────────────────────────────────────────
const DocUploadRow: React.FC<{
  label: string;
  docKey: string;
  value: string | null;
  onChange: (url: string | null) => void;
  required?: boolean;
}> = ({ label, docKey, value, onChange, required }) => {
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState(false);
  const { uploadAndGetUrl, getFileUrl } = useFileUpload();

  const handleFile = async (file: File) => {
    setUploading(true);
    onChange(await uploadAndGetUrl(file, docKey));
    setUploading(false);
    return false;
  };
  const handleView = async () => {
    if (!value) return;
    setViewing(true);
    const url = await getFileUrl(value);
    setViewing(false);
    if (url && url !== "URL Not Found")
      window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "13px 16px",
        borderRadius: 10,
        border: `1px solid ${value ? "#86efac" : "#e5e7eb"}`,
        background: value ? "#f0fdf4" : "#fafafa",
        transition: "all .15s",
      }}
    >
      <div
        style={{
          width: 9,
          height: 9,
          borderRadius: "50%",
          flexShrink: 0,
          background: value ? "#22c55e" : "#d1d5db",
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#1f2937",
            display: "block",
          }}
        >
          {label}
          {required && (
            <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>
          )}
        </span>
        <span
          style={{
            fontSize: 11,
            color: value ? "#16a34a" : "#9ca3af",
            marginTop: 2,
            display: "block",
          }}
        >
          {value ? "Document uploaded" : "No file yet"}
        </span>
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
      >
        {value && (
          <>
            <button
              onClick={handleView}
              disabled={viewing}
              title="View document"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 7,
                border: "1px solid #86efac",
                background: "#f0fdf4",
                color: viewing ? "#9ca3af" : "#16a34a",
                cursor: viewing ? "default" : "pointer",
              }}
            >
              {viewing ? <Spin size="small" /> : <EyeIcon />}
            </button>
            <button
              onClick={() => onChange(null)}
              title="Remove"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: 7,
                border: "1px solid #fca5a5",
                background: "#fef2f2",
                color: "#ef4444",
                cursor: "pointer",
              }}
            >
              <XIcon />
            </button>
          </>
        )}
        <Upload
          beforeUpload={handleFile}
          showUploadList={false}
          accept=".jpg,.jpeg,.png,.pdf,.webp"
        >
          <Button
            size="small"
            loading={uploading}
            style={{
              fontSize: 12,
              height: 32,
              minWidth: 80,
              borderColor: value ? "#86efac" : "#d9d9d9",
              color: value ? "#15803d" : "#374151",
              fontWeight: value ? 600 : 400,
            }}
          >
            {uploading ? "" : value ? "Replace" : "Upload"}
          </Button>
        </Upload>
      </div>
    </div>
  );
};

// ── SinglePdfUpload ───────────────────────────────────────────────────────────
const SinglePdfUpload: React.FC<{
  value: string | null;
  onChange: (url: string | null) => void;
}> = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState(false);
  const { uploadAndGetUrl, getFileUrl } = useFileUpload();

  const handleFile = async (file: File) => {
    setUploading(true);
    onChange(await uploadAndGetUrl(file, "allDocuments_Doc"));
    setUploading(false);
    return false;
  };
  const handleView = async () => {
    if (!value) return;
    setViewing(true);
    const url = await getFileUrl(value);
    setViewing(false);
    if (url && url !== "URL Not Found")
      window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ padding: "24px 0" }}>
      <Upload.Dragger
        beforeUpload={handleFile}
        showUploadList={false}
        accept=".pdf"
        style={{ borderColor: "#16a34a" }}
      >
        <div style={{ padding: "20px 0" }}>
          {uploading ? (
            <Spin />
          ) : value ? (
            <>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#15803d",
                  margin: 0,
                }}
              >
                PDF uploaded
              </p>
              <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>
                Click or drag to replace
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📁</div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#374151",
                  margin: 0,
                }}
              >
                Click or drag a single PDF here
              </p>
              <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0" }}>
                One PDF containing all vehicle documents
              </p>
            </>
          )}
        </div>
      </Upload.Dragger>
      {value && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            marginTop: 12,
          }}
        >
          <button
            onClick={handleView}
            disabled={viewing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: viewing ? "#9ca3af" : "#16a34a",
              background: "none",
              border: "none",
              cursor: viewing ? "default" : "pointer",
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            <EyeIcon /> {viewing ? "Opening…" : "View uploaded PDF"}
          </button>
          <button
            onClick={() => onChange(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: "#ef4444",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <XIcon /> Remove
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  transporterId?: number;
  /** locCode of the active vendor's office — injected from parent, not selected by user */
  locCode?: number;
  /** Display name of the active vendor */
  vendorLabel?: string;
  onSuccess: () => void;
}

type UploadMode = "individual" | "single";

export const ComplianceAddVehicleModal: React.FC<Props> = ({
  open,
  onClose,
  transporterId,
  locCode,
  vendorLabel,
  onSuccess,
}) => {
  const { Modal } = useUILibrary();

  const isMobile = useIsMobile();

  const { color, spacing, radius, font } = useTokens();
  const {
    fuelTypeOptions,
    vehicleTypeOptions,
    locationOptions,
    vehicleStatusOptions,
    vendorOptions,
    currentStatusOptions,
  } = useLookups({
    only: [
      "fuelTypeOptions",
      "vehicleTypeOptions",
      "vendorOptions",
      "locationOptions",
      "vehicleStatusOptions",
      "currentStatusOptions",
    ],
  });

  // Resolve human-readable office name from locCode via lookup list
  const officeLabel: string | undefined = (locationOptions as any)?.find(
    (o: any) => o.value === locCode,
  )?.label;

  const {
    form,
    step,
    submitting,
    docs,
    setDoc,
    goNext,
    goBack,
    reset,
    submit,
  } = useAddVehicleStageForm({ transporterId, onSuccess });

  const [uploadMode, setUploadMode] = useState<UploadMode>("single");
  const [singlePdfUrl, setSinglePdfUrl] = useState<string | null>(null);

  // Inject locCode into form whenever modal opens
  useEffect(() => {
    if (!open) return;
    reset();
    setSinglePdfUrl(null);
    setUploadMode("single");
    if (locCode !== undefined) form.setFieldValue("locCode", locCode);
    form.setFieldValue("current_Status", 1);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    reset();
    setSinglePdfUrl(null);
    setUploadMode("single");
    onClose();
  };

  const handleSubmit = () => {
    if (uploadMode === "single") {
      if (!singlePdfUrl) {
        message.error("Please upload the combined PDF before submitting.");
        return;
      }
    } else {
      const missing = REQUIRED_INDIVIDUAL_DOCS.filter((k) => !docs[k]);
      if (missing.length > 0) {
        message.error(
          `Please upload: ${VEHICLE_DOC_FIELDS.filter((f) =>
            missing.includes(f.key),
          )
            .map((f) => f.label)
            .join(", ")}`,
        );
        return;
      }
    }
    submit(
      uploadMode === "single" && singlePdfUrl
        ? { allDocuments_Doc: singlePdfUrl }
        : undefined,
    );
  };

  const G4 = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
    gap: "8px 10px",
  };
  const G2 = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
    gap: "12px 16px",
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <span style={{ fontSize: font.sizeLg, fontWeight: 600 }}>
          Add Vehicle — Step {step + 1} of 3
        </span>
      }
      footer={null}
      centered={!isMobile}
      width={isMobile ? "100%" : "min(1260px, 96vw)"}
      style={isMobile ? { top: 0, maxWidth: "100%", margin: 0 } : undefined}
      destroyOnClose={false}
    >
      <div
        style={{
          padding: isMobile
            ? `${spacing.xs}px ${spacing.md}px`
            : `${spacing.sm}px ${spacing.xl}px`,
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <Steps
          current={step}
          size="small"
          items={[
            { title: isMobile ? "Identity" : "Vehicle Identity" },
            { title: isMobile ? "Dates" : "Compliance Dates" },
            { title: "Documents" },
          ]}
        />
      </div>

      {/* ── Vendor + Office badge strip — persists on every step ── */}
      <InfoBanner
        vendorLabel={vendorLabel}
        officeLabel={officeLabel}
        locCode={locCode}
        isMobile={isMobile}
      />

      <Form
        form={form}
        layout="vertical"
        size="small"
        initialValues={{ current_Status: 1 }}
        scrollToFirstError={{ behavior: "smooth", block: "center" }}
        style={{
          padding: isMobile
            ? `${spacing.sm}px ${spacing.md}px`
            : `${spacing.sm}px ${spacing.xl}px`,
        }}
      >
        {/* ══ STEP 0 — Vehicle Identity ══ */}
        <div style={{ display: step === 0 ? undefined : "none" }}>
          <div style={G4}>
            {!transporterId && (
              <Field label="Vendor" name="transporterId">
                <Select
                  style={S.select}
                  size="small"
                  placeholder="Select vendor"
                  options={(vendorOptions as any) ?? []}
                  allowClear
                />
              </Field>
            )}
            {/* Office field removed — locCode injected via useEffect above */}
            <Field
              label="Registration No."
              name="vehicle_Registration_No"
              required
              rules={[v.required(), v.vehicleRegNo(), v.maxLen(20)]}
              normalize={normalize.vehicleRegNo}
              tooltip="e.g. UP-58-P-6228"
            >
              <Input style={S.input} placeholder="UP-58-P-6228" />
            </Field>
            <Field
              label="Vehicle Type"
              name="vehicleTypeCode"
              required
              rules={[{ required: true, message: "Vehicle type is required" }]}
            >
              <Select
                style={S.select}
                size="small"
                placeholder="Select type"
                options={(vehicleTypeOptions as any) ?? []}
              />
            </Field>
            <Field label="Make" name="make" rules={[v.maxLen(50)]}>
              <Input style={S.input} placeholder="TATA" />
            </Field>
            <Field label="Model" name="model" rules={[v.maxLen(50)]}>
              <Input style={S.input} placeholder="Ace" />
            </Field>
            <Field
              label="Make Year"
              name="makeYear"
              required
              rules={[{ required: true, message: "Make year is required" }]}
              tooltip="Select manufacturing year"
            >
              <DatePicker
                {...DATE_PICKER_PROPS}
                picker="year"
                placeholder="Select year"
              />
            </Field>
            <Field
              label="Fuel Type"
              name="fuelTypeCode"
              required
              rules={[{ required: true, message: "Fuel type is required" }]}
            >
              <Select
                style={S.select}
                size="small"
                placeholder="Select fuel"
                options={(fuelTypeOptions as any) ?? []}
              />
            </Field>
            <Field
              label="Chassis No."
              name="chassis_No"
              rules={[v.alphaNumDash("Chassis No."), v.maxLen(25)]}
              normalize={normalize.alphaNumUpper}
              tooltip="VIN / Chassis number"
            >
              <Input style={S.input} placeholder="1ZVBP8JZ8H1234567" />
            </Field>
            {/* <Field label="Assigned Driver" name="driverId">
              <Select
                style={S.select}
                size="small"
                placeholder="Select driver"
                options={(driverOptions as any) ?? []}
                allowClear
                showSearch
                optionFilterProp="label"
              />
            </Field> */}
            <div style={{ gridColumn: "span 1" }}>
              <label style={S.label}>GPS Installed</label>
              <Form.Item
                name="isGpsInstalled"
                valuePropName="checked"
                style={S.item}
              >
                <Switch
                  size="small"
                  checkedChildren="Yes"
                  unCheckedChildren="No"
                />
              </Form.Item>
            </div>
            <Form.Item
              shouldUpdate={(p, c) => p.isGpsInstalled !== c.isGpsInstalled}
              style={{ ...S.item, gridColumn: "span 1" }}
            >
              {({ getFieldValue }) => (
                <Field
                  label="GPS Provider"
                  name="gpsProviderCode"
                  rules={
                    getFieldValue("isGpsInstalled")
                      ? [
                          v.required(
                            "GPS provider required when GPS is installed",
                          ),
                        ]
                      : []
                  }
                >
                  <Select
                    style={S.select}
                    size="small"
                    placeholder="Select provider"
                    options={GPS_PROVIDER_OPTIONS}
                    allowClear
                  />
                </Field>
              )}
            </Form.Item>
            <Form.Item
              shouldUpdate={(p, c) => p.isGpsInstalled !== c.isGpsInstalled}
              style={{ ...S.item, gridColumn: "span 1" }}
            >
              {({ getFieldValue }) => (
                <Field
                  label="GPS Install Date"
                  name="gps_Installation_Date"
                  required={!!getFieldValue("isGpsInstalled")}
                  rules={
                    getFieldValue("isGpsInstalled")
                      ? [
                          v.required("GPS install date is required"),
                          v.pastDate("GPS install date"),
                        ]
                      : []
                  }
                >
                  <DatePicker {...DATE_PICKER_PROPS} />
                </Field>
              )}
            </Form.Item>
            {/* <Field
              label="GPS Status"
              name="gpsStatusCode"
              required
              rules={[{ required: true, message: "GPS status is required" }]}
            >
              <Select
                style={S.select}
                size="small"
                placeholder="Select GPS status"
                options={GPS_OPTIONS}
              />
            </Field> */}
          </div>
        </div>

        {/* ══ STEP 1 — Compliance Dates ══ */}
        <div style={{ display: step === 1 ? undefined : "none" }}>
          <div style={G4}>
            <Field
              label="Registration Date"
              name="vehicle_Registration_Date"
              required
              rules={[
                { required: true, message: "Registration date is required" },
                v.pastDate("Registration date"),
              ]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="Induction Date"
              name="vehicle_Induction_Date"
              required
              rules={[
                { required: true, message: "Induction date is required" },
              ]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="Registration Expiry"
              name="registration_Exp_Date"
              rules={[v.futureDate("Registration expiry")]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="Permit Expiry"
              name="permit_Expiry_Date"
              required
              rules={[
                { required: true, message: "Permit expiry is required" },
                v.futureDate("Permit expiry"),
              ]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="Insurance Expiry"
              name="insurance_Expiry_Date"
              required
              rules={[
                { required: true, message: "Insurance expiry is required" },
                v.futureDate("Insurance expiry"),
              ]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="Fitness Expiry"
              name="fitness_Expiry_Date"
              required
              rules={[
                { required: true, message: "Fitness expiry is required" },
                v.futureDate("Fitness expiry"),
              ]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="Road Tax Expiry"
              name="road_Tax_Validity_Expiry"
              required
              rules={[
                { required: true, message: "Road tax expiry is required" },
                v.futureDate("Road tax expiry"),
              ]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="PUC Expiry"
              name="puc_Expiry_Date"
              required
              rules={[
                { required: true, message: "PUC expiry is required" },
                v.futureDate("PUC expiry"),
              ]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="First Aid Kit Expiry"
              name="firstAid_Kid_Date"
              rules={[v.futureDate("First aid kit date")]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field
              label="Fire Ext. Expiry"
              name="fire_Extinguisher_Date"
              rules={[v.futureDate("Fire extinguisher date")]}
            >
              <DatePicker {...DATE_PICKER_PROPS} />
            </Field>
            <Field label="Owner Name" name="owner_Name" rules={[v.maxLen(100)]}>
              <Input style={S.input} placeholder="Owner full name" />
            </Field>
            <Field
              label="Owner Type"
              name="owner_Type"
              required
              rules={[{ required: true, message: "Owner type is required" }]}
            >
              <Select
                style={S.select}
                size="small"
                placeholder="Own / Attached"
                options={OWNER_TYPE_OPTIONS}
              />
            </Field>
            <Field
              label="Owner Address"
              name="owner_Address"
              rules={[v.maxLen(300)]}
              span={2}
            >
              <Input style={S.input} placeholder="Full address" />
            </Field>
            <Field
              label="Vehicle Status"
              name="vehicle_Status"
              required
              rules={[
                { required: true, message: "Vehicle status is required" },
              ]}
            >
              <Select
                style={S.select}
                size="small"
                placeholder="Status"
                options={(vehicleStatusOptions as any) ?? []}
              />
            </Field>
            <Field
              label="Current Status"
              name="current_Status"
              required
              rules={[
                { required: true, message: "Current status is required" },
              ]}
            >
              <Select
                style={S.select}
                size="small"
                placeholder="Current status"
                options={(currentStatusOptions as any) ?? []}
              />
            </Field>
            <Field
              label="Remarks"
              name="remarks"
              required
              rules={[
                { required: true, message: "Remarks are required" },
                v.maxLen(500),
              ]}
              span={2}
            >
              <Input style={S.input} placeholder="Required remarks" />
            </Field>
          </div>
        </div>

        {/* ══ STEP 2 — Documents ══ */}
        <div style={{ display: step === 2 ? undefined : "none" }}>
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "center",
              justifyContent: "space-between",
              marginBottom: spacing.md,
              padding: `${spacing.sm}px ${spacing.md}px`,
              background: "#f9fafb",
              borderRadius: radius.lg,
              border: "1px solid #e5e7eb",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#111827",
                  margin: 0,
                }}
              >
                How do you want to upload documents?
              </p>
              <p style={{ fontSize: 12, color: "#6b7280", margin: "2px 0 0" }}>
                {uploadMode === "single"
                  ? "Upload everything as one PDF — quicker if you have a combined scan."
                  : "Upload each document separately for better traceability."}
              </p>
            </div>
            <Segmented
              value={uploadMode}
              onChange={(val) => setUploadMode(val as UploadMode)}
              size="small"
              block={isMobile}
              options={[
                { label: "📎 One PDF", value: "single" },
                { label: "📂 One by One", value: "individual" },
              ]}
            />
          </div>
          {uploadMode === "single" && (
            <SinglePdfUpload value={singlePdfUrl} onChange={setSinglePdfUrl} />
          )}
          {/* {uploadMode === "individual" && (
            <div style={G2}>
              {VEHICLE_DOC_FIELDS.map(({ key, label }) => (
                <DocUploadRow
                  key={key}
                  label={label}
                  docKey={key}
                  value={docs[key]}
                  onChange={(url) => setDoc(key as keyof VehicleDocState, url)}
                />
              ))}
            </div>
          )} */}

          {uploadMode === "individual" && (
            <>
              <div style={G2}>
                {VEHICLE_DOC_FIELDS.filter(
                  (f) =>
                    f.key !== "firstAidKitDateExpiry_Doc" &&
                    f.key !== "fireExtinguisherExp_Doc" &&
                    f.key !== "allDocuments_Doc",
                ).map(({ key, label }) => (
                  <DocUploadRow
                    key={key}
                    label={label}
                    docKey={key}
                    value={docs[key]}
                    onChange={(url) =>
                      setDoc(key as keyof VehicleDocState, url)
                    }
                    required={true}
                  />
                ))}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#6b7280",
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: 4,
                  marginTop: 14,
                  marginBottom: 8,
                }}
              >
                Optional Documents
              </div>
              <div style={G2}>
                {VEHICLE_DOC_FIELDS.filter(
                  (f) =>
                    f.key === "firstAidKitDateExpiry_Doc" ||
                    f.key === "fireExtinguisherExp_Doc",
                ).map(({ key, label }) => (
                  <DocUploadRow
                    key={key}
                    label={`${label} (Optional)`}
                    docKey={key}
                    value={docs[key]}
                    onChange={(url) =>
                      setDoc(key as keyof VehicleDocState, url)
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </Form>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile
            ? step === 0
              ? "column-reverse"
              : "row"
            : "row",
          justifyContent: isMobile ? "stretch" : "flex-end",
          alignItems: "center",
          gap: spacing.sm,
          padding: isMobile
            ? `${spacing.sm}px ${spacing.md}px ${spacing.md}px`
            : `${spacing.sm}px ${spacing.xl}px ${spacing.md}px`,
          borderTop: "1px solid #f3f4f6",
        }}
      >
        {(!isMobile || step === 0) && (
          <button
            onClick={handleClose}
            style={{
              padding: "7px 18px",
              borderRadius: radius.md,
              border: "1px solid #d9d9d9",
              background: "#fff",
              cursor: "pointer",
              fontSize: font.sizeSm,
              fontFamily: "inherit",
              width: isMobile ? "100%" : "auto",
            }}
          >
            Cancel
          </button>
        )}

        {step > 0 && (
          <button
            onClick={goBack}
            style={{
              padding: "7px 18px",
              borderRadius: radius.md,
              border: `1px solid ${color.primary}`,
              background: "#fff",
              color: color.primary,
              cursor: "pointer",
              fontSize: font.sizeSm,
              fontFamily: "inherit",
              width: isMobile ? "100%" : "auto",
              flex: isMobile ? 1 : undefined,
            }}
          >
            ← Back
          </button>
        )}
        {step < 2 ? (
          <button
            onClick={goNext}
            style={{
              padding: "7px 22px",
              borderRadius: radius.md,
              border: "none",
              background: color.primary,
              color: "#fff",
              cursor: "pointer",
              fontSize: font.sizeSm,
              fontFamily: "inherit",
              fontWeight: 600,
              width: isMobile ? "100%" : "auto",
              flex: isMobile && step > 0 ? 1 : undefined,
            }}
          >
            {step === 0 ? "Next — Compliance Dates →" : "Next — Documents →"}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: "7px 22px",
              borderRadius: radius.md,
              border: "none",
              background: submitting ? "#9ca3af" : color.primary,
              color: "#fff",
              cursor: submitting ? "not-allowed" : "pointer",
              fontSize: font.sizeSm,
              fontFamily: "inherit",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
              width: isMobile ? "100%" : "auto",
              flex: isMobile && step > 0 ? 1 : undefined,
            }}
          >
            {submitting && <Spin size="small" />}
            {submitting ? "Submitting…" : "Submit Vehicle"}
          </button>
        )}
      </div>
    </Modal>
  );
};
