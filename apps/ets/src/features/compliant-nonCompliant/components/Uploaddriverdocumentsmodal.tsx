/**
 * UploadDriverDocumentsModal
 *
 * Edit/update a pending driver stage (PUT /api/v1/DriverStages/{id}).
 * Three steps — Driver Info · Address · Documents — same flow as ComplianceAddDriverModal.
 * Step navigation: Next → Next → Save Changes. Each Next validates only current step fields.
 */
import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Select,
  Spin,
  Steps,
  Switch,
  Upload,
  message,
} from "antd";
import dayjs from "dayjs";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../constants/tokens";
import { useLookups } from "../../lookups/hooks/useLookups";
import { useFileUpload } from "../../../shared/customHooks/useFileUpload";
import { useUpdateDriverStageMutation } from "../services/DrivercomplianceApi";

// ─── Static options ───────────────────────────────────────────────────────────
const GENDER_OPTIONS = ["Male", "Female", "Other"].map((x) => ({
  label: x,
  value: x,
}));
const BLOOD_GROUP_OPTIONS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "O+",
  "O-",
  "AB+",
  "AB-",
].map((x) => ({ label: x, value: x }));
const DRIVER_TYPE_OPTIONS = ["Permanent", "Contract", "Daily Wages"].map(
  (x) => ({ label: x, value: x }),
);
const TRAINING_STATUS_OPTIONS = [
  "Pending",
  "In Progress",
  "Completed",
  "Failed",
].map((x) => ({ label: x, value: x }));
// const LICENSE_TYPE_OPTIONS = ["LMV", "HMV", "HGMV", "TRANS", "LMV-TR"].map(
//   (x) => ({ label: x, value: x }),
// );
const CURRENT_STATUS_OPTIONS = [
  { label: "Active", value: 1 },
  { label: "Inactive", value: 0 },
];
const GOVT_ID_OPTIONS = [
  { label: "Aadhaar Card", value: 1 },
  { label: "PAN Card", value: 2 },
  { label: "Passport", value: 3 },
  { label: "Voter ID", value: 4 },
  { label: "Driving License", value: 5 },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  label: {
    fontSize: 11,
    fontWeight: 500,
    marginBottom: 2,
    color: "#374151",
    display: "block",
  } as React.CSSProperties,
  input: { height: 28, fontSize: 12 } as React.CSSProperties,
  select: { width: "100%", fontSize: 12 } as React.CSSProperties,
  date: { width: "100%", height: 28, fontSize: 12 } as React.CSSProperties,
  item: { margin: 0 } as React.CSSProperties,
};

const G5: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: "6px 12px",
};
const G6: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: "6px 12px",
};
const G4: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "6px 12px",
};
const G2: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "8px 14px",
};

const sectionCard: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "8px 12px",
  marginBottom: 6,
  background: "#fff",
};
const sectionTitle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "#1B4332",
  borderBottom: "1px solid #e5e7eb",
  paddingBottom: 4,
  marginBottom: 7,
};
const DATE_PICKER_PROPS = {
  size: "small" as const,
  format: "DD/MM/YYYY",
  style: S.date,
  getPopupContainer: () => document.body,
};

// ─── Validators ───────────────────────────────────────────────────────────────
const requiredDate = (label?: string) => ({
  validator(_: any, value: any) {
    if (value) return Promise.resolve();
    return Promise.reject(
      new Error(label ? `${label} is required` : "Required"),
    );
  },
});
const requiredSelect = (label?: string) => ({
  validator(_: any, value: any) {
    if (value !== undefined && value !== null) return Promise.resolve();
    return Promise.reject(
      new Error(label ? `${label} is required` : "Required"),
    );
  },
});

// ─── Step field lists (used for per-step validation) ─────────────────────────
const STEP_FIELDS: string[][] = [
  // Step 0 — Driver Info
  [
    "driverName",
    "dob",
    "gender",
    "bloodGroup",
    "mobileNo",
    "licenseNo",
    "licenseType",
    "licenseIssueDate",
    "licenseExpDate",
    "inductionDate",
    "driverLicenceAuthority",
    "govtIdProof",
    "driverType",
    "trainingStatus",
    "lastTrainingDate",
    "currentStatus",
    "policeVerificationExpDate",
    "lastInternalVerificationDate",
  ],
  // Step 1 — Address
  ["presentAddress", "permanentAddress"],
  // Step 2 — Documents (validated manually)
  [],
];

