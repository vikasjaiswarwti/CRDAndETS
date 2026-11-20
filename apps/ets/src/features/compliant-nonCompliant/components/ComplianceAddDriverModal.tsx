/**
 * ComplianceAddDriverModal — 3-step driver form
 *
 * Vendor name + office name shown as a persistent badge strip above all form steps.
 * locCode is resolved to an office label via locationOptions (useLookups).
 * The Office select field is removed; locCode is injected via form.setFieldValue on open.
 */
import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
  Switch,
  Upload,
  Button,
  Steps,
  Spin,
  Tooltip,
} from "antd";
import { useFileUpload } from "../../../shared/customHooks/useFileUpload";
import { useLookups } from "../../lookups/hooks/useLookups";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../constants/tokens";
import {
  useAddDriverStageForm,
  DRIVER_DOC_FIELDS,
  type DriverDocState,
} from "../hooks/useAddDriverStageForm";
import { v, normalize } from "../utils/Formvalidation";

import { useIsMobile } from "../../../shared/customHooks/useIsMobile";

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

// ─── Field wrapper ────────────────────────────────────────────────────────────
interface FieldProps {
  label: string;
  name: string | string[];
  required?: boolean;
  rules?: any[];
  span?: number;
  tooltip?: string;
  children: React.ReactNode;
  normalize?: (v: any) => any;
}
// const Field: React.FC<FieldProps> = ({
//   label,
//   name,
//   required,
//   rules = [],
//   span = 1,
//   tooltip,
//   children,
//   normalize: norm,
// }) => (
//   <div style={{ gridColumn: `span ${span}` }}>
//     <label style={S.label}>
//       {label}
//       {required && <span style={{ color: "#ef4444" }}> *</span>}
//       {tooltip && (
//         <Tooltip title={tooltip}>
//           <span
//             style={{
//               marginLeft: 4,
//               color: "#9ca3af",
//               cursor: "help",
//               fontSize: 10,
//             }}
//           >
//             ⓘ
//           </span>
//         </Tooltip>
//       )}
//     </label>
//     <Form.Item
//       name={name}
//       rules={rules}
//       style={S.item}
//       normalize={norm}
//       validateTrigger="onChange"
//     >
//       {children}
//     </Form.Item>
//   </div>
// );

// ─── Persistent info banner — vendor + office pills, shown on every step ──────

const Field: React.FC<FieldProps> = ({
  label,
  name,
  required,
  rules = [],
  span = 1,
  tooltip,
  children,
  normalize: norm,
}) => {
  const isMobile = useIsMobile();
  const effectiveSpan = isMobile ? 1 : span;

  return (
    <div style={{ gridColumn: `span ${effectiveSpan}` }}>
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
        validateTrigger="onChange"
      >
        {children}
      </Form.Item>
    </div>
  );
};

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
          📍Office:- {officeName}
        </span>
      )}
    </div>
  );
};

