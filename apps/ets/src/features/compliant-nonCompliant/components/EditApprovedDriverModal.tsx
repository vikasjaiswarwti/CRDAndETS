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
  message,
} from "antd";
import dayjs from "dayjs";
import { useFileUpload } from "../../../shared/customHooks/useFileUpload";
import { useLookups } from "../../lookups/hooks/useLookups";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../constants/tokens";
import { useUpdateDriverMutation } from "../services/DrivercomplianceApi"; // add this mutation
import { v, normalize } from "../utils/Formvalidation";

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

const Field: React.FC<{
  label: string;
  name: string | string[];
  required?: boolean;
  rules?: any[];
  span?: number;
  children: React.ReactNode;
  normalize?: (v: any) => any;
}> = ({
  label,
  name,
  required,
  rules = [],
  span = 1,
  children,
  normalize: norm,
}) => (
  <div style={{ gridColumn: `span ${span}` }}>
    <label style={S.label}>
      {label}
      {required && <span style={{ color: "#ef4444" }}> *</span>}
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
        Editing for:
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
    onChange(await uploadAndGetUrl(file, label));
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
        padding: "11px 14px",
        borderRadius: 10,
        border: `1px solid ${value ? "#86efac" : "#e5e7eb"}`,
        background: value ? "#f0fdf4" : "#fafafa",
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

const DATE_FIELDS = [
  "dob",
  "licenseIssueDate",
  "licenseExpDate",
  "inductionDate",
  "policeVerificationExpDate",
  "lastInternalVerificationDate",
  "externalVerificationExpDate",
  "lastTrainingDate",
  "privateBGVExpDate",
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  record: any | null;
  transporterId?: number;
  locCode?: number;
  vendorLabel?: string;
  onSuccess: () => void;
}

export const EditApprovedDriverModal: React.FC<Props> = ({
  open,
  onClose,
  record,
  transporterId,
  locCode,
  vendorLabel,
  onSuccess,
}) => {
  const { Modal } = useUILibrary();
  const { color, spacing, radius, font } = useTokens();
  const { locationOptions, currentStatusOptions } = useLookups({
    only: ["locationOptions", "currentStatusOptions"],
  }) as any;
  const officeLabel: string | undefined = locationOptions?.find(
    (o: any) => o.value === locCode,
  )?.label;

  const [form] = Form.useForm();
  const [step, setStep] = useState(0);
  const [docs, setDocsState] = useState<DocState>({ ...INITIAL_DOCS });
  const [submitting, setSubmitting] = useState(false);
  const [updateDriver] = useUpdateDriverMutation();

  const setDoc = (key: DocKey, url: string | null) =>
    setDocsState((p) => ({ ...p, [key]: url }));
  useEffect(() => {
    if (!open || !record) return;
    const r = record as any;
    form.resetFields();
    setStep(0);

    form.setFieldsValue({
      driverName: r.driverName ?? "",
      fatherName: r.fatherName ?? "",
      gender: r.gender ?? undefined,
      dob: r.dob ? dayjs(r.dob) : undefined,
      bloodGroup: r.bloodGroup ?? undefined,
      mobileNo: r.mobileNo ?? "",
      alternateMobileNo: r.alternateMobileNo ?? "",
      licenseNo: r.licenseNo ?? "",
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
      currentStatus: r.currentStatus ?? 1,
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

  const goNext = async () => {
    const stepFields: string[][] = [
      [
        "driverName",
        "dob",
        "gender",
        "bloodGroup",
        "mobileNo",
        "licenseNo",
        "licenseExpDate",
        "inductionDate",
        "driverLicenceAuthority",
        "govtIdProof",
        "driverType",
        "currentStatus",
      ],
      ["presentAddress"],
      [],
    ];
    try {
      await form.validateFields(stepFields[step]);
      setStep((s) => s + 1);
    } catch {}
  };

  const handleClose = () => {
    form.resetFields();
    setStep(0);
    setDocsState({ ...INITIAL_DOCS });
    onClose();
  };

  const handleSubmit = async () => {
    let values: Record<string, any>;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    if (values.sameAsPresentAddress)
      values.permanentAddress = values.presentAddress ?? "";

    setSubmitting(true);
    try {
      const r = record as any;
      DATE_FIELDS.forEach((f) => {
        if (values[f] && dayjs.isDayjs(values[f]))
          values[f] = (values[f] as any).format("YYYY-MM-DD");
      });

      await updateDriver({
        id: r.id ?? r.driverId ?? "",
        body: {
          ...values,
          locCode: locCode ?? r.locCode,
          transporterId: transporterId ?? r.transporterId,
          active: values.currentStatus === 1,
          ...docs,
        },
      }).unwrap();

      message.success("Driver updated successfully");
      onSuccess();
    } catch (e: any) {
      message.error(
        e?.data?.title ?? e?.data?.message ?? "Failed to update driver",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!record) return null;

  const TOTAL_STEPS = 3;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <span style={{ fontSize: font.sizeLg, fontWeight: 600 }}>
          Edit Driver — Step {step + 1} of {TOTAL_STEPS}
        </span>
      }
      footer={null}
      centered
      width="min(1200px, 96vw)"
      destroyOnClose
    >
      <div
        style={{
          padding: `${spacing.xs}px ${spacing.xl}px ${spacing.sm}px`,
          borderBottom: "1px solid #f3f4f6",
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
      <InfoBanner
        vendorLabel={vendorLabel}
        officeLabel={officeLabel}
        locCode={locCode}
      />

      <Form
        form={form}
        layout="vertical"
        size="small"
        style={{ padding: `${spacing.xs}px ${spacing.xl}px` }}
      >
        {/* ── Step 0: Driver Details ── */}
        <div style={{ display: step === 0 ? "block" : "none" }}>
          <div style={sectionCard}>
            <div style={sectionTitle}>Identity</div>
            <div style={G5}>
              <Field
                label="Driver Name"
                name="driverName"
                required
                rules={[
                  v.required(),
                  v.maxLen(100),
                  v.lettersOnly("Driver name"),
                ]}
                normalize={normalize.titleCase}
                span={2}
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
                rules={[v.requiredSelect("Date of Birth"), v.driverDOB()]}
              >
                <DatePicker {...DATE_PICKER_PROPS} />
              </Field>
              <Field
                label="Gender"
                name="gender"
                required
                rules={[v.requiredSelect()]}
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
                rules={[v.requiredSelect()]}
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
              <div />
              <div />
            </div>
          </div>

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
              >
                <Input style={S.input} placeholder="DL01202312345" />
              </Field>
              <Field label="Issue Date" name="licenseIssueDate">
                <DatePicker {...DATE_PICKER_PROPS} />
              </Field>
              <Field
                label="License Expiry Date"
                name="licenseExpDate"
                required
                rules={[v.requiredSelect(), v.futureDate("License expiry")]}
              >
                <DatePicker {...DATE_PICKER_PROPS} />
              </Field>
              <Field
                label="Induction Date"
                name="inductionDate"
                required
                rules={[v.requiredSelect(), v.pastDate("Induction date")]}
              >
                <DatePicker {...DATE_PICKER_PROPS} />
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
                rules={[v.requiredSelect()]}
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

          <div style={sectionCard}>
            <div style={sectionTitle}>Employment &amp; Compliance</div>
            <div style={G6}>
              <Field
                label="Driver Type"
                name="driverType"
                required
                rules={[v.requiredSelect()]}
              >
                <Select
                  style={S.select}
                  size="small"
                  placeholder="Select"
                  options={DRIVER_TYPE_OPTIONS}
                />
              </Field>
              <Field label="Training Status" name="trainingStatus">
                <Select
                  style={S.select}
                  size="small"
                  placeholder="Select"
                  options={TRAINING_STATUS_OPTIONS}
                />
              </Field>
              <Field label="Last Training Date" name="lastTrainingDate">
                <DatePicker {...DATE_PICKER_PROPS} />
              </Field>
              <Field label="Background Verify. Expiry" name="privateBGVExpDate">
                <DatePicker {...DATE_PICKER_PROPS} />
              </Field>
              <Field
                label="Driver Status"
                name="currentStatus"
                required
                rules={[v.requiredSelect()]}
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
                rules={[v.futureDate("Police verif. expiry")]}
              >
                <DatePicker {...DATE_PICKER_PROPS} />
              </Field>
              <Field
                label="Last Internal Verif."
                name="lastInternalVerificationDate"
                rules={[v.pastDate("Last internal verification")]}
              >
                <DatePicker {...DATE_PICKER_PROPS} />
              </Field>
              <Field
                label="External Verify. Expiry"
                name="externalVerificationExpDate"
                rules={[v.futureDate("External verification expiry")]}
              >
                <DatePicker {...DATE_PICKER_PROPS} />
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
                <Input style={S.input} placeholder="Optional" />
              </Field>
            </div>
          </div>
        </div>

        {/* ── Step 1: Address ── */}
        <div style={{ display: step === 1 ? "block" : "none" }}>
          <div style={sectionCard}>
            <div style={sectionTitle}>Present Address</div>
            <Field
              label="Street / Lane"
              name="presentAddress"
              rules={[v.maxLen(200)]}
            >
              <Input style={S.input} placeholder="House no., Street name" />
            </Field>
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
                  <Field
                    label="Street / Lane"
                    name="permanentAddress"
                    rules={[v.maxLen(200)]}
                  >
                    <Input
                      style={S.input}
                      placeholder="House no., Street name"
                    />
                  </Field>
                </div>
              )
            }
          </Form.Item>
        </div>

        {/* ── Step 2: Documents ── */}
        <div style={{ display: step === 2 ? "block" : "none" }}>
          <p
            style={{
              fontSize: font.sizeSm,
              color: color.textSecondary,
              marginBottom: spacing.sm,
            }}
          >
            Update documents for this driver. All fields are optional.
          </p>
          <div style={G2}>
            {DOC_LIST.map(({ key, label }) => (
              <DocCard
                key={key}
                label={label}
                value={docs[key]}
                onChange={(url) => setDoc(key, url)}
              />
            ))}
          </div>
        </div>
      </Form>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: spacing.sm,
          padding: `${spacing.sm}px ${spacing.xl}px ${spacing.md}px`,
          borderTop: "1px solid #f3f4f6",
        }}
      >
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
          }}
        >
          Cancel
        </button>
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
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
            }}
          >
            {submitting && <Spin size="small" />}
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        )}
      </div>
    </Modal>
  );
};
