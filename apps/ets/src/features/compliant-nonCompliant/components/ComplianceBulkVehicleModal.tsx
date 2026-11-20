import React, { useState } from "react";
import { Upload, Alert, Spin } from "antd";
import * as XLSX from "xlsx";
import { useBulkUploadVehicleStageMutation } from "../../vehicle-management/services/vehicleApi";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useTokens } from "../constants/tokens";
import { useLookups } from "../../lookups/hooks/useLookups";
import { message } from "antd";

const { Dragger } = Upload;

// ─── DTO ──────────────────────────────────────────────────────────────────────
export interface CreateVehicleDto {
  vehicle_Registration_No: string;
  vehicleTypeCode: string;
  transporterId: number | null;
  driverId: null;
  locCode: number;
  vehicle_Registration_Date: string;
  vehicle_Induction_Date: string;
  registration_Exp_Date: string;
  firstAid_Kid_Date: string;
  fire_Extinguisher_Date: string;
  make: string;
  model: string;
  chassis_No: string;
  permit_Expiry_Date: string;
  insurance_Expiry_Date: string;
  fitness_Expiry_Date: string;
  road_Tax_Validity_Expiry: string;
  puc_Expiry_Date: string;
  owner_Name: string;
  owner_Address: string;
  owner_Type: string;
  isGpsInstalled: boolean;
  gps_Installation_Date: string;
  gpsProviderCode: string;
  fuelTypeCode: string;
  makeYear: string;
  remarks: string;
  registrationExpiryDate_Doc?: string | null;
  fireExtinguisherExp_Doc?: string | null;
  permitExpiryDate_Doc?: string | null;
  firstAidKitDateExpiry_Doc?: string | null;
  insuranceExpiryDate_Doc?: string | null;
  fitnessExpiryDate_Doc?: string | null;
  roadTaxExpiryDate_Doc?: string | null;
  pucExpiryDate_Doc?: string | null;
  allDocuments_Doc?: string | null;
}