// ─── Icons ────────────────────────────────────────────────────────────────────
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

// ─── Field wrapper ────────────────────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  name: string | string[];
  required?: boolean;
  rules?: any[];
  span?: number;
  children: React.ReactNode;
}> = ({ label, name, required, rules = [], span = 1, children }) => (
  <div style={{ gridColumn: `span ${span}` }}>
    <label style={S.label}>
      {label}
      {required && <span style={{ color: "#ef4444" }}> *</span>}
    </label>
    <Form.Item name={name} rules={rules} style={S.item}>
      {children}
    </Form.Item>
  </div>
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
      margin: "10px 0 6px",
    }}
  >
    <span
      style={{
        fontSize: 10,
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

// ─── Vendor + Office banner ───────────────────────────────────────────────────
const InfoBanner: React.FC<{
  vendorLabel?: string;
  officeLabel?: string;
  locCode?: number;
}> = ({ vendorLabel, officeLabel, locCode }) => {
  const officeName = officeLabel ?? (locCode ? `Office ${locCode}` : null);
  if (!vendorLabel && !officeName) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
        padding: "8px 24px",
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
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#3E9B73",
              flexShrink: 0,
            }}
          />
          Vendor:- {vendorLabel}
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
          📍 Office:- {officeName}
        </span>
      )}
    </div>
  );
};

