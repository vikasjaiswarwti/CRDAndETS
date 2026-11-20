import React, { useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { getExcelDownload } from "../constants/driverFormFields";
import { downloadExcel } from "../../../shared/hooks/useExcelExport";
import { Tooltip } from "antd";
import * as XLSX from "xlsx";
import {
  InboxOutlined,
  CloudDownloadOutlined,
  UploadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Button, Col, Form, message, Row, Upload } from "antd";
import { useDriverMutations } from "../hooks/useDriverMutations";
import type { CreateDriverDto } from "../types/driver.types";
import {
  MAX_FILE_SIZE_MB,
  validateFileSize,
} from "../../../shared/utils/uploadValidation.utils";
import { T } from "../../../styles/tokens";
import { usePermittedHook } from "../hooks/usePermittedHook";

const selectStyle: React.CSSProperties = {
  width: "100%",
  fontSize: 12,
  background: T.formcss.inputBg,
  border: `1px solid ${T.formcss.greyBorder}`,
  height: 34,
};
const { Dragger } = Upload;
type SelectOption = { label: string; value: any };
interface BulkUploadModalProps {
  open: boolean;
  onClose: () => void;
  // statesOptions: SelectOption[];
  vendorOptions: SelectOption[];
  locationOptions: SelectOption[];
}

interface UploadSummary {
  total: number;
  success: number;
  failed: number;
}

const excelToApiFieldMap: Record<string, string> = {
  "Active Status": "active",
  "Alternate Mobile Number": "alternateMobileNo",
  "Blood Group": "bloodGroup",
  "Current Status": "currentStatus", // 0=Inactive | 1=Active | 2=Suspended | 3=Terminated
  "Date of Birth": "dob",
  "Driving License Authority": "driverLicenceAuthority",
  "Driver Name": "driverName",
  "Driver Type": "driverType",
  "External Verification Agency": "externalVerificationAgency",
  "External Verification Expiry Date": "externalVerificationExpDate",
  "Father Name": "fatherName",
  Gender: "gender",
  "Government ID Document": "govtIdDoc",
  "Government ID Proof Type": "govtIdProof", // 1=Aadhaar | 2=PAN | 3=Passport | 4=Voter ID
  "Induction Date": "inductionDate",
  "Last Internal Verification Date": "lastInternalVerificationDate",
  "Last Training Date": "lastTrainingDate",
  "Last Training Document": "lastTrainingDoc",
  "License Expiry Date": "licenseExpDate",
  "License Expiry Document": "licenseExpDoc",
  "License Issue Date": "licenseIssueDate",
  "Driving License Number": "licenseNo",
  "Location Code": "locCode",
  "Mobile Number": "mobileNo",
  "Permanent Address": "permanentAddress",
  "Police Verification Completed": "policeVerification",
  "Police Verification Expiry Date": "policeVerificationExpDate",
  "Police Verification Document": "policeVerificationExpDoc",
  "Present Address": "presentAddress",
  "Private BGV Expiry Date": "privateBGVExpDate",
  "Profile Image": "profileImageDoc",
  Remarks: "remarks",
  "Training Status": "trainingStatus",
  "Transporter ID": "transporterId",
};

// Reverse map: API key → Excel header (used for friendly error messages)
const apiToExcelHeaderMap: Record<string, string> = Object.fromEntries(
  Object.entries(excelToApiFieldMap).map(([header, key]) => [key, header]),
);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Required API field keys. All must be present and non-empty after remapping. */
const REQUIRED_FIELDS = [
  // "locCode",
  // "transporterId",
  "driverName",
  "mobileNo",
  "licenseNo",
  "licenseIssueDate",
  "licenseExpDate",
  "dob",
  "gender",
  "driverType",
] as const;

/** All date fields — validated when a value is present. */
const ALL_DATE_FIELDS = [
  "dob",
  "licenseIssueDate",
  "licenseExpDate",
  "inductionDate",
  "lastTrainingDate",
  "lastInternalVerificationDate",
  "externalVerificationExpDate",
  "policeVerificationExpDate",
  "privateBGVExpDate",
] as const;

const VALID_GENDERS = ["male", "female", "other"] as const;

const remapRow = (rawRow: Record<string, unknown>): Record<string, unknown> => {
  const remapped: Record<string, unknown> = {};
  for (const [excelHeader, value] of Object.entries(rawRow)) {
    const apiKey = excelToApiFieldMap[excelHeader];
    if (apiKey) {
      remapped[apiKey] = value;
    }
  }
  return remapped;
};

const isValidDate = (val: unknown): boolean => {
  if (val === null || val === undefined || val === "") return false;
  if (val instanceof Date) return !isNaN(val.getTime());

  const str = String(val).trim();

  // Excel serial number
  if (/^\d+$/.test(str)) {
    const epoch = new Date(1899, 11, 30);
    return !isNaN(
      new Date(epoch.getTime() + Number(str) * 86_400_000).getTime(),
    );
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (ymdMatch) {
    return !isNaN(
      new Date(`${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`).getTime(),
    );
  }

  return !isNaN(Date.parse(str));
};

/** Converts any supported date value to ISO string, or null. */
const toISOOrNull = (val: unknown): string | null => {
  if (
    val === null ||
    val === undefined ||
    val === "" ||
    String(val).trim().toLowerCase() === "null"
  )
    return null;

  if (val instanceof Date)
    return isNaN(val.getTime()) ? null : val.toISOString();

  const str = String(val).trim();

  // Excel serial number
  if (/^\d+$/.test(str)) {
    const epoch = new Date(1899, 11, 30);
    const parsed = new Date(epoch.getTime() + Number(str) * 86_400_000);
    return isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (ymdMatch) {
    const parsed = new Date(`${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`);
    return isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback.toISOString();
};

const toBool = (val: unknown): boolean =>
  val === true ||
  val === 1 ||
  String(val).toLowerCase() === "true" ||
  String(val) === "1";

// ---------------------------------------------------------------------------
// Helper: null-safe string
// ---------------------------------------------------------------------------

/** Returns trimmed string or null when value is empty / the literal "null". */
const toStringOrNull = (val: unknown): string | null => {
  if (val === null || val === undefined || val === "") return null;
  const str = String(val).trim();
  return str.toLowerCase() === "null" || str === "" ? null : str;
};
const drivingLicenseRegex = /^[A-Z]{2}[0-9]{2}\s?[0-9]{4}[0-9]{7}$/i;
const validateRows = (rows: Record<string, unknown>[]): string[] => {
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const label = `Row ${index + 2}`;

    // Helper to get the friendly Excel column name in error messages
    const col = (apiKey: string) => apiToExcelHeaderMap[apiKey] ?? apiKey;

    // ── Required fields ──────────────────────────────────────────────────
    REQUIRED_FIELDS.forEach((field) => {
      const val = row[field];
      if (val === undefined || val === null || String(val).trim() === "") {
        errors.push(`${label}: "${col(field)}" is required`);
      }
    });

    // ── Location Code — positive integer ─────────────────────────────────
    if (row.locCode !== undefined && row.locCode !== "") {
      const n = Number(row.locCode);
      if (isNaN(n) || !Number.isInteger(n) || n <= 0) {
        errors.push(`${label}: "${col("locCode")}" must be a positive integer`);
      }
    }

    // ── Transporter ID — positive integer ─────────────────────────────────
    if (row.transporterId !== undefined && row.transporterId !== "") {
      const n = Number(row.transporterId);
      if (isNaN(n) || !Number.isInteger(n) || n <= 0) {
        errors.push(
          `${label}: "${col("transporterId")}" must be a positive integer`,
        );
      }
    }

    // ── Driver Name — minimum 2 characters ───────────────────────────────
    if (row.driverName && String(row.driverName).trim().length < 2) {
      errors.push(
        `${label}: "${col("driverName")}" must be at least 2 characters`,
      );
    }

    // ── Mobile Number — exactly 10 digits ────────────────────────────────
    if (row.mobileNo && !/^\d{10}$/.test(String(row.mobileNo))) {
      errors.push(`${label}: "${col("mobileNo")}" must be exactly 10 digits`);
    }

    // ── Alternate Mobile — 10 digits if provided; must differ from primary ─
    const altMobile = toStringOrNull(row.alternateMobileNo);
    if (altMobile !== null) {
      if (!/^\d{10}$/.test(altMobile)) {
        errors.push(
          `${label}: "${col("alternateMobileNo")}" must be exactly 10 digits`,
        );
      } else if (altMobile === String(row.mobileNo).trim()) {
        errors.push(
          `${label}: "${col("alternateMobileNo")}" must differ from "${col("mobileNo")}"`,
        );
      }
    }

    // ── Driving License Number — alphanumeric, 6–20 chars ────────────────
    if (row.licenseNo && !drivingLicenseRegex.test(String(row.licenseNo))) {
      errors.push(
        `${label}: Enter a valid Indian Driving License Number (Example: DL0120123456789)`,
      );
    }

    // ── Gender ───────────────────────────────────────────────────────────
    if (
      row.gender &&
      !VALID_GENDERS.includes(
        String(row.gender) as (typeof VALID_GENDERS)[number],
      )
    ) {
      errors.push(
        `${label}: "${col("gender")}" must be one of: ${VALID_GENDERS.join(", ")}`,
      );
    }

    // ── All date fields — validated when a value is present ───────────────
    ALL_DATE_FIELDS.forEach((field) => {
      const val = row[field];
      if (
        val !== undefined &&
        val !== null &&
        val !== "" &&
        String(val).toLowerCase() !== "null"
      ) {
        if (!isValidDate(val)) {
          errors.push(
            `${label}: "${col(field)}" must be a valid date (YYYY-MM-DD)`,
          );
        }
      }
    });

    // ── License Expiry must be after License Issue ─────────────────────
    if (row.licenseIssueDate && row.licenseExpDate) {
      const issueISO = toISOOrNull(row.licenseIssueDate);
      const expISO = toISOOrNull(row.licenseExpDate);
      if (issueISO && expISO && new Date(expISO) <= new Date(issueISO)) {
        errors.push(
          `${label}: "${col("licenseExpDate")}" must be after "${col("licenseIssueDate")}"`,
        );
      }
    }

    // ── Date of Birth must be in the past ────────────────────────────────
    if (row.dob) {
      const dobISO = toISOOrNull(row.dob);
      if (dobISO && new Date(dobISO) >= new Date()) {
        errors.push(`${label}: "${col("dob")}" must be in the past`);
      }
    }

    // ── Police Verification Expiry requires verification = true ──────────
    const hasPoliceVerif = toBool(row.policeVerification);
    const policeExpVal = toStringOrNull(row.policeVerificationExpDate);
    if (!hasPoliceVerif && policeExpVal !== null) {
      errors.push(
        `${label}: "${col("policeVerificationExpDate")}" is provided but "${col("policeVerification")}" is false`,
      );
    }
  });

  return errors;
};

// ---------------------------------------------------------------------------
// Formatter: remapped row → CreateDriverDto
// ---------------------------------------------------------------------------

const formatRow = (row: Record<string, unknown>): Partial<CreateDriverDto> => ({
  // ── Organisation ────────────────────────────────────────────────────────
  locCode: Number(row.locCode),
  transporterId: Number(row.transporterId),
  driverType: toStringOrNull(row.driverType),
  currentStatus: null, // Excel uploads always create active drivers; status changes must be done manually later

  active: true,

  // ── Identity ─────────────────────────────────────────────────────────────
  driverName: String(row.driverName ?? "").trim(),
  gender: String(row.gender ?? "").trim(),
  dob: toISOOrNull(row.dob),
  fatherName: toStringOrNull(row.fatherName),
  bloodGroup: toStringOrNull(row.bloodGroup),

  // ── Contact ───────────────────────────────────────────────────────────────
  mobileNo: String(row.mobileNo ?? "").trim(),
  alternateMobileNo: toStringOrNull(row.alternateMobileNo),
  permanentAddress: row.permanentAddress
    ? String(row.permanentAddress).trim()
    : "",
  presentAddress: toStringOrNull(row.presentAddress),

  // ── Licence ───────────────────────────────────────────────────────────────
  licenseNo: String(row.licenseNo ?? "")
    .trim()
    .toUpperCase(),
  licenseIssueDate: toISOOrNull(row.licenseIssueDate),
  licenseExpDate: toISOOrNull(row.licenseExpDate),
  licenseExpDoc: null,
  driverLicenceAuthority: row.driverLicenceAuthority
    ? String(row.driverLicenceAuthority).trim()
    : "",
  govtIdProof: "",
  govtIdDoc: null,

  // ── Police Verification ───────────────────────────────────────────────────
  policeVerification: toBool(row.policeVerification),
  policeVerificationExpDate: toISOOrNull(row.policeVerificationExpDate),
  policeVerificationExpDoc: toStringOrNull(row.policeVerificationExpDoc),

  // ── External & Private BGV ────────────────────────────────────────────────
  externalVerificationAgency: toStringOrNull(row.externalVerificationAgency),
  externalVerificationExpDate: toISOOrNull(row.externalVerificationExpDate),
  privateBGVExpDate: toISOOrNull(row.privateBGVExpDate),

  // ── Internal Verification ─────────────────────────────────────────────────
  lastInternalVerificationDate: toISOOrNull(row.lastInternalVerificationDate),

  // ── Induction ─────────────────────────────────────────────────────────────
  inductionDate: toISOOrNull(row.inductionDate),

  // ── Training ──────────────────────────────────────────────────────────────
  lastTrainingDate: toISOOrNull(row.lastTrainingDate),
  lastTrainingDoc: toStringOrNull(row.lastTrainingDoc),
  trainingStatus: toStringOrNull(row.trainingStatus),

  // ── Documents ─────────────────────────────────────────────────────────────
  profileImageDoc: toStringOrNull(row.profileImageDoc),

  // ── Misc ──────────────────────────────────────────────────────────────────
  remarks: toStringOrNull(row.remarks),
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  open,
  onClose,
  vendorOptions,
  locationOptions,
}) => {
  const { DRIVER_CONFIG } = usePermittedHook();
  const { Modal, Select } = useUILibrary();
  const {
    bulkDriverUpload,
    isBulkDriverUpload,
    bulkDriverUploadError,
    resetBulk,
  } = useDriverMutations();

  const [form] = Form.useForm();
  const [_, setJsonData] = useState<Record<string, unknown>[]>([]);
  const [errorRows, setErrorRows] = useState<string[]>([]);
  const [summary, setSummary] = useState<UploadSummary | null>(null);
  // ── Parse Excel/CSV file → remapped rows ───────────────────────────────
  const parseAndRemapFile = async (
    file: File,
    useCellDates = false,
  ): Promise<Record<string, unknown>[]> => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { cellDates: useCellDates });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });
    // Remap human-readable Excel headers → API field keys
    return rawRows.map(remapRow);
  };

  // ── beforeUpload: client-side validation before file is accepted ────────
  const uploadProps = {
    beforeUpload: async (file: File) => {
      // File size check
      if (!validateFileSize(file)) {
        return Upload.LIST_IGNORE;
      }

      // MIME / extension check
      const allowedMimes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];
      const isValidFile =
        allowedMimes.includes(file.type) ||
        /\.(xlsx|xls|csv)$/i.test(file.name);

      if (!isValidFile) {
        message.error("Only Excel (.xlsx, .xls) and CSV files are allowed");
        return Upload.LIST_IGNORE;
      }

      // Parse + remap using cellDates: true for better date handling
      const remapped = await parseAndRemapFile(file, true);

      if (!remapped.length) {
        message.error("The uploaded file is empty");
        return Upload.LIST_IGNORE;
      }

      // Verify all required columns are present after remapping
      const presentKeys = new Set(Object.keys(remapped[0]));
      const missingFields = REQUIRED_FIELDS.filter((f) => !presentKeys.has(f));

      if (missingFields.length > 0) {
        const missingHeaders = missingFields.map(
          (f) => apiToExcelHeaderMap[f] ?? f,
        );
        message.error(`Missing required columns: ${missingHeaders.join(", ")}`);
        return Upload.LIST_IGNORE;
      }

      // Row-level validation
      const errors = validateRows(remapped);
      setJsonData(remapped);
      setErrorRows(errors);

      if (errors.length > 0) {
        message.error(
          `${errors.length} validation error(s) found. See details below.`,
        );
        return Upload.LIST_IGNORE;
      }

      message.success("File validated successfully");
      return false; // prevent auto-upload — manual submit triggers the API call
    },
    maxCount: 1,
    accept: ".xlsx,.xls,.csv",
  };

  const parseApiErrors = (err: unknown): string[] => {
    if (!err || typeof err !== "object")
      return ["An unexpected error occurred."];

    const errObj = err as Record<string, any>;

    // ── Shape 1: RFC 9110 / .NET validation error ──────────────────────────
    // { type, title, status: 400, errors: { fieldOrPath: string[] } }
    if (
      errObj.errors &&
      typeof errObj.errors === "object" &&
      !Array.isArray(errObj.errors)
    ) {
      const parsed: string[] = [];

      for (const [path, messages] of Object.entries(errObj.errors)) {
        const msgs: string[] = Array.isArray(messages)
          ? messages
          : [String(messages)];

        const rowMatch = path.match(/^\$\[(\d+)\]\.(.+)$/);
        if (rowMatch) {
          const rowNum = parseInt(rowMatch[1], 10) + 1; // +1 for 1-based display
          const fieldKey = rowMatch[2];
          // Map API key back to Excel header if possible
          const friendlyField = apiToExcelHeaderMap[fieldKey] ?? fieldKey;
          msgs.forEach((msg) => {
            parsed.push(`Row ${rowNum} — ${friendlyField}: ${msg}`);
          });
        } else {
          // Top-level validation error (e.g. "driverStageRequests")
          msgs.forEach((msg) => {
            parsed.push(`Validation — ${path}: ${msg}`);
          });
        }
      }

      return parsed.length
        ? parsed
        : ["Validation failed. Please check the file and try again."];
    }

    // ── Shape 2: business-logic partial failures ───────────────────────────
    // { successRows: [...], errors: [{ rowNumber, messages }] }
    if (Array.isArray(errObj.errors)) {
      return (
        errObj.errors as { rowNumber: number; messages: string[] }[]
      ).flatMap(({ rowNumber, messages }) =>
        messages.map((msg) => `Row ${rowNumber + 1}: ${msg}`),
      );
    }

    // ── Fallback ───────────────────────────────────────────────────────────
    return [errObj.title ?? errObj.message ?? "An unexpected error occurred."];
  };

  // ── Submit: re-parse → format → call bulk upload API ───────────────────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const fileList = values.drivers;
      const file: File | undefined = fileList?.[0]?.originFileObj;

      if (!file) {
        message.error("Please upload a file first");
        return;
      }

      const remapped = await parseAndRemapFile(file);
      // 👇 Inject form-selected values into every row (overrides excel values)
      const enrichedRows = remapped.map((row) => ({
        ...row,
        locCode: values.locCode,
        transporterId: DRIVER_CONFIG.canStageSelectTransported
          ? values.transporterId
          : null,
      }));

      const formattedData = enrichedRows.map(formatRow);
      console.log(formattedData, "formattedData");

      const res: any = await bulkDriverUpload(
        formattedData as CreateDriverDto[],
      );
      console.log("API response:", res);
      if (!res) return;
      console.log("Bulk upload response:", res);
      const successCount: number = res.successRows?.length ?? 0;
      const failed: { rowNumber: number; messages: string[] }[] =
        res.errors ?? [];

      setSummary({
        total: successCount + failed.length,
        success: successCount,
        failed: failed.length,
      });

      setErrorRows(
        failed.flatMap(({ rowNumber, messages }) =>
          messages.map((msg) => `Row ${rowNumber + 1}: ${msg}`),
        ),
      );

      if (failed.length > 0) {
        message.warning(
          `Upload complete — ${successCount} succeeded, ${failed.length} row(s) failed`,
        );
      } else {
        message.success("All rows uploaded successfully");
        form.resetFields();
        setJsonData([]);
        setSummary(null);
        onClose();
      }
    } catch (err: any) {
      console.error("Bulk upload error:", err);
      const errorBody =
        err?.response?.data ?? // axios
        err?.data ?? // custom wrapper
        err; // already parsed

      const errors = parseApiErrors(errorBody);
      setErrorRows(errors);
      // setSummary({
      //   total: formattedData.length,
      //   success: 0,
      //   failed: formattedData.length,
      // });
      message.error(
        `Upload failed — ${errors.length} error(s). See details below.`,
      );
      return;
    }
  };

  // ── Reset ───────────────────────────────────────────────────────────────
  const handleReset = () => {
    form.resetFields();
    setJsonData([]);
    setErrorRows([]);
    setSummary(null);
    resetBulk();
  };

  const handleDownload = () => {
    downloadExcel(getExcelDownload);
  };

  const transporterId = DRIVER_CONFIG.canStageSelectTransported
    ? Form.useWatch("transporterId", form)
    : true;
  const locCode = Form.useWatch("locCode", form);
  const filtersSelected = !!transporterId && !!locCode;
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span>📄 Upload Driver</span>
          <span style={{ marginLeft: 30 }}>
            <Tooltip title="Download sample Excel template">
              <button
                onClick={handleDownload}
                style={{ fontSize: "12px" }}
                className="cursor-pointer"
              >
                <CloudDownloadOutlined /> Template
              </button>
            </Tooltip>
          </span>
        </div>
      }
      width={420}
      style={{ top: 15 }}
      destroyOnClose
      footer={null}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 5 }}>
        <Row gutter={12}>
          {DRIVER_CONFIG.canStageSelectTransported && (
            <Col span={24}>
              <Form.Item
                label={
                  <span style={{ color: "#555", fontSize: 12 }}>
                    Select Transporter
                  </span>
                }
                name="transporterId"
                rules={[{ required: true, message: "Please select a vendor" }]}
              >
                <Select
                  options={vendorOptions}
                  placeholder="Select vendor"
                  allowClear
                  style={selectStyle}
                />
              </Form.Item>
            </Col>
          )}

          <Col span={24}>
            <Form.Item
              label={
                <span style={{ color: "#555", fontSize: 12 }}>
                  Select Office
                </span>
              }
              name="locCode"
              rules={[{ required: true, message: "Please select a location" }]}
            >
              <Select
                options={locationOptions}
                placeholder="Select location"
                style={selectStyle}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item
              label={
                <span style={{ color: "#555", fontSize: 12 }}>
                  Upload Driver Excel
                </span>
              }
              name="drivers"
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
              rules={[
                { required: true, message: "Please upload an Excel file" },
              ]}
              style={{ marginBottom: 16 }}
            >
              <Dragger
                {...uploadProps}
                disabled={!filtersSelected}
                style={{
                  borderRadius: 12,
                  background: T.formcss.inputBg,
                  border: `1.5px dashed ${T.formcss.greyBorder}`,
                  padding: "12px 0",
                }}
                showUploadList={{ showRemoveIcon: true }}
                onChange={(info) => {
                  // Manually sync file list so Form.Item registers the file
                  const updatedFileList = info.fileList.map((f) => ({
                    ...f,
                    status: f.status ?? "done",
                  }));
                  form.setFieldValue("drivers", updatedFileList);
                }}
              >
                <p className="ant-upload-drag-icon" style={{ marginBottom: 4 }}>
                  <InboxOutlined style={{ color: "#aaa", fontSize: 28 }} />
                </p>
                <p style={{ color: "#555", fontSize: 13, margin: 0 }}>
                  Click or drag file here to upload
                </p>
                <p style={{ color: "#999", fontSize: 11, margin: "4px 0 0" }}>
                  .xlsx, .xls, .csv
                </p>
              </Dragger>
              <p style={{ marginTop: 6, fontSize: 12, color: "#888" }}>
                <InfoCircleOutlined /> File size must be less than{" "}
                {MAX_FILE_SIZE_MB} MB
              </p>
            </Form.Item>

            <Row gutter={20} justify="space-between" align="middle">
              <Col>
                <Button
                  type="primary"
                  loading={isBulkDriverUpload}
                  icon={<UploadOutlined />}
                  onClick={handleSubmit}
                  style={{
                    borderRadius: 20,
                    background: "#1a6b3c",
                    borderColor: "#1a6b3c",
                    height: 34,
                  }}
                >
                  Upload
                </Button>
              </Col>
              <Col>
                <Button
                  onClick={handleReset}
                  style={{
                    borderRadius: 20,
                    border: "1px solid #d0d5dd",
                    color: "#333",
                    height: 34,
                  }}
                >
                  Reset
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>

      {/* Upload summary + error list */}
      <div style={{ marginTop: 12 }}>
        {summary && (
          <div
            style={{
              marginBottom: 8,
              fontSize: 13,
              color: "#555",
              padding: "8px 12px",
              background: "#f9f9f9",
              borderRadius: 8,
              border: "1px solid #e0e0e0",
            }}
          >
            Total: <b>{summary.total}</b>&nbsp;|&nbsp;Success:{" "}
            <b style={{ color: "#1a6b3c" }}>{summary.success}</b>&nbsp;|&nbsp;
            Failed: <b style={{ color: "red" }}>{summary.failed}</b>
          </div>
        )}

        {errorRows.length > 0 && (
          <div
            style={{
              maxHeight: 180,
              overflowY: "auto",
              border: "1px solid #ffa39e",
              borderRadius: 8,
              background: "#fff2f0",
              padding: "8px 12px",
              marginTop: 8,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#cf1322",
                marginBottom: 4,
              }}
            >
              ⚠ Upload Errors ({errorRows.length})
            </div>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {errorRows.map((err, i) => (
                <li
                  key={i}
                  style={{ color: "#cf1322", fontSize: 12, marginBottom: 2 }}
                >
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}
        {(bulkDriverUploadError?.fieldErrors?.length ?? 0) > 0 && (
          <div
            style={{
              maxHeight: 180,
              overflowY: "auto",
              border: "1px solid #ffccc7",
              borderRadius: 8,
              background: "#fff2f0",
              padding: "8px 12px",
              marginTop: 12,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#cf1322",
                marginBottom: 6,
              }}
            >
              ⚠ API Validation Errors
            </div>

            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {bulkDriverUploadError?.fieldErrors?.map(
                (
                  err: {
                    field: string;
                    message: string;
                  },
                  index: number,
                ) => (
                  <li
                    key={index}
                    style={{
                      color: "#cf1322",
                      fontSize: 12,
                      marginBottom: 4,
                    }}
                  >
                    <b>{err.field}</b>: {err.message}
                  </li>
                ),
              )}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BulkUploadModal;