// ─── Template definition ──────────────────────────────────────────────────────
const VEHICLE_TEMPLATE = {
  fileName: "Vehicle_Template.xlsx",
  sheetName: "Vehicle",
  data: [
    {
      "Vehicle Registration Number": "DL21CH3487",
      "Vehicle Type Code": "suv/sedan/hatchback",
      Make: "TATA",
      Model: "Nissan",
      "Chassis Number": "1ZVBP8JZ8H1234567",
      "Fuel Type Code": "Diesel/Petrol/CNG",
      "Make Year": "YYYY-MM-DD",
      Remarks: "remarks",
      "Owner Name": "Vikas",
      "Owner Address": "dwarka",
      "Owner Type": "Own/Attached",
      "GPS Installed": "Yes",
      "GPS Provider Code": "Dhanuka/TRAQR",
      "GPS Installation Date": "YYYY-MM-DD",
      "Registration Date": "YYYY-MM-DD",
      "Induction Date": "YYYY-MM-DD",
      "Registration Expiry Date": "YYYY-MM-DD",
      "Permit Expiry Date": "YYYY-MM-DD",
      "Insurance Expiry Date": "YYYY-MM-DD",
      "Fitness Expiry Date": "YYYY-MM-DD",
      "Road Tax Validity Expiry": "YYYY-MM-DD",
      "PUC Expiry Date": "YYYY-MM-DD",
      "First Aid Kit Date": "YYYY-MM-DD",
      "Fire Extinguisher Date": "YYYY-MM-DD",
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
  if (val instanceof Date) return val.toISOString().split("T")[0];
  if (typeof val === "number") {
    const date = XLSX.SSF.parse_date_code(val);
    return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
  }
  const str = String(val).trim();
  if (!str || str === "YYYY-MM-DD") return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(str)) {
    const parts = str.split("/").map(Number);
    const fullYear = parts[2] < 100 ? 2000 + parts[2] : parts[2];
    return `${fullYear}-${String(parts[0]).padStart(2, "0")}-${String(parts[1]).padStart(2, "0")}`;
  }
  const parsed = new Date(str);
  return !isNaN(parsed.getTime()) ? parsed.toISOString().split("T")[0] : "";
}

function parseBool(val: any): boolean {
  if (typeof val === "boolean") return val;
  return String(val).trim().toLowerCase() === "yes";
}

// ─── Excel row → CreateVehicleDto ─────────────────────────────────────────────
function mapRowToCreateVehicleDto(
  row: Record<string, any>,
  transporterId: number | null,
  locCode: string | undefined,
): CreateVehicleDto {
  return {
    vehicle_Registration_No: String(row["Vehicle Registration Number"] ?? "")
      .trim()
      .toLocaleUpperCase(),
    vehicleTypeCode: String(row["Vehicle Type Code"] ?? "suv").trim(),
    make: String(row["Make"] ?? "").trim(),
    model: String(row["Model"] ?? "").trim(),
    chassis_No: String(row["Chassis Number"] ?? "")
      .trim()
      .toLocaleUpperCase(),
    fuelTypeCode: String(row["Fuel Type Code"] ?? "Petrol").trim(),
    makeYear: parseExcelDate(row["Make Year"]),
    remarks: String(row["Remarks"] ?? "").trim(),
    owner_Name: String(row["Owner Name"] ?? "").trim(),
    owner_Address: String(row["Owner Address"] ?? "").trim(),
    owner_Type: String(row["Owner Type"] ?? "Attached").trim(),
    isGpsInstalled: parseBool(row["GPS Installed"]),
    gpsProviderCode: String(row["GPS Provider Code"] ?? "Dhanuka").trim(),
    gps_Installation_Date: parseExcelDate(row["GPS Installation Date"]),
    vehicle_Registration_Date: parseExcelDate(row["Registration Date"]),
    vehicle_Induction_Date: parseExcelDate(row["Induction Date"]),
    registration_Exp_Date: parseExcelDate(row["Registration Expiry Date"]),
    permit_Expiry_Date: parseExcelDate(row["Permit Expiry Date"]),
    insurance_Expiry_Date: parseExcelDate(row["Insurance Expiry Date"]),
    fitness_Expiry_Date: parseExcelDate(row["Fitness Expiry Date"]),
    road_Tax_Validity_Expiry: parseExcelDate(row["Road Tax Validity Expiry"]),
    puc_Expiry_Date: parseExcelDate(row["PUC Expiry Date"]),
    firstAid_Kid_Date: parseExcelDate(row["First Aid Kit Date"]),
    fire_Extinguisher_Date: parseExcelDate(row["Fire Extinguisher Date"]),
    transporterId: transporterId ?? null,
    locCode: locCode ? Number(locCode) : 0,
    driverId: null,
    registrationExpiryDate_Doc: null,
    fireExtinguisherExp_Doc: null,
    permitExpiryDate_Doc: null,
    firstAidKitDateExpiry_Doc: null,
    insuranceExpiryDate_Doc: null,
    fitnessExpiryDate_Doc: null,
    roadTaxExpiryDate_Doc: null,
    pucExpiryDate_Doc: null,
    allDocuments_Doc: null,
  };
}

// ─── Required field validator ─────────────────────────────────────────────────
const REQUIRED_FIELDS: { key: string; label: string }[] = [
  { key: "Vehicle Registration Number", label: "Vehicle Registration Number" },
  { key: "Vehicle Type Code", label: "Vehicle Type Code" },
  { key: "Make", label: "Make" },
  { key: "Model", label: "Model" },
  { key: "Chassis Number", label: "Chassis Number" },
  { key: "Fuel Type Code", label: "Fuel Type Code" },
  { key: "Make Year", label: "Make Year" },
  { key: "Owner Name", label: "Owner Name" },
  { key: "Owner Address", label: "Owner Address" },
  { key: "Owner Type", label: "Owner Type" },
  { key: "GPS Installed", label: "GPS Installed" },
  { key: "GPS Provider Code", label: "GPS Provider Code" },
  { key: "GPS Installation Date", label: "GPS Installation Date" },
  { key: "Registration Date", label: "Registration Date" },
  { key: "Induction Date", label: "Induction Date" },
  { key: "Registration Expiry Date", label: "Registration Expiry Date" },
  { key: "Permit Expiry Date", label: "Permit Expiry Date" },
  { key: "Insurance Expiry Date", label: "Insurance Expiry Date" },
  { key: "Fitness Expiry Date", label: "Fitness Expiry Date" },
  { key: "Road Tax Validity Expiry", label: "Road Tax Validity Expiry" },
  { key: "PUC Expiry Date", label: "PUC Expiry Date" },
  { key: "First Aid Kit Date", label: "First Aid Kit Date" },
  { key: "Fire Extinguisher Date", label: "Fire Extinguisher Date" },
];

function validateRows(
  rows: Record<string, any>[],
): { rowNumber: number; messages: string[] }[] {
  return rows.reduce<{ rowNumber: number; messages: string[] }[]>(
    (acc, row, index) => {
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
    },
    [],
  );
}

// ─── Component props ──────────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
  /** Resolved by parent (useComplianceTransporter) — stamped on every row */
  transporterId?: number;
  onSuccess: () => void;
  /** Injected from parent — auto-derived from vendor; no manual selector needed */
  locCode?: number;
  /** Vendor display name for the info banner */
  vendorLabel?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const ComplianceBulkVehicleModal: React.FC<Props> = ({
  open,
  onClose,
  transporterId: propTransporterId,
  onSuccess,
  locCode: propLocCode,
  vendorLabel: propVendorLabel,
}) => {
  const { Modal } = useUILibrary();
  const { color, spacing, radius, font } = useTokens();
  const { locationOptions } = useLookups({
    only: ["locationOptions"],
  }) as any;

  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{
    success?: number;
    errors?: { rowNumber: number; messages: string[] }[];
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Resolve office name from locationOptions using the passed-in locCode
  const officeLabel: string | undefined = (locationOptions as any)?.find(
    (o: any) => o.value === propLocCode,
  )?.label;

  const [bulkUploadVehicle] = useBulkUploadVehicleStageMutation();

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

      const dtos: CreateVehicleDto[] = rows.map((row) =>
        mapRowToCreateVehicleDto(row, tid, String(propLocCode ?? "")),
      );

      const res: any = await bulkUploadVehicle(dtos as any[]).unwrap();
      const rowErrors = Array.isArray(res?.errors) ? res.errors : [];

      const successCount = Array.isArray(res?.successRows)
        ? res.successRows.length // ← { successRows: [1], errors: [] }
        : (res?.successCount ?? res?.inserted ?? res?.count ?? 0);
      setResult({
        success: successCount, //res?.successCount ?? res?.inserted ?? res?.count ?? 0,
        errors: rowErrors,
      });
      // if (!rowErrors.length) onSuccess();
      if (!rowErrors.length) {
        message.success(`${successCount} vehicle(s) uploaded successfully`);
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

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title="Bulk Upload Vehicles"
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
            onClick={() => downloadExcelTemplate(VEHICLE_TEMPLATE)}
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
                Vendor:- {propVendorLabel}
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
            {(result.success ?? 0) > 0 && (
              <Alert
                type="success"
                message={`${result.success} vehicle(s) uploaded successfully.`}
                style={{ marginBottom: spacing.xs, fontSize: font.sizeSm }}
              />
            )}
            {result?.errors && result.errors.length > 0 && (
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
                  {result.errors.map(
                    ({
                      rowNumber,
                      messages,
                    }: {
                      rowNumber: number;
                      messages: string[];
                    }) => (
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
                    ),
                  )}
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
            {result && !result.errors?.length ? "Close" : "Cancel"}
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
