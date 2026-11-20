/**
 * UploadDocumentsModal — 3-step vehicle edit wizard
 *
 * Step 1: Vehicle Info   (fields aligned with ComplianceAddVehicleModal Step 0)
 * Step 2: Compliance Dates (aligned with ComplianceAddVehicleModal Step 1)
 * Step 3: Documents
 *
 * isPending=true  → PUT /api/v1/VehicleStages/{id}
 * isPending=false → existing onSubmit flow (POST .../compliance)
 */
import React, { useState, useCallback, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Upload,
  Button,
  Alert,
  Spin,
  Steps,
  message,
} from "antd";
import dayjs from "dayjs";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../constants/tokens";
import { useFileUpload } from "../../../shared/customHooks/useFileUpload";
import { useLookups } from "../../lookups/hooks/useLookups";
import type { VehicleCompliance } from "../types/Vehiclecompliance.types";
// import {

//   FIXED_DEVICE_OPTIONS,
// } from "../constants/VehicleComplianceConstants";
import { useUpdateVehicleStageMutation } from "../services/VehicleComplianceApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const GPS_PROVIDER_OPTIONS = [
  { value: 1, label: "Dhanuka" },
  { value: 2, label: "TRAQR" },
];

const OWNER_TYPE_OPTIONS = ["Owned", "Attached"].map((x) => ({
  label: x,
  value: x,
}));

const TOTAL_STEPS = 3;

/** Fields validated per step — Step 2 docs are validated manually in handleSubmit */
const STEP_FIELDS: string[][] = [
  // Step 0 — Vehicle Info
  [
    "vehicleTypeCode",
    "make",
    "model",
    "makeYear",
    "chassis_No",
    "fuelType",
    "ownerName",
    "ownerAddress",
    "vehicleOwnership",
    "isGpsInstalled",
    "gpsProviderCode",
    "gpsInstallDate",
    "driverId",
    "fixedDeviceStatus",
    "fixedDeviceDate",
  ],
  // Step 1 — Compliance Dates
  [
    "vehicle_Registration_Date",
    "manufacturingDate",
    "inductionDate",
    "registrationDate",
    "insuranceExpiry",
    "roadTaxExpiry",
    "pollutionExpiry",
    "fitnessExpiry",
    "commercialExpiry",
    "vehicleServiceDate",
    "firstAidKitDate",
    "fireExtDate",
    "vehicleStatus",
    "currentStatus",
    "remarks",
  ],
  // Step 2 — Documents (validated manually)
  [],
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: "#374151",
    display: "block",
    marginBottom: 3,
  } as React.CSSProperties,
  input: { fontSize: 13, height: 34 } as React.CSSProperties,
  select: { width: "100%", fontSize: 13 } as React.CSSProperties,
  date: { width: "100%", height: 34, fontSize: 12 } as React.CSSProperties,
  item: { margin: 0 } as React.CSSProperties,
};

const DP = {
  size: "small" as const,
  format: "DD/MM/YYYY",
  getPopupContainer: () => document.body,
};

const DATE_FIELDS_SUBMIT = [
  "registrationDate",
  "manufacturingDate",
  "inductionDate",
  "insuranceExpiry",
  "roadTaxExpiry",
  "pollutionExpiry",
  "commercialExpiry",
  "fitnessExpiry",
  "vehicleServiceDate",
  "fixedDeviceDate",
  "gpsInstallDate",
  "firstAidKitDate",
  "fireExtDate",
] as const;

const DOC_KEYS = [
  "registration",
  "permit",
  "fitness",
  "puc",
  "fireExt",
  "firstAidKit",
  "roadTax",
  "insurance",
] as const;
type DocKey = (typeof DOC_KEYS)[number];
type DocState = Record<DocKey, string | null>;
const INITIAL_DOCS: DocState = {
  registration: null,
  permit: null,
  fitness: null,
  puc: null,
  fireExt: null,
  firstAidKit: null,
  roadTax: null,
  insurance: null,
};

// ─── Icons ────────────────────────────────────────────────────────────────────
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

