import React, { useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { downloadExcel } from "../../../shared/hooks/useExcelExport";
import { getExcelDownload } from "../constants/employeeFormFields"; // adjust path
import { Tooltip } from "antd";
import * as XLSX from "xlsx";
import {
  InboxOutlined,
  CloudDownloadOutlined,
  UploadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Button, Col, Form, message, Row, Upload } from "antd";
import { useEmployeeMutations } from "../hooks/useEmployeeMutations"; // adjust path
import type {
  BulkCreateDto,
  // CreateUserStageDto,
} from "../types/Employee.types"; // adjust path
import {
  MAX_FILE_SIZE_MB,
  validateFileSize,
} from "../../../shared/utils/uploadValidation.utils";
// import { ConsoleLogger } from "../../../shared/lib/logging/logger";

const { Dragger } = Upload;

interface BulkUploadEmployeeModalProps {
  open: boolean;
  onClose: () => void;
}

interface UploadSummary {
  total: number;
  success: number;
  failed: number;
}

// ✅ Minimum required fields for a valid employee row
const REQUIRED_FIELDS = [
  "employeeId",
  "firstName",
  "lastName",
  "mobileNo",
  "emailId",
  "gender",
  "locCode",
  "empTypeId",
  "empLat",
  "empLng",
];

const validateRows = (rows: any[]): string[] => {
  console.log(rows, "validating rows");
  const errors: string[] = [];
  const employeeIds = new Set<string>();

  rows.forEach((rawRow, index) => {
    // ✅ Remove extra spaces
    const row: any = {};

    Object.keys(rawRow).forEach((key) => {
      row[key] =
        typeof rawRow[key] === "string" ? rawRow[key].trim() : rawRow[key];
    });

    const rowLabel = `Row ${index + 2}`;

    // ✅ Skip fully empty rows
    const isEmptyRow = Object.values(row).every(
      (val) => val === "" || val === null || val === undefined,
    );

    if (isEmptyRow) return;

    REQUIRED_FIELDS.forEach((field) => {
      if (
        row[field] === undefined ||
        row[field] === null ||
        String(row[field]).trim() === ""
      ) {
        errors.push(`${rowLabel}: "${field}" is required`);
      }
    });

    // =====================================================
    // EMPLOYEE ID
    // =====================================================

    if (row.employeeId) {
      const empId = String(row.employeeId);

      if (employeeIds.has(empId)) {
        errors.push(`${rowLabel}: Duplicate employeeId "${empId}"`);
      } else {
        employeeIds.add(empId);
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(empId)) {
        errors.push(`${rowLabel}: employeeId contains invalid characters`);
      }
    }
    ["firstName", "lastName"].forEach((field) => {
      if (row[field] && !/^[a-zA-Z\s]+$/.test(String(row[field]))) {
        errors.push(`${rowLabel}: "${field}" must contain only letters`);
      }
    });

    if (row.mobileNo) {
      const mobile = String(row.mobileNo);

      if (!/^[6-9]\d{9}$/.test(mobile)) {
        errors.push(
          `${rowLabel}: mobileNo must be valid 10 digit Indian mobile number`,
        );
      }
    }
    if (
      row.emailId &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(row.emailId))
    ) {
      errors.push(`${rowLabel}: Invalid email format`);
    }
    if (
      row.gender &&
      !["M", "F", "O"].includes(String(row.gender).toUpperCase())
    ) {
      errors.push(`${rowLabel}: gender must be M, F or O`);
    }

    // =====================================================
    // LATITUDE
    // =====================================================

    if (row.empLat !== "" && row.empLat !== null) {
      const lat = Number(row.empLat);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.push(`${rowLabel}: Invalid empLat`);
      }
    }

    // =====================================================
    // LONGITUDE
    // =====================================================

    if (row.empLng !== "" && row.empLng !== null) {
      const lng = Number(row.empLng);

      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.push(`${rowLabel}: Invalid empLng`);
      }
    }
  });

  return errors;
};
// ✅ Normalize boolean-like values
const toBoolOrNull = (val: any): boolean | null => {
  if (val === undefined || val === null || String(val).trim() === "")
    return null;
  const str = String(val).toLowerCase().trim();
  if (["true", "1", "yes"].includes(str)) return true;
  if (["false", "0", "no"].includes(str)) return false;
  return null;
};

