import React, { useEffect, useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { getExcelDownload } from "../constants/vehicleFormFields";
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
import type { CreateVehicleDto } from "../types/vehicle.types";
import { useVehicleMutations } from "../hooks/useVehicleMutations";
import {
  MAX_FILE_SIZE_MB,
  validateFileSize,
} from "../../../shared/utils/uploadValidation.utils";
import { usePermittedHook } from "../hooks/usePermittedHook";

const { Dragger } = Upload;
type SelectOption = { label: string; value: any };
interface BulkUploadModalProps {
  open: boolean;
  onClose: () => void;
  vendorOptions: SelectOption[];
  locationOptions: SelectOption[];
}

// interface BulkUploadResponse {
//   successRows: any[];
//   errors: { rowNumber: number; messages: string[] }[];
// }

interface UploadSummary {
  total: number;
  success: number;
  failed: number;
}
// ── Field Map: Human-readable Excel column → API field name ──────────────────
export const excelToApiFieldMap: Record<string, string> = {
  // Vehicle Identity
  "Vehicle Registration Number": "vehicle_Registration_No",
  "Vehicle Type Code": "vehicleTypeCode",
  "Location Code": "locCode",
  "Transporter ID": "transporterId",
  Make: "make",
  Model: "model",
  "Chassis Number": "chassis_No",
  "Fuel Type Code": "fuelTypeCode",
  "Make Year": "makeYear",
  "Driver ID": "driverId",

  // Status
  "Vehicle Status": "vehicle_Status",
  "Current Status": "current_Status",
  Remarks: "remarks",

  // Owner Info
  "Owner Name": "owner_Name",
  "Owner Address": "owner_Address",
  "Owner Type": "owner_Type",

  // GPS
  "GPS Installed": "isGpsInstalled",
  "GPS Provider Code": "gpsProviderCode",
  "GPS Installation Date": "gps_Installation_Date",

  // Registration & Validity Dates
  "Registration Date": "vehicle_Registration_Date",
  "Induction Date": "vehicle_Induction_Date",
  "Registration Expiry Date": "registration_Exp_Date",
  "Permit Expiry Date": "permit_Expiry_Date",
  "Insurance Expiry Date": "insurance_Expiry_Date",
  "Fitness Expiry Date": "fitness_Expiry_Date",
  "Road Tax Validity Expiry": "road_Tax_Validity_Expiry",
  "PUC Expiry Date": "puc_Expiry_Date",
  "First Aid Kit Date": "firstAid_Kid_Date",
  "Fire Extinguisher Date": "fire_Extinguisher_Date",

  // Document URLs
  "Registration Expiry Document": "registrationExpiryDate_Doc",
  "Permit Expiry Document": "permitExpiryDate_Doc",
  "Insurance Expiry Document": "insuranceExpiryDate_Doc",
  "Fitness Expiry Document": "fitnessExpiryDate_Doc",
  "Road Tax Expiry Document": "roadTaxExpiryDate_Doc",
  "PUC Expiry Document": "pucExpiryDate_Doc",
  "First Aid Kit Document": "firstAidKitDateExpiry_Doc",
  "Fire Extinguisher Document": "fireExtinguisherExp_Doc",
  "All Documents": "allDocuments_Doc",
};
// Reverse map for parsing Excel rows → normalized object keyed by API field
export const apiFieldMap = Object.fromEntries(
  Object.entries(excelToApiFieldMap).map(([label, api]) => [label, api]),
);
// ── Required fields (by readable label) ──────────────────────────────────────
export const REQUIRED_LABELS = [
  "Vehicle Registration Number",
  "Vehicle Type Code",
  // "Location Code",
  // "Transporter ID",
  "Make",
  "Model",
  "Chassis Number",
  "Owner Name",
  "Owner Address",
  "Owner Type",
  "Fuel Type Code",
];
// Vehicle Status, Make, Fuel Type Code,
// Derived required API keys (used for internal validation)
export const REQUIRED_FIELDS = REQUIRED_LABELS.map(
  (label) => excelToApiFieldMap[label],
);
// Normalize a raw Excel row (readable labels) → API-keyed object
const normalizeRow = (raw: Record<string, any>): Record<string, any> => {
  const normalized: Record<string, any> = {};
  for (const [label, apiKey] of Object.entries(excelToApiFieldMap)) {
    normalized[apiKey] = raw[label] ?? "";
  }
  return normalized;
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

const toISOOrNull = (val: any): string | null => {
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

  if (/^\d+$/.test(str)) {
    const excelEpoch = new Date(1899, 11, 30);
    const parsed = new Date(excelEpoch.getTime() + Number(str) * 86400000);
    return isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  const ymdRegex = /^(\d{4})[-\/](\d{2})[-\/](\d{2})$/;
  const match = str.match(ymdRegex);
  if (match) {
    const [, yyyy, mm, dd] = match;
    const parsed = new Date(`${yyyy}-${mm}-${dd}`);
    return isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const validateRows = (rows: any[]): string[] => {
  const errors: string[] = [];

  rows.forEach((row, index) => {
    const rowLabel = `Row ${index + 2}`;

    REQUIRED_FIELDS.forEach((field) => {
      if (!row[field] && row[field] !== 0) {
        errors.push(`${rowLabel}: "${field}" is required`);
      }
    });
    // ── Vehicle Registration Number ──
    if (row.vehicle_Registration_No) {
      const vehicleRegRegex =
        /^[A-Z]{2}[- ]?[0-9]{1,2}[- ]?[A-Z]{1,3}[- ]?[0-9]{4}$/;
      if (
        !vehicleRegRegex.test(
          String(row.vehicle_Registration_No).trim().toUpperCase(),
        )
      ) {
        errors.push(
          `${rowLabel}: "Vehicle Registration Number" is invalid (e.g. UP12AM4321)`,
        );
      }
    }

    // ── Chassis Number ──
    if (row.chassis_No) {
      const chassisRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
      if (!chassisRegex.test(String(row.chassis_No).trim().toUpperCase())) {
        errors.push(
          `${rowLabel}: "Chassis Number" must be a valid 17-character VIN (no I, O, Q)`,
        );
      }
    }

    if (row.locCode && isNaN(Number(row.locCode))) {
      errors.push(`${rowLabel}: "locCode" must be a number`);
    }
    if (row.transporterId && isNaN(Number(row.transporterId))) {
      errors.push(`${rowLabel}: "transporterId" must be a number`);
    }

    // Add any vehicle-specific date fields here
    const DATE_FIELDS = [
      "vehicle_Registration_Date",
      "vehicle_Induction_Date",
      "registration_Exp_Date",
      "permit_Expiry_Date",
      "insurance_Expiry_Date",
      "fitness_Expiry_Date",
      "road_Tax_Validity_Expiry",
      "puc_Expiry_Date",
      "firstAid_Kid_Date",
      "fire_Extinguisher_Date",
      "gps_Installation_Date",
      "makeYear",
    ];
    // Numeric fields
    const numericFields = [
      "locCode",
      "transporterId",
      "vehicleTypeCode",
      "vehicle_Status",
      "fuelTypeCode",
      "current_Status",
      "gpsProviderCode",
    ];
    numericFields.forEach((field) => {
      if (
        row[field] !== "" &&
        row[field] !== undefined &&
        isNaN(Number(row[field]))
      ) {
        errors.push(`${rowLabel}: "${field}" must be a number`);
      }
    });
    DATE_FIELDS.forEach((field) => {
      if (row[field] && !isValidDate(row[field])) {
        errors.push(
          `${rowLabel}: "${field}" must be a valid date in yyyy-mm-dd format`,
        );
      }
    });
    // Boolean field
    if (row.isGpsInstalled !== "" && row.isGpsInstalled !== undefined) {
      const val = String(row.isGpsInstalled).toLowerCase().trim();
      if (!["true", "false", "yes", "no", "1", "0"].includes(val)) {
        errors.push(
          `${rowLabel}: "isGpsInstalled" must be true/false or yes/no`,
        );
      }
    }
  });

  return errors;
};

const parseBool = (val: any): boolean => {
  if (typeof val === "boolean") return val;
  const str = String(val).toLowerCase().trim();
  return ["true", "yes", "1"].includes(str);
};

const formatRow = (row: any): CreateVehicleDto => ({
  // ── Vehicle Info ──────────────────────────
  vehicle_Registration_No: String(
    row.vehicle_Registration_No || "",
  ).toLocaleUpperCase(),
  vehicleTypeCode: Number(row.vehicleTypeCode),
  transporterId: row.transporterId,
  locCode: Number(row.locCode),
  make: String(row.make || "").toLocaleUpperCase(),
  model: String(row.model || ""),
  chassis_No: String(row.chassis_No || ""),
  fuelTypeCode: Number(row.fuelTypeCode),
  makeYear: toISOOrNull(row.vehicle_Induction_Date) as string,
  driverId: row.driverId ? Number(row.driverId) : (null as any),

  // ── Status ────────────────────────────────
  vehicle_Status: row.vehicle_Status
    ? Number(row.vehicle_Status)
    : (null as any),
  current_Status: row.current_Status
    ? Number(row.current_Status)
    : (null as any),
  remarks: String(row.remarks || ""),

  // ── Owner Info ────────────────────────────
  owner_Name: String(row.owner_Name || ""),
  owner_Address: String(row.owner_Address || ""),
  owner_Type: String(row.owner_Type || ""),

  // ── GPS ───────────────────────────────────
  isGpsInstalled: parseBool(row.isGpsInstalled),
  gpsProviderCode: row.gpsProviderCode
    ? Number(row.gpsProviderCode)
    : (null as any),
  gps_Installation_Date: toISOOrNull(row.gps_Installation_Date) as string,

  // ── Registration & Dates ──────────────────
  vehicle_Registration_Date: toISOOrNull(
    row.vehicle_Registration_Date,
  ) as string,
  vehicle_Induction_Date: toISOOrNull(row.vehicle_Induction_Date) as string,
  registration_Exp_Date: toISOOrNull(row.registration_Exp_Date) as string,
  permit_Expiry_Date: toISOOrNull(row.permit_Expiry_Date) as string,
  insurance_Expiry_Date: toISOOrNull(row.insurance_Expiry_Date) as string,
  fitness_Expiry_Date: toISOOrNull(row.fitness_Expiry_Date) as string,
  road_Tax_Validity_Expiry: toISOOrNull(row.road_Tax_Validity_Expiry) as string,
  puc_Expiry_Date: toISOOrNull(row.puc_Expiry_Date) as string,
  firstAid_Kid_Date: toISOOrNull(row.firstAid_Kid_Date) as string,
  fire_Extinguisher_Date: toISOOrNull(row.fire_Extinguisher_Date) as string,

  // ── Document URLs (optional) ──────────────
  registrationExpiryDate_Doc:
    String(row.registrationExpiryDate_Doc || "") || null,
  permitExpiryDate_Doc: String(row.permitExpiryDate_Doc || "") || null,
  insuranceExpiryDate_Doc: String(row.insuranceExpiryDate_Doc || "") || null,
  fitnessExpiryDate_Doc: String(row.fitnessExpiryDate_Doc || "") || null,
  roadTaxExpiryDate_Doc: String(row.roadTaxExpiryDate_Doc || "") || null,
  pucExpiryDate_Doc: String(row.pucExpiryDate_Doc || "") || null,
  firstAidKitDateExpiry_Doc:
    String(row.firstAidKitDateExpiry_Doc || "") || null,
  fireExtinguisherExp_Doc: String(row.fireExtinguisherExp_Doc || "") || null,
  allDocuments_Doc: String(row.allDocuments_Doc || "") || null,
});

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  open,
  onClose,
  // onSubmit,
  // isSubmitting,
  vendorOptions,
  locationOptions,
}) => {
  const { VEHICLE_CONFIG } = usePermittedHook();
  const { Modal, Select } = useUILibrary();
  // 5. Mutations
  const {
    bulkVehicleUpload,
    isBulkVehicleUpload,
    bulkVehicleUploadError,
    resetBulk,
  } = useVehicleMutations();

  const [form] = Form.useForm();
  const [_, setJsonData] = useState<any[]>([]);
  const [errorRows, setErrorRows] = useState<string[]>([]);
  const [summary, setSummary] = useState<UploadSummary | null>(null);

  const uploadProps = {
    beforeUpload: async (file: File) => {
      if (!validateFileSize(file)) {
        return Upload.LIST_IGNORE;
      }
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
        "application/vnd.ms-excel", // xls
        "text/csv", // csv
      ];
      const isValidFile =
        allowedTypes.includes(file.type) || file.name.endsWith(".csv");
      if (!isValidFile) {
        message.error("Only Excel and CSV files are allowed");
        return Upload.LIST_IGNORE;
      }
      // ← validate API keys
      // --------------------------
      const data = await file.arrayBuffer();
      // ✅ beforeUpload — has cellDates: true (correct)
      const workbook = XLSX.read(data, { cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!json.length) {
        message.error("Excel file is empty");
        return Upload.LIST_IGNORE;
      }

      const fileColumns = Object.keys(json[0] as object);
      // const missingColumns = REQUIRED_FIELDS.filter(
      //   (col) => !fileColumns.includes(col),
      // );
      // if (missingColumns.length > 0) {
      //   message.error(`Missing columns: ${missingColumns.join(", ")}`);
      //   return Upload.LIST_IGNORE;
      // }
      const missingColumns = REQUIRED_LABELS.filter(
        (label) => !fileColumns.includes(label),
      );
      if (missingColumns.length > 0) {
        message.error(`Missing columns: ${missingColumns.join(", ")}`);
        return Upload.LIST_IGNORE;
      }
      const normalized = (json as any[]).map(normalizeRow); // ← remap here
      const errors = validateRows(normalized);
      // ---------------
      // Check readable column headers

      setJsonData(normalized);
      setErrorRows(errors);

      if (errors.length > 0) {
        message.error(errors[0]);
        return Upload.LIST_IGNORE;
      }

      message.success("File validated successfully");
      return false;
    },
    maxCount: 1,
    accept: ".xlsx,.xls",
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const fileList = values.vehicles;
      const file = fileList?.[0]?.originFileObj;

      if (!file) {
        message.error("Please upload a file");
        return;
      }

      const data = await file.arrayBuffer();
      // ✅ beforeUpload — has cellDates: true (correct)
      const workbook = XLSX.read(data, { cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const normalized = (json as any[]).map(normalizeRow);
      // const formattedData = normalized.map(formatRow);

      // ✅ Inject form-selected transporterId and locCode into each row
      const formattedData = normalized.map((row) =>
        formatRow({
          ...row,
          transporterId: VEHICLE_CONFIG.canStageSelectTransported
            ? values.transporterId
            : null,
          locCode: values.locCode,
        }),
      );

      const res: any = await bulkVehicleUpload(formattedData);
      if (!res) return;

      const successCount = res.successRows?.length || 0;
      const failed = res.errors || [];

      setSummary({
        total: successCount + failed.length,
        success: successCount,
        failed: failed.length,
      });

      setErrorRows(
        failed.flatMap(({ rowNumber, messages }: any) =>
          messages.map((msg: string) => `Row ${rowNumber + 1}: ${msg}`),
        ),
      );

      if (failed.length > 0) {
        message.warning(
          `Upload done — ${successCount} succeeded, ${failed.length} row(s) failed`,
        );
      } else {
        message.success("All rows uploaded successfully");
        form.resetFields();
        onClose();
        setJsonData([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setJsonData([]);
    setErrorRows([]);
    setSummary(null);
    resetBulk?.();
  };
  useEffect(() => {
    handleReset();
  }, []);
  const handleDownload = () => {
    downloadExcel(getExcelDownload);
  };
  const transporterId = VEHICLE_CONFIG.canStageSelectTransported
    ? Form.useWatch("transporterId", form)
    : true;
  const locCode = Form.useWatch("locCode", form);
  const filtersSelected = !!transporterId && !!locCode;
  return (
    <Modal
      open={open}
      onCancel={onClose}
      style={{ top: 15 }}
      title={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span>📄 Upload Vehicle</span>
          <span style={{ marginLeft: 30 }}>
            <Tooltip title="Download sample Excel format">
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
      destroyOnClose
      footer={null}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 5 }}>
        <Row gutter={12}>
          {VEHICLE_CONFIG.canStageSelectTransported && (
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
                  style={{ width: "100%" }}
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
                style={{ width: "100%" }}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item
              label={
                <span style={{ color: "#555", fontSize: 13 }}>
                  Upload Vehicle Excel
                </span>
              }
              name="vehicles"
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
                accept=".xlsx,.xls"
                style={{
                  borderRadius: 12,
                  background: "#eaf6ec",
                  border: "1.5px dashed #d0d5dd",
                  padding: "12px 0",
                }}
                showUploadList={{ showRemoveIcon: true }}
                onChange={(info: any) => {
                  // ✅ Force status so Form.Item recognizes the file
                  const updatedFileList = info.fileList.map((f: any) => ({
                    ...f,
                    status: f.status ?? "done", // fill in missing status
                  }));
                  form.setFieldValue("vehicles", updatedFileList); // ✅ manually sync to form
                }}
              >
                <p className="ant-upload-drag-icon" style={{ marginBottom: 4 }}>
                  <InboxOutlined style={{ color: "#aaa", fontSize: 28 }} />
                </p>
                <p style={{ color: "#555", fontSize: 13, margin: 0 }}>
                  Click to upload File
                </p>
              </Dragger>
              <p>
                <InfoCircleOutlined /> File size must be less than{" "}
                {MAX_FILE_SIZE_MB}MB
              </p>
            </Form.Item>

            <Row gutter={20} justify="space-between" align="middle">
              <Col>
                <Button
                  type="primary"
                  loading={isBulkVehicleUpload}
                  icon={<UploadOutlined />}
                  onClick={handleSubmit}
                  style={{
                    width: "100%",
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
                    // width: "100%",
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

      {/* Summary + error rows below form */}
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
            Total: <b>{summary.total}</b> &nbsp;|&nbsp; Success:{" "}
            <b style={{ color: "#1a6b3c" }}>{summary.success}</b> &nbsp;|&nbsp;
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
              ⚠ Upload Errors
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
        {(bulkVehicleUploadError?.fieldErrors?.length ?? 0) > 0 && (
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
              {bulkVehicleUploadError?.fieldErrors?.map(
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
