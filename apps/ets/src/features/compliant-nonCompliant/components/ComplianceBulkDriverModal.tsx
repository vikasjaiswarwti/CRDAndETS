import React, { useState } from "react";
import { Upload, Alert, Spin } from "antd";
import * as XLSX from "xlsx";
import { useBulkUploadDriverStageMutation } from "../../driver/services/driverApi";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../constants/tokens";
import { useLookups } from "../../lookups/hooks/useLookups";
import { message } from "antd";

const { Dragger } = Upload;

// ─── DTO ──────────────────────────────────────────────────────────────────────
export interface CreateDriverDto {
  driverName: string;
  mobileNo: string;
  alternateMobileNo: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
  fatherName: string;
  permanentAddress: string;
  presentAddress: string;
  driverType: string;
  inductionDate: string;
  licenseNo: string;
  licenseIssueDate: string;
  licenseExpDate: string;
  driverLicenceAuthority: string;
  policeVerificationCompleted: boolean;
  policeVerificationExpiryDate: string;
  lastInternalVerificationDate: string;
  lastTrainingDate: string;
  trainingStatus: string;
  externalVerificationAgency: string;
  externalVerificationExpiryDate: string;
  privateBgvExpiryDate: string;
  remarks: string;
  // injected from modal selectors
  transporterId: number | null;
  locCode: number;
}

// ─── API response types ───────────────────────────────────────────────────────
interface RowError {
  rowNumber: number;
  messages: string[];
}

interface BulkUploadResponse {
  // success: number;
  errors: RowError[];
  successRows: number[];
}

// ─── Result state type ────────────────────────────────────────────────────────
interface UploadResult {
  success: number;
  errors: RowError[];
}

// ─── Template definition ──────────────────────────────────────────────────────
const DRIVER_TEMPLATE = {
  fileName: "Driver_Template.xlsx",
  sheetName: "Driver",
  data: [
    {
      "Driver Name": "Rahul",
      "Mobile Number": "9876543210",
      "Alternate Mobile Number": "9876543210",
      Gender: "male",
      "Date of Birth": "YYYY-MM-DD",
      "Blood Group": "O+",
      "Father Name": "Rahul father",
      "Permanent Address": "Delhi Address",
      "Present Address": "Current Address",
      "Driver Type": "Company/Attachment",
      "Induction Date": "YYYY-MM-DD",
      "Driving License Number": "",
      "License Issue Date": "YYYY-MM-DD",
      "License Expiry Date": "YYYY-MM-DD",
      "Driving License Authority": "RTO Delhi",
      "Police Verification Completed": "Yes",
      "Police Verification Expiry Date": "YYYY-MM-DD",
      "Last Internal Verification Date": "YYYY-MM-DD",
      "Last Training Date": "YYYY-MM-DD",
      "Training Status": "Completed",
      "External Verification Agency": "ABC Verification",
      "External Verification Expiry Date": "YYYY-MM-DD",
      "Private BGV Expiry Date": "YYYY-MM-DD",
      Remarks: "No remarks",
    },
  ],
};