// ─── Document upload card ─────────────────────────────────────────────────────
const DocCard: React.FC<{
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
}> = ({ label, value, onChange }) => {
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
        </span>
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

// ─── Document state ───────────────────────────────────────────────────────────
type DocKey =
  | "profileImageDoc"
  | "licenseExpDoc"
  | "policeVerificationExpDoc"
  | "govtIdDoc"
  | "lastTrainingDoc";
type DocState = Record<DocKey, string | null>;

const INITIAL_DOCS: DocState = {
  profileImageDoc: null,
  licenseExpDoc: null,
  policeVerificationExpDoc: null,
  govtIdDoc: null,
  lastTrainingDoc: null,
};

const DOC_LIST: { key: DocKey; label: string }[] = [
  { key: "profileImageDoc", label: "Profile Photo" },
  { key: "licenseExpDoc", label: "Driving License" },
  { key: "policeVerificationExpDoc", label: "Police Verification" },
  { key: "govtIdDoc", label: "Government ID Proof" },
  { key: "lastTrainingDoc", label: "Training Certificate" },
];

// ─── Date fields needing dayjs → ISO ─────────────────────────────────────────
const DATE_FIELDS = [
  "dob",
  "inductionDate",
  "licenseIssueDate",
  "licenseExpDate",
  "policeVerificationExpDate",
  "lastInternalVerificationDate",
  "externalVerificationExpDate",
  "lastTrainingDate",
  "privateBGVExpDate",
] as const;

const TOTAL_STEPS = 3;

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  record: any | null;
  locCode?: number;
  vendorLabel?: string;
  transporterId?: number;
  onSuccess: () => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const UploadDriverDocumentsModal: React.FC<Props> = ({
  open,
  onClose,
  record,
  locCode,
  transporterId,
  vendorLabel,
  onSuccess,
}) => {
  console.log("record is UploadDriverDocumentsModal", record);
  const { Modal } = useUILibrary();
  const { color, spacing, radius, font } = useTokens();
  const { locationOptions, currentStatusOptions } = useLookups({
    only: ["locationOptions", "currentStatusOptions"],
  }) as any;
  const [form] = Form.useForm();
  const [docs, setDocsState] = useState<DocState>({ ...INITIAL_DOCS });
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updateDriverStage] = useUpdateDriverStageMutation();

  const officeLabel: string | undefined = (locationOptions as any)?.find(
    (o: any) => o.value === locCode,
  )?.label;

  const setDoc = useCallback((key: DocKey, url: string | null) => {
    setDocsState((prev) => ({ ...prev, [key]: url }));
  }, []);

  // ── Pre-populate ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || !record) return;
    const r = record as any;
    form.resetFields();
    setStep(0);
    setDocsState({ ...INITIAL_DOCS });

    form.setFieldsValue({
      driverName: r.driverName ?? r.driver_Name ?? "",
      fatherName: r.fatherName ?? "",
      gender: r.gender ?? undefined,
      dob: r.dob ? dayjs(r.dob) : undefined,
      bloodGroup: r.bloodGroup ?? undefined,
      mobileNo: r.mobileNo ?? r.mobile_No ?? "",
      alternateMobileNo: r.alternateMobileNo ?? "",
      licenseNo: r.licenseNo ?? r.license_No ?? "",
      licenseType: r.licenseType ?? undefined,
      licenseIssueDate: r.licenseIssueDate
        ? dayjs(r.licenseIssueDate)
        : undefined,
      licenseExpDate: r.licenseExpDate ? dayjs(r.licenseExpDate) : undefined,
      inductionDate: r.inductionDate ? dayjs(r.inductionDate) : undefined,
      driverLicenceAuthority: r.driverLicenceAuthority ?? "",
      govtIdProof: r.govtIdProof ?? undefined,
      driverType: r.driverType ?? undefined,
      trainingStatus: r.trainingStatus ?? undefined,
      lastTrainingDate: r.lastTrainingDate
        ? dayjs(r.lastTrainingDate)
        : undefined,
      privateBGVExpDate: r.privateBGVExpDate
        ? dayjs(r.privateBGVExpDate)
        : undefined,
      currentStatus: r.currentStatus ?? undefined,
      policeVerification: r.policeVerification ?? false,
      policeVerificationExpDate: r.policeVerificationExpDate
        ? dayjs(r.policeVerificationExpDate)
        : undefined,
      lastInternalVerificationDate: r.lastInternalVerificationDate
        ? dayjs(r.lastInternalVerificationDate)
        : undefined,
      externalVerificationExpDate: r.externalVerificationExpDate
        ? dayjs(r.externalVerificationExpDate)
        : undefined,
      externalVerificationAgency: r.externalVerificationAgency ?? "",
      remarks: r.remarks ?? "",
      presentAddress: r.presentAddress ?? "",
      permanentAddress: r.permanentAddress ?? "",
    });

    setDocsState({
      profileImageDoc: r.profileImageDoc ?? null,
      licenseExpDoc: r.licenseExpDoc ?? null,
      policeVerificationExpDoc: r.policeVerificationExpDoc ?? null,
      govtIdDoc: r.govtIdDoc ?? null,
      lastTrainingDoc: r.lastTrainingDoc ?? null,
    });
  }, [open, record, form]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const goNext = async () => {
    try {
      await form.validateFields(STEP_FIELDS[step]);
      setStep((s) => s + 1);
    } catch {
      // validation errors shown inline
    }
  };

  const goBack = () => setStep((s) => s - 1);

  const handleClose = () => {
    form.resetFields();
    setStep(0);
    setDocsState({ ...INITIAL_DOCS });
    onClose();
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!docs.govtIdDoc) {
      message.error("Government ID document is required");
      return;
    }

    let values: Record<string, any>;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    // When "same as present" is ticked, mirror the value so the API gets it
    if (values.sameAsPresentAddress) {
      values.permanentAddress = values.presentAddress ?? "";
    }

    setIsSubmitting(true);
    try {
      const r = record as any;

      DATE_FIELDS.forEach((f) => {
        if (values[f] && dayjs.isDayjs(values[f]))
          values[f] = (values[f] as any).toISOString();
      });

      await updateDriverStage({
        id: r.id ?? r.driver_Id ?? "",
        numericId: typeof r.numericId === "number" ? r.numericId : undefined,
        locCode: locCode ?? r.locCode ?? r.locationCode ?? null,
        transporterId: transporterId ?? r.transporterId ?? null,
        active: true,
        ...values,
        ...docs,
      } as any).unwrap();

      message.success("Driver updated successfully");
      onSuccess();
    } catch (e: any) {
      console.error("updateDriverStage failed", e);
      const apiErrors = e?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const messages = Object.entries(apiErrors)
          .map(([field, msgs]) => `${field}: ${(msgs as string[])[0]}`)
          .join("\n");
        message.error(
          <span style={{ whiteSpace: "pre-line" }}>{messages}</span>,
          6,
        );
      } else {
        message.error(
          e?.data?.title ??
            e?.data?.message ??
            e?.message ??
            "Failed to update driver",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadedCount = Object.values(docs).filter(Boolean).length;
  const pct = Math.round((uploadedCount / DOC_LIST.length) * 100);

  if (!record) return null;
  const r = record as any;

  // ══ STEP 0 — Driver Info ══════════════════════════════════════════════════
  const stepInfo = (
    <div
      style={{
        overflowY: "auto",
        maxHeight: "calc(86vh - 240px)",
        padding: "4px 0",
      }}
    >
      {/* Identity */}
      <div style={sectionCard}>
        <div style={sectionTitle}>Identity</div>
        <div style={G5}>
          <Field
            label="Driver Name"
            name="driverName"
            required
            rules={[{ required: true, message: "Driver name is required" }]}
            span={2}
          >
            <Input style={S.input} placeholder="Full name" />
          </Field>
          <Field label="Father Name" name="fatherName">
            <Input style={S.input} placeholder="Father's name" />
          </Field>
          <Field
            label="Date of Birth"
            name="dob"
            required
            rules={[requiredDate("Date of Birth")]}
          >
            <DatePicker {...DATE_PICKER_PROPS} placeholder="DD/MM/YYYY" />
          </Field>
          <Field
            label="Gender"
            name="gender"
            required
            rules={[requiredSelect("Gender")]}
          >
            <Select
              style={S.select}
              size="small"
              placeholder="Select"
              options={GENDER_OPTIONS}
            />
          </Field>
          <Field
            label="Blood Group"
            name="bloodGroup"
            required
            rules={[requiredSelect("Blood Group")]}
          >
            <Select
              style={S.select}
              size="small"
              placeholder="Select"
              options={BLOOD_GROUP_OPTIONS}
            />
          </Field>
          <Field
            label="Mobile No."
            name="mobileNo"
            required
            rules={[{ required: true, message: "Mobile is required" }]}
          >
            <Input style={S.input} placeholder="9876543210" maxLength={10} />
          </Field>
          <Field label="Alternate Mobile" name="alternateMobileNo">
            <Input style={S.input} placeholder="Optional" maxLength={10} />
          </Field>
          <div />
          <div />
        </div>
      </div>

      {/* License & ID */}
      <div style={sectionCard}>
        <div style={sectionTitle}>License &amp; ID</div>
        <div style={G5}>
          <Field
            label="License No."
            name="licenseNo"
            required
            rules={[{ required: true, message: "License No. is required" }]}
          >
            <Input style={S.input} placeholder="DL01202312345" />
          </Field>

          {/* <Field
            label="License Type"
            name="licenseType"
            required
            rules={[requiredSelect("License Type")]}
          >
            <Select
              style={S.select}
              size="small"
              placeholder="Select"
              options={LICENSE_TYPE_OPTIONS}
            />

            
          </Field> */}
          <Field
            label="License Issue Date"
            name="licenseIssueDate"
            // required
            // rules={[requiredDate("License Issue Date")]}
          >
            <DatePicker {...DATE_PICKER_PROPS} placeholder="DD/MM/YYYY" />
          </Field>
          <Field
            label="Expiry Date"
            name="licenseExpDate"
            required
            rules={[requiredDate("License Expiry")]}
          >
            <DatePicker {...DATE_PICKER_PROPS} placeholder="DD/MM/YYYY" />
          </Field>
          <Field
            label="Induction Date"
            name="inductionDate"
            required
            rules={[requiredDate("Induction Date")]}
          >
            <DatePicker {...DATE_PICKER_PROPS} placeholder="DD/MM/YYYY" />
          </Field>
          <Field
            label="Licence Authority"
            name="driverLicenceAuthority"
            required
            rules={[
              { required: true, message: "Licence authority is required" },
            ]}
            span={2}
          >
            <Input style={S.input} placeholder="e.g. Delhi RTO" />
          </Field>
          <Field
            label="Govt ID Type"
            name="govtIdProof"
            required
            rules={[requiredSelect("Govt ID Type")]}
          >
            <Select
              style={S.select}
              size="small"
              placeholder="Select"
              options={GOVT_ID_OPTIONS}
            />
          </Field>
          <div />
          <div />
        </div>
      </div>

      {/* Employment & Compliance */}
      <div style={sectionCard}>
        <div style={sectionTitle}>Employment &amp; Compliance</div>
        <div style={G6}>
          <Field
            label="Driver Type"
            name="driverType"
            required
            rules={[requiredSelect("Driver Type")]}
          >
            <Select
              style={S.select}
              size="small"
              placeholder="Select"
              options={DRIVER_TYPE_OPTIONS}
            />
          </Field>
          <Field
            label="Training Status"
            name="trainingStatus"
            // required
            // rules={[requiredSelect("Training Status")]}
          >
            <Select
              style={S.select}
              size="small"
              placeholder="Select"
              options={TRAINING_STATUS_OPTIONS}
            />
          </Field>
          <Field
            label="Last Training Date"
            name="lastTrainingDate"
            // required
            // rules={[requiredDate("Last Training Date")]}
          >
            <DatePicker {...DATE_PICKER_PROPS} placeholder="DD/MM/YYYY" />
          </Field>
          <Field label="BGV Expiry" name="privateBGVExpDate">
            <DatePicker {...DATE_PICKER_PROPS} placeholder="DD/MM/YYYY" />
          </Field>
          <Field
            label="Driver Status"
            name="currentStatus"
            required
            rules={[requiredSelect("Driver Status")]}
          >
            <Select
              style={S.select}
              size="small"
              placeholder="Select"
              options={currentStatusOptions ?? CURRENT_STATUS_OPTIONS}
            />
          </Field>
          <div>
            <label style={S.label}>Police Verified</label>
            <Form.Item
              name="policeVerification"
              valuePropName="checked"
              style={{ ...S.item, paddingTop: 4 }}
            >
              <Switch
                size="small"
                checkedChildren="Yes"
                unCheckedChildren="No"
              />
            </Form.Item>
          </div>
          <Field
            label="Police Verif. Expiry"
            name="policeVerificationExpDate"

            // rules={[requiredDate("Police Verification Expiry")]}
          >
            <DatePicker {...DATE_PICKER_PROPS} placeholder="DD/MM/YYYY" />
          </Field>
          <Field
            label="Last Internal Verif."
            name="lastInternalVerificationDate"
            // required
            // rules={[requiredDate("Last Internal Verification")]}
          >
            <DatePicker {...DATE_PICKER_PROPS} placeholder="DD/MM/YYYY" />
          </Field>
          <Field label="Ext. Verif. Expiry" name="externalVerificationExpDate">
            <DatePicker {...DATE_PICKER_PROPS} placeholder="DD/MM/YYYY" />
          </Field>
          <Field label="External Agency" name="externalVerificationAgency">
            <Input style={S.input} placeholder="Agency name" />
          </Field>
          <Field label="Remarks" name="remarks" span={2}>
            <Input style={S.input} placeholder="Optional" />
          </Field>
        </div>
      </div>
    </div>
  );

  // ══ STEP 1 — Address ══════════════════════════════════════════════════════
  const stepAddress = (
    <div
      style={{
        overflowY: "auto",
        maxHeight: "calc(86vh - 240px)",
        padding: "4px 0",
      }}
    >
      <div style={sectionCard}>
        <div style={sectionTitle}>Present Address</div>
        <div style={G4}>
          <Field label="Street / Lane" name="presentAddress" span={2}>
            <Input style={S.input} placeholder="House no., Street name" />
          </Field>
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <Form.Item
          name="sameAsPresentAddress"
          valuePropName="checked"
          style={S.item}
        >
          <Checkbox>
            <span style={{ fontSize: 11, color: "#374151" }}>
              Permanent address same as present address
            </span>
          </Checkbox>
        </Form.Item>
      </div>

      <Form.Item
        shouldUpdate={(p, c) =>
          p.sameAsPresentAddress !== c.sameAsPresentAddress
        }
        style={S.item}
      >
        {({ getFieldValue }) =>
          !getFieldValue("sameAsPresentAddress") && (
            <div style={sectionCard}>
              <div style={sectionTitle}>Permanent Address</div>
              <div style={G4}>
                <Field
                  label="Street / Lane"
                  name="permanentAddress"
                  span={2}
                  required
                  rules={[
                    {
                      required: true,
                      message: "Permanent address is required",
                    },
                  ]}
                >
                  <Input style={S.input} placeholder="House no., Street name" />
                </Field>
              </div>
            </div>
          )
        }
      </Form.Item>
    </div>
  );

  // ══ STEP 2 — Documents ════════════════════════════════════════════════════
  const stepDocs = (
    <div
      style={{
        overflowY: "auto",
        maxHeight: "calc(86vh - 240px)",
        padding: "4px 0",
      }}
    >
      {/* Progress strip */}
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
          {DOC_LIST.length} documents uploaded
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

      <SectionHead text="Driver Documents" badge="Recommended" />
      <div style={G2}>
        {DOC_LIST.slice(0, 2).map(({ key, label }) => (
          <DocCard
            key={key}
            label={label}
            value={docs[key]}
            onChange={(url) => setDoc(key, url)}
          />
        ))}
      </div>

      <SectionHead text="Compliance Documents" />
      <div style={G2}>
        {DOC_LIST.slice(2).map(({ key, label }) => (
          <DocCard
            key={key}
            label={label}
            value={docs[key]}
            onChange={(url) => setDoc(key, url)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={handleClose}
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
          height: "min(86vh, 820px)",
          background: "#fff",
          borderRadius: radius.xl,
          overflow: "hidden",
        }}
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
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
              Edit Driver — Step {step + 1} of {TOTAL_STEPS}
            </div>
            <div
              style={{ fontSize: 12, color: color.textSecondary, marginTop: 1 }}
            >
              {r.driverName ?? r.driver_Name ?? "—"} •{" "}
              {r.licenseNo ?? r.license_No ?? "—"}
            </div>
          </div>
          <button
            onClick={handleClose}
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

        {/* ── Step indicator ─────────────────────────────────────────────── */}
        <div
          style={{
            padding: `10px ${spacing.xl}px`,
            borderBottom: "1px solid #f3f4f6",
            flexShrink: 0,
          }}
        >
          <Steps
            current={step}
            size="small"
            items={[
              { title: "Driver Details" },
              { title: "Address" },
              { title: "Documents" },
            ]}
          />
        </div>

        {/* ── Vendor + Office banner ─────────────────────────────────────── */}
        <InfoBanner
          vendorLabel={vendorLabel}
          officeLabel={officeLabel}
          locCode={locCode}
        />

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <Form
          form={form}
          layout="vertical"
          size="small"
          style={{
            flex: 1,
            overflow: "hidden",
            padding: `${spacing.xs}px ${spacing.xl}px`,
          }}
        >
          <div style={{ display: step === 0 ? "block" : "none" }}>
            {stepInfo}
          </div>
          <div style={{ display: step === 1 ? "block" : "none" }}>
            {stepAddress}
          </div>
          <div style={{ display: step === 2 ? "block" : "none" }}>
            {stepDocs}
          </div>
        </Form>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: spacing.sm,
            padding: `0 ${spacing.xl}px`,
            height: 56,
            flexShrink: 0,
            borderTop: `1px solid ${color.border}`,
            background: "#fafafa",
          }}
        >
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            style={{
              padding: "6px 16px",
              borderRadius: radius.md,
              border: `1px solid ${color.border}`,
              background: "#fff",
              cursor: "pointer",
              fontSize: font.sizeSm,
              fontFamily: "inherit",
              color: color.textPrimary,
            }}
          >
            Cancel
          </button>

          {step > 0 && (
            <button
              onClick={goBack}
              disabled={isSubmitting}
              style={{
                padding: "6px 16px",
                borderRadius: radius.md,
                border: `1px solid ${color.primary}`,
                background: "#fff",
                color: color.primary,
                cursor: "pointer",
                fontSize: font.sizeSm,
                fontFamily: "inherit",
              }}
            >
              ← Back
            </button>
          )}

          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={goNext}
              style={{
                padding: "6px 20px",
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
              {step === 0 ? "Next — Address →" : "Next — Documents →"}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                padding: "6px 20px",
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
    </Modal>
  );
};