// ─── Document upload row ──────────────────────────────────────────────────────
const DocUploadRow: React.FC<{
  label: string;
  docKey: string;
  value: string | null;
  onChange: (url: string | null) => void;
}> = ({ label, docKey, value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState(false);
  const { uploadAndGetUrl, getFileUrl } = useFileUpload();

  const handleFile = async (file: File) => {
    setUploading(true);
    const url = await uploadAndGetUrl(file, docKey);
    onChange(url);
    setUploading(false);
    return false;
  };

  const handleView = async () => {
    if (!value) return;
    setViewing(true);
    const signedUrl = await getFileUrl(value);
    setViewing(false);
    if (signedUrl && signedUrl !== "URL Not Found")
      window.open(signedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 0",
        borderBottom: "1px solid #f3f4f6",
      }}
    >
      <span
        style={{ flex: 1, fontSize: 11, fontWeight: 500, color: "#374151" }}
      >
        {label}
      </span>
      <div
        style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}
      >
        {value && (
          <Button
            type="link"
            size="small"
            loading={viewing}
            onClick={handleView}
            style={{
              fontSize: 11,
              color: "#16a34a",
              fontWeight: 600,
              padding: 0,
              height: "auto",
            }}
          >
            {viewing ? "" : "✓ View"}
          </Button>
        )}
        {value && (
          <button
            onClick={() => onChange(null)}
            style={{
              fontSize: 10,
              color: "#ef4444",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            title="Remove"
          >
            ✕
          </button>
        )}
        <Upload
          beforeUpload={handleFile}
          showUploadList={false}
          accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
        >
          <Button
            size="small"
            loading={uploading}
            style={{ fontSize: 11, height: 24, minWidth: 60 }}
          >
            {uploading ? "" : value ? "Replace" : "Upload"}
          </Button>
        </Upload>
      </div>
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
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

export const ComplianceAddDriverModal: React.FC<Props> = ({
  open,
  onClose,
  transporterId,
  locCode,
  vendorLabel,
  onSuccess,
}) => {
  const { Modal } = useUILibrary();
  const { color, spacing, radius, font } = useTokens();

  const isMobile = useIsMobile();

  const G5: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(5, 1fr)",
    gap: "6px 12px",
  };
  const G6: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(6, 1fr)",
    gap: "6px 12px",
  };
  const G4: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
    gap: "6px 12px",
  };
  const G3: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
    gap: "4px 10px",
  };

  const { vendorOptions, locationOptions, currentStatusOptions } = useLookups({
    only: ["vendorOptions", "locationOptions", "currentStatusOptions"],
  }) as any;

  // Resolve human-readable office name from locCode via lookup list
  const officeLabel: string | undefined = locationOptions?.find(
    (o: any) => o.value === locCode,
  )?.label;

  const {
    form,
    step,
    submitting,
    docs,
    setDoc,
    onValuesChange,
    goNext,
    goBack,
    reset,
    submit,
  } = useAddDriverStageForm({ transporterId, locCode, onSuccess });

  console.log("locCode from modal", locCode);

  // Inject locCode into form as hidden value whenever modal opens or locCode changes
  useEffect(() => {
    if (open && locCode !== undefined) {
      form.setFieldValue("locCode", locCode);
    }
  }, [open, locCode]);

  const handleClose = () => {
    reset();
    onClose();
  };
  const TOTAL_STEPS = 3;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <span style={{ fontSize: font.sizeLg, fontWeight: 600 }}>
          Add Driver — Step {step + 1} of {TOTAL_STEPS}
        </span>
      }
      footer={null}
      centered={!isMobile}
      width={isMobile ? "100%" : "min(1200px, 96vw)"}
      style={isMobile ? { top: 0, maxWidth: "100%", margin: 0 } : undefined}
      destroyOnClose
    >
      {/* Step indicator */}
      <div
        style={{
          padding: isMobile
            ? `${spacing.xs}px ${spacing.md}px ${spacing.sm}px`
            : `${spacing.xs}px ${spacing.xl}px ${spacing.sm}px`,
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <Steps
          current={step}
          size="small"
          items={[
            { title: "Details" },
            { title: "Address" },
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
        initialValues={{ currentStatus: 1 }}
        scrollToFirstError={{ behavior: "smooth", block: "center" }}
        onValuesChange={onValuesChange}
        style={{
          padding: isMobile
            ? `${spacing.xs}px ${spacing.md}px`
            : `${spacing.xs}px ${spacing.xl}px`,
        }}
      >
        {/* ══ STEP 1 — Driver Details ═══════════════════════════════════════ */}
        <div style={{ display: step === 0 ? "block" : "none" }}>
          {/* Section 1: Identity */}
          <div style={sectionCard}>
            <div style={sectionTitle}>Identity</div>
            <div style={G5}>
              {!transporterId && (
                <Field
                  label="Vendor"
                  name="transporterId"
                  required
                  rules={[requiredSelect("Vendor")]}
                >
                  <Select
                    style={S.select}
                    size="small"
                    placeholder="Select vendor"
                    options={vendorOptions ?? []}
                  />
                </Field>
              )}
              {/* Office field removed — locCode injected via useEffect above */}
              <Field
                label="Driver Name"
                name="driverName"
                required
                rules={[
                  v.required(),
                  v.minLen(2),
                  v.maxLen(100),
                  v.lettersOnly("Driver name"),
                ]}
                normalize={normalize.titleCase}
                span={transporterId ? 2 : 1}
              >
                <Input style={S.input} placeholder="Full name" />
              </Field>
              <Field
                label="Father Name"
                name="fatherName"
                rules={[v.maxLen(100), v.lettersOnly("Father name")]}
                normalize={normalize.titleCase}
              >
                <Input style={S.input} placeholder="Father's name" />
              </Field>
              <Field
                label="Date of Birth"
                name="dob"
                required
                rules={[requiredDate("Date of Birth"), v.driverDOB()]}
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
                rules={[v.required()]}
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
                rules={[v.required(), v.mobile()]}
                normalize={normalize.mobile}
                tooltip="10-digit mobile"
              >
                <Input
                  style={S.input}
                  placeholder="9876543210"
                  maxLength={10}
                />
              </Field>
              <Field
                label="Alternate Mobile"
                name="alternateMobileNo"
                rules={[v.mobile()]}
                normalize={normalize.mobile}
              >
                <Input style={S.input} placeholder="Optional" maxLength={10} />
              </Field>
              {transporterId && <div />}
            </div>
          </div>

          {/* Section 2: License & ID */}
          <div style={sectionCard}>
            <div style={sectionTitle}>License &amp; ID</div>
            <div style={G5}>
              <Field
                label="License No."
                name="licenseNo"
                required
                rules={[
                  v.required(),
                  v.alphaNumDash("License No."),
                  v.maxLen(20),
                ]}
                normalize={normalize.alphaNumUpper}
                tooltip="e.g. DL01202312345"
              >
                <Input style={S.input} placeholder="DL01202312345" />
              </Field>
              {/* <Field
                label="License Type"
                name="licenseType"
                required
                rules={[v.required()]}
              >
                <Select
                  style={S.select}
                  size="small"
                  placeholder="Select type"
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
                label="License Expiry Date"
                name="licenseExpDate"
                required
                rules={[
                  requiredDate("License Expiry"),
                  v.futureDate("License expiry"),
                ]}
              >
                <DatePicker {...DATE_PICKER_PROPS} placeholder="DD/MM/YYYY" />
              </Field>
              <Field
                label="Induction Date"
                name="inductionDate"
                required
                rules={[
                  requiredDate("Induction Date"),
                  v.pastDate("Induction date"),
                ]}
              >
                <DatePicker {...DATE_PICKER_PROPS} placeholder="DD/MM/YYYY" />
              </Field>

              <Field
                label="Licence Authority"
                name="driverLicenceAuthority"
                required
                rules={[v.required(), v.maxLen(100)]}
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

          {/* Section 3: Employment & Compliance */}
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
                label="Driver Training Status"
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
              <Field label="Background Verify. Expiry" name="privateBGVExpDate">
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
                name="policeVerificationExpiry"
                rules={[
                  // requiredDate("Police Verification Expiry"),
                  v.futureDate("Police verif. expiry"),
                ]}
              >
                <DatePicker {...DATE_PICKER_PROPS} placeholder="DD/MM/YYYY" />
              </Field>
              <Field
                label="Last Internal Verify."
                name="lastInternalVerificationDate"
                // required
                // rules={[requiredDate("Last Internal Verification")]}
              >
                <DatePicker {...DATE_PICKER_PROPS} placeholder="DD/MM/YYYY" />
              </Field>
              <Field
                label="External Verif. Expiry"
                name="externalVerificationExpDate"
              >
                <DatePicker {...DATE_PICKER_PROPS} placeholder="DD/MM/YYYY" />
              </Field>
              <Field
                label="External Agency"
                name="externalVerificationAgency"
                rules={[v.maxLen(100)]}
              >
                <Input style={S.input} placeholder="Agency name" />
              </Field>
              <Field
                label="Remarks"
                name="remarks"
                rules={[v.maxLen(500)]}
                span={2}
              >
                <Input style={S.input} placeholder="Optional remarks" />
              </Field>
            </div>
          </div>
        </div>

        {/* ══ STEP 2: Address ══════════════════════════════════════════════════ */}
        <div style={{ display: step === 1 ? "block" : "none" }}>
          <div style={sectionCard}>
            <div style={sectionTitle}>Present Address</div>
            <div style={G4}>
              <Field
                label="Street / Lane"
                name="presentAddress"
                rules={[v.maxLen(200)]}
                span={2}
              >
                <Input style={S.input} placeholder="House no., Street name" />
              </Field>
              {/* <Field label="City" name="presentCity" rules={[v.maxLen(100)]}>
                <Input style={S.input} placeholder="City" />
              </Field>
              <Field label="State" name="presentState" rules={[v.maxLen(100)]}>
                <Input style={S.input} placeholder="State" />
              </Field> 
              <Field
                label="Pincode"
                name="presentPincode"
                rules={[v.maxLen(6)]}
                normalize={(val) => (val ?? "").replace(/\D/g, "").slice(0, 6)}
              >
                <Input style={S.input} placeholder="110001" maxLength={6} />
              </Field>*/}
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
                      rules={[v.maxLen(200)]}
                      span={2}
                    >
                      <Input
                        style={S.input}
                        placeholder="House no., Street name"
                      />
                    </Field>
                    {/* <Field
                      label="City"
                      name="permanentCity"
                      rules={[v.maxLen(100)]}
                    >
                      <Input style={S.input} placeholder="City" />
                    </Field>
                    <Field
                      label="State"
                      name="permanentState"
                      rules={[v.maxLen(100)]}
                    >
                      <Input style={S.input} placeholder="State" />
                    </Field> 
                    <Field
                      label="Pincode"
                      name="permanentPincode"
                      rules={[v.maxLen(6)]}
                      normalize={(val) =>
                        (val ?? "").replace(/\D/g, "").slice(0, 6)
                      }
                    >
                      <Input
                        style={S.input}
                        placeholder="110001"
                        maxLength={6}
                      />
                    </Field>*/}
                  </div>
                </div>
              )
            }
          </Form.Item>
        </div>

        {/* ══ STEP 3: Documents ════════════════════════════════════════════════ */}
        <div style={{ display: step === 2 ? "block" : "none" }}>
          <p
            style={{
              fontSize: font.sizeSm,
              color: color.textSecondary,
              marginBottom: spacing.sm,
            }}
          >
            Upload documents for this driver. All fields are optional but
            recommended.
          </p>
          <div style={G3}>
            {DRIVER_DOC_FIELDS.map(({ key, label }) => (
              <DocUploadRow
                key={key}
                label={label}
                docKey={key}
                value={docs[key]}
                onChange={(url) => setDoc(key as keyof DriverDocState, url)}
              />
            ))}
          </div>
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
              padding: "6px 16px",
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
              padding: "6px 16px",
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
              width: isMobile ? "100%" : "auto",
              flex: isMobile && step > 0 ? 1 : undefined,
            }}
          >
            {step === 0 ? "Next — Address →" : "Next — Documents →"}
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={submitting}
            style={{
              padding: "6px 20px",
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
            {submitting ? "Submitting…" : "Submit Driver"}
          </button>
        )}
      </div>
    </Modal>
  );
};
