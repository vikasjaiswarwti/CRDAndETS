import React, { useState, useEffect } from "react";
import {
  Input,
  Select,
  DatePicker,
  Switch,
  Radio,
  Form,
  Button,
  Upload,
  message,
} from "antd";
import type { UploadProps } from "antd";
import {
  alphanumericOnlyProps,
  lettersOnlyProps,
  numbersOnlyProps,
  addressProps,
} from "../utils/inputRestrictions";

import type { UploadFile } from "antd/es/upload/interface";
import {
  PhoneOutlined,
  IdcardOutlined,
  HomeOutlined,
  SafetyOutlined,
  TrophyOutlined,
  CameraOutlined,
  UploadOutlined,
  CheckCircleFilled,
  LoadingOutlined,
  EyeOutlined,
  DeleteOutlined,
  LeftOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  BLOOD_GROUP_OPTIONS,
  DRIVER_TYPE_OPTIONS,
  TRAINING_STATUS_OPTIONS,
  YES_NO_OPTIONS,
  DRIVER_DOC_KEYS,
  DRIVER_FILE_LABELS,
} from "../constants/driverConstants";
import type { Driver } from "../types/driver.types";
import { useFileUpload } from "../../../shared/customHooks/useFileUpload";
import {
  MAX_FILE_SIZE_MB,
  beforeUpload,
} from "../../../shared/utils/uploadValidation.utils";
import DocumentApproval from "../../../shared/components/DocumentApproval/DocumentApproval";
import { useDocumentApproval } from "../../../shared/customHooks/useDocumentApproval";
import { T } from "../../../styles/tokens";

// ─── Types ────────────────────────────────────────────────────────────────────
type SelectOption = { label: string; value: any | string | number | boolean };

interface DriverFormOptions {
  currentStatusOptions?: SelectOption[];
  vendorOptions: SelectOption[];
  GENDER_OPTIONS: SelectOption[];
  DRIVER_TYPE_OPTIONS: SelectOption[];
  BLOOD_GROUP_OPTIONS: SelectOption[];
  TRAINING_STATUS_OPTIONS: SelectOption[];
  locationOptions: SelectOption[];
  YES_NO_OPTIONS: SelectOption[];
  documentTypesOptions: SelectOption[];
}

// ─── Design Tokens ────────────────────────────────────────────────────────────
// const C = {
//   green: "#1B4332",
//   greenDark: "#163b2c",
//   greenMid: "#52796F",
//   greenLight: "#B7E4C7",
//   greenPale: "#F0FAF4",
//   greyBorder: "#DCE3EA",
//   greenAccent: "#4CAF82",
//   inputBg: "#F5F7FA",
//   sectionBorder: "#e0f0e8",
//   error: "#e53e3e",
//   label: "#52796F",
//   text: "#1a3a2a",
//   textMuted: "#6b8f7a",
//   iconColor: "#BFC9D1",
// } as const;

// ─── Shared Styles ────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  borderRadius: 7,
  fontSize: 12,
  height: 34,
  background: T.formcss.inputBg,
  border: `1px solid ${T.formcss.greyBorder}`,
  color: T.formcss.text,
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  fontSize: 12,
  background: T.formcss.inputBg,
  border: `1px solid ${T.formcss.greyBorder}`,
  height: 34,
};

const dateStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 7,
  fontSize: 12,
  height: 34,
  // background: T.formcss.inputBg,
  border: `1px solid ${T.formcss.greyBorder}`,
  backgroundColor: T.formcss.inputBg,
};

const cardStyle: React.CSSProperties = {
  // background: T.formcss.inputBg,
  border: `1px solid ${T.formcss.greyBorder}`,
  borderRadius: 12,
  padding: "20px",
  height: "100%",
  background: "#fff",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: T.formcss.green,
  textTransform: "uppercase",
  letterSpacing: "0.7px",
  display: "flex",
  alignItems: "center",
  gap: 6,
  paddingBottom: 8,
  // background: "white",
  marginBottom: 4,
  borderBottom: `1.2px solid ${T.formcss.greyBorder}`,
};

const formWrapStyle: React.CSSProperties = {
  // border: `1.5px solid ${T.formcss.sectionBorder}`,
  // padding: 20,
  borderRadius: 16,
  // background: "#fff",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  // color: T.formcss.label,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: 3,
  display: "block",
};
const dateInputStyles: React.CSSProperties = {
  fontSize: 12,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const FieldWrap: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
  style?: any;
  id?: string;
}> = ({ label, required, error, children, hint, style, id = "" }) => (
  <div
    style={{ display: "flex", flexDirection: "column", gap: 3, ...style }}
    id={id}
  >
    {label && (
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: T.formcss.error, marginLeft: 2 }}>*</span>}
        {hint && (
          <span
            style={{
              fontSize: 9,
              color: T.formcss.textMuted,
              fontWeight: 500,
              marginLeft: 4,
            }}
          >
            {hint}
          </span>
        )}
      </label>
    )}
    {children}
    {error && (
      <span style={{ fontSize: 10, color: T.formcss.error, marginTop: 1 }}>
        {error}
      </span>
    )}
  </div>
);
const FieldComponentWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
      }}
    >
      {children}
    </div>
  );
};

