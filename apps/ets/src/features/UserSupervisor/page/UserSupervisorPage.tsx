import { Form, Upload, Button, Row, Col, message } from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  InboxOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { CreateUSVDto, empObj } from "../type/userSupervisor.types";
import * as XLSX from "xlsx";
import { downloadExcel } from "../../../shared/hooks/useExcelExport";
import { getExcelDownload } from "../constants/userSupervisorField";
import { useUserSuperVisorMutations } from "../hooks/useUserSuperVisorMutations";
import { Table, Tag, Card } from "antd";
import { useState } from "react";
import { T } from "../../../styles/tokens";

const { Dragger } = Upload;

const smallHeader = (text: string) => (
  <span style={{ fontSize: 12, fontWeight: 500 }}>{text}</span>
);

const MyForm = () => {
  const [form] = Form.useForm();
  const { createVendorSuperVisor, isUploaded } = useUserSuperVisorMutations({});
  const [errorRows, setErrorRows] = useState<any[]>([]);

  const [summary, setSummary] = useState<{
    total: number;
    failed: number;
    success: number;
  } | null>(null);

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

      // ✅ Read Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(sheet);

      // console.log("Excel Data:", jsonData);

      // ✅ Validation logic
      if (!jsonData.length) {
        message.error("Excel file is empty");
        return Upload.LIST_IGNORE;
      }

      // Example: required columns check
      const requiredColumns = ["employeeId", "supEmployeeId"];

      const fileColumns = Object.keys(jsonData[0] as object);

      const missingColumns = requiredColumns.filter(
        (col) => !fileColumns.includes(col),
      );

      if (missingColumns.length > 0) {
        message.error(`Missing columns: ${missingColumns.join(", ")}`);
        return Upload.LIST_IGNORE;
      }

      // Example: row validation
      const hasInvalidRow = jsonData.some((row: any) => {
        return !row.employeeId || !row.supEmployeeId;
      });

      if (hasInvalidRow) {
        message.error("Some rows have missing required data");
        return Upload.LIST_IGNORE;
      }

      return false; // ✅ keep file in form (no auto upload)
    },

    maxCount: 1,
  };

  // ✅ Submit (Add to backend)
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const file = values.users?.[0]?.originFileObj;

      if (!file) {
        message.error("Please upload a file");
        return;
      }

      // 👉 Read file
      const data = await file.arrayBuffer();

      // 👉 Parse Excel
      const workbook = XLSX.read(data);

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // ✅ Convert to JSON array of objects
      const jsonData = XLSX.utils.sheet_to_json(sheet, {
        defval: "", // keeps empty cells
      }) as CreateUSVDto["users"];
      // ✅ Transform to required payload
      const formattedData = jsonData.map((row: any) => ({
        employeeId: row.employeeId ? String(row.employeeId) : "",
        supEmployeeId: row.supEmployeeId ? String(row.supEmployeeId) : null,
      }));

      console.log("JSON Data:", jsonData);

      const res = await createVendorSuperVisor({
        users: formattedData as empObj[],
      });
      console.log(res, "res");
      if (!res) return;
      if (res.successCount === res.totalRecords) {
        return message.success("File Uploaded Successfully.");
        form.resetFields();
      } else {
        setErrorRows(res.errors || []);
        setSummary({
          total: res.totalRecords,
          failed: res.failedCount,
          success: res.successCount,
        });
        // message.success("File converted to JSON successfully");
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  // ✅ Reset
  const handleReset = () => {
    setErrorRows([]);
    setSummary(null);
    form.resetFields();
  };

  // ✅ Download (you already have this)
  const handleDownload = () => {
    downloadExcel(getExcelDownload);
  };
  // console.log(summary, errorRows);
  return (
    <div className="h-[88vh] bg-white" style={{ padding: 32 }}>
      <div
        className={`flex items-start justify-center gap-5 bg-white h-[70vh]`}
      >
        <div
          className={"flex flex-col gap-8 h-fit"}
          style={{
            width: "50%",
            borderRadius: 24,
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            padding: 20,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              style={{
                fontSize: 20,
                fontWeight: 600,
                margin: 0,
                color: "#1f2937",
              }}
            >
              Upload User Supervisor
            </h2>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              style={{
                // width: "100%",
                borderRadius: 16,
                border: "1px solid #3E9B73",
                height: 36,
                color: "#3E9B73",
              }}
            >
              Template
            </Button>
          </div>
          <Form
            form={form}
            layout="vertical"
            style={{
              marginTop: 5,
            }}
          >
            <Row>
              {/* Upload Field */}
              <Col span={24} className="">
                <Form.Item
                  label={
                    <span style={{ color: "#555", fontSize: 13 }}>
                      Upload User Supervisor Excel
                    </span>
                  }
                  name="users"
                  valuePropName="fileList"
                  getValueFromEvent={(e) => e?.fileList}
                  rules={[
                    {
                      required: true,
                      message: "Please upload an Excel file",
                    },
                  ]}
                  style={{ marginBottom: 32 }}
                >
                  <Dragger
                    {...uploadProps}
                    accept=".xlsx,.xls"
                    className="small-dragger"
                    style={{
                      borderRadius: 12,
                      background: "#eaf6ec",
                      border: "1.5px dashed #d0d5dd",
                      padding: "12px 0",
                      height: 12,
                    }}
                    showUploadList={{ showRemoveIcon: true }}
                  >
                    <p
                      className="ant-upload-drag-icon"
                      style={{ marginBottom: 4 }}
                    >
                      <InboxOutlined style={{ color: "#aaa", fontSize: 28 }} />
                    </p>
                    <p style={{ color: "#555", fontSize: 13, margin: 0 }}>
                      Click to upload File
                    </p>
                  </Dragger>
                </Form.Item>

                <Row
                  gutter={20}
                  justify="space-between"
                  align="middle"
                  style={{ marginTop: 20 }}
                >
                  <Col span={10}>
                    <Button
                      type="primary"
                      loading={isUploaded}
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
        </div>

        {errorRows.length > 0 && (
          <div style={{ width: "50%" }}>
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
                <b style={{ color: "#1a6b3c" }}>{summary.success}</b>{" "}
                &nbsp;|&nbsp; Failed:{" "}
                <b style={{ color: "red" }}>{summary.failed}</b>
              </div>
            )}
            <Card
              title={
                <span style={{ color: T.error.text, fontWeight: 600 }}>
                  <InfoCircleOutlined /> Error Logs
                </span>
              }
              style={{
                marginTop: 16,
                //  width: "50%" ,
                overflow: "hidden",
                border: "1px solid #f5c2c7",
                borderRadius: 12,
                background: T.error.bg,
              }}
              bodyStyle={{ padding: 0 }}
            >
              <Table
                dataSource={errorRows}
                rowKey={(r, i) => `${r.employeeId}-${i}`}
                pagination={false}
                scroll={{ y: 250 }}
                columns={[
                  {
                    title: smallHeader("Employee ID"),
                    dataIndex: "employeeId",
                    render: (text: string) => (
                      <span style={{ color: T.error.text, fontWeight: 600 }}>
                        {text}
                      </span>
                    ),
                  },
                  {
                    title: smallHeader("Supervisor ID"),
                    dataIndex: "supEmployeeId",
                    render: (text: string) => (
                      <span style={{ color: T.error.text, fontWeight: 600 }}>
                        {text}
                      </span>
                    ),
                  },
                  {
                    title: smallHeader("Status"),
                    dataIndex: "isSuccess",
                    render: () => <Tag color="red">Failed</Tag>,
                    width: 100,
                  },
                  {
                    title: smallHeader("Reason"),
                    dataIndex: "message",
                    render: (text: string) => (
                      <span style={{ color: T.error.text, fontWeight: 500 }}>
                        {text}
                      </span>
                    ),
                  },
                ]}
                rowClassName={() => "error-row"}
              />
            </Card>{" "}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyForm;
