import React, { useState, useEffect } from "react";
import {
  Input,
  Select,
  DatePicker,
  Switch,
  Form,
  Button,
  Upload,
  Radio,
  message,
} from "antd";
import type { UploadProps } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import {
  SafetyOutlined,
  UploadOutlined,
  CarOutlined,
  EnvironmentOutlined,
  ToolOutlined,
  FileProtectOutlined,
  LoadingOutlined,
  CheckCircleFilled,
  EyeOutlined,
  LeftOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  OWNER_TYPE_OPTIONS,
  GPS_PROVIDER_OPTIONS,
  VEHICLE_DOC_KEYS,
  VEHICLE_FILE_LABELS,
} from "../constants/vehicleConstants";
import type { Vehicle } from "../types/vehicle.types";
import { useFileUpload } from "../../../shared/customHooks/useFileUpload";
import {
  alphanumericOnlyProps,
  lettersOnlyProps,
  addressProps,
  carModelProps,
} from "../utils/inputRestrictions";
import {
  beforeUpload,
  MAX_FILE_SIZE_MB,
} from "../../../shared/utils/uploadValidation.utils";
import { useDocumentApproval } from "../../../shared/customHooks/useDocumentApproval";
import DocumentApproval from "../../../shared/components/DocumentApproval/DocumentApproval";
import { T } from "../../../styles/tokens";
// import {IconLifeCycle} from "../../../assets/dashboard/index"
// ─── Types ────────────────────────────────────────────────────────────────────
type SelectOption = { label: string; value: any | string | number | boolean };

// ─── Design Tokens (identical to DriverForm) ──────────────────────────────────
// const T.formcss = {
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

// ─── Shared Styles (identical to DriverForm) ──────────────────────────────────
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
  borderRadius: 7,
  border: `1px solid ${T.formcss.greyBorder}`,
  height: 34,
};

const dateStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 7,
  fontSize: 12,
  height: 34,
  border: `1px solid ${T.formcss.greyBorder}`,
  backgroundColor: T.formcss.inputBg,
};

const cardStyle: React.CSSProperties = {
  border: `1px solid ${T.formcss.greyBorder}`,
  borderRadius: 12,
  padding: "20px",
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
  marginBottom: 4,
  borderBottom: `1.2px solid ${T.formcss.greyBorder}`,
};