const XIcon = ({ size = 12 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
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

// ─── SectionHead ──────────────────────────────────────────────────────────────
const SectionHead: React.FC<{ text: string; badge?: string }> = ({
  text,
  badge,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      margin: "12px 0 8px",
    }}
  >
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "#6b7280",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
    {badge && (
      <span
        style={{
          fontSize: 10,
          background: "#fef2f2",
          color: "#dc2626",
          border: "1px solid #fca5a5",
          borderRadius: 4,
          padding: "1px 6px",
        }}
      >
        {badge}
      </span>
    )}
    <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
  </div>
);

// ─── FormRow ──────────────────────────────────────────────────────────────────
const FormRow: React.FC<{
  label: string;
  name: string;
  required?: boolean;
  rules?: any[];
  children: React.ReactNode;
}> = ({ label, name, required, rules, children }) => (
  <div>
    <label style={S.label}>
      {label}
      {required && <span style={{ color: "#ef4444" }}> *</span>}
    </label>
    <Form.Item
      name={name}
      style={S.item}
      rules={
        rules ??
        (required ? [{ required: true, message: `${label} is required` }] : [])
      }
    >
      {children}
    </Form.Item>
  </div>
);

// ─── DocCard ──────────────────────────────────────────────────────────────────
const DocCard: React.FC<{
  label: string;
  expiryLabel?: string;
  value: string | null;
  onChange: (url: string | null) => void;
  required?: boolean;
}> = ({ label, expiryLabel, value, onChange, required }) => {
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState(false);
  const { uploadAndGetUrl, getFileUrl } = useFileUpload();

  const handleFile = async (file: File) => {
    setUploading(true);
    const url = await uploadAndGetUrl(file, label);
    onChange(url);
    setUploading(false);
    return false;
  };

  const handleView = async () => {
    if (!value) return;
    setViewing(true);
    try {
      const url = await getFileUrl(value);
      if (url && url !== "URL Not Found")
        window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setViewing(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "11px 14px",
        borderRadius: 10,
        border: `1px solid ${value ? "#86efac" : "#e5e7eb"}`,
        background: value ? "#f0fdf4" : "#fafafa",
        transition: "all .15s",
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
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
        {expiryLabel ? (
          <span
            style={{
              fontSize: 11,
              color: "#6b7280",
              marginTop: 1,
              display: "block",
            }}
          >
            Expiry: {expiryLabel}
          </span>
        ) : (
          <span
            style={{
              fontSize: 11,
              color: value ? "#16a34a" : "#9ca3af",
              marginTop: 1,
              display: "block",
            }}
          >
            {value ? "Uploaded" : "No file"}
          </span>
        )}
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
      >
        {value && (
          <>
            <button
              onClick={handleView}
              disabled={viewing}
              title="View"
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

// ─── Grid helpers ─────────────────────────────────────────────────────────────
const Grid4: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: "10px 14px",
      padding: "12px",
      background: "#f9fafb",
      borderRadius: 8,
      border: "1px solid #e5e7eb",
      marginBottom: 12,
    }}
  >
    {children}
  </div>
);

const Grid2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 14px" }}
  >
    {children}
  </div>
);

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  record: VehicleCompliance | null;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  isSubmitting: boolean;
  serverErrors?: { message: string }[] | null;
  /** true when record comes from VehicleStages (Pending tab) → PUT /api/v1/VehicleStages/{id} */
  isPending?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (d: string | null | undefined) =>
  d ? dayjs(d).format("DD/MM/YYYY") : undefined;

const toISO = (v: any) => {
  if (!v) return null;
  if (dayjs.isDayjs(v)) return v.toISOString();
  return v;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const UploadDocumentsModal: React.FC<Props> = ({
  open,
  onClose,
  record,
  onSubmit,
  isSubmitting: isSubmittingProp,
  serverErrors,
  isPending = false,
}) => {
  const { Modal } = useUILibrary();
  const { color, spacing, radius, font } = useTokens();
  const [form] = Form.useForm();

  console.log("record from upload doc", record);

  // ── Lookups (same as ComplianceAddVehicleModal) ──────────────────────────
  const {
    vehicleTypeOptions,
    fuelTypeOptions,
    vehicleStatusOptions,
    currentStatusOptions,
    driverOptions,
  } = useLookups({
    only: [
      "vehicleTypeOptions",
      "fuelTypeOptions",
      "vehicleStatusOptions",
      "currentStatusOptions",
      "driverOptions",
    ],
  });

  // ── State ─────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [roadTaxLifetime, setRoadTaxLifetime] = useState(false);
  const [docs, setDocsState] = useState<DocState>({ ...INITIAL_DOCS });

  const [updateVehicleStage, { isLoading: isUpdatingStage }] =
    useUpdateVehicleStageMutation();
  const isSubmitting = isSubmittingProp || isUpdatingStage;

  // ── Reset on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || !record) return;
    const r = record as any;
    setStep(0);
    form.resetFields();
    form.setFieldsValue({
      // Step 0 — Vehicle Info
      vehicleTypeCode: r.vehicleTypeCode ?? undefined,
      make: r.make ?? "",
      model: r.model ?? "",
      chassisNo: r.chassis_No ?? r.chassisNo ?? "",
      fuelType: r.fuelTypeCode ?? r.fuelType ?? undefined,
      ownerName: r.owner_Name ?? r.ownerName ?? "",

      ownerAddress: r.owner_Address ?? r.ownerAddress ?? "",
      vehicleOwnership: r.owner_Type ?? r.vehicleOwnership ?? undefined,
      isGpsInstalled: r.isGpsInstalled ?? false,
      gpsProvider: r.gpsProviderCode ?? r.gpsProvider ?? undefined,
      gpsInstallDate: r.gps_Installation_Date
        ? dayjs(r.gps_Installation_Date)
        : undefined,
      gpsStatusCode: r.gpsStatusCode ?? undefined,
      driverId: r.driverId ?? undefined,
      fixedDeviceStatus: r.fixedDeviceStatus ?? undefined,
      fixedDeviceDate: r.fixedDeviceDate ? dayjs(r.fixedDeviceDate) : undefined,
      // Step 1 — Compliance Dates
      manufacturingDate: r.makeYear ? dayjs(r.makeYear) : undefined,
      inductionDate: r.vehicle_Induction_Date
        ? dayjs(r.vehicle_Induction_Date)
        : undefined,
      registrationDate: r.registration_Exp_Date
        ? dayjs(r.registration_Exp_Date)
        : undefined,
      insuranceExpiry: r.insuranceExpDate
        ? dayjs(r.insuranceExpDate)
        : undefined,
      roadTaxExpiry: r.roadTaxExpDate ? dayjs(r.roadTaxExpDate) : undefined,
      pollutionExpiry: r.pucExpDate ? dayjs(r.pucExpDate) : undefined,
      fitnessExpiry: r.fitnessExpDate ? dayjs(r.fitnessExpDate) : undefined,
      commercialExpiry: r.permitExpDate ? dayjs(r.permitExpDate) : undefined,
      vehicleServiceDate: undefined,
      firstAidKitDate: r.firstAid_Kid_Date
        ? dayjs(r.firstAid_Kid_Date)
        : undefined,
      fireExtDate: r.fire_Extinguisher_Date
        ? dayjs(r.fire_Extinguisher_Date)
        : undefined,
      vehicleStatus: r.vehicle_Status ?? undefined,
      currentStatus: r.current_Status ?? undefined,
      remarks: r.remarks ?? "",
    });
    setRoadTaxLifetime(false);

    setDocsState({
      registration: r.registrationExpiryDate_Doc ?? null,
      permit: r.permitExpiryDate_Doc ?? null,
      fitness: r.fitnessExpiryDate_Doc ?? null,
      puc: r.pucExpiryDate_Doc ?? null,
      fireExt: r.fireExtinguisherExp_Doc ?? null,
      firstAidKit: r.firstAidKitDateExpiry_Doc ?? null,
      roadTax: r.roadTaxExpiryDate_Doc ?? null,
      insurance: r.insuranceExpiryDate_Doc ?? null,
    });
  }, [open, record]); // eslint-disable-line react-hooks/exhaustive-deps

  const setDoc = useCallback((key: DocKey, url: string | null) => {
    setDocsState((prev) => ({ ...prev, [key]: url }));
  }, []);

  // ── Step navigation ────────────────────────────────────────────────────────
  const goNext = async () => {
    try {
      await form.validateFields(STEP_FIELDS[step]);
      setStep((s) => s + 1);
    } catch {
      /* validation errors shown inline by Ant Design */
    }
  };

  const goBack = () => setStep((s) => s - 1);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    let rawValues: Record<string, any>;
    try {
      rawValues = await form.validateFields();
    } catch {
      return;
    }

    DATE_FIELDS_SUBMIT.forEach((f) => {
      if (rawValues[f] && dayjs.isDayjs(rawValues[f]))
        rawValues[f] = rawValues[f].toISOString();
    });

    if (isPending) {
      const r = record as any;
      try {
        await updateVehicleStage({
          id: r.id,
          // preserve non-editable record fields
          vehicle_Registration_No:
            r.vehicleNo ?? r.vehicle_Registration_No ?? "",
          transporterId: r.transporterId ?? null,
          locCode: r.locCode ?? null,
          // editable form fields → API names
          vehicleTypeCode: rawValues.vehicleTypeCode ?? null,
          vehicle_Status: rawValues.vehicleStatus ?? null,
          current_Status: rawValues.currentStatus ?? null,
          driverId: rawValues.driverId ?? null,
          make: rawValues.make ?? null,
          model: rawValues.model ?? null,
          chassis_No: rawValues.chassisNo ?? null,
          fuelTypeCode: r.fuelTypeCode ?? null,
          owner_Name: rawValues.ownerName ?? null,
          owner_Address: rawValues.ownerAddress ?? null,
          owner_Type: rawValues.owner_Type ?? null,
          isGpsInstalled: rawValues.isGpsInstalled ?? false,
          gpsProviderCode: rawValues.gpsProvider ?? null,
          gpsStatusCode: rawValues.gpsStatusCode ?? null,
          gps_Installation_Date: toISO(rawValues.gpsInstallDate),
          makeYear: toISO(rawValues.manufacturingDate),
          vehicle_Induction_Date: toISO(rawValues.inductionDate),
          registration_Exp_Date: toISO(rawValues.registrationDate),
          insurance_Expiry_Date: toISO(rawValues.insuranceExpiry),
          road_Tax_Validity_Expiry: roadTaxLifetime
            ? null
            : toISO(rawValues.roadTaxExpiry),
          puc_Expiry_Date: toISO(rawValues.pollutionExpiry),
          fitness_Expiry_Date: toISO(rawValues.fitnessExpiry),
          permit_Expiry_Date: toISO(rawValues.commercialExpiry),
          firstAid_Kid_Date: toISO(rawValues.firstAidKitDate),
          fire_Extinguisher_Date: toISO(rawValues.fireExtDate),
          remarks: rawValues.remarks ?? null,
          // documents
          registrationExpiryDate_Doc: docs.registration,
          permitExpiryDate_Doc: docs.permit,
          fitnessExpiryDate_Doc: docs.fitness,
          pucExpiryDate_Doc: docs.puc,
          fireExtinguisherExp_Doc: docs.fireExt,
          firstAidKitDateExpiry_Doc: docs.firstAidKit,
          roadTaxExpiryDate_Doc: docs.roadTax,
          insuranceExpiryDate_Doc: docs.insurance,
        }).unwrap();
        message.success("Vehicle updated successfully");
        onClose();
      } catch (e: any) {
        const apiErrors = e?.data?.errors;
        if (apiErrors && typeof apiErrors === "object") {
          const msgs = Object.entries(apiErrors)
            .map(([field, errs]) => `${field}: ${(errs as string[])[0]}`)
            .join("\n");
          message.error(
            <span style={{ whiteSpace: "pre-line" }}>{msgs}</span>,
            6,
          );
        } else {
          message.error(
            e?.data?.title ??
              e?.data?.message ??
              e?.message ??
              "Failed to update vehicle",
          );
        }
      }
    } else {
      await onSubmit({ ...rawValues, roadTaxLifetime, uploadedDocs: docs });
    }
  };

  const uploadedCount = Object.values(docs).filter(Boolean).length;
  const pct = Math.round((uploadedCount / DOC_KEYS.length) * 100);

  if (!record) return null;
  const r = record as any;

  // ── Step 0: Vehicle Info ───────────────────────────────────────────────────
  const vehicleInfoStep = (
    <div>
      <SectionHead text="Vehicle Details" />
      <Grid4>
        <FormRow
          label="Vehicle Type"
          name="vehicleTypeCode"
          required
          rules={[{ required: true, message: "Vehicle type is required" }]}
        >
          <Select
            size="small"
            style={S.select}
            placeholder="Select type"
            options={(vehicleTypeOptions as any) ?? []}
          />
        </FormRow>
        <FormRow label="Make" name="make">
          <Input size="small" style={S.input} placeholder="e.g. Tata" />
        </FormRow>
        <FormRow label="Model" name="model">
          <Input size="small" style={S.input} placeholder="e.g. Ultra" />
        </FormRow>
        <FormRow label="Chassis No." name="chassisNo">
          <Input size="small" style={S.input} placeholder="Chassis number" />
        </FormRow>
        <FormRow
          label="Fuel Type"
          name="fuelType"
          required
          rules={[{ required: true, message: "Fuel type is required" }]}
        >
          <Select
            size="small"
            style={S.select}
            placeholder="Select fuel"
            options={(fuelTypeOptions as any) ?? []}
          />
        </FormRow>
        <FormRow label="Assigned Driver" name="driverId">
          <Select
            size="small"
            style={S.select}
            placeholder="Select driver"
            options={(driverOptions as any) ?? []}
            allowClear
            showSearch
            optionFilterProp="label"
          />
        </FormRow>
      </Grid4>

      <SectionHead text="Ownership & Permit" />
      <Grid4>
        <FormRow label="Owner Name" name="ownerName">
          <Input size="small" style={S.input} placeholder="Owner name" />
        </FormRow>
        <FormRow label="Owner Address" name="ownerAddress">
          <Input size="small" style={S.input} placeholder="Address" />
        </FormRow>
        <FormRow
          label="Owner Type"
          name="vehicleOwnership"
          required
          rules={[{ required: true, message: "Owner type is required" }]}
        >
          <Select
            size="small"
            style={S.select}
            placeholder="Owned / Attached"
            options={OWNER_TYPE_OPTIONS}
          />
        </FormRow>
      </Grid4>

      <SectionHead text="GPS & Fixed Device" />
      <Grid4>
        {/* GPS Installed — Switch matches ComplianceAddVehicleModal */}
        <div>
          <label style={S.label}>GPS Installed</label>
          <Form.Item
            name="isGpsInstalled"
            valuePropName="checked"
            style={S.item}
          >
            <Switch size="small" checkedChildren="Yes" unCheckedChildren="No" />
          </Form.Item>
        </div>

        {/* GPS Provider — conditionally required */}
        <Form.Item
          shouldUpdate={(p, c) => p.isGpsInstalled !== c.isGpsInstalled}
          style={S.item}
        >
          {({ getFieldValue }) => (
            <FormRow
              label="GPS Provider"
              name="gpsProvider"
              required={!!getFieldValue("isGpsInstalled")}
              rules={
                getFieldValue("isGpsInstalled")
                  ? [
                      {
                        required: true,
                        message: "GPS provider required when GPS is installed",
                      },
                    ]
                  : []
              }
            >
              <Select
                size="small"
                style={S.select}
                placeholder="Select provider"
                options={GPS_PROVIDER_OPTIONS}
                allowClear
              />
            </FormRow>
          )}
        </Form.Item>

        {/* GPS Install Date — conditionally required */}
        <Form.Item
          shouldUpdate={(p, c) => p.isGpsInstalled !== c.isGpsInstalled}
          style={S.item}
        >
          {({ getFieldValue }) => (
            <FormRow
              label="GPS Install Date"
              name="gpsInstallDate"
              required={!!getFieldValue("isGpsInstalled")}
              rules={
                getFieldValue("isGpsInstalled")
                  ? [
                      {
                        required: true,
                        message: "GPS install date is required",
                      },
                    ]
                  : []
              }
            >
              <DatePicker {...DP} style={S.date} />
            </FormRow>
          )}
        </Form.Item>

        {/* <FormRow label="GPS Status" name="gpsStatusCode">
          <Select
            size="small"
            style={S.select}
            placeholder="Select GPS status"
            options={GPS_OPTIONS}
          />
        </FormRow> */}

        {/* <FormRow label="Fixed Device Date" name="fixedDeviceDate">
          <DatePicker {...DP} style={S.date} />
        </FormRow> */}
      </Grid4>
    </div>
  );

  // ── Step 1: Compliance Dates ───────────────────────────────────────────────
  const datesStep = (
    <div>
      <SectionHead text="Vehicle Dates" />
      <Grid4>
        <FormRow label="Manufacturing Date" name="manufacturingDate">
          <DatePicker
            {...DP}
            picker="year"
            placeholder="Select year"
            style={S.date}
          />
        </FormRow>
        <FormRow label="Induction Date" name="inductionDate">
          <DatePicker {...DP} style={S.date} />
        </FormRow>
        <FormRow label="Registration Expiry" name="registrationDate">
          <DatePicker {...DP} style={S.date} />
        </FormRow>
        <FormRow label="First Aid Kit Expiry" name="firstAidKitDate">
          <DatePicker {...DP} style={S.date} />
        </FormRow>
        <FormRow label="Fire Ext. Expiry" name="fireExtDate">
          <DatePicker {...DP} style={S.date} />
        </FormRow>
      </Grid4>

      <SectionHead text="Compliance Expiry Dates" />
      <Grid4>
        <FormRow label="Permit Expiry" name="commercialExpiry">
          <DatePicker {...DP} style={S.date} />
        </FormRow>
        <FormRow label="Insurance Expiry" name="insuranceExpiry">
          <DatePicker {...DP} style={S.date} />
        </FormRow>
        {/* Road Tax with Lifetime checkbox */}
        <div>
          <label style={S.label}>Road Tax Expiry</label>
          <Form.Item name="roadTaxExpiry" style={S.item}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <DatePicker
                {...DP}
                style={{ ...S.date, flex: 1, width: undefined }}
                disabled={roadTaxLifetime}
              />
              {/* <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "#6b7280",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <Checkbox
                  checked={roadTaxLifetime}
                  onChange={(e) => setRoadTaxLifetime(e.target.checked)}
                />
                Lifetime
              </label> */}
            </div>
          </Form.Item>
        </div>
        <FormRow label="Pollution (PUC) Expiry" name="pollutionExpiry">
          <DatePicker {...DP} style={S.date} />
        </FormRow>
        <FormRow label="Fitness Expiry" name="fitnessExpiry">
          <DatePicker {...DP} style={S.date} />
        </FormRow>
        {/* <FormRow label="Service Date" name="vehicleServiceDate">
          <DatePicker {...DP} style={S.date} />
        </FormRow> */}
      </Grid4>

      <SectionHead text="Status & Remarks" />
      <Grid4>
        <FormRow
          label="Vehicle Status"
          name="vehicleStatus"
          required
          rules={[{ required: true, message: "Vehicle status is required" }]}
        >
          <Select
            size="small"
            style={S.select}
            placeholder="Status"
            options={(vehicleStatusOptions as any) ?? []}
          />
        </FormRow>
        <FormRow
          label="Current Status"
          name="currentStatus"
          required
          rules={[{ required: true, message: "Current status is required" }]}
        >
          <Select
            size="small"
            style={S.select}
            placeholder="Current status"
            options={(currentStatusOptions as any) ?? []}
          />
        </FormRow>
        <div style={{ gridColumn: "span 2" }}>
          <FormRow label="Remarks" name="remarks">
            <Input size="small" style={S.input} placeholder="Remarks" />
          </FormRow>
        </div>
      </Grid4>
    </div>
  );

  // ── Step 2: Documents ─────────────────────────────────────────────────────
  // const DOC_LIST: { key: DocKey; label: string; expiry?: string }[] = [
  //   {
  //     key: "registration",
  //     label: "Registration",
  //     expiry: fmt(r.registration_Exp_Date),
  //   },
  //   { key: "insurance", label: "Insurance", expiry: fmt(r.insuranceExpDate) },
  //   {
  //     key: "roadTax",
  //     label: "Road Tax",
  //     expiry: roadTaxLifetime ? "Lifetime" : fmt(r.roadTaxExpDate),
  //   },
  //   {
  //     key: "commercial",
  //     label: "Commercial / Permit",
  //     expiry: fmt(r.permitExpDate),
  //   },
  //   { key: "fitness", label: "Fitness", expiry: fmt(r.fitnessExpDate) },
  //   { key: "pollution", label: "Pollution (PUC)", expiry: fmt(r.pucExpDate) },
  //   { key: "service", label: "Service", expiry: undefined },
  //   { key: "addDoc", label: "Additional", expiry: undefined },
  // ];

  const DOC_LIST: { key: DocKey; label: string; expiry?: string }[] = [
    {
      key: "registration",
      label: "Registration Doc",
      expiry: fmt(r.registration_Exp_Date),
    },
    {
      key: "permit",
      label: "Permit Doc",
      expiry: fmt(r.permit_Expiry_Date ?? r.permitExpDate),
    },
    {
      key: "fitness",
      label: "Fitness Doc",
      expiry: fmt(r.fitness_Expiry_Date ?? r.fitnessExpDate),
    },
    {
      key: "puc",
      label: "PUC Doc",
      expiry: fmt(r.puc_Expiry_Date ?? r.pucExpDate),
    },
    {
      key: "fireExt",
      label: "Fire Extinguisher Doc",
      expiry: fmt(r.fire_Extinguisher_Date),
    },
    {
      key: "firstAidKit",
      label: "First Aid Kit Doc",
      expiry: fmt(r.firstAid_Kid_Date),
    },
    {
      key: "roadTax",
      label: "Road Tax Doc",
      expiry: roadTaxLifetime
        ? "Lifetime"
        : fmt(r.road_Tax_Validity_Expiry ?? r.roadTaxExpDate),
    },
    {
      key: "insurance",
      label: "Insurance Doc",
      expiry: fmt(r.insurance_Expiry_Date ?? r.insuranceExpDate),
    },
  ];

  const documentsStep = (
    <div>
      {/* Upload progress */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 14px",
          background: "#f9fafb",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 12, color: "#6b7280" }}>
          <b style={{ color: "#1f2937" }}>{uploadedCount}</b> /{" "}
          {DOC_KEYS.length} documents uploaded
        </span>
        <div
          style={{
            flex: 1,
            height: 6,
            background: "#e5e7eb",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: pct === 100 ? "#22c55e" : "#3E9B73",
              borderRadius: 99,
              transition: "width .3s ease",
            }}
          />
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: pct === 100 ? "#16a34a" : "#3E9B73",
          }}
        >
          {pct}%
        </span>
      </div>

      <SectionHead text="Required Documents" badge="Must upload" />
      <Grid2>
        {DOC_LIST.filter(
          (d) => d.key !== "fireExt" && d.key !== "firstAidKit",
        ).map(({ key, label, expiry }) => (
          <DocCard
            key={key}
            label={label}
            expiryLabel={expiry}
            value={docs[key]}
            onChange={(url) => setDoc(key, url)}
            required={true}
          />
        ))}
      </Grid2>
      <SectionHead text="Optional Documents" />
      <Grid2>
        {DOC_LIST.filter(
          (d) => d.key === "fireExt" || d.key === "firstAidKit",
        ).map(({ key, label, expiry }) => (
          <DocCard
            key={key}
            label={`${label} (Optional)`}
            expiryLabel={expiry}
            value={docs[key]}
            onChange={(url) => setDoc(key, url)}
          />
        ))}
      </Grid2>

      {serverErrors && serverErrors.length > 0 && (
        <div style={{ marginTop: spacing.sm }}>
          {serverErrors.map((e, i) => (
            <Alert
              key={i}
              type="error"
              message={e.message}
              style={{ marginBottom: 4, fontSize: font.sizeSm }}
            />
          ))}
        </div>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  const footerHint = [
    "Update vehicle details, ownership and GPS info",
    "Update compliance and expiry dates",
    `${uploadedCount} of ${DOC_KEYS.length} documents uploaded`,
  ][step];

  const nextLabel =
    step === 0 ? "Next — Compliance Dates →" : "Next — Documents →";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={null}
      footer={null}
      closable={false}
      centered
      width="min(1100px, 96vw)"
      destroyOnClose
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "min(86vh, 800px)",
          background: "#fff",
          borderRadius: radius.xl,
          overflow: "hidden",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `0 ${spacing.xl}px`,
            height: 62,
            flexShrink: 0,
            borderBottom: `1px solid ${color.border}`,
            background: "#fafafa",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: color.textPrimary,
              }}
            >
              {isPending ? "Edit Pending Vehicle" : "Edit Vehicle"}
            </div>
            <div
              style={{ fontSize: 12, color: color.textSecondary, marginTop: 1 }}
            >
              {r.vehicleNo}
              {r.vehicleType ? ` • ${String(r.vehicleType)}` : ""}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: radius.md,
              border: `1px solid ${color.border}`,
              background: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: color.textSecondary,
            }}
          >
            <XIcon size={14} />
          </button>
        </div>

        {/* ── Steps strip ────────────────────────────────────────────────── */}
        <div
          style={{
            padding: `${spacing.sm}px ${spacing.xl}px`,
            borderBottom: "1px solid #f3f4f6",
            background: "#fafafa",
            flexShrink: 0,
          }}
        >
          <Steps
            current={step}
            size="small"
            items={[
              { title: "Vehicle Info" },
              { title: "Compliance Dates" },
              { title: "Documents" },
            ]}
          />
        </div>

        {/* ── Body (scrollable) ───────────────────────────────────────────── */}
        <Form
          form={form}
          layout="vertical"
          size="small"
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: `${spacing.sm}px ${spacing.xl}px`,
            }}
          >
            <div style={{ display: step === 0 ? undefined : "none" }}>
              {vehicleInfoStep}
            </div>
            <div style={{ display: step === 1 ? undefined : "none" }}>
              {datesStep}
            </div>
            <div style={{ display: step === 2 ? undefined : "none" }}>
              {documentsStep}
            </div>
          </div>
        </Form>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.sm,
            padding: `0 ${spacing.xl}px`,
            height: 56,
            flexShrink: 0,
            borderTop: `1px solid ${color.border}`,
            background: "#fafafa",
          }}
        >
          <span style={{ fontSize: 12, color: color.textSecondary }}>
            {footerHint}
          </span>
          <div style={{ display: "flex", gap: spacing.sm }}>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: "7px 20px",
                borderRadius: radius.md,
                border: `1px solid ${color.border}`,
                background: "#fff",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: font.sizeSm,
                fontFamily: "inherit",
                color: color.textPrimary,
              }}
            >
              Cancel
            </button>

            {/* ← Back — visible on steps 1 and 2 */}
            {step > 0 && (
              <button
                onClick={goBack}
                disabled={isSubmitting}
                style={{
                  padding: "7px 18px",
                  borderRadius: radius.md,
                  border: `1px solid ${color.primary}`,
                  background: "#fff",
                  color: color.primary,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: font.sizeSm,
                  fontFamily: "inherit",
                }}
              >
                ← Back
              </button>
            )}

            {/* Next or Save Changes */}
            {step < TOTAL_STEPS - 1 ? (
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
                }}
              >
                {nextLabel}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  padding: "7px 26px",
                  borderRadius: radius.md,
                  border: "none",
                  background: isSubmitting ? "#9ca3af" : color.primary,
                  color: "#fff",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontSize: font.sizeSm,
                  fontFamily: "inherit",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {isSubmitting && <Spin size="small" />}
                {isSubmitting ? "Saving…" : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
