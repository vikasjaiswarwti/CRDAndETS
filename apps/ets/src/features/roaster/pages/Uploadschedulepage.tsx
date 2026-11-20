// src/features/roster/pages/UploadSchedulePage.tsx

import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import { useLookups } from "../../lookups";
import { useRosterBulkUpload } from "../hooks/useRosterBulkUpload";
import { useLazyGetSchedulerTemplateQuery } from "../services/RosterApi";
import type { BulkUploadErrorLog } from "../types/Roster.types";
import { Select } from "../../../shared/components/ui/Select";
import * as XLSX from "xlsx";
import { useGetCurrentUserQuery } from "../../auth/services/authApi";
import { useGetGlobalUserQuery } from "../../profile/services/profileApi";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const G = {
  dark: "#1B4332",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  white: "#fff",
  lightBg: "#F0FAF4",
  successBg: "#F0FDF4",
  successBorder: "#BBF7D0",
  successText: "#15803D",
  errorRed: "#DC2626",
  errorBg: "#FEF2F2",
  errorBorder: "#FECACA",
  errorText: "#991B1B",
  errorMuted: "#EF4444",
};

// ─── File validation ──────────────────────────────────────────────────────────
const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".csv"];
const ALLOWED_MIME = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
];
function isAllowedFile(file: File): boolean {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext) || ALLOWED_MIME.includes(file.type);
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const BackChevron = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M11 4L6 9l5 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const UploadCloud = ({ color = G.white }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M5 10l3-3 3 3M8 7v7"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.5 10.5A3 3 0 0011 5.5a.5.5 0 01-.49-.39A5 5 0 002 7.5a3.5 3.5 0 00.5 7"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M7.5 1v9M4 7l3.5 3.5L11 7"
      stroke={G.dark}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1 13h13"
      stroke={G.dark}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const ExcelIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="3" fill="#1D6F42" />
    <path
      d="M7 8l3 4-3 4M13 8h4M13 12h3M13 16h4"
      stroke="#fff"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const WarnTriangle = () => (
  <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
    <path
      d="M9.17 3.172a2 2 0 013.66 0l7.17 14.34A2 2 0 0118.17 20H3.83a2 2 0 01-1.83-2.488L9.17 3.172z"
      fill="#FEE2E2"
      stroke={G.errorRed}
      strokeWidth="1.4"
    />
    <path
      d="M11 9v4M11 15.5v.5"
      stroke={G.errorRed}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle
      cx="11"
      cy="11"
      r="10"
      fill="#DCFCE7"
      stroke={G.successText}
      strokeWidth="1.4"
    />
    <path
      d="M7 11l3 3 5-5"
      stroke={G.successText}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RosterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="3" width="20" height="18" rx="3" fill={G.dark} />
    <path
      d="M7 8h10M7 12h10M7 16h6"
      stroke="#fff"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// ─── Upload Zone ──────────────────────────────────────────────────────────────
interface UploadZoneProps {
  file: File | null;
  hasBackendErrors: boolean;
  dragging: boolean;
  onFileChange: (f: File | null) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  fileError: string;
}

const UploadZone: React.FC<UploadZoneProps> = ({
  file,
  hasBackendErrors,
  dragging,
  onFileChange,
  onDragOver,
  onDragLeave,
  onDrop,
  inputRef,
  fileError,
}) => (
  <div>
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => !file && inputRef.current?.click()}
      style={{
        border: `2px dashed ${fileError ? G.errorRed : hasBackendErrors ? G.errorBorder : dragging ? G.dark : "#D1D5DB"}`,
        borderRadius: 12,
        padding: "28px 24px",
        background: fileError
          ? G.errorBg
          : hasBackendErrors
            ? G.errorBg
            : dragging
              ? G.lightBg
              : "#FAFAFA",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: file ? "default" : "pointer",
        transition: "all 0.15s",
        minHeight: 130,
        textAlign: "center",
      }}
    >
      {hasBackendErrors && !file ? (
        <>
          <WarnTriangle />
          <p
            style={{
              margin: "10px 0 4px",
              fontSize: 14,
              fontWeight: 700,
              color: G.errorRed,
            }}
          >
            Action Required: Format Issues
          </p>
          <p style={{ margin: 0, fontSize: 12, color: G.errorMuted }}>
            Fix the errors shown on the right, then reupload.
          </p>
          <span
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            style={{
              fontSize: 12,
              color: G.dark,
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
              marginTop: 8,
            }}
          >
            Choose new file
          </span>
        </>
      ) : file ? (
        <>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#DCFCE7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <ExcelIcon />
          </div>
          <p
            style={{
              margin: "0 0 2px",
              fontSize: 14,
              fontWeight: 600,
              color: G.text,
            }}
          >
            {file.name}
          </p>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: G.muted }}>
            {(file.size / 1024).toFixed(1)} KB
          </p>
          <span
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            style={{
              fontSize: 12,
              color: G.dark,
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Change file
          </span>
        </>
      ) : (
        <>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "#F3F4F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            <UploadCloud color={G.muted} />
          </div>
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 14,
              fontWeight: 500,
              color: G.text,
            }}
          >
            Click to upload or drag & drop
          </p>
          <p style={{ margin: 0, fontSize: 12, color: G.muted }}>
            Excel (.xlsx, .xls) or CSV only
          </p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: "none" }}
        onChange={(e) => {
          const picked = e.target.files?.[0] ?? null;
          onFileChange(picked);
          e.target.value = "";
        }}
      />
    </div>
    {fileError && (
      <p style={{ margin: "4px 0 0", fontSize: 12, color: G.errorRed }}>
        {fileError}
      </p>
    )}
  </div>
);