interface ImageUploadProps {
  name: string;
  value?: string | null;
  onChange: (name: string, url: string | null) => void;
  uploadAndGetUrl: (file: File, name: string) => Promise<string | null>;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  name,
  value,
  onChange,
  uploadAndGetUrl,
}) => {
  const { getFileUrl } = useFileUpload();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>("");

  const handleChange: UploadProps["onChange"] = async ({
    fileList: newList,
  }) => {
    const latest = newList.slice(-1);
    setFileList(latest);
    const originFile = latest[0]?.originFileObj;
    if (!originFile) return;
    setUploading(true);
    try {
      const remoteUrl = await uploadAndGetUrl(originFile as File, name);
      setPreview(remoteUrl);
      onChange(name, remoteUrl);
    } finally {
      setUploading(false);
    }
  };

  const fileName = fileList[0]?.name;

  const handleView = async () => {
    if (!getFileUrl) return;
    let imageUrl = value || preview || "";
    if (!imageUrl) {
      message.error("No file URL available");
      return;
    }
    const url = await getFileUrl(imageUrl);
    if (url && url !== "URL Not Found") {
      window.open(url, "_blank");
    } else {
      message.error(`Invalid URL - ${imageUrl}`);
    }
  };

  const handleRemove = () => {
    setFileList([]);
    setPreview(null);
    onChange(name, "");
  };

  const hasFile = !!(value || preview) && !uploading;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        // gap: 6,
        width: "100%",
        minHeight: 34,
      }}
    >
      <style>
        {`
      .full-upload,
      .full-upload .ant-upload {
        width: 100%;
        display: block;
      }
    `}
      </style>
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}
      >
        {!hasFile && (
          <Upload
            fileList={fileList}
            onChange={handleChange}
            rootClassName="full-upload"
            beforeUpload={beforeUpload}
            accept="image/*,.pdf"
            maxCount={1}
            showUploadList={false}
            style={{ width: "100%", display: "block" }}
          >
            <div
              style={{
                minHeight: 34,
                paddingInline: 12,
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 7,
                border: `1.2px dashed ${T.formcss.greyBorder}`,
                background: T.formcss.inputBg,
                cursor: "pointer",
                transition: "border-color 0.15s",
                boxSizing: "border-box",
              }}
            >
              {uploading ? (
                <LoadingOutlined
                  style={{ color: T.formcss.iconColor, fontSize: 13 }}
                />
              ) : (
                <UploadOutlined
                  style={{ color: T.formcss.iconColor, fontSize: 13 }}
                />
              )}
              <span
                style={{
                  fontSize: 11,
                  color: T.formcss.iconColor,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {uploading ? "Uploading..." : fileName || "Upload file"}
              </span>
            </div>
          </Upload>
        )}
      </div>

      {hasFile && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 10px",
            borderRadius: 7,
            border: `1px solid ${T.formcss.greyBorder}`,
            background: T.formcss.inputBg,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 5,
              background: T.formcss.greenPale,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CheckCircleFilled
              style={{ color: T.formcss.greenAccent, fontSize: 12 }}
            />
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: T.formcss.greenMid,
              background: T.formcss.greenPale,
              border: `1px solid ${T.formcss.greyBorder}`,
              borderRadius: 99,
              padding: "1px 7px",
            }}
          >
            Uploaded
          </span>
          <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
            <button
              onClick={handleView}
              style={{
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 5,
                border: `1px solid ${T.formcss.greyBorder}`,
                background: T.formcss.inputBg,
                cursor: "pointer",
                color: T.formcss.greenMid,
                transition: "background 0.15s",
              }}
            >
              <EyeOutlined style={{ fontSize: 11 }} />
            </button>
            <button
              onClick={handleRemove}
              style={{
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 5,
                border: `1px solid ${T.formcss.greyBorder}`,
                background: T.formcss.inputBg,
                cursor: "pointer",
                color: T.formcss.error,
                transition: "background 0.15s",
              }}
            >
              <DeleteOutlined style={{ fontSize: 11 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface DriverFormProps {
  title: string;
  driverId?: string | number;
  onClose: () => void;
  options?: Partial<DriverFormOptions>;
  editingRecord: Driver | null;
  onSubmit?: (values: Record<string, any>) => void;
  vendorOptions: SelectOption[];
  locationOptions: SelectOption[];
  documentTypesOptions: SelectOption[];
  isSubmitting: boolean;
  isApproving: boolean;
  serverErrors: any;
  currentStatusOptions: SelectOption[];
  statesOptions: SelectOption[];
  uploadAndGetUrl: (file: File, name: string) => Promise<string | null>;
  isApproved?: boolean;
  approveDriver?: (driverStageId: string | undefined) => Promise<void>;
}

const getSafeDoc = (doc: any) => {
  if (doc === null || doc === "null" || doc === undefined || doc === "")
    return null;
  return doc;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const DriverForm: React.FC<DriverFormProps> = ({
  title = "",
  onClose = () => {},
  editingRecord,
  onSubmit,
  vendorOptions,
  locationOptions,
  documentTypesOptions,
  isSubmitting,
  isApproving,
  currentStatusOptions,
  uploadAndGetUrl,
  isApproved = false,
  approveDriver,
}) => {
  const [form] = Form.useForm();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, string | null>>({
    profileImageDoc: null,
    licenseExpDoc: null,
    policeVerificationExpDoc: null,
    lastTrainingDoc: null,
    govtIdDoc: null,
  });
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  // ── All original logic unchanged ──────────────────────────────────────────

  useEffect(() => {
    const loadData = async () => {
      if (!editingRecord) {
        form.resetFields();
        return;
      }
      form.setFieldsValue({
        ...editingRecord,
        dob: editingRecord.dob ? dayjs(editingRecord.dob) : null,
        licenseExpDate: editingRecord.licenseExpDate
          ? dayjs(editingRecord.licenseExpDate)
          : null,
        lastTrainingDate: editingRecord.lastTrainingDate
          ? dayjs(editingRecord.lastTrainingDate)
          : null,
        licenseIssueDate: editingRecord.licenseIssueDate
          ? dayjs(editingRecord.licenseIssueDate)
          : null,
        inductionDate: editingRecord.inductionDate
          ? dayjs(editingRecord.inductionDate)
          : null,
        policeVerificationExpDate: editingRecord.policeVerificationExpDate
          ? dayjs(editingRecord.policeVerificationExpDate)
          : null,
        privateBGVExpDate: editingRecord.privateBGVExpDate
          ? dayjs(editingRecord.privateBGVExpDate)
          : null,
        externalVerificationExpDate: editingRecord.externalVerificationExpDate
          ? dayjs(editingRecord.externalVerificationExpDate)
          : null,
        lastInternalVerificationDate: editingRecord.lastInternalVerificationDate
          ? dayjs(editingRecord.lastInternalVerificationDate)
          : null,
      });
      setFiles({
        profileImageDoc: getSafeDoc(editingRecord.profileImageDoc),
        licenseExpDoc: getSafeDoc(editingRecord.licenseExpDoc),
        policeVerificationExpDoc: getSafeDoc(
          editingRecord.policeVerificationExpDoc,
        ),
        lastTrainingDoc: getSafeDoc(editingRecord.lastTrainingDoc),
        govtIdDoc: getSafeDoc(editingRecord.govtIdDoc),
      });
    };
    loadData();
  }, [editingRecord]);

  const handleFileChange = (name: string, url: string | null) => {
    setFiles((prev) => ({ ...prev, [name]: url }));
    if (url) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleProfileChange: UploadProps["onChange"] = async ({ fileList }) => {
    const originFile = fileList[0]?.originFileObj;
    if (!originFile) return;
    setProfilePreview(URL.createObjectURL(originFile));
    const remoteUrl = await uploadAndGetUrl(
      originFile as File,
      "profileImageDoc",
    );
    setFiles((prev) => ({ ...prev, profileImageDoc: remoteUrl }));
    if (remoteUrl) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.profileImageDoc;
        return next;
      });
    }
  };

  const drivingLicenseRegex = /^[A-Z]{2}[0-9]{2}\s?[0-9]{4}[0-9]{7}$/;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const values = form.getFieldsValue(true);
    if (!values.locCode) errs.locCode = "Office Location is required";
    if (!values.transporterId) errs.transporterId = "Vendor is required";
    if (!values.driverName?.trim()) errs.driverName = "Driver name is required";
    if (!values.dob) errs.dob = "Date of birth is required";
    if (!values.gender) errs.gender = "Gender is required";
    if (!values.fatherName?.trim()) errs.fatherName = "Father name is required";
    if (!values.mobileNo?.trim()) {
      errs.mobileNo = "Mobile number is required";
    } else if (values.mobileNo.trim().length !== 10) {
      errs.mobileNo = "Mobile number must be 10 digits";
    }
    if (!values.alternateMobileNo?.trim()) {
      errs.alternateMobileNo = "Alternate mobile is required";
    } else if (values.alternateMobileNo.trim().length !== 10) {
      errs.alternateMobileNo = "Alternate mobile must be 10 digits";
    }
    if (!values.bloodGroup) errs.bloodGroup = "Blood group is required";
    if (!values.licenseNo?.trim())
      errs.licenseNo = "License number is required";
    else if (!drivingLicenseRegex.test(values.licenseNo)) {
      errs.licenseNo = "Enter valid driving license number";
    }
    if (!values.licenseExpDate)
      errs.licenseExpDate = "License expiry date is required";
    if (!values.licenseIssueDate)
      errs.licenseIssueDate = "License issue date is required";
    if (!values.driverLicenceAuthority?.trim())
      errs.driverLicenceAuthority = "Authority is required";
    if (!values.govtIdProof)
      errs.govtIdProof = "Govt ID proof type is required";
    if (!values.inductionDate)
      errs.inductionDate = "Induction date is required";
    if (!files.govtIdDoc) errs.govtIdDoc = "Govt ID document is required";
    if (!files.licenseExpDoc)
      errs.licenseExpDoc = "License document is required";
    if (!files.lastTrainingDoc)
      errs.lastTrainingDoc = "Training document is required";
    if (!files.policeVerificationExpDoc)
      errs.policeVerificationExpDoc =
        "Police verification document is required";
    if (!files.profileImageDoc)
      errs.profileImageDoc = "Profile image is required";
    if (!values.presentAddress?.trim())
      errs.presentAddress = "Present address is required";
    if (!values.permanentAddress?.trim())
      errs.permanentAddress = "Permanent address is required";
    if (!values.trainingStatus)
      errs.trainingStatus = "Training status is required";
    if (!values.lastTrainingDate)
      errs.lastTrainingDate = "Last training date is required";
    if (!values.driverType) errs.driverType = "Driver type is required";
    if (!values.currentStatus)
      errs.currentStatus = "Current status is required";
    if (!values.privateBGVExpDate)
      errs.privateBGVExpDate = "Private BGV date is required";
    if (!values.externalVerificationAgency?.trim())
      errs.externalVerificationAgency = "External BGV agency is required";
    if (!values.externalVerificationExpDate)
      errs.externalVerificationExpDate =
        "External verification expiry is required";
    if (!values.policeVerification)
      errs.policeVerification = "Police verification status is required";
    if (!values.policeVerificationExpDate)
      errs.policeVerificationExpDate = "Police verification expiry is required";
    if (!values.lastInternalVerificationDate)
      errs.lastInternalVerificationDate =
        "Last internal verification date is required";

    form.setFields(
      Object.entries(errs).map(([name, error]) => ({ name, errors: [error] })),
    );

    const firstErrorField = Object.keys(errs)[0];
    if (firstErrorField) {
      const element = document.getElementById(firstErrorField);
      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset + rect.top - window.innerHeight * 0.5;
        window.scrollTo({ top: scrollTop, behavior: "smooth" });
        setTimeout(() => {
          (element as HTMLElement).focus?.();
        }, 300);
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    try {
      const isValid = validate();
      if (!isValid) return;
      const values = await form.validateFields();
      Object.keys(values).forEach((k) => {
        if (values[k] && dayjs.isDayjs(values[k])) {
          values[k] = values[k].toISOString();
        }
      });
      onSubmit?.({ ...values, ...files });
    } catch {}
  };

  const handleReset = () => {
    form.resetFields();
    setErrors({});
    setFiles({
      profileImageDoc: null,
      licenseExpDoc: null,
      policeVerificationExpDoc: null,
      lastTrainingDoc: null,
      govtIdDoc: null,
    });
    setProfilePreview(null);
  };

  const { getFileUrl } = useFileUpload();
  const handleProfileView = async () => {
    const imageUrl = getSafeDoc(files.profileImageDoc);
    if (!imageUrl) {
      message.error("Profile image not uploaded yet");
      return;
    }
    try {
      const viewableUrl = await getFileUrl(imageUrl);
      if (viewableUrl && viewableUrl !== "URL Not Found") {
        window.open(viewableUrl, "_blank");
      } else {
        message.error("Unable to load image");
      }
    } catch {
      message.error("Failed to open image");
    }
  };

  const ImageHint = () => (
    <>
      <InfoCircleOutlined /> Max {MAX_FILE_SIZE_MB}MB
    </>
  );

  const approval = useDocumentApproval({ docKeys: DRIVER_DOC_KEYS });

  // ─── Ant Design global token overrides via inline wrapper ─────────────────
  // We inject a style tag to scope Ant selects/datepickers/inputs to our green palette
  const antOverride = `
    .driver-form-scope .ant-select-selector {
      border-color: ${T.formcss.greyBorder} !important;
      background: ${T.formcss.inputBg} !important;
      border-radius: 7px !important;
      font-size: 12px !important;
    }
    .driver-form-scope .ant-select-selector:hover,
    .driver-form-scope .ant-select-focused .ant-select-selector {
      border-color: ${T.formcss.greenAccent} !important;
      box-shadow: 0 0 0 2px ${T.formcss.greenAccent}22 !important;
    }
    .driver-form-scope .ant-picker {
      border-color: ${T.formcss.greyBorder} !important;
      background: ${T.formcss.inputBg} !important;
    }
    .driver-form-scope .ant-picker:hover,
    .driver-form-scope .ant-picker-focused {
      border-color: ${T.formcss.greenAccent} !important;
      border:2px !important;
      box-shadow: 0 0 0 2px ${T.formcss.greenAccent}22 !important;
    }
    .driver-form-scope .ant-input,
    .driver-form-scope .ant-input-affix-wrapper {
        border-color: ${T.formcss.greyBorder} !important;
      box-shadow: 0 0 0 2px ${T.formcss.greyBorder}22 !important;
    }
    .driver-form-scope .ant-input:hover,
    .driver-form-scope .ant-input:focus {
      // border-color: ${T.formcss.green} !important;
      box-shadow: 0 0 0 2px ${T.formcss.greenAccent}22 !important;
    }
    .driver-form-scope .ant-switch-checked {
      background: ${T.formcss.green} !important;
    }
    .driver-form-scope .ant-radio-checked .ant-radio-inner {
      border-color: ${T.formcss.green} !important;
      background: ${T.formcss.green} !important;
    }
    .driver-form-scope .ant-form-item-explain-error {
      font-size: 10px;
      color: ${T.formcss.error};
    }
  `;

  return (
    <>
      <style>{antOverride}</style>
      <DocumentApproval
        open={approval.isOpen}
        onCancel={approval.close}
        filePreview={approval.filePreview}
        failedImages={approval.failedImages}
        loadingPreview={approval.loadingPreview}
        fileLabels={DRIVER_FILE_LABELS}
        title="Driver Document Preview"
        approveLabel="Approve Driver"
        onApprove={() => approveDriver?.(editingRecord?.driver_Id?.toString())}
      />
      <div
        // className="driver-form-scope"
        style={{
          minHeight: "100vh",
          padding: 12,
          background: T.formcss.pageBg,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* ── Page Header ────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fff",
            borderRadius: 12,
            padding: "10px 16px",
            border: `1px solid ${T.formcss.sectionBorder}`,
            boxShadow: "0 1px 4px rgba(27,67,50,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                border: `1px solid ${T.formcss.greyBorder}`,
                background: T.formcss.greenPale,
                color: T.formcss.greenMid,
                transition: "background 0.15s",
              }}
            >
              <LeftOutlined style={{ fontSize: 13 }} />
            </button>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.formcss.green }}>
                {title} Driver
              </div>
              <div style={{ fontSize: 11, color: T.formcss.textMuted, marginTop: 1 }}>
                {editingRecord
                  ? "Update driver profile and documents"
                  : "Fill in all required details to register a new driver"}
              </div>
            </div>
          </div>
        </div>

        {/* ── Form Body ──────────────────────────────────────────────────── */}
        <div style={formWrapStyle}>
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
            onValuesChange={(changed) => {
              const changedKeys = Object.keys(changed);
              setErrors((prev) => {
                const next = { ...prev };
                changedKeys.forEach((k) => delete next[k]);
                return next;
              });
              form.setFields(changedKeys.map((name) => ({ name, errors: [] })));
            }}
          >
            {/* ════════════════════════════════════════════════════
                Driver Details
            ════════════════════════════════════════════════════ */}
            <div
              style={{
                ...cardStyle,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={sectionTitleStyle}>
                <IdcardOutlined />
                Driver Details
              </div>
              {/* Profile image upload */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  paddingBottom: 14,
                }}
              >
                <FieldWrap
                  label=""
                  required
                  error={errors.profileImageDoc}
                  id="profileImageDoc"
                >
                  <Upload
                    fileList={[]}
                    onChange={handleProfileChange}
                    beforeUpload={() => false}
                    accept="image/*"
                    maxCount={1}
                    showUploadList={false}
                  >
                    <div
                      style={{
                        width: 68,
                        height: 68,
                        borderRadius: 10,
                        border: `1.5px dashed ${T.formcss.greyBorder}`,
                        background: T.formcss.inputBg,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        overflow: "hidden",
                        flexShrink: 0,
                        transition: "border-color 0.15s",
                      }}
                    >
                      {profilePreview ? (
                        <img
                          src={profilePreview}
                          alt="profile"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <CameraOutlined
                          style={{ fontSize: 20, color: T.formcss.iconColor }}
                        />
                      )}
                    </div>
                  </Upload>
                </FieldWrap>
                <div style={{ paddingTop: 2 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.formcss.text }}>
                    Profile Image
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 9,
                      fontWeight: 700,
                      color: T.formcss.green,
                      background: "#fcbf49",
                      border: `1px solid ${T.formcss.greyBorder}`,
                      borderRadius: 99,
                      padding: "2px 6px",
                      marginTop: 4,
                    }}
                  >
                    REQUIRED
                  </span>
                  {files.profileImageDoc && (
                    <div
                      onClick={handleProfileView}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 11,
                        color: T.formcss.green,
                        marginTop: 5,
                        cursor: "pointer",
                      }}
                    >
                      <EyeOutlined style={{ fontSize: 12 }} />
                      <span style={{ textDecoration: "underline" }}>View</span>
                    </div>
                  )}
                </div>
              </div>

              <FieldComponentWrapper>
                <FieldWrap
                  label="Office"
                  required
                  error={errors.locCode}
                  id="locCode"
                >
                  <Form.Item name="locCode" noStyle>
                    <Select
                      options={locationOptions}
                      placeholder="Select office"
                      style={selectStyle}
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Vendor"
                  required
                  error={errors.transporterId}
                  id="transporterId"
                >
                  <Form.Item name="transporterId" noStyle>
                    <Select
                      options={vendorOptions}
                      placeholder="Select vendor"
                      style={selectStyle}
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Driver Name"
                  required
                  error={errors.driverName}
                  id="driverName"
                >
                  <Form.Item name="driverName" noStyle>
                    <Input
                      placeholder="Enter driver name"
                      style={inputStyle}
                      {...lettersOnlyProps}
                      maxLength={70}
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap label="DOB" required error={errors.dob} id="dob">
                  <Form.Item name="dob" noStyle>
                    <DatePicker
                      format="DD-MM-YYYY"
                      disabledDate={(current) =>
                        current && current > dayjs().endOf("day")
                      }
                      placeholder="Select date"
                      inputReadOnly
                      style={dateStyle}
                      styles={{
                        input: dateInputStyles,
                      }}
                    />
                  </Form.Item>
                </FieldWrap>
                <FieldWrap
                  label="Gender"
                  required
                  error={errors.gender}
                  id="gender"
                >
                  <Form.Item name="gender" noStyle>
                    <Radio.Group
                      style={{
                        display: "flex",
                        alignItems: "center",
                        paddingTop: 6,
                      }}
                    >
                      <Radio value="male" style={{ fontSize: 11 }}>
                        Male
                      </Radio>
                      <Radio value="female" style={{ fontSize: 11 }}>
                        Female
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Father Name"
                  required
                  error={errors.fatherName}
                  id="fatherName"
                >
                  <Form.Item name="fatherName" noStyle>
                    <Input
                      placeholder="Father's full name"
                      style={inputStyle}
                      {...lettersOnlyProps}
                    />
                  </Form.Item>
                </FieldWrap>
              </FieldComponentWrapper>
            </div>
            {/* ════════════════════════════════════════════════════
              Licensing ID
            ════════════════════════════════════════════════════ */}
            <div
              style={{
                ...cardStyle,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={sectionTitleStyle}>
                <IdcardOutlined />
                Licensing &amp; ID
              </div>
              <FieldComponentWrapper>
                <FieldWrap
                  label="License Number"
                  required
                  error={errors.licenseNo}
                  id="licenseNo"
                >
                  <Form.Item name="licenseNo" noStyle>
                    <Input
                      placeholder="DL0120110012345"
                      style={inputStyle}
                      maxLength={15}
                      onChange={(e) =>
                        form.setFieldsValue({
                          licenseNo: e.target.value.toUpperCase(),
                        })
                      }
                      {...alphanumericOnlyProps}
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Expiry Date"
                  required
                  error={errors.licenseExpDate}
                  id="licenseExpDate"
                >
                  <Form.Item name="licenseExpDate" noStyle>
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{
                        input: dateInputStyles,
                      }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current < dayjs().startOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Authority"
                  required
                  error={errors.driverLicenceAuthority}
                  id="driverLicenceAuthority"
                >
                  <Form.Item name="driverLicenceAuthority" noStyle>
                    <Input
                      placeholder="RTO Office"
                      style={inputStyle}
                      {...lettersOnlyProps}
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Govt ID Proof"
                  required
                  error={errors.govtIdProof}
                  id="govtIdProof"
                >
                  <Form.Item name="govtIdProof" noStyle>
                    <Select
                      options={documentTypesOptions}
                      placeholder="Select type"
                      style={selectStyle}
                    />
                  </Form.Item>
                </FieldWrap>
                <FieldWrap
                  label="Govt Id Doc"
                  required
                  error={errors.govtIdDoc}
                  id="govtIdDoc"
                  hint={<ImageHint />}
                >
                  <ImageUpload
                    name="govtIdDoc"
                    uploadAndGetUrl={uploadAndGetUrl}
                    value={files.govtIdDoc}
                    onChange={handleFileChange}
                  />
                </FieldWrap>

                <FieldWrap
                  label="Induction Date"
                  required
                  error={errors.inductionDate}
                  id="inductionDate"
                >
                  <Form.Item name="inductionDate" noStyle>
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{
                        input: dateInputStyles,
                      }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current > dayjs().endOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="License Issue Date"
                  required
                  error={errors.licenseIssueDate}
                  id="licenseIssueDate"
                >
                  <Form.Item name="licenseIssueDate" noStyle>
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{
                        input: dateInputStyles,
                      }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current > dayjs().endOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>
                <FieldWrap
                  label="License Exp Doc"
                  required
                  error={errors.licenseExpDoc}
                  id="licenseExpDoc"
                  hint={<ImageHint />}
                >
                  <ImageUpload
                    name="licenseExpDoc"
                    value={files.licenseExpDoc}
                    uploadAndGetUrl={uploadAndGetUrl}
                    onChange={handleFileChange}
                  />
                </FieldWrap>
              </FieldComponentWrapper>
            </div>
            {/* ═════════ Residential Info ══════════ */}
            <div
              style={{
                ...cardStyle,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={sectionTitleStyle}>
                <HomeOutlined />
                Residential Info
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px 1fr",
                  gap: 16,
                }}
              >
                <FieldWrap
                  label="Present Address"
                  required
                  error={errors.presentAddress}
                  id="presentAddress"
                >
                  <Form.Item name="presentAddress" noStyle>
                    <Input.TextArea
                      placeholder="Full local residential address"
                      rows={2}
                      style={{
                        ...inputStyle,
                        height: "auto",
                        resize: "none",
                      }}
                      {...addressProps}
                    />
                  </Form.Item>
                </FieldWrap>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    style={{
                      accentColor: T.formcss.green,
                      width: 12,
                      height: 12,
                      cursor: "pointer",
                    }}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const present = form.getFieldValue("presentAddress");
                        if (present)
                          form.setFieldValue("permanentAddress", present);
                      }
                    }}
                  />
                  <span
                    style={{ fontSize: 11, color: T.formcss.text, fontWeight: 500 }}
                  >
                    Same as present address
                  </span>
                </label>

                <FieldWrap
                  label="Permanent Address"
                  required
                  error={errors.permanentAddress}
                  id="permanentAddress"
                >
                  <Form.Item name="permanentAddress" noStyle>
                    <Input.TextArea
                      placeholder="Full permanent address"
                      rows={2}
                      style={{
                        ...inputStyle,
                        height: "auto",
                        resize: "none",
                      }}
                      {...addressProps}
                    />
                  </Form.Item>
                </FieldWrap>
              </div>
            </div>
            {/* ═════════ Communication ══════════ */}
            <div
              style={{
                ...cardStyle,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={sectionTitleStyle}>
                <PhoneOutlined />
                Communication
              </div>
              <FieldComponentWrapper>
                <FieldWrap
                  label="Primary Mobile"
                  required
                  error={errors.mobileNo}
                  id="mobileNo"
                >
                  <Form.Item
                    name="mobileNo"
                    noStyle
                    rules={[
                      {
                        required: true,
                        message: "Mobile number is required",
                      },
                      { len: 10, message: "Must be 10 digits" },
                    ]}
                  >
                    <Input
                      placeholder="Enter mobile number"
                      style={inputStyle}
                      {...numbersOnlyProps}
                      maxLength={10}
                      onInput={(e: any) => {
                        let value = e.target.value;
                        if (/^[0-5]/.test(value))
                          e.target.value = value.slice(1);
                        if (value.length > 10)
                          e.target.value = value.slice(0, 10);
                      }}
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Alt Mobile"
                  required
                  error={errors.alternateMobileNo}
                  id="alternateMobileNo"
                >
                  <Form.Item
                    name="alternateMobileNo"
                    noStyle
                    rules={[
                      { required: true, message: "Required" },
                      { len: 10, message: "Must be 10 digits" },
                    ]}
                  >
                    <Input
                      placeholder="Enter alternate number"
                      maxLength={10}
                      style={inputStyle}
                      {...numbersOnlyProps}
                      onInput={(e: any) => {
                        let value = e.target.value;
                        if (/^[0-5]/.test(value))
                          e.target.value = value.slice(1);
                        if (value.length > 10)
                          e.target.value = value.slice(0, 10);
                      }}
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Blood Group"
                  required
                  error={errors.bloodGroup}
                  id="bloodGroup"
                >
                  <Form.Item name="bloodGroup" noStyle>
                    <Select
                      options={BLOOD_GROUP_OPTIONS}
                      placeholder="Select blood group"
                      style={selectStyle}
                    />
                  </Form.Item>
                </FieldWrap>
              </FieldComponentWrapper>
            </div>

            {/* ════════════════════════════════════════════════════
               Training & Lifecycle
            ════════════════════════════════════════════════════ */}
            <div
              style={{
                ...cardStyle,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={sectionTitleStyle}>
                <TrophyOutlined />
                Training &amp; Lifecycle
              </div>
              <FieldComponentWrapper>
                <FieldWrap
                  label="Training Status"
                  required
                  error={errors.trainingStatus}
                  id="trainingStatus"
                >
                  <Form.Item name="trainingStatus" noStyle>
                    <Select
                      options={TRAINING_STATUS_OPTIONS}
                      placeholder="Select status"
                      style={selectStyle}
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Last Training Date"
                  required
                  error={errors.lastTrainingDate}
                  id="lastTrainingDate"
                >
                  <Form.Item name="lastTrainingDate" noStyle>
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{
                        input: dateInputStyles,
                      }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current > dayjs().endOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Training Doc"
                  required
                  error={errors.lastTrainingDoc}
                  id="lastTrainingDoc"
                  hint={<ImageHint />}
                >
                  <ImageUpload
                    name="lastTrainingDoc"
                    uploadAndGetUrl={uploadAndGetUrl}
                    value={files.lastTrainingDoc}
                    onChange={handleFileChange}
                  />
                </FieldWrap>

                <FieldWrap
                  label="Driver Type"
                  required
                  error={errors.driverType}
                  id="driverType"
                >
                  <Form.Item name="driverType" noStyle>
                    <Select
                      options={DRIVER_TYPE_OPTIONS}
                      placeholder="Select type"
                      style={selectStyle}
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Current Status"
                  required
                  error={errors.currentStatus}
                  id="currentStatus"
                >
                  <Form.Item name="currentStatus" noStyle>
                    <Select
                      options={currentStatusOptions}
                      placeholder="Select status"
                      style={selectStyle}
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap label="Remarks" id="remarks">
                  <Form.Item name="remarks" noStyle>
                    <Input.TextArea
                      placeholder="Optional remarks…"
                      rows={1}
                      style={{ ...inputStyle, height: "auto", resize: "none" }}
                    />
                  </Form.Item>
                </FieldWrap>
              </FieldComponentWrapper>
            </div>

            {/* ════════════════════════════════════════════════════
               Compliance & BGV
            ════════════════════════════════════════════════════ */}
            <div
              style={{
                ...cardStyle,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={sectionTitleStyle}>
                <SafetyOutlined />
                Compliance &amp; BGV
              </div>

              <FieldComponentWrapper>
                <FieldWrap
                  label="Police Verified"
                  required
                  error={errors.policeVerification}
                  id="policeVerification"
                >
                  <Form.Item name="policeVerification" noStyle>
                    <Select
                      options={YES_NO_OPTIONS}
                      placeholder="Select"
                      style={selectStyle}
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Police Verification Expiry"
                  required
                  error={errors.policeVerificationExpDate}
                  id="policeVerificationExpDate"
                >
                  <Form.Item name="policeVerificationExpDate" noStyle>
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{
                        input: dateInputStyles,
                      }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current < dayjs().startOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Police Verification Doc"
                  required
                  error={errors.policeVerificationExpDoc}
                  id="policeVerificationExpDoc"
                  hint={<ImageHint />}
                >
                  <ImageUpload
                    name="policeVerificationExpDoc"
                    value={files.policeVerificationExpDoc}
                    uploadAndGetUrl={uploadAndGetUrl}
                    onChange={handleFileChange}
                  />
                </FieldWrap>
              </FieldComponentWrapper>

              <FieldComponentWrapper>
                <FieldWrap
                  label="Private BGV Date"
                  required
                  error={errors.privateBGVExpDate}
                  id="privateBGVExpDate"
                >
                  <Form.Item name="privateBGVExpDate" noStyle>
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{
                        input: dateInputStyles,
                      }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current < dayjs().startOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="External BGV Agency"
                  required
                  error={errors.externalVerificationAgency}
                  id="externalVerificationAgency"
                >
                  <Form.Item name="externalVerificationAgency" noStyle>
                    <Input placeholder="Verification Co." style={inputStyle} />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="External Verification Expiry"
                  required
                  error={errors.externalVerificationExpDate}
                  id="externalVerificationExpDate"
                >
                  <Form.Item name="externalVerificationExpDate" noStyle>
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{
                        input: dateInputStyles,
                      }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current < dayjs().startOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>
              </FieldComponentWrapper>

              <FieldComponentWrapper>
                <FieldWrap
                  label="Last Internal Verification Date"
                  required
                  error={errors.lastInternalVerificationDate}
                  id="lastInternalVerificationDate"
                >
                  <Form.Item name="lastInternalVerificationDate" noStyle>
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{
                        input: dateInputStyles,
                      }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current < dayjs().startOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>
              </FieldComponentWrapper>
            </div>
            {editingRecord?.driver_Id && (
              <div
                style={{
                  ...cardStyle,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={sectionTitleStyle}>
                  <SettingOutlined /> Setting
                </div>
                <FieldComponentWrapper>
                  <div className="flex items-center gap-5">
                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                      Active Status
                    </label>
                    <Form.Item name="active" valuePropName="checked" noStyle>
                      <Switch size="small" defaultChecked />
                    </Form.Item>
                  </div>
                </FieldComponentWrapper>
              </div>
            )}

            {/* ── Submit / Reset / Approve ───────────────────────────────── */}
            <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
              <Button
                type="primary"
                loading={isSubmitting}
                onClick={handleSubmit}
                style={{
                  background: T.formcss.green,
                  borderColor: T.formcss.green,
                  borderRadius: 8,
                  fontWeight: 600,
                  height: 38,
                  paddingInline: 28,
                  fontSize: 13,
                  border: "1px solid",
                }}
              >
                Submit Driver
              </Button>

              <Button
                onClick={handleReset}
                style={{
                  borderRadius: 8,
                  height: 38,
                  paddingInline: 20,
                  fontSize: 13,
                  borderColor: T.formcss.greyBorder,
                  color: T.formcss.greenMid,
                  background: "#fff",
                  border: "1px solid",
                }}
              >
                Reset
              </Button>

              {isApproved && editingRecord && (
                <Button
                  loading={isApproving}
                  type="primary"
                  onClick={() => approval.open(editingRecord)}
                  style={{
                    background: T.formcss.greenDark,
                    color: "#fff",
                    borderColor: T.formcss.greenDark,
                    borderRadius: 8,
                    fontWeight: 600,
                    height: 38,
                    paddingInline: 20,
                    fontSize: 13,
                    border: "1px solid",
                  }}
                >
                  Approve
                </Button>
              )}
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default DriverForm;
