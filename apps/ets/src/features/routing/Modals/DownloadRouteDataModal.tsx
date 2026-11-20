// src/features/routeManagement/Modals/DownloadRouteDataModal.tsx
import React, { useState } from "react";
import {
  Map,
  BarChart3,
  Bus,
  Download,
  Loader2,
  Check,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import {
  useDownloadVehicleDeploymentReportMutation,
  useDownloadRouteAnalysisReportMutation,
  useDownloadOnTimeArrivalReportMutation,
} from "../services/RouteReportsApi";
import { downloadExcel } from "../utils/excelExport";
import type { DownloadRouteDataPayload } from "../types/RouteReportType";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  payload: DownloadRouteDataPayload;
  // onDownload: (reportKey: string) => void;
}

interface CS {
  loading: boolean;
  success: boolean;
  error: string;
}
const INIT: CS = { loading: false, success: false, error: "" };

// ─────────────────────────────────────────────────────────────────────────────
// Download runner
// ─────────────────────────────────────────────────────────────────────────────

async function runDownload(
  set: React.Dispatch<React.SetStateAction<CS>>,
  fn: () => Promise<Record<string, unknown>[]>,
  filename: string,
): Promise<void> {
  set({ loading: true, success: false, error: "" });
  try {
    const data = await fn();
    const colMap = data.length
      ? Object.fromEntries(Object.keys(data[0]).map((k) => [k, k]))
      : {};
    downloadExcel(data, colMap, filename);
    set({ loading: false, success: true, error: "" });
    setTimeout(() => set(INIT), 3000);
  } catch {
    set({ loading: false, success: false, error: "Download failed." });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Download button  (same design token as DownloadReportsModal)
// ─────────────────────────────────────────────────────────────────────────────

const DlBtn: React.FC<{ s: CS; onClick: () => void }> = ({ s, onClick }) => {
  const [hov, setHov] = useState(false);

  if (s.success)
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "6px 14px",
          borderRadius: 7,
          background: "#DCFCE7",
          color: "#15803D",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        <Check size={13} strokeWidth={2.5} /> Downloaded
      </div>
    );

  if (s.loading)
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 14px",
          borderRadius: 7,
          background: "#F8FAFC",
          color: "#94A3B8",
          fontSize: 12,
          fontWeight: 600,
          border: "1px solid #E5E7EB",
          userSelect: "none",
        }}
      >
        <Loader2
          size={13}
          strokeWidth={2.5}
          style={{ animation: "spin 0.8s linear infinite" }}
        />
        Downloading
      </div>
    );

  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 7,
        border: `1px solid ${hov ? "#0F766E" : "#E2E8F0"}`,
        background: hov ? "#0F766E" : "#fff",
        color: hov ? "#fff" : "#334155",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      <Download size={13} strokeWidth={2.5} />
      Download
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Report row  (icon | title + description | Live badge | button)
// ─────────────────────────────────────────────────────────────────────────────

const ReportRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  s: CS;
  onDl: () => void;
  api?: boolean;
}> = ({ icon, title, description, s, onDl }) => {
  const [hov, setHov] = useState(false);

  return (
    <div>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "13px 14px",
          borderRadius: 10,
          border: `1px solid ${hov ? "#CBD5E1" : "#E5E7EB"}`,
          background: hov ? "#F8FAFC" : "#fff",
          transition: "all 0.14s ease",
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "#F1F5F9",
            border: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#475569",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
              {title}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
            {description}
          </div>
        </div>

        {/* Button */}
        <DlBtn s={s} onClick={onDl} />
      </div>

      {/* Inline error */}
      {s.error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 4,
            paddingLeft: 14,
            fontSize: 11,
            color: "#DC2626",
          }}
        >
          <AlertCircle size={11} /> {s.error}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main modal
// ─────────────────────────────────────────────────────────────────────────────

export const DownloadRouteDataModal: React.FC<Props> = ({
  open,
  onClose,
  payload,
  // onDownload,
}) => {
  const { Modal } = useUILibrary();

  // const [s1, setS1] = useState<CS>(INIT); // Download Routes
  const [s2, setS2] = useState<CS>(INIT); // Route Analysis
  const [s3, setS3] = useState<CS>(INIT); // Vehicle Deployment
  const [s4, setS4] = useState<CS>(INIT);

  const [dlRouteAnalysis] = useDownloadRouteAnalysisReportMutation();
  const [dlVehicleDeployment] = useDownloadVehicleDeploymentReportMutation();
  const [dlOnTimeArrival] = useDownloadOnTimeArrivalReportMutation();

  const sharedBody = {
    LocCode: payload.locCode,
    fromDate: payload.date,
    toDate: payload.date,
    tripType: payload.tripType,
    ShiftId: Number(payload.shiftId),
  };

  // const handleStaticDownload = () => {
  //   setS1({ loading: true, success: false, error: "" });
  //   try {
  //     onDownload("DOWNLOAD_ROUTES");
  //     setS1({ loading: false, success: true, error: "" });
  //     setTimeout(() => setS1(INIT), 3000);
  //   } catch {
  //     setS1({ loading: false, success: false, error: "Download failed." });
  //   }
  // };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={540}
      destroyOnClose
      styles={{
        content: { borderRadius: 16, padding: 0, overflow: "hidden" },
        header: { padding: "20px 24px 0", marginBottom: 0 },
        body: { padding: "16px 24px 24px" },
      }}
      title={
        <div>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#16A34A",
                flexShrink: 0,
              }}
            >
              <Map size={18} strokeWidth={1.8} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#0F172A",
                  letterSpacing: "-0.01em",
                }}
              >
                Route Data
              </div>
              <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                {[
                  payload.date,
                  `Shift ${payload.shiftId}`,
                  payload.tripType === 1 ? "Login" : "Logout",
                ].map((label) => (
                  <span
                    key={label}
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#64748B",
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderRadius: 5,
                      padding: "1px 8px",
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    >
      {/* Section divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 10,
          marginBottom: 10,
          borderBottom: "1px solid #F1F5F9",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#64748B",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          Available Reports
        </span>
        <span style={{ fontSize: 11, color: "#CBD5E1" }}>Excel (.xlsx)</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {/* <ReportRow
          icon={<Map size={16} strokeWidth={1.8} />}
          title="Download Routes"
          description="Export current route assignments"
          s={s1}
          onDl={handleStaticDownload}
        /> */}
        <ReportRow
          icon={<BarChart3 size={16} strokeWidth={1.8} />}
          title="Route Analysis Report"
          description="Detailed route performance analytics"
          s={s2}
          api
          onDl={() =>
            runDownload(
              setS2,
              () => dlRouteAnalysis(sharedBody).unwrap(),
              `route-analysis-${payload.date}`,
            )
          }
        />
        <ReportRow
          icon={<Bus size={16} strokeWidth={1.8} />}
          title="Vehicle Deployment Report"
          description="Vehicle allocation and deployment summary"
          s={s3}
          api
          onDl={() =>
            runDownload(
              setS3,
              () => dlVehicleDeployment(sharedBody).unwrap(),
              `vehicle-deployment-${payload.date}`,
            )
          }
        />

        {payload.tripType === 1 && (
          <ReportRow
            icon={<Clock size={16} strokeWidth={1.8} />}
            title="On Time Arrival Report"
            description="Shift-wise on-time arrival trip details"
            s={s4}
            onDl={() =>
              runDownload(
                setS4,
                () =>
                  dlOnTimeArrival({
                    LocCode: payload.locCode,
                    fromDate: payload.date,
                    toDate: payload.date,
                    ShiftID: Number(payload.shiftId),
                  }).unwrap(),
                `ontime-arrival-${payload.date}`,
              )
            }
          />
        )}
      </div>
    </Modal>
  );
};