// ✅ Map raw Excel row → CreateEmployeeDto shape
const formatRow = (row: any) => ({
  id: null,
  locCode: row.locCode !== "" ? row.locCode : null,
  depCode: row.depCode !== "" ? String(row.depCode) : null,
  proCode: row.proCode !== "" ? String(row.proCode) : null,
  lobCode: row.lobCode !== "" ? String(row.lobCode) : null,
  gender: row.gender || "M",
  city: row.city ? String(row.city) : null,
  pin: row.pin !== "" ? String(row.pin) : null,
  state: row.state ? String(row.state) : null,
  stateCode: row.stateCode !== "" ? row.stateCode : null,
  phoneNo: row.phoneNo ? String(row.phoneNo) : null,
  emerContactNo: row.emerContactNo ? String(row.emerContactNo) : null,
  address: row.address ? String(row.address) : null,
  supId: row.supId ? String(row.supId) : null,
  empType: row.empType ? String(row.empType) : null,
  empTypeId: row.empTypeId ? String(row.empTypeId) : null,
  transport: row.transport ? String(row.transport) : null,
  useDayPickupPoint: toBoolOrNull(row.useDayPickupPoint),
  nodalPick: row.nodalPick ? String(row.nodalPick) : null,
  nodalDrop: row.nodalDrop ? String(row.nodalDrop) : null,
  geocodeId: row.geocodeId ? row.geocodeId : null,
  empLat: row.empLat !== "" ? Number(row.empLat) : 1,
  empLng: row.empLng !== "" ? Number(row.empLng) : 1,
  locationName: row.locationName ? String(row.locationName) : null,
  employeeId: row.employeeId ? String(row.employeeId) : null,
  firstName: row.firstName ? String(row.firstName) : null,
  middleName: row.middleName ? String(row.middleName) : null,
  lastName: String(row.lastName || ""),
  mobileNo: String(row.mobileNo || ""),
  emailId: String(row.emailId || ""),
  specialNeeds: row.specialNeeds ? String(row.specialNeeds) : null,
  supEmployeeId: row.supEmployeeId ? String(row.supEmployeeId) : null,
  spocEmployeeId: row.spocEmployeeId ? String(row.spocEmployeeId) : null,
  spoc: row.spoc ? String(row.spoc) : null,
  tpin: row.tpin ? String(row.tpin) : null,
  actionType: row.actionType ? String(row.actionType) : null,
  supervisorName: row.supervisorName ? String(row.supervisorName) : null,
  departmentName: row.departmentName ? String(row.departmentName) : null,
  projectName: row.projectName ? String(row.projectName) : null,
  regisLocation: row.regisLocation ? String(row.regisLocation) : null,
  ipAddress: row.ipAddress ? String(row.ipAddress) : null,
});

