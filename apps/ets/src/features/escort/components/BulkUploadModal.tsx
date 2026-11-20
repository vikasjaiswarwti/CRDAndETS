import React, { useState } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { getExcelDownload } from "../constants/EscortFormFields";
import { downloadExcel } from "../../../shared/hooks/useExcelExport";
import { Tooltip } from "antd";
import * as XLSX from "xlsx";
import {
  // DownloadOutlined,
  InboxOutlined,
  InfoCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Col, Form, message, Row, Upload } from "antd";
import { useEscortMutations } from "../hooks/useEscortMutations";

const { Dragger } = Upload;

interface BulkUploadModalProps {
  open: boolean;
  onClose: () => void;
}

interface UploadSummary {
  total: number;
  success: number;
  failed: number;
}

// ✅ Row validator — returns array of error strings
const validateRows = (rows: any[]): string[] => {
  const errors: string[] = [];
  const requiredFields = [
    "locCode",
    "escortVendorId",
    "name",
    "mobileNo",
    "emailId",
  ];

  rows.forEach((row, index) => {
    requiredFields.forEach((field) => {
      if (!row[field] && row[field] !== 0) {
        errors.push(`Row ${index + 2}: "${field}" is required`);
      }
    });

    if (row.mobileNo && !/^\d{10}$/.test(String(row.mobileNo))) {
      errors.push(`Row ${index + 2}: "mobileNo" must be 10 digits`);
    }

    if (
      row.emailId &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(row.emailId))
    ) {
      errors.push(`Row ${index + 2}: "emailId" is invalid`);
    }
  });

  return errors;
};

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ open, onClose }) => {
  const { Modal } = useUILibrary();
  const { bulkUploadEscorts, isBulkUploading } = useEscortMutations();

  const [form] = Form.useForm();
  const [_, setJsonData] = useState<any[]>([]);
  const [errorRows, setErrorRows] = useState<string[]>([]);
  const [summary, setSummary] = useState<UploadSummary | null>(null);

  // ✅ Upload props
  const uploadProps = {
    beforeUpload: async (file: File) => {
      const isExcel =
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";

      if (!isExcel) {
        message.error("Only Excel files are allowed");
        return Upload.LIST_IGNORE;
      }

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!json.length) {
        message.error("Excel file is empty");
        return Upload.LIST_IGNORE;
      }

      // ✅ Column validation
      const requiredColumns = [
        "locCode",
        "escortVendorId",
        "name",
        "mobileNo",
        "emailId",
      ];
      const fileColumns = Object.keys(json[0] as object);
      const missingColumns = requiredColumns.filter(
        (col) => !fileColumns.includes(col),
      );

      if (missingColumns.length > 0) {
        message.error(`Missing columns: ${missingColumns.join(", ")}`);
        return Upload.LIST_IGNORE;
      }

      // ✅ Row validation
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
    maxCount: 1,
    accept: ".xlsx,.xls",
  };

  // ✅ Submit — sends plain array to match API contract
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // ✅ Fixed: field name is "users" to match Form.Item name
      const fileList = values.users;
      const file = fileList?.[0]?.originFileObj;

      if (!file) {
        message.error("Please upload a file");
        return;
      }

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      // ✅ Transform to match API shape — plain array, not { users: [...] }
      const formattedData = json.map((row: any) => ({
        locCode: Number(row.locCode),
        escortVendorId: Number(row.escortVendorId),
        name: String(row.name || ""),
        address: String(row.address || ""),
        mobileNo: String(row.mobileNo || ""),
        emailId: String(row.emailId || ""),
        remarks: row.remarks ? String(row.remarks) : null,
        active:
          String(row.active).toLowerCase() === "true" ||
          String(row.active) === "1",
      }));

      // ✅ Pass plain array directly — matches: POST /api/v1/Escorts/bulk-upload [...]
      const res: any = await bulkUploadEscorts(formattedData);

      if (!res) return;

      const successCount = res.successRows?.length || 0;
      const failed = res.errors || [];

      setSummary({
        total: successCount + failed.length,
        success: successCount,
        failed: failed.length,
      });

      // ✅ Flatten row errors into display strings
      setErrorRows(
        failed.map(
          (err: { rowNumber: number; messages: string[] }) =>
            `Row ${err.rowNumber}: ${err.messages.join(", ")}`,
        ),
      );

      if (failed.length > 0) {
        message.warning(
          `Upload done — ${successCount} succeeded, ${failed.length} rows failed`,
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

  // ✅ Reset clears state too
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
          <span>Upload Escort</span>
          <span style={{ marginLeft: 30 }}>
            <Tooltip title="Download sample Excel format">
              <button onClick={handleDownload} style={{ fontSize: "12px" }}>
                <InfoCircleOutlined /> Template
              </button>
            </Tooltip>
          </span>
        </div>
      }
      width={380}
      destroyOnClose
      footer={null}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 5 }}>
        <Row>
          <Col span={24}>
            <Form.Item
              label={
                <span style={{ color: "#555", fontSize: 13 }}>
                  Upload Escort Vendor Excel
                </span>
              }
              name="users"
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
              rules={[
                { required: true, message: "Please upload an Excel file" },
              ]}
              style={{ marginBottom: 16 }}
            >
              <Dragger
                {...uploadProps}
                accept=".xlsx,.xls"
                style={{
                  borderRadius: 12,
                  background: "#eaf6ec",
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
            </Form.Item>

            {/* {summary && (
              <div style={{ marginBottom: 12, fontSize: 13, color: "#555" }}>
                Total: <b>{summary.total}</b> | Success:{" "}
                <b style={{ color: "#1a6b3c" }}>{summary.success}</b> | Failed:{" "}
                <b style={{ color: "red" }}>{summary.failed}</b>
              </div>
            )}
            {errorRows.length > 0 && (
              <ul
                style={{
                  color: "red",
                  fontSize: 12,
                  paddingLeft: 16,
                  marginBottom: 12,
                }}
              >
                {errorRows.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )} */}

            {/* <Col span={24} style={{ marginBottom: 20 }}>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                style={{
                  width: "100%",
                  borderRadius: 16,
                  border: "1px solid #3E9B73",
                  height: 36,
                  color: "#3E9B73",
                }}
              >
                Download Template [Excel]
              </Button>
            </Col> */}

            <Row gutter={20}>
              <Col span={10}>
                <Button
                  type="primary"
                  loading={isBulkUploading}
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
              <Col span={6}>
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
      {/* <div style={{ marginTop: 12 }}>
        {summary && (
          <div style={{ marginBottom: 12, fontSize: 13, color: "#555" }}>
            Total: <b>{summary.total}</b> | Success:{" "}
            <b style={{ color: "#1a6b3c" }}>{summary.success}</b> | Failed:{" "}
            <b style={{ color: "red" }}>{summary.failed}</b>
          </div>
        )}

        {errorRows.length > 0 && (
          <ul
            style={{
              color: "red",
              fontSize: 12,
              paddingLeft: 16,
              marginBottom: 12,
            }}
          >
            {errorRows.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}
      </div> */}
      {/* // Replace this in EscortBulkUploadModal.tsx (inside the <div style={{ marginTop: 12 }}> block): */}

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
      </div>
    </Modal>
  );
};

export default BulkUploadModal;