const formWrapStyle: React.CSSProperties = {
  borderRadius: 16,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: T.formcss.label,
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
  id?: string;
}> = ({ label, required, error, children, hint, id = "" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 3 }} id={id}>
    {label && (
      <label style={labelStyle}>
        {label}
        {required && (
          <span style={{ color: T.formcss.error, marginLeft: 2 }}>*</span>
        )}
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
        width: "100%",
        minHeight: 34,
      }}
    >
      <style>
        {`
          .full-upload-v,
          .full-upload-v .ant-upload {
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
            rootClassName="full-upload-v"
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

// ─── Props ────────────────────────────────────────────────────────────────────
interface VehicleFormProps {
  title: string;
  vehicleId?: string | number;
  onClose: () => void;
  editingRecord: Vehicle | null;
  onSubmit?: (values: Record<string, any>) => void;
  isSubmitting: boolean;
  serverErrors: any;
  uploadAndGetUrl: (file: File, name: string) => Promise<string | null>;
  fuelTypeOptions: SelectOption[];
  driverOptions: SelectOption[];
  vehicleTypeOptions: SelectOption[];
  locationOptions: SelectOption[];
  vehicleStatusOptions: SelectOption[];
  vendorOptions: SelectOption[];
  currentStatusOptions: SelectOption[];
  isApproved?: boolean | null;
  approveVehicle?: (vehicleStageId: string | undefined) => Promise<void>;
  isStageCreate?: boolean;
}

const getSafeDoc = (doc: any) => {
  if (doc === null || doc === "null" || doc === undefined || doc === "")
    return null;
  return doc;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const VehicleForm: React.FC<VehicleFormProps> = ({
  title = "",
  onClose = () => {},
  editingRecord,
  onSubmit,
  isSubmitting,
  fuelTypeOptions,
  driverOptions,
  vehicleTypeOptions,
  locationOptions,
  vehicleStatusOptions,
  vendorOptions,
  currentStatusOptions,
  uploadAndGetUrl,
  isApproved = false,
  approveVehicle,
  isStageCreate = false,
}) => {
  const [form] = Form.useForm();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, string | null>>({
    registrationExpiryDate_Doc: null,
    fireExtinguisherExp_Doc: null,
    permitExpiryDate_Doc: null,
    firstAidKitDateExpiry_Doc: null,
    insuranceExpiryDate_Doc: null,
    fitnessExpiryDate_Doc: null,
    roadTaxExpiryDate_Doc: null,
    pucExpiryDate_Doc: null,
    allDocuments_Doc: null,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!editingRecord) {
        form.resetFields();
        return;
      }
      form.setFieldsValue({
        ...editingRecord,
        makeYear: editingRecord.makeYear ? dayjs(editingRecord.makeYear) : null,
        gps_Installation_Date: editingRecord.gps_Installation_Date
          ? dayjs(editingRecord.gps_Installation_Date)
          : null,
        vehicle_Registration_Date: editingRecord.vehicle_Registration_Date
          ? dayjs(editingRecord.vehicle_Registration_Date)
          : null,
        vehicle_Induction_Date: editingRecord.vehicle_Induction_Date
          ? dayjs(editingRecord.vehicle_Induction_Date)
          : null,
        registration_Exp_Date: editingRecord.registration_Exp_Date
          ? dayjs(editingRecord.registration_Exp_Date)
          : null,
        permit_Expiry_Date: editingRecord.permit_Expiry_Date
          ? dayjs(editingRecord.permit_Expiry_Date)
          : null,
        insurance_Expiry_Date: editingRecord.insurance_Expiry_Date
          ? dayjs(editingRecord.insurance_Expiry_Date)
          : null,
        fitness_Expiry_Date: editingRecord.fitness_Expiry_Date
          ? dayjs(editingRecord.fitness_Expiry_Date)
          : null,
        road_Tax_Validity_Expiry: editingRecord.road_Tax_Validity_Expiry
          ? dayjs(editingRecord.road_Tax_Validity_Expiry)
          : null,
        puc_Expiry_Date: editingRecord.puc_Expiry_Date
          ? dayjs(editingRecord.puc_Expiry_Date)
          : null,
        firstAid_Kid_Date: editingRecord.firstAid_Kid_Date
          ? dayjs(editingRecord.firstAid_Kid_Date)
          : null,
        fire_Extinguisher_Date: editingRecord.fire_Extinguisher_Date
          ? dayjs(editingRecord.fire_Extinguisher_Date)
          : null,
      });
      setFiles({
        fireExtinguisherExp_Doc: getSafeDoc(
          editingRecord.fireExtinguisherExp_Doc,
        ),
        permitExpiryDate_Doc: getSafeDoc(editingRecord.permitExpiryDate_Doc),
        firstAidKitDateExpiry_Doc: getSafeDoc(
          editingRecord.firstAidKitDateExpiry_Doc,
        ),
        insuranceExpiryDate_Doc: getSafeDoc(
          editingRecord.insuranceExpiryDate_Doc,
        ),
        fitnessExpiryDate_Doc: getSafeDoc(editingRecord.fitnessExpiryDate_Doc),
        roadTaxExpiryDate_Doc: getSafeDoc(editingRecord.roadTaxExpiryDate_Doc),
        pucExpiryDate_Doc: getSafeDoc(editingRecord.pucExpiryDate_Doc),
        allDocuments_Doc: getSafeDoc(editingRecord.allDocuments_Doc),
        registrationExpiryDate_Doc: getSafeDoc(
          editingRecord.registrationExpiryDate_Doc,
        ),
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

  const vehicleRegRegex =
    /^[A-Z]{2}[- ]?[0-9]{1,2}[- ]?[A-Z]{1,3}[- ]?[0-9]{4}$/;
  const chassisRegex = /^[A-HJ-NPR-Z0-9]{17}$/;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const values = form.getFieldsValue(true);

    if (!values.locCode) errs.locCode = "Office location is required";
    if (!values.vehicleTypeCode)
      errs.vehicleTypeCode = "Vehicle type is required";
    if (!values.vehicle_Registration_No?.trim())
      errs.vehicle_Registration_No = "Registration number is required";
    else if (!vehicleRegRegex.test(values.vehicle_Registration_No?.trim())) {
      errs.vehicle_Registration_No =
        "Invalid registration number (e.g. KA11AB1234)";
    }
    if (!values.make?.trim()) errs.make = "Make is required";
    if (!values.model?.trim()) errs.model = "Model is required";
    if (!values.makeYear) errs.makeYear = "Make year is required";
    if (!values.fuelTypeCode) errs.fuelTypeCode = "Fuel type is required";
    if (!values.chassis_No?.trim())
      errs.chassis_No = "Chassis number is required";
    else if (!chassisRegex.test(values.chassis_No.trim().toUpperCase())) {
      errs.chassis_No =
        "Invalid chassis number (must be 17 characters, no I/O/Q)";
    }
    if (!values.transporterId) errs.transporterId = "Vendor is required";
    if (!isStageCreate && !values.driverId)
      errs.driverId = "Assigned driver is required";

    if (values.isGpsInstalled === true) {
      if (!values.gpsProviderCode)
        errs.gpsProviderCode = "GPS provider is required when GPS is installed";
      if (!values.gps_Installation_Date)
        errs.gps_Installation_Date = "GPS installation date is required";
    }

    if (!values.vehicle_Registration_Date)
      errs.vehicle_Registration_Date = "Registration date is required";
    if (!values.vehicle_Induction_Date)
      errs.vehicle_Induction_Date = "Induction date is required";
    if (!values.registration_Exp_Date)
      errs.registration_Exp_Date = "Registration expiry date is required";
    if (!values.permit_Expiry_Date)
      errs.permit_Expiry_Date = "Permit expiry date is required";
    if (!values.insurance_Expiry_Date)
      errs.insurance_Expiry_Date = "Insurance expiry date is required";
    if (!values.fitness_Expiry_Date)
      errs.fitness_Expiry_Date = "Fitness expiry date is required";

    if (!values.owner_Name?.trim()) errs.owner_Name = "Owner name is required";
    if (!values.owner_Type) errs.owner_Type = "Owner type is required";
    if (!values.owner_Address?.trim())
      errs.owner_Address = "Owner address is required";

    if (!values.vehicle_Status)
      errs.vehicle_Status = "Vehicle status is required";
    if (!values.current_Status)
      errs.current_Status = "Current status is required";

    if (!values.road_Tax_Validity_Expiry)
      errs.road_Tax_Validity_Expiry = "Road tax expiry date is required";
    if (!values.puc_Expiry_Date)
      errs.puc_Expiry_Date = "PUC expiry date is required";
    if (!values.firstAid_Kid_Date)
      errs.firstAid_Kid_Date = "First aid kit expiry date is required";
    if (!values.fire_Extinguisher_Date)
      errs.fire_Extinguisher_Date = "Fire extinguisher expiry date is required";

    if (!files.registrationExpiryDate_Doc)
      errs.registrationExpiryDate_Doc =
        "Registration expiry document is required";
    if (!files.permitExpiryDate_Doc)
      errs.permitExpiryDate_Doc = "Permit expiry document is required";
    if (!files.insuranceExpiryDate_Doc)
      errs.insuranceExpiryDate_Doc = "Insurance expiry document is required";
    if (!files.fitnessExpiryDate_Doc)
      errs.fitnessExpiryDate_Doc = "Fitness expiry document is required";
    if (!files.roadTaxExpiryDate_Doc)
      errs.roadTaxExpiryDate_Doc = "Road tax expiry document is required";
    if (!files.pucExpiryDate_Doc)
      errs.pucExpiryDate_Doc = "PUC expiry document is required";
    if (!files.firstAidKitDateExpiry_Doc)
      errs.firstAidKitDateExpiry_Doc = "First aid kit document is required";
    if (!files.fireExtinguisherExp_Doc)
      errs.fireExtinguisherExp_Doc = "Fire extinguisher document is required";
    if (!files.allDocuments_Doc)
      errs.allDocuments_Doc = "All documents upload is required";

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
    const isValid = validate();
    if (!isValid) return;
    try {
      const values = await form.validateFields();
      Object.keys(values).forEach((k) => {
        if (values[k] && dayjs.isDayjs(values[k])) {
          values[k] = values[k].toISOString();
        }
      });
      let payload = { ...values };
      if (isStageCreate) {
        payload = { ...payload, driverId: null };
      }
      onSubmit?.({ ...payload, ...files });
    } catch (error) {
      console.log(error, "error");
    }
  };

  const handleReset = () => {
    form.resetFields();
    setErrors({});
    setFiles({
      fireExtinguisherExp_Doc: null,
      permitExpiryDate_Doc: null,
      firstAidKitDateExpiry_Doc: null,
      insuranceExpiryDate_Doc: null,
      fitnessExpiryDate_Doc: null,
      roadTaxExpiryDate_Doc: null,
      pucExpiryDate_Doc: null,
      allDocuments_Doc: null,
      registrationExpiryDate_Doc: null,
    });
  };

  const gpsInstalled = Form.useWatch("isGpsInstalled", form);

  const ImageHint = () => (
    <>
      <InfoCircleOutlined /> Max {MAX_FILE_SIZE_MB}MB
    </>
  );

  const approval = useDocumentApproval({ docKeys: VEHICLE_DOC_KEYS });

  const antOverride = `
/* =========================================
   INPUT
========================================= */

.vehicle-form-scope .ant-input {
  background: ${T.formcss.inputBg} !important;
  border: 1px solid ${T.formcss.greyBorder} !important;
  border-radius: 7px !important;
  font-size: 12px !important;
  height: 34px !important;
  box-shadow: none !important;
  transition: all 0.2s ease !important;
}

.vehicle-form-scope .ant-input:hover {
  border-color: ${T.formcss.greenAccent} !important;
}

.vehicle-form-scope .ant-input:focus,
.vehicle-form-scope .ant-input-focused {
  border-color: ${T.formcss.greenAccent} !important;
  box-shadow: 0 0 0 2px ${T.formcss.greenAccent}22 !important;
  outline: none !important;
}

/* =========================================
   SELECT
========================================= */

.vehicle-form-scope .ant-select .ant-select-selector {
  background: ${T.formcss.inputBg} !important;
  border: 1px solid ${T.formcss.greyBorder} !important;
  border-radius: 7px !important;
  height: 34px !important;
  font-size: 12px !important;
  box-shadow: none !important;
  transition: all 0.2s ease !important;
}

.vehicle-form-scope .ant-select:hover .ant-select-selector {
  border-color: ${T.formcss.greenAccent} !important;
}

.vehicle-form-scope .ant-select-focused .ant-select-selector {
  border-color: ${T.formcss.greenAccent} !important;
  box-shadow: 0 0 0 2px ${T.formcss.greenAccent}22 !important;
}

/* =========================================
   DATE PICKER
========================================= */

.vehicle-form-scope .ant-picker {
  background: ${T.formcss.inputBg} !important;
  border: 1px solid ${T.formcss.greyBorder} !important;
  border-radius: 7px !important;
  height: 34px !important;
  box-shadow: none !important;
  transition: all 0.2s ease !important;
}

.vehicle-form-scope .ant-picker:hover {
  border-color: ${T.formcss.greenAccent} !important;
}

.vehicle-form-scope .ant-picker-focused {
  border-color: ${T.formcss.greenAccent} !important;
  box-shadow: 0 0 0 2px ${T.formcss.greenAccent}22 !important;
}

/* =========================================
   REMOVE DEFAULT BLUE SHADOW
========================================= */

.vehicle-form-scope .ant-input:focus,
.vehicle-form-scope .ant-select-focused .ant-select-selector,
.vehicle-form-scope .ant-picker-focused {
  box-shadow: 0 0 0 2px ${T.formcss.greenAccent}22 !important;
}

/* =========================================
   TEXT
========================================= */

.vehicle-form-scope .ant-input::placeholder,
.vehicle-form-scope .ant-select-selection-placeholder {
  color: #a0a8b0 !important;
  font-size: 12px !important;
}

/* =========================================
   SELECT ALIGNMENT
========================================= */

.vehicle-form-scope .ant-select-selection-item,
.vehicle-form-scope .ant-select-selection-placeholder {
  line-height: 32px !important;
}

/* =========================================
   ERROR
========================================= */

.vehicle-form-scope .ant-form-item-explain-error {
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
        fileLabels={VEHICLE_FILE_LABELS}
        title="Vehicle Document Preview"
        approveLabel="Approve Vehicle"
        onApprove={() =>
          approveVehicle?.(editingRecord?.vehicle_Id?.toString())
        }
      />
      <div
        className="vehicle-form-scope"
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
              }}
            >
              <LeftOutlined style={{ fontSize: 13 }} />
            </button>
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: T.formcss.green,
                }}
              >
                {title} Vehicle
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: T.formcss.textMuted,
                  marginTop: 1,
                }}
              >
                {editingRecord
                  ? "Update vehicle profile and documents"
                  : "Fill in all required details to register a new vehicle"}
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
                Vehicle Detials
            ════════════════════════════════════════════════════ */}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Vehicle Info Card */}
              <div
                style={{
                  ...cardStyle,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={sectionTitleStyle}>
                  <CarOutlined />
                  Vehicle Info
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
                    label="Registration No."
                    required
                    error={errors.vehicle_Registration_No}
                    id="vehicle_Registration_No"
                  >
                    <Form.Item
                      name="vehicle_Registration_No"
                      rules={[{ required: true, message: "Required" }]}
                      noStyle
                    >
                      <Input
                        placeholder="KA11AB1234"
                        style={{ ...inputStyle, textTransform: "uppercase" }}
                        maxLength={10}
                        onChange={(e) =>
                          form.setFieldsValue({
                            vehicle_Registration_No:
                              e.target.value.toUpperCase(),
                          })
                        }
                        {...alphanumericOnlyProps}
                      />
                    </Form.Item>
                  </FieldWrap>
                  <FieldWrap
                    label="Vehicle Type"
                    required
                    error={errors.vehicleTypeCode}
                    id="vehicleTypeCode"
                  >
                    <Form.Item
                      name="vehicleTypeCode"
                      rules={[{ required: true, message: "Required" }]}
                      noStyle
                    >
                      <Select
                        options={vehicleTypeOptions}
                        placeholder="Select type"
                        style={selectStyle}
                      />
                    </Form.Item>
                  </FieldWrap>
                  <FieldWrap
                    label="Assigned Driver"
                    required={!isStageCreate}
                    error={errors.driverId}
                    id="driverId"
                  >
                    <Form.Item name="driverId" noStyle>
                      <Select
                        options={driverOptions}
                        placeholder="Select driver"
                        style={selectStyle}
                      />
                    </Form.Item>
                  </FieldWrap>

                  <FieldWrap
                    label="Make"
                    required
                    error={errors.make}
                    id="make"
                  >
                    <Form.Item
                      name="make"
                      rules={[{ required: true, message: "Required" }]}
                      noStyle
                    >
                      <Input
                        placeholder="Enter make"
                        style={inputStyle}
                        maxLength={20}
                        {...lettersOnlyProps}
                      />
                    </Form.Item>
                  </FieldWrap>
                  <FieldWrap
                    label="Model"
                    required
                    error={errors.model}
                    id="model"
                  >
                    <Form.Item
                      name="model"
                      rules={[{ required: true, message: "Required" }]}
                      noStyle
                    >
                      <Input
                        placeholder="Enter model"
                        style={inputStyle}
                        maxLength={10}
                        {...carModelProps}
                      />
                    </Form.Item>
                  </FieldWrap>

                  <FieldWrap
                    label="Make Year"
                    required
                    error={errors.makeYear}
                    id="makeYear"
                  >
                    <Form.Item
                      name="makeYear"
                      rules={[{ required: true, message: "Required" }]}
                      noStyle
                    >
                      <DatePicker
                        format="DD-MM-YYYY"
                        placeholder="Select date"
                        style={dateStyle}
                        styles={{ input: dateInputStyles }}
                        inputReadOnly
                        disabledDate={(current) =>
                          current && current > dayjs().endOf("day")
                        }
                      />
                    </Form.Item>
                  </FieldWrap>
                  <FieldWrap
                    label="Fuel Type"
                    required
                    error={errors.fuelTypeCode}
                    id="fuelTypeCode"
                  >
                    <Form.Item
                      name="fuelTypeCode"
                      rules={[{ required: true, message: "Required" }]}
                      noStyle
                    >
                      <Select
                        options={fuelTypeOptions}
                        placeholder="Select fuel"
                        style={selectStyle}
                      />
                    </Form.Item>
                  </FieldWrap>

                  <FieldWrap
                    label="Chassis No."
                    required
                    error={errors.chassis_No}
                    id="chassis_No"
                  >
                    <Form.Item
                      name="chassis_No"
                      rules={[{ required: true, message: "Required" }]}
                      noStyle
                    >
                      <Input
                        placeholder="MAT123456789XXXXX"
                        style={{ ...inputStyle, textTransform: "uppercase" }}
                        maxLength={17}
                        onChange={(e) => {
                          e.target.value = e.target.value.toUpperCase();
                        }}
                        {...alphanumericOnlyProps}
                      />
                    </Form.Item>
                  </FieldWrap>
                </FieldComponentWrapper>
              </div>

              {/* GPS Info Card */}
              <div
                style={{
                  ...cardStyle,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={sectionTitleStyle}>
                  <EnvironmentOutlined />
                  GPS Information
                </div>
                <FieldComponentWrapper>
                  <div>
                    <label style={labelStyle}>GPS Installed</label>
                    <Form.Item
                      name="isGpsInstalled"
                      noStyle
                      initialValue={true}
                    >
                      <Radio.Group>
                        <Radio value={true} style={{ fontSize: 11 }}>
                          Yes
                        </Radio>
                        <Radio value={false} style={{ fontSize: 11 }}>
                          No
                        </Radio>
                      </Radio.Group>
                    </Form.Item>
                  </div>

                  <FieldWrap
                    label="GPS Provider"
                    required={gpsInstalled}
                    error={errors.gpsProviderCode}
                    id="gpsProviderCode"
                  >
                    <Form.Item name="gpsProviderCode" noStyle>
                      <Select
                        options={GPS_PROVIDER_OPTIONS}
                        placeholder="Select provider"
                        style={selectStyle}
                        disabled={!gpsInstalled}
                      />
                    </Form.Item>
                  </FieldWrap>

                  <FieldWrap
                    label="GPS Installation Date"
                    required={gpsInstalled}
                    error={errors.gps_Installation_Date}
                    id="gps_Installation_Date"
                  >
                    <Form.Item name="gps_Installation_Date" noStyle>
                      <DatePicker
                        format="DD-MM-YYYY"
                        placeholder="Select date"
                        style={dateStyle}
                        styles={{ input: dateInputStyles }}
                        inputReadOnly
                        disabled={!gpsInstalled}
                        disabledDate={(current) =>
                          current && current > dayjs().endOf("day")
                        }
                      />
                    </Form.Item>
                  </FieldWrap>
                </FieldComponentWrapper>
              </div>
            </div>
            {/* ════════════════════════════════════════════════════
                Registration & Dates
            ════════════════════════════════════════════════════ */}
            {/* ── Col 2:  ───────────────────────── */}
            <div
              style={{
                ...cardStyle,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <div style={sectionTitleStyle}>
                <FileProtectOutlined />
                Registration &amp; Dates
              </div>
              <FieldComponentWrapper>
                <FieldWrap
                  label="Registration Date"
                  required
                  error={errors.vehicle_Registration_Date}
                  id="vehicle_Registration_Date"
                >
                  <Form.Item
                    name="vehicle_Registration_Date"
                    rules={[{ required: true, message: "Required" }]}
                    noStyle
                  >
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{ input: dateInputStyles }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current > dayjs().endOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Induction Date"
                  required
                  error={errors.vehicle_Induction_Date}
                  id="vehicle_Induction_Date"
                >
                  <Form.Item
                    name="vehicle_Induction_Date"
                    rules={[{ required: true, message: "Required" }]}
                    noStyle
                  >
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{ input: dateInputStyles }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current > dayjs().endOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Registration Expiry Date"
                  required
                  error={errors.registration_Exp_Date}
                  id="registration_Exp_Date"
                >
                  <Form.Item
                    name="registration_Exp_Date"
                    rules={[{ required: true, message: "Required" }]}
                    noStyle
                  >
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{ input: dateInputStyles }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current < dayjs().endOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Registration Expiry Doc"
                  required
                  error={errors.registrationExpiryDate_Doc}
                  hint={<ImageHint />}
                  id="registrationExpiryDate_Doc"
                >
                  <ImageUpload
                    name="registrationExpiryDate_Doc"
                    value={files.registrationExpiryDate_Doc}
                    uploadAndGetUrl={uploadAndGetUrl}
                    onChange={handleFileChange}
                  />
                </FieldWrap>

                <FieldWrap
                  label="Permit Expiry Date"
                  required
                  error={errors.permit_Expiry_Date}
                  id="permit_Expiry_Date"
                >
                  <Form.Item
                    name="permit_Expiry_Date"
                    rules={[{ required: true, message: "Required" }]}
                    noStyle
                  >
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{ input: dateInputStyles }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current < dayjs().endOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Permit Expiry Doc"
                  required
                  error={errors.permitExpiryDate_Doc}
                  hint={<ImageHint />}
                  id="permitExpiryDate_Doc"
                >
                  <ImageUpload
                    name="permitExpiryDate_Doc"
                    value={files.permitExpiryDate_Doc}
                    uploadAndGetUrl={uploadAndGetUrl}
                    onChange={handleFileChange}
                  />
                </FieldWrap>

                <FieldWrap
                  label="Insurance Expiry Date"
                  required
                  error={errors.insurance_Expiry_Date}
                  id="insurance_Expiry_Date"
                >
                  <Form.Item
                    name="insurance_Expiry_Date"
                    rules={[{ required: true, message: "Required" }]}
                    noStyle
                  >
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{ input: dateInputStyles }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current < dayjs().endOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Insurance Expiry Doc"
                  required
                  error={errors.insuranceExpiryDate_Doc}
                  hint={<ImageHint />}
                  id="insuranceExpiryDate_Doc"
                >
                  <ImageUpload
                    name="insuranceExpiryDate_Doc"
                    value={files.insuranceExpiryDate_Doc}
                    uploadAndGetUrl={uploadAndGetUrl}
                    onChange={handleFileChange}
                  />
                </FieldWrap>

                <FieldWrap
                  label="Fitness Expiry Date"
                  required
                  error={errors.fitness_Expiry_Date}
                  id="fitness_Expiry_Date"
                >
                  <Form.Item
                    name="fitness_Expiry_Date"
                    rules={[{ required: true, message: "Required" }]}
                    noStyle
                  >
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{ input: dateInputStyles }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current < dayjs().endOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Fitness Expiry Doc"
                  required
                  error={errors.fitnessExpiryDate_Doc}
                  hint={<ImageHint />}
                  id="fitnessExpiryDate_Doc"
                >
                  <ImageUpload
                    name="fitnessExpiryDate_Doc"
                    value={files.fitnessExpiryDate_Doc}
                    uploadAndGetUrl={uploadAndGetUrl}
                    onChange={handleFileChange}
                  />
                </FieldWrap>
              </FieldComponentWrapper>
            </div>

            {/* ── Col 3: Owner Info + Status & Lifecycle ────────────── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Owner Info */}
              <div
                style={{
                  ...cardStyle,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={sectionTitleStyle}>
                  <ToolOutlined />
                  Owner Info
                </div>
                <FieldComponentWrapper>
                  <FieldWrap
                    label="Owner Name"
                    required
                    error={errors.owner_Name}
                    id="owner_Name"
                  >
                    <Form.Item
                      name="owner_Name"
                      rules={[{ required: true, message: "Required" }]}
                      noStyle
                    >
                      <Input
                        placeholder="Full owner name"
                        style={inputStyle}
                        {...lettersOnlyProps}
                      />
                    </Form.Item>
                  </FieldWrap>

                  <FieldWrap
                    label="Owner or Attached"
                    required
                    error={errors.owner_Type}
                    id="owner_Type"
                  >
                    <Form.Item
                      name="owner_Type"
                      rules={[{ required: true, message: "Required" }]}
                      noStyle
                    >
                      <Select
                        options={OWNER_TYPE_OPTIONS}
                        placeholder="Select type"
                        style={selectStyle}
                      />
                    </Form.Item>
                  </FieldWrap>

                  <FieldWrap
                    label="Owner Address"
                    required
                    error={errors.owner_Address}
                    id="owner_Address"
                  >
                    <Form.Item
                      name="owner_Address"
                      rules={[{ required: true, message: "Required" }]}
                      noStyle
                    >
                      <Input.TextArea
                        placeholder="Full owner address"
                        rows={1}
                        style={{
                          ...inputStyle,
                          height: "auto",
                          resize: "none",
                        }}
                        {...addressProps}
                      />
                    </Form.Item>
                  </FieldWrap>
                </FieldComponentWrapper>
              </div>

              {/* Status & Lifecycle */}
              <div
                style={{
                  ...cardStyle,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={sectionTitleStyle}>
                  <SafetyOutlined />
                  Status &amp; Lifecycle
                </div>
                <FieldComponentWrapper>
                  <FieldWrap
                    label="Vehicle Status"
                    required
                    error={errors.vehicle_Status}
                    id="vehicle_Status"
                  >
                    <Form.Item
                      name="vehicle_Status"
                      rules={[{ required: true, message: "Required" }]}
                      noStyle
                    >
                      <Select
                        options={vehicleStatusOptions}
                        placeholder="Select status"
                        style={selectStyle}
                      />
                    </Form.Item>
                  </FieldWrap>

                  <FieldWrap
                    label="Current Status"
                    required
                    error={errors.current_Status}
                    id="current_Status"
                  >
                    <Form.Item
                      name="current_Status"
                      rules={[{ required: true, message: "Required" }]}
                      noStyle
                    >
                      <Select
                        options={currentStatusOptions}
                        placeholder="Select status"
                        style={selectStyle}
                      />
                    </Form.Item>
                  </FieldWrap>

                  <FieldWrap
                    label="Remarks"
                    error={errors.remarks}
                    id="remarks"
                  >
                    <Form.Item name="remarks" noStyle>
                      <Input.TextArea
                        placeholder="Optional remarks…"
                        rows={1.2}
                        style={{
                          ...inputStyle,
                          height: "auto",
                          resize: "none",
                        }}
                      />
                    </Form.Item>
                  </FieldWrap>

                  <FieldWrap
                    label="All Documents"
                    required
                    error={errors.allDocuments_Doc}
                    hint={<ImageHint />}
                    id="allDocuments_Doc"
                  >
                    <ImageUpload
                      name="allDocuments_Doc"
                      value={files.allDocuments_Doc}
                      uploadAndGetUrl={uploadAndGetUrl}
                      onChange={handleFileChange}
                    />
                  </FieldWrap>
                </FieldComponentWrapper>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════
                Safety & Compliance (full width)
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
                Safety &amp; Compliance
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 16,
                }}
              >
                <FieldWrap
                  label="Road Tax Validity Expiry"
                  required
                  error={errors.road_Tax_Validity_Expiry}
                  id="road_Tax_Validity_Expiry"
                >
                  <Form.Item
                    name="road_Tax_Validity_Expiry"
                    rules={[{ required: true, message: "Required" }]}
                    noStyle
                  >
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{ input: dateInputStyles }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current < dayjs().endOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="PUC Expiry Date"
                  required
                  error={errors.puc_Expiry_Date}
                  id="puc_Expiry_Date"
                >
                  <Form.Item
                    name="puc_Expiry_Date"
                    rules={[{ required: true, message: "Required" }]}
                    noStyle
                  >
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{ input: dateInputStyles }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current < dayjs().endOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="First Aid Kit Expiry"
                  required
                  error={errors.firstAid_Kid_Date}
                  id="firstAid_Kid_Date"
                >
                  <Form.Item
                    name="firstAid_Kid_Date"
                    rules={[{ required: true, message: "Required" }]}
                    noStyle
                  >
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{ input: dateInputStyles }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current < dayjs().endOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>

                <FieldWrap
                  label="Fire Extinguisher Expiry"
                  required
                  error={errors.fire_Extinguisher_Date}
                  id="fire_Extinguisher_Date"
                >
                  <Form.Item
                    name="fire_Extinguisher_Date"
                    rules={[{ required: true, message: "Required" }]}
                    noStyle
                  >
                    <DatePicker
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                      style={dateStyle}
                      styles={{ input: dateInputStyles }}
                      inputReadOnly
                      disabledDate={(current) =>
                        current && current < dayjs().endOf("day")
                      }
                    />
                  </Form.Item>
                </FieldWrap>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 16,
                }}
              >
                <FieldWrap
                  label="Road Tax Expiry Doc"
                  required
                  error={errors.roadTaxExpiryDate_Doc}
                  hint={<ImageHint />}
                  id="roadTaxExpiryDate_Doc"
                >
                  <ImageUpload
                    name="roadTaxExpiryDate_Doc"
                    value={files.roadTaxExpiryDate_Doc}
                    uploadAndGetUrl={uploadAndGetUrl}
                    onChange={handleFileChange}
                  />
                </FieldWrap>

                <FieldWrap
                  label="PUC Expiry Doc"
                  required
                  error={errors.pucExpiryDate_Doc}
                  hint={<ImageHint />}
                  id="pucExpiryDate_Doc"
                >
                  <ImageUpload
                    name="pucExpiryDate_Doc"
                    value={files.pucExpiryDate_Doc}
                    uploadAndGetUrl={uploadAndGetUrl}
                    onChange={handleFileChange}
                  />
                </FieldWrap>

                <FieldWrap
                  label="First Aid Kit Doc"
                  required
                  error={errors.firstAidKitDateExpiry_Doc}
                  hint={<ImageHint />}
                  id="firstAidKitDateExpiry_Doc"
                >
                  <ImageUpload
                    name="firstAidKitDateExpiry_Doc"
                    value={files.firstAidKitDateExpiry_Doc}
                    uploadAndGetUrl={uploadAndGetUrl}
                    onChange={handleFileChange}
                  />
                </FieldWrap>

                <FieldWrap
                  label="Fire Extinguisher Doc"
                  required
                  error={errors.fireExtinguisherExp_Doc}
                  hint={<ImageHint />}
                  id="fireExtinguisherExp_Doc"
                >
                  <ImageUpload
                    name="fireExtinguisherExp_Doc"
                    value={files.fireExtinguisherExp_Doc}
                    uploadAndGetUrl={uploadAndGetUrl}
                    onChange={handleFileChange}
                  />
                </FieldWrap>
              </div>
            </div>
            {editingRecord?.vehicle_Id && (
              <div
                style={{
                  ...cardStyle,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={sectionTitleStyle}>
                  <SettingOutlined />
                  Setting
                </div>
                <FieldComponentWrapper>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      paddingTop: 4,
                    }}
                  >
                    <label style={labelStyle}>Active Status</label>
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
                }}
              >
                Submit Vehicle
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
                }}
              >
                Reset
              </Button>

              {isApproved && editingRecord && (
                <Button
                  loading={isSubmitting}
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
                  }}
                >
                  Approve Vehicle
                </Button>
              )}
            </div>
          </Form>
        </div>
      </div>
    </>
  );
};

export default VehicleForm;
