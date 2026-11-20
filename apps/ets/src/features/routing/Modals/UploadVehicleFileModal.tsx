import React, { useState, useRef, useCallback } from "react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import {
  useExportTripsMutation,
  useUploadTripAssignmentsMutation,
  downloadBlob,
} from "../services/RouteManagementApi";

import { FolderOpen } from "lucide-react";

interface UploadVehicleFilePayload {
  locCode: number;
  shiftId: number;
  tripType: number;
  routeDate: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  payload: UploadVehicleFilePayload;
  onValidate?: (file: File) => Promise<void>;
  isSubmitting?: boolean;
}

const G = "#0F766E";

export const UploadVehicleFileModal: React.FC<Props> = ({
  open,
  onClose,
  payload,
}) => {
  const { Modal, Button } = useUILibrary();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setDragging] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploadIssue, setUploadIssue] = useState<{ message: string } | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const [exportTrips, { isLoading: exporting }] = useExportTripsMutation();
  const [uploadAssignments, { isLoading: uploading }] =
    useUploadTripAssignmentsMutation();

  const pickFile = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx" && ext !== "csv") {
      setError("Only .xlsx or .csv files are accepted.");
      return;
    }
    setError("");
    setUploadIssue(null);
    setFile(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  }, []);

  const handleDownload = async () => {
    setError("");
    try {
      await exportTrips(payload).unwrap();
    } catch {
      setError("Failed to download template. Please try again.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    setError("");
    setSuccess("");
    setUploadIssue(null);
    try {
      const res = await uploadAssignments({ ...payload, file }).unwrap();
      // No isSuccess flag from the backend — an error-report blob means it
      // failed, anything else means the trips were assigned.
      if (res.errorReport) {
        downloadBlob(
          res.errorReport,
          `upload-errors-shift-${payload.shiftId}-${payload.routeDate}.xlsx`,
        );
        setUploadIssue({ message: res.message || "Upload failed." });
      } else {
        setSuccess(res.message || "File uploaded successfully.");
        setTimeout(() => {
          setFile(null);
          setSuccess("");
          onClose();
        }, 1500);
      }
    } catch (e: any) {
      setError(e?.data?.message || "Upload failed. Please try again.");
    }
  };

  const handleClose = () => {
    setFile(null);
    setError("");
    setSuccess("");
    setUploadIssue(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={540}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "#ECFDF5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            <FolderOpen size={20} strokeWidth={1.8} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
              Upload Vendor/Vehicle Assignments
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 400 }}>
              Shift #{payload.shiftId} ·{" "}
              {payload.tripType === 1 ? "Login" : "Logout"} ·{" "}
              {payload.routeDate}
            </div>
          </div>
        </div>
      }
      destroyOnClose
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          padding: "4px 0 8px",
        }}
      >
        {/* Step indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            marginBottom: 4,
          }}
        >
          {[
            { n: "1", label: "Download Template" },
            { n: "2", label: "Upload Filled File" },
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: G,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {s.n}
                </div>
                <span
                  style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
                >
                  {s.label}
                </span>
              </div>
              {i === 0 && (
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: "#D1FAE5",
                    margin: "0 10px",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1 */}
        <div
          style={{
            border: "1px solid #D1FAE5",
            borderRadius: 8,
            padding: "14px 16px",
            background: "#F0FDF4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#166534" }}>
              Step 1 — Download Template
            </div>
            <div style={{ fontSize: 12, color: "#4B7A5A", marginTop: 3 }}>
              Fill in <strong>Vehicle ID</strong>, <strong>Vendor ID</strong>{" "}
              and <strong>Driver ID</strong> per trip row.
            </div>
          </div>
          <Button
            type="primary"
            loading={exporting}
            onClick={handleDownload}
            style={{
              background: G,
              borderColor: G,
              fontSize: 12,
              whiteSpace: "nowrap",
            }}
          >
            ⬇ Download
          </Button>
        </div>

        {/* Step 2 — drag drop */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? G : "#6EE7B7"}`,
            borderRadius: 8,
            background: isDragging ? "#F0FDF4" : "#FAFAFA",
            padding: "28px 16px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.csv"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickFile(f);
            }}
          />
          <div style={{ fontSize: 26, marginBottom: 8 }}>☁️</div>
          {file ? (
            <>
              <div style={{ fontWeight: 600, color: G, fontSize: 14 }}>
                {file.name}
              </div>
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 3 }}>
                {(file.size / 1024).toFixed(1)} KB · click to change
              </div>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>
                Step 2 — Drop your filled file here
              </div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 3 }}>
                .xlsx or .csv · click to browse
              </div>
            </>
          )}
        </div>

        {uploadIssue && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 8,
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 700,
                color: "#B91C1C",
                marginBottom: 8,
              }}
            >
              ⚠ {uploadIssue.message}
            </div>
            <div style={{ fontSize: 12, color: "#7F1D1D", lineHeight: 1.6 }}>
              A file with just the rows that had a problem has been
              downloaded — the <strong>right-most column</strong> explains
              the issue for each row.
              <br />
              It's a reference only and doesn't include your correct rows, so{" "}
              <strong>don't upload it back</strong>. Fix those rows in your
              original file instead, then upload that corrected file again.
            </div>
          </div>
        )}
        {error && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: 6,
              padding: "10px 14px",
              color: "#B91C1C",
              fontSize: 13,
            }}
          >
            ⚠ {error}
          </div>
        )}
        {success && (
          <div
            style={{
              background: "#F0FDF4",
              border: "1px solid #86EFAC",
              borderRadius: 6,
              padding: "10px 14px",
              color: G,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ✓ {success}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            paddingTop: 12,
            borderTop: "1px solid #F1F5F9",
            marginTop: 4,
          }}
        >
          <Button onClick={handleClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            type="primary"
            loading={uploading}
            disabled={!file}
            onClick={handleUpload}
            style={{ background: G, borderColor: G, opacity: !file ? 0.5 : 1 }}
          >
            Upload File
          </Button>
        </div>
      </div>
    </Modal>
  );
};