// ─── Generate + download Excel client-side via SheetJS ───────────────────────
function downloadExcelTemplate(config: {
  fileName: string;
  sheetName: string;
  data: Record<string, unknown>[];
}) {
  const ws = XLSX.utils.json_to_sheet(config.data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, config.sheetName);
  XLSX.writeFile(wb, config.fileName);
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function parseExcelDate(val: any): string {
  if (!val) return "";

  if (val instanceof Date) {
    return val.toISOString().split("T")[0];
  }

  if (typeof val === "number") {
    const date = XLSX.SSF.parse_date_code(val);
    return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
  }

  const str = String(val).trim();
  if (!str || str === "YYYY-MM-DD") return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(str)) {
    const parts = str.split("/").map(Number);
    const m = parts[0];
    const d = parts[1];
    const y = parts[2];
    const fullYear = y < 100 ? 2000 + y : y;
    return `${fullYear}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return "";
}

function parseBool(val: any): boolean {
  if (typeof val === "boolean") return val;
  return String(val).trim().toLowerCase() === "yes";
}

// ─── Required field definitions ───────────────────────────────────────────────
const REQUIRED_FIELDS: { key: string; label: string }[] = [
  { key: "Driver Name", label: "Driver Name" },
  { key: "Mobile Number", label: "Mobile Number" },
  { key: "Gender", label: "Gender" },
  { key: "Date of Birth", label: "Date of Birth" },
  { key: "Blood Group", label: "Blood Group" },
  { key: "Father Name", label: "Father Name" },
  { key: "Permanent Address", label: "Permanent Address" },
  { key: "Present Address", label: "Present Address" },
  { key: "Driver Type", label: "Driver Type" },
  { key: "Induction Date", label: "Induction Date" },
  { key: "Driving License Number", label: "Driving License Number" },
  { key: "License Issue Date", label: "License Issue Date" },
  { key: "License Expiry Date", label: "License Expiry Date" },
  { key: "Driving License Authority", label: "Driving License Authority" },
  {
    key: "Police Verification Completed",
    label: "Police Verification Completed",
  },
  {
    key: "Police Verification Expiry Date",
    label: "Police Verification Expiry Date",
  },
  {
    key: "Last Internal Verification Date",
    label: "Last Internal Verification Date",
  },
  { key: "Last Training Date", label: "Last Training Date" },
  { key: "Training Status", label: "Training Status" },
  {
    key: "External Verification Agency",
    label: "External Verification Agency",
  },
  {
    key: "External Verification Expiry Date",
    label: "External Verification Expiry Date",
  },
  { key: "Private BGV Expiry Date", label: "Private BGV Expiry Date" },
];

function validateRows(rows: Record<string, any>[]): RowError[] {
  return rows.reduce<RowError[]>((acc, row, index) => {
    const missing = REQUIRED_FIELDS.filter(({ key }) => {
      const val = row[key];
      return (
        val === undefined ||
        val === null ||
        String(val).trim() === "" ||
        String(val).trim() === "YYYY-MM-DD"
      );
    }).map(({ label }) => `${label} is required`);

    if (missing.length) acc.push({ rowNumber: index + 1, messages: missing });
    return acc;
  }, []);
}

// ─── Excel row → CreateDriverDto ──────────────────────────────────────────────
function mapRowToCreateDriverDto(
  row: Record<string, any>,
  transporterId: number | null,
  locCode: string | undefined,
): CreateDriverDto {
  return {
    driverName: String(row["Driver Name"] ?? "").trim(),
    mobileNo: String(row["Mobile Number"] ?? "").trim(),
    alternateMobileNo: String(row["Alternate Mobile Number"] ?? "").trim(),
    gender: String(row["Gender"] ?? "").trim(),
    dateOfBirth: parseExcelDate(row["Date of Birth"]),
    bloodGroup: String(row["Blood Group"] ?? "").trim(),
    fatherName: String(row["Father Name"] ?? "").trim(),
    permanentAddress: String(row["Permanent Address"] ?? "").trim(),
    presentAddress: String(row["Present Address"] ?? "").trim(),
    driverType: String(row["Driver Type"] ?? "Attachment").trim(),
    inductionDate: parseExcelDate(row["Induction Date"]),
    licenseNo: String(row["Driving License Number"] ?? "").trim(),
    licenseIssueDate: parseExcelDate(row["License Issue Date"]),
    licenseExpDate: parseExcelDate(row["License Expiry Date"]),
    driverLicenceAuthority: String(
      row["Driving License Authority"] ?? "",
    ).trim(),
    policeVerificationCompleted: parseBool(
      row["Police Verification Completed"] ?? "",
    ),
    policeVerificationExpiryDate: parseExcelDate(
      row["Police Verification Expiry Date"] ?? "",
    ),
    lastInternalVerificationDate: parseExcelDate(
      row["Last Internal Verification Date"] ?? "",
    ),
    lastTrainingDate: parseExcelDate(row["Last Training Date"]),
    trainingStatus: String(row["Training Status"] ?? "").trim(),
    externalVerificationAgency: String(
      row["External Verification Agency"] ?? "",
    ).trim(),
    externalVerificationExpiryDate: parseExcelDate(
      row["External Verification Expiry Date"] ?? "",
    ),
    privateBgvExpiryDate: parseExcelDate(row["Private BGV Expiry Date"]),
    remarks: String(row["Remarks"] ?? "").trim(),
    transporterId: transporterId ?? null,
    locCode: locCode ? Number(locCode) : 0,
  };
}

// ─── Component props ──────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  /** Resolved by parent (useComplianceTransporter) — stamped on every row */
  transporterId?: number;
  /** Injected from parent — auto-derived from vendor; no manual selector needed */
  locCode?: number;
  /** Vendor display name for the info banner */
  vendorLabel?: string;
  onSuccess: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const ComplianceBulkDriverModal: React.FC<Props> = ({
  open,
  onClose,
  transporterId: propTransporterId,
  locCode: propLocCode,
  vendorLabel: propVendorLabel,
  onSuccess,
}) => {
  const { Modal } = useUILibrary();
  const { color, spacing, radius, font } = useTokens();
  const { locationOptions } = useLookups({
    only: ["locationOptions"],
  }) as any;

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [uploading, setUploading] = useState(false);

  // Resolve office name from locationOptions using the passed-in locCode
  const officeLabel: string | undefined = (locationOptions as any)?.find(
    (o: any) => o.value === propLocCode,
  )?.label;

  const [bulkUploadDriver] = useBulkUploadDriverStageMutation();

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, {
        defval: "",
        raw: false,
      });

      if (!rows.length) {
        setResult({
          success: 0,
          errors: [
            { rowNumber: 0, messages: ["No data rows found in the file."] },
          ],
        });
        setUploading(false);
        return;
      }

      // transporterId + locCode come entirely from the parent — no local override
      const tid = propTransporterId ?? null;
      const loc = propLocCode ?? 0;

      const dtos: CreateDriverDto[] = rows
        .map((row) =>
          mapRowToCreateDriverDto(row, tid, String(propLocCode ?? "")),
        )
        .map((dto) => ({ ...dto, transporterId: tid, locCode: loc }));

      const res = (await bulkUploadDriver(
        dtos as any[],
      ).unwrap()) as BulkUploadResponse;

      const rowErrors: RowError[] = Array.isArray(res?.errors)
        ? res.errors
        : [];
      // setResult({ success: res?.success ?? 0, errors: rowErrors });
      // // if (!rowErrors.length) onSuccess();
      // if (!rowErrors.length) {
      //   message.success(`${res?.success ?? 0} driver(s) uploaded successfully`);
      //   onSuccess();
      // }

      const successCount = Array.isArray(res?.successRows)
        ? res.successRows.length
        : 0;
      setResult({ success: successCount, errors: rowErrors });
      if (!rowErrors.length) {
        message.success(`${successCount} driver(s) uploaded successfully`);
        onSuccess();
      }
    } catch (e: any) {
      const data = e?.data;
      let msg = "Upload failed. Please check the file and try again.";

      if (data?.errors && typeof data.errors === "object") {
        msg = Object.values(data.errors as Record<string, string[]>)
          .flat()
          .join(" · ");
      } else if (data?.message ?? data?.title) {
        msg = data.message ?? data.title;
      }

      setResult({ success: 0, errors: [{ rowNumber: 0, messages: [msg] }] });
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = !!file && !uploading;
  const hasErrors = (result?.errors?.length ?? 0) > 0;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="Bulk Upload Drivers"
      footer={null}
      centered
      width={560}
      destroyOnClose
    >
      <div style={{ padding: `${spacing.sm}px 0` }}>
        {/* ── Template download ─────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: color.primaryLight,
            borderRadius: radius.md,
            padding: `${spacing.sm}px ${spacing.md}px`,
            marginBottom: spacing.md,
          }}
        >
          <div>
            <p
              style={{
                fontSize: font.sizeSm,
                color: color.primaryDark,
                margin: 0,
                fontWeight: 600,
              }}
            >
              Need the template?
            </p>
            <p
              style={{
                fontSize: font.sizeXs,
                color: color.primaryDark,
                margin: 0,
                opacity: 0.8,
              }}
            >
              Download, fill it in, then upload here.
            </p>
          </div>
          <button
            onClick={() => downloadExcelTemplate(DRIVER_TEMPLATE)}
            style={{
              padding: "5px 12px",
              borderRadius: radius.md,
              border: `1px solid ${color.primary}`,
              background: "#fff",
              color: color.primary,
              cursor: "pointer",
              fontSize: font.sizeXs,
              fontFamily: "inherit",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
            }}
          >
            ⬇ Download Template
          </button>
        </div>

        {/* ── Vendor + Office info banner ───────────────────────────────────── */}
        {(propVendorLabel || officeLabel || propLocCode) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
              background: "#f0faf4",
              border: "1px solid #d1fae5",
              borderRadius: 8,
              padding: "8px 14px",
              marginBottom: spacing.sm,
              fontSize: 12,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: "#6b7280" }}>
              Uploading for:
            </span>
            {propVendorLabel && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#fff",
                  border: "1px solid #b7e4c7",
                  borderRadius: 20,
                  padding: "3px 10px",
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
                {propVendorLabel}
              </span>
            )}
            {(officeLabel ?? propLocCode) && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#fff",
                  border: "1px solid #b7e4c7",
                  borderRadius: 20,
                  padding: "3px 10px",
                  color: "#1B4332",
                  fontWeight: 600,
                }}
              >
                📍Office:- {officeLabel ?? `Office ${propLocCode}`}
              </span>
            )}
          </div>
        )}

        {/* ── File dragger ──────────────────────────────────────────────────── */}
        <Dragger
          accept=".xlsx,.xls,.csv"
          beforeUpload={(f) => {
            setResult(null);

            const reader = new FileReader();
            reader.onload = (e) => {
              const buffer = e.target?.result as ArrayBuffer;
              const wb = XLSX.read(buffer, { type: "array", cellDates: true });
              const ws = wb.Sheets[wb.SheetNames[0]];
              const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, {
                defval: "",
                raw: false,
              });

              if (!rows.length) {
                setResult({
                  success: 0,
                  errors: [
                    {
                      rowNumber: 0,
                      messages: ["No data rows found in the file."],
                    },
                  ],
                });
                return;
              }

              const validationErrors = validateRows(rows);
              if (validationErrors.length) {
                setResult({ success: 0, errors: validationErrors });
                setFile(null);
                return;
              }

              setFile(f);
            };

            reader.readAsArrayBuffer(f);
            return false;
          }}
          fileList={file ? [{ uid: "1", name: file.name, status: "done" }] : []}
          onRemove={() => {
            setFile(null);
            setResult(null);
          }}
          maxCount={1}
          style={{ marginBottom: spacing.md }}
        >
          <div style={{ padding: `${spacing.md}px 0` }}>
            <p style={{ fontSize: 24, margin: 0, color: color.primary }}>⬆</p>
            <p
              style={{
                fontSize: font.sizeMd,
                color: color.textPrimary,
                margin: `${spacing.xs}px 0`,
              }}
            >
              Click or drag Excel file here
            </p>
            <p
              style={{
                fontSize: font.sizeXs,
                color: color.textSecondary,
                margin: 0,
              }}
            >
              Supports: .xlsx, .xls, .csv
            </p>
          </div>
        </Dragger>

        {/* ── Result summary ────────────────────────────────────────────────── */}
        {result && (
          <div style={{ marginBottom: spacing.md }}>
            {result.success > 0 && (
              <Alert
                type="success"
                message={`${result.success} driver(s) uploaded successfully.`}
                style={{ marginBottom: spacing.xs, fontSize: font.sizeSm }}
              />
            )}

            {result.errors.length > 0 && (
              <div
                style={{
                  border: "1px solid #fca5a5",
                  borderRadius: radius.md,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#fef2f2",
                    padding: `${spacing.xs}px ${spacing.sm}px`,
                    borderBottom: "1px solid #fca5a5",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: font.sizeSm,
                      fontWeight: 600,
                      color: "#b91c1c",
                    }}
                  >
                    Upload errors
                  </span>
                  <span style={{ fontSize: font.sizeXs, color: "#b91c1c" }}>
                    {result.errors.length} row(s) failed
                  </span>
                </div>

                <div
                  style={{
                    maxHeight: 200,
                    overflowY: "auto",
                    overflowX: "hidden",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#fca5a5 #fff",
                  }}
                >
                  {result.errors.map(({ rowNumber, messages }: RowError) => (
                    <div
                      key={rowNumber}
                      style={{
                        display: "flex",
                        gap: spacing.sm,
                        padding: `${spacing.xs}px ${spacing.sm}px`,
                        borderBottom: "1px solid #fee2e2",
                        alignItems: "flex-start",
                        minHeight: 32,
                      }}
                    >
                      <span
                        style={{
                          fontSize: font.sizeXs,
                          fontWeight: 600,
                          color: "#b91c1c",
                          whiteSpace: "nowrap",
                          minWidth: 52,
                          paddingTop: 2,
                        }}
                      >
                        {rowNumber === 0 ? "Error" : `Row ${rowNumber}`}
                      </span>
                      <span
                        style={{
                          fontSize: font.sizeXs,
                          color: "#7f1d1d",
                          lineHeight: 1.5,
                        }}
                      >
                        {messages.join(" · ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Actions ───────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: spacing.sm,
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
            {result && !hasErrors ? "Close" : "Cancel"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              padding: "6px 20px",
              borderRadius: radius.md,
              border: "none",
              background: !canSubmit ? "#9ca3af" : color.primary,
              color: "#fff",
              cursor: !canSubmit ? "not-allowed" : "pointer",
              fontSize: font.sizeSm,
              fontFamily: "inherit",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {uploading && <Spin size="small" />}
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </div>
    </Modal>
  );
};