// ─── Success Banner ───────────────────────────────────────────────────────────
const SuccessBanner: React.FC<{ message: string; onDismiss: () => void }> = ({
  message,
  onDismiss,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: G.successBg,
      border: `1px solid ${G.successBorder}`,
      borderRadius: 10,
      padding: "12px 16px",
      marginBottom: 14,
    }}
  >
    <CheckIcon />
    <span
      style={{ fontSize: 13, fontWeight: 600, color: G.successText, flex: 1 }}
    >
      {message}
    </span>
    <button
      onClick={onDismiss}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: G.successText,
        fontSize: 16,
        lineHeight: 1,
        padding: 0,
      }}
    >
      ✕
    </button>
  </div>
);

// ─── Error Log Table ──────────────────────────────────────────────────────────
const ErrorLogTable: React.FC<{ logs: BulkUploadErrorLog[] }> = ({ logs }) => (
  <div>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "100px 1fr",
        padding: "10px 16px",
        background: G.errorBg,
        borderRadius: "10px 10px 0 0",
        border: `1px solid ${G.errorBorder}`,
        borderBottom: "none",
      }}
    >
      {["Batch ID", "Log Details"].map((h) => (
        <span
          key={h}
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: G.errorText,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {h}
        </span>
      ))}
    </div>
    <div
      style={{
        border: `1px solid ${G.errorBorder}`,
        borderRadius: "0 0 10px 10px",
        overflow: "hidden",
      }}
    >
      {logs.map((log, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "100px 1fr",
            padding: "12px 16px",
            borderBottom:
              i < logs.length - 1 ? `1px solid ${G.errorBorder}` : "none",
            background: i % 2 === 0 ? G.white : "#FFFBFB",
            alignItems: "start",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: G.errorRed,
              paddingTop: 1,
            }}
          >
            #{log.batchId}
          </span>
          <span style={{ fontSize: 13, color: G.text, lineHeight: 1.4 }}>
            {log.logDetail}
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const UploadSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const { Spin } = useUILibrary();
  const { locationOptions, isLoading: lookupsLoading } = useLookups({
    only: ["locationOptions"],
  });

  const { data: user } = useGetCurrentUserQuery();
  const { data: profile, isLoading: isProfileLoading } = useGetGlobalUserQuery(
    user?.id ?? "",
    { skip: !user?.id },
  );

  const {
    upload,
    isUploading,
    errorLogs,
    successMessage,
    reset: resetUpload,
  } = useRosterBulkUpload();

  // Lazy query — only fires when user clicks Download Template
  const [fetchTemplate, { isFetching: templateLoading }] =
    useLazyGetSchedulerTemplateQuery();

  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const [locCode, setLocCode] = useState<number | null>(null);
  const [locError, setLocError] = useState("");

  const hasBackendErrors = errorLogs.length > 0;

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileChange(dropped);
  };

  const handleFileChange = (picked: File | null) => {
    setFileError("");
    resetUpload();
    if (!picked) {
      setFile(null);
      return;
    }
    if (!isAllowedFile(picked)) {
      setFileError("Only Excel (.xlsx, .xls) or CSV files are allowed.");
      setFile(null);
      return;
    }
    setFile(picked);
  };

  const loginUser = profile?.empId ?? 0;

  // ── handleDownload — use outer loginUser, guard if not ready ──────────────
  const handleDownload = async () => {
    if (!locCode) {
      setLocError("Please select an office before downloading the template.");
      return;
    }
    if (!loginUser) {
      setLocError("User profile not loaded yet. Please wait and try again.");
      return;
    }

    try {
      const rows = await fetchTemplate({ locCode, loginUser }).unwrap();

      if (!rows || rows.length === 0) {
        setLocError("No employees found for this office.");
        return;
      }

      const ws = XLSX.utils.json_to_sheet(rows, {
        header: [
          "EMPLOYEEID",
          "EMPNAME",
          "FROMDATE",
          "TODATE",
          "SHIFTSTART",
          "SHIFTEND",
          "WEEKOFF1",
          "WEEKOFF2",
          "WEEKOFF3",
        ],
      });
      ws["!cols"] = [
        { wch: 38 },
        { wch: 22 },
        { wch: 14 },
        { wch: 14 },
        { wch: 12 },
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Scheduler");
      XLSX.writeFile(wb, `Scheduler_Template_Loc${locCode}.xlsx`);
    } catch {
      setLocError("Failed to download template. Please try again.");
    }
  };

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    let valid = true;
    if (!locCode) {
      setLocError("Please select an office.");
      valid = false;
    }
    if (!file) {
      setFileError("Please select a file to upload.");
      valid = false;
    }
    if (!valid) return;

    const { ok } = await upload(file!, locCode!);
    if (ok) {
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setFile(null);
    setFileError("");
    setLocCode(null);
    setLocError("");
    resetUpload();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 24px",
          background: G.white,
          borderBottom: `1px solid ${G.border}`,
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: 8,
            border: `1px solid ${G.border}`,
            background: G.white,
            cursor: "pointer",
            color: G.text,
            flexShrink: 0,
          }}
        >
          <BackChevron />
        </button>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: G.lightBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <RosterIcon />
        </div>
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: G.text }}>
            Upload Schedule
          </div>
          <div style={{ fontSize: 11, color: G.muted }}>
            Bulk-import via Excel or CSV
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 32,
            background: G.border,
            marginInline: 6,
            flexShrink: 0,
          }}
        />

        {/* Steps */}
        {[
          {
            step: "1",
            title: "Select Office",
            desc: "Pick an office to load employees.",
          },
          {
            step: "2",
            title: "Download Template",
            desc: "Get pre-filled Excel with employee IDs.",
          },
          {
            step: "3",
            title: "Fill & Upload",
            desc: (
              <>
                Fill{" "}
                <code
                  style={{
                    fontSize: 10,
                    background: "#F3F4F6",
                    padding: "1px 3px",
                    borderRadius: 3,
                  }}
                >
                  SHIFTSTART
                </code>
                ,{" "}
                <code
                  style={{
                    fontSize: 10,
                    background: "#F3F4F6",
                    padding: "1px 3px",
                    borderRadius: 3,
                  }}
                >
                  SHIFTEND
                </code>{" "}
                &{" "}
                <code
                  style={{
                    fontSize: 10,
                    background: "#F3F4F6",
                    padding: "1px 3px",
                    borderRadius: 3,
                  }}
                >
                  WEEKOFF
                </code>
                , then upload.
              </>
            ),
          },
        ].map(({ step, title, desc }, i, arr) => (
          <div
            key={step}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              paddingInline: 12,
              borderRight:
                i < arr.length - 1 ? `1px solid ${G.border}` : "none",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: G.dark,
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {step}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: G.text }}>
                {title}
              </div>
              <div style={{ fontSize: 10, color: G.muted, lineHeight: 1.4 }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "start",
          justifyContent: "center",
          padding: "0 24px 24px",
        }}
      >
        {/* ── How it works ──────────────────────────────────────────── */}

        {/* ── LEFT: Upload panel ─────────────────────────────────── */}
        <div
          style={{
            width: hasBackendErrors ? "50%" : 520,
            background: G.white,
            border: `1px solid ${G.border}`,
            borderRadius: 14,
            padding: "24px 24px 20px",
            flexShrink: 0,
          }}
        >
          {successMessage && (
            <SuccessBanner message={successMessage} onDismiss={resetUpload} />
          )}

          {/* Office Location — required for both download and upload */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 500,
                color: G.muted,
                marginBottom: 6,
              }}
            >
              Office Location <span style={{ color: G.errorRed }}>*</span>
            </label>
            <Select
              value={locCode != null ? String(locCode) : undefined}
              autoSelectFirst
              onChange={(v: string) => {
                setLocCode(Number(v));
                setLocError("");
              }}
              options={locationOptions.map((o) => ({
                ...o,
                value: String(o.value),
              }))}
              placeholder={
                lookupsLoading ? "Loading offices…" : "Select office location"
              }
              loading={lookupsLoading}
              showSearch
              allowClear
              style={{ width: "100%" }}
            />
            {locError && (
              <p style={{ margin: "4px 0 0", fontSize: 12, color: G.errorRed }}>
                {locError}
              </p>
            )}
          </div>

          <button
            onClick={handleDownload}
            disabled={templateLoading || isProfileLoading || !loginUser}
            style={{
              width: "100%",
              padding: "11px 0",
              borderRadius: 10,
              marginTop: 16,
              border: `1.5px solid ${G.border}`,
              background: G.white,
              color: templateLoading ? G.muted : G.dark,
              fontSize: 14,
              fontWeight: 600,
              cursor: templateLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "inherit",
              marginBottom: 10,
              opacity: templateLoading ? 0.7 : 1,
            }}
          >
            {templateLoading ? (
              <span style={{ fontSize: 13, color: G.muted }}>Downloading…</span>
            ) : (
              <>
                <DownloadIcon /> Download Template [Excel] And Fill Shift and
                Weekly Offs.
              </>
            )}
          </button>

          {/* Schedule File */}
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: G.muted,
              marginBottom: 8,
            }}
          >
            Schedule File <span style={{ color: G.errorRed }}>*</span>
          </label>
          <UploadZone
            file={file}
            hasBackendErrors={hasBackendErrors}
            dragging={dragging}
            onFileChange={handleFileChange}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            inputRef={inputRef}
            fileError={fileError}
          />

          {/* Download Template — requires office selection, fetches from API */}

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              style={{
                flex: 1,
                padding: "11px 0",
                borderRadius: 10,
                border: "none",
                background: isUploading ? "#52796F" : G.dark,
                color: G.white,
                fontSize: 14,
                fontWeight: 700,
                cursor: isUploading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontFamily: "inherit",
              }}
            >
              {isUploading ? <Spin size="small" /> : <UploadCloud />}
              {isUploading
                ? "Uploading…"
                : hasBackendErrors
                  ? "Reupload"
                  : "Upload"}
            </button>
            <button
              onClick={handleReset}
              disabled={isUploading}
              style={{
                flex: "0 0 90px",
                padding: "11px 0",
                borderRadius: 10,
                border: `1.5px solid ${G.border}`,
                background: G.white,
                color: G.muted,
                fontSize: 14,
                fontWeight: 600,
                cursor: isUploading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* ── RIGHT: Error Logs ────────────────────────────────────── */}
        {hasBackendErrors && (
          <div
            style={{
              flex: 1,
              background: G.white,
              border: `1px solid ${G.border}`,
              borderRadius: 14,
              padding: "24px 24px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle
                  cx="10"
                  cy="10"
                  r="9"
                  stroke={G.errorRed}
                  strokeWidth="1.5"
                />
                <path
                  d="M10 6v5M10 13.5v.5"
                  stroke={G.errorRed}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <span
                style={{ fontSize: 16, fontWeight: 700, color: G.errorRed }}
              >
                Error Logs
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  padding: "2px 10px",
                  borderRadius: 20,
                  background: G.errorBg,
                  border: `1px solid ${G.errorBorder}`,
                  fontSize: 11,
                  fontWeight: 700,
                  color: G.errorRed,
                }}
              >
                {errorLogs.length} error{errorLogs.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div style={{ maxHeight: 460, overflowY: "auto" }}>
              <ErrorLogTable logs={errorLogs} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadSchedulePage;