const BulkUploadEmployeeModal: React.FC<BulkUploadEmployeeModalProps> = ({
  open,
  onClose,
}) => {
  const { Modal } = useUILibrary();
  const { bulkCreate, isBulkCreating } = useEmployeeMutations();

  const [form] = Form.useForm();
  const [_, setJsonData] = useState<any[]>([]);
  const [errorRows, setErrorRows] = useState<string[]>([]);
  const [summary, setSummary] = useState<UploadSummary | null>(null);

  const uploadProps = {
    beforeUpload: async (file: File) => {
      // ✅ Global size validation
      if (!validateFileSize(file)) {
        return Upload.LIST_IGNORE;
      }

      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];
      const isValidFile =
        allowedTypes.includes(file.type) || file.name.endsWith(".csv");
      if (!isValidFile) {
        message.error("Only Excel and CSV files are allowed");
        return Upload.LIST_IGNORE;
      }

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      // console.log(json, "json from excel before validation");
      if (!json.length) {
        message.error("File is empty");
        return Upload.LIST_IGNORE;
      }

      // ✅ Column presence check against required fields only
      const fileColumns = Object.keys(json[0] as object);
      const missingColumns = REQUIRED_FIELDS.filter(
        (col) => !fileColumns.includes(col),
      );

      if (missingColumns.length > 0) {
        message.error(`Missing columns: ${missingColumns.join(", ")}`);
        return Upload.LIST_IGNORE;
      }
      // console.log(json, "json from excel");
      const errors = validateRows(json);
      setJsonData(json);
      setErrorRows(errors);

      if (errors.length > 0) {
        message.error(errors[0]);
        return Upload.LIST_IGNORE;
      }

      message.success("File validated successfully");
      return false; // prevent auto-upload
    },
    onChange({ fileList }: any) {
      // This ensures the form field value is always in sync
      form.setFieldValue("users", fileList);
    },
    maxCount: 1,
    accept: ".xlsx,.xls,.csv",
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // console.log(values, "form values");
      const fileList = values.users;
      const file = fileList?.[0]?.originFileObj;

      if (!file) {
        message.error("Please upload a file");
        return;
      }
      // console.log(file, "file object");
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      const formattedData = json.map(formatRow);

      let payload = { users: formattedData };
      // console.log(payload, "payload before API call");
      const res: any = await bulkCreate(payload as unknown as BulkCreateDto);

      if (!res) return;
      // console.log(result, "response from bulk create API");
      const successCount = res?.result?.successCount || 0;

      const failed =
        res?.result?.errors?.map((item: any) => ({
          rowNumber: item.rowNumber,
          message: item.message,
        })) || [];

      setSummary({
        total: res?.result?.totalRecords || 0,
        success: successCount,
        failed: res?.result?.failedCount || 0,
      });

      setErrorRows(
        failed.map(
          ({ rowNumber, message }: { rowNumber: any; message: string }) =>
            `Row ${rowNumber}: ${message}`,
        ),
      );

      if (failed.length > 0) {
        message.error(
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
  };

  const handleDownload = () => {
    downloadExcel(getExcelDownload);
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span>👤 Upload Employees</span>
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
      width={380}
      style={{ top: 25 }}
      destroyOnClose
      footer={null}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 5 }}>
        <Row>
          <Col span={24}>
            <Form.Item
              label={
                <span style={{ color: "#555", fontSize: 13 }}>
                  Upload Employee Excel
                </span>
              }
              name="users"
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
              rules={[
                {
                  required: true,
                  message: "Please upload an Excel file",
                  validator: (_, value) => {
                    if (value && value.length > 0) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Please upload an Excel file"),
                    );
                  },
                },
              ]}
              style={{ marginBottom: 16 }}
            >
              <Dragger
                {...uploadProps}
                accept=".xlsx,.xls,.csv"
                style={{
                  borderRadius: 12,
                  background: "#eaf0fb",
                  border: "1.5px dashed #d0d5dd",
                  padding: "12px 0",
                }}
                showUploadList={{ showRemoveIcon: true }}
              >
                <p className="ant-upload-drag-icon" style={{ marginBottom: 4 }}>
                  <InboxOutlined style={{ color: "#aaa", fontSize: 28 }} />
                </p>
                <p style={{ color: "#555", fontSize: 13, margin: 0 }}>
                  Click to upload File
                </p>
              </Dragger>
              <p style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
                <InfoCircleOutlined /> File size must be less than{" "}
                {MAX_FILE_SIZE_MB}MB
              </p>
            </Form.Item>

            <Row gutter={20} justify="space-between" align="middle">
              <Col>
                <Button
                  type="primary"
                  loading={isBulkCreating}
                  icon={<UploadOutlined />}
                  onClick={handleSubmit}
                  style={{
                    width: "100%",
                    borderRadius: 20,
                    background: "#1a3c6b",
                    borderColor: "#1a3c6b",
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
                    width: "100%",
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

      {errorRows.length > 0 && (
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
              <b style={{ color: "#1a3c6b" }}>{summary.success}</b>{" "}
              &nbsp;|&nbsp; Failed:{" "}
              <b style={{ color: "red" }}>{summary.failed}</b>
            </div>
          )}
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
                  style={{ color: "#cf1322", fontSize: 12, marginBottom: 3 }}
                >
                  {err}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BulkUploadEmployeeModal;
