import React, { useState } from "react";
import {
  // FileText,
  // Truck,
  // MessageSquare,
  // ArrowLeftRight,
  // Users,
  // Car,
  Bus,
  BarChart3,
  UserCheck,
  Download,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import { useUILibrary } from "../../../shared/lib/ui-lib/ui-library-context";
import {
  useDownloadVehicleDeploymentReportMutation,
  useDownloadSummaryReportMutation,
  useDownloadTripSummaryReportMutation,
} from "../services/RouteReportsApi";
import type { DownloadReportsPayload } from "../types/RouteReportType";
import { downloadExcel } from "../utils/excelExport";
// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  payload: DownloadReportsPayload;
  onDownload?: (key: string, format: "PDF" | "XLS") => void;
}

interface CS {
  loading: boolean;
  success: boolean;
  error: string;
}
const INIT: CS = { loading: false, success: false, error: "" };

// ─────────────────────────────────────────────────────────────────────────────
// Download runner (API-backed)
// ─────────────────────────────────────────────────────────────────────────────

async function runDownload(
  set: React.Dispatch<React.SetStateAction<CS>>,
  fn: () => Promise<Record<string, unknown>[]>,
  filename: string,
) {
  set({ loading: true, success: false, error: "" });
  try {
    const data = await fn();
    const cols = data.length
      ? Object.fromEntries(Object.keys(data[0]).map((k) => [k, k]))
      : {};
    downloadExcel(data, cols, filename);
    set({ loading: false, success: true, error: "" });
    setTimeout(() => set(INIT), 3000);
  } catch {
    set({ loading: false, success: false, error: "Failed" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Spinner keyframe (injected once)
// ─────────────────────────────────────────────────────────────────────────────

const SpinStyle = () => (
  <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// Compact format pill  PDF | XLS
// ─────────────────────────────────────────────────────────────────────────────

const FmtPill: React.FC<{
  value: "PDF" | "XLS";
  onChange: (v: "PDF" | "XLS") => void;
}> = ({ value, onChange }) => (
  <div
    style={{
      display: "inline-flex",
      background: "#F1F5F9",
      borderRadius: 5,
      padding: 2,
      gap: 1,
    }}
  >
    {(["PDF", "XLS"] as const).map((f) => (
      <button
        key={f}
        onClick={(e) => {
          e.stopPropagation();
          onChange(f);
        }}
        style={{
          padding: "2px 8px",
          fontSize: 10,
          fontWeight: 700,
          borderRadius: 3,
          border: "none",
          background: value === f ? "#fff" : "transparent",
          color: value === f ? "#0F172A" : "#94A3B8",
          boxShadow: value === f ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
          cursor: "pointer",
          transition: "all 0.12s",
          letterSpacing: "0.03em",
        }}
      >
        {f}
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Compact download button
// ─────────────────────────────────────────────────────────────────────────────

const DlBtn: React.FC<{ s: CS; onClick: () => void }> = ({ s, onClick }) => {
  const [hov, setHov] = useState(false);

  if (s.success)
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 10px",
          borderRadius: 5,
          background: "#DCFCE7",
          color: "#15803D",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        <Check size={11} strokeWidth={2.5} /> Done
      </div>
    );

  if (s.loading)
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 10px",
          borderRadius: 5,
          background: "#F8FAFC",
          color: "#94A3B8",
          fontSize: 11,
          fontWeight: 600,
          border: "1px solid #E5E7EB",
        }}
      >
        <Loader2
          size={11}
          strokeWidth={2.5}
          style={{ animation: "spin 0.8s linear infinite" }}
        />
        Loading
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
        gap: 4,
        padding: "4px 10px",
        borderRadius: 5,
        border: `1px solid ${hov ? "#0F766E" : "#E2E8F0"}`,
        background: hov ? "#0F766E" : "#fff",
        color: hov ? "#fff" : "#334155",
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.14s",
        whiteSpace: "nowrap",
      }}
    >
      <Download size={11} strokeWidth={2.5} />
      Download
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Compact tile card  (3-col grid)
// ─────────────────────────────────────────────────────────────────────────────

const Tile: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  s: CS;
  fmt?: "PDF" | "XLS";
  onFmt?: (v: "PDF" | "XLS") => void;
  onDl: () => void;
  api?: boolean;
}> = ({ icon, title, description, s, fmt, onFmt, onDl }) => {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "12px 13px",
        borderRadius: 10,
        border: `1px solid ${hov ? "#CBD5E1" : "#E5E7EB"}`,
        background: hov ? "#F8FAFC" : "#fff",
        transition: "border-color 0.14s, background 0.14s",
        gap: 8,
        minHeight: 110,
      }}
    >
      {/* Top: icon + title */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 7,
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 650,
                color: "#0F172A",
                lineHeight: 1.3,
              }}
            >
              {title}
            </span>
            {/* {api && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: "#0369A1",
                  background: "#E0F2FE",
                  padding: "1px 5px",
                  borderRadius: 3,
                  textTransform: "uppercase",
                  flexShrink: 0,
                }}
              >
                Live
              </span>
            )} */}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "#94A3B8",
              marginTop: 2,
              lineHeight: 1.3,
            }}
          >
            {description}
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom: format + button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: fmt ? "space-between" : "flex-end",
          gap: 6,
        }}
      >
        {fmt && onFmt && <FmtPill value={fmt} onChange={onFmt} />}
        <DlBtn s={s} onClick={onDl} />
      </div>

      {/* Inline error */}
      {s.error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 10,
            color: "#DC2626",
          }}
        >
          <AlertCircle size={10} /> {s.error}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Section header
// ─────────────────────────────────────────────────────────────────────────────

const Section: React.FC<{ label: string; right?: React.ReactNode }> = ({
  label,
  right,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 8,
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
      {label}
    </span>
    {right}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main modal
// ─────────────────────────────────────────────────────────────────────────────

export const DownloadReportsModal: React.FC<Props> = ({
  open,
  onClose,
  payload,
  // onDownload,
}) => {
  const { Modal } = useUILibrary();

  // const [fmtTrip, setFmtTrip] = useState<"PDF" | "XLS">("PDF");
  // const [fmtVendor, setFmtVendor] = useState<"PDF" | "XLS">("PDF");
  // const [fmtRouting, setFmtRouting] = useState<"PDF" | "XLS">("PDF");

  // const [sTrip, setSTrip] = useState<CS>(INIT);
  // const [sVendor, setSVendor] = useState<CS>(INIT);
  // const [sSms, setSSms] = useState<CS>(INIT);
  // const [sRouting, setSRouting] = useState<CS>(INIT);
  // const [sRoster, setSRoster] = useState<CS>(INIT);
  // const [sUsage, setSUsage] = useState<CS>(INIT);

  const [sDeploy, setSDeploy] = useState<CS>(INIT);

  const [sSumm, setSSumm] = useState<CS>(INIT);
  const [sEmp, setSEmp] = useState<CS>(INIT);

  const [dlDeploy] = useDownloadVehicleDeploymentReportMutation();
  const [dlSummary] = useDownloadSummaryReportMutation();
  const [dlTrip] = useDownloadTripSummaryReportMutation();

  const shiftBody = {
    LocCode: payload.locCode,
    fromDate: payload.date,
    toDate: payload.date,
    tripType: payload.tripType,
    ShiftId: Number(payload.shiftId),
  };

  // const staticDl = (
  //   set: React.Dispatch<React.SetStateAction<CS>>,
  //   key: string,
  //   fmt: "PDF" | "XLS" = "PDF",
  // ) => {
  //   set({ loading: true, success: false, error: "" });
  //   try {
  //     onDownload?.(key, fmt);
  //     set({ loading: false, success: true, error: "" });
  //     setTimeout(() => set(INIT), 3000);
  //   } catch {
  //     set({ loading: false, success: false, error: "Failed" });
  //   }
  // };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
      style={{ top: 40 }}
      title={
        <div>
          <SpinStyle />
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
              <BarChart3 size={18} strokeWidth={1.8} />
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
                Download Reports
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
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* ── Section 1: Tripsheet Downloads ─────────────────────────── */}
        {/* <div>
          
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              marginTop: 10,
            }}
          >
            <Tile
              icon={<FileText size={14} strokeWidth={1.8} />}
              title="Tripsheets"
              description="Driver and route trip sheets"
              s={sTrip}
              fmt={fmtTrip}
              onFmt={setFmtTrip}
              onDl={() => staticDl(setSTrip, "TRIPSHEETS", fmtTrip)}
            />
            <Tile
              icon={<Truck size={14} strokeWidth={1.8} />}
              title="Vendor Tracksheets"
              description="Vendor-wise route tracking"
              s={sVendor}
              fmt={fmtVendor}
              onFmt={setFmtVendor}
              onDl={() => staticDl(setSVendor, "VENDOR_TRACKSHEETS", fmtVendor)}
            />
            <Tile
              icon={<MessageSquare size={14} strokeWidth={1.8} />}
              title="Tripsheet SMS File"
              description="SMS notification data export"
              s={sSms}
              onDl={() => staticDl(setSSms, "TRIPSHEET_SMS")}
            />
          </div>
        </div> */}

        {/* ── Section 2: Operational Reports ─────────────────────────── */}
        <div>
          <Section label="Reports" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              marginTop: 10,
            }}
          >
            {/* <Tile
              icon={<ArrowLeftRight size={14} strokeWidth={1.8} />}
              title="Change In Routing"
              description="Employee routing modifications"
              s={sRouting}
              fmt={fmtRouting}
              onFmt={setFmtRouting}
              onDl={() =>
                staticDl(setSRouting, "CHANGE_IN_ROUTING", fmtRouting)
              }
            />
            <Tile
              icon={<Users size={14} strokeWidth={1.8} />}
              title="Consolidated Roster"
              description="Full shift employee roster"
              s={sRoster}
              onDl={() => staticDl(setSRoster, "CONSOLIDATED_ROSTER")}
            />
            <Tile
              icon={<Car size={14} strokeWidth={1.8} />}
              title="Vehicle Usage"
              description="Vehicle utilisation data"
              s={sUsage}
              onDl={() => staticDl(setSUsage, "VEHICLE_USAGE")}
            /> */}
            <Tile
              icon={<Bus size={14} strokeWidth={1.8} />}
              title="Vehicle Deployment"
              description="Vehicle assignment report"
              s={sDeploy}
              api
              onDl={() =>
                runDownload(
                  setSDeploy,
                  () => dlDeploy(shiftBody).unwrap(),
                  `vehicle-deployment-${payload.date}`,
                )
              }
            />
            <Tile
              icon={<BarChart3 size={14} strokeWidth={1.8} />}
              title="Summary Report"
              description="Operational summary metrics"
              s={sSumm}
              api
              onDl={() =>
                runDownload(
                  setSSumm,
                  () =>
                    dlSummary({
                      LocCode: payload.locCode,
                      fromDate: payload.date,
                      toDate: payload.date,
                      tripType: payload.tripType,
                    }).unwrap(),
                  `summary-report-${payload.date}`,
                )
              }
            />
            <Tile
              icon={<UserCheck size={14} strokeWidth={1.8} />}
              title="Employee Trip Report"
              description="Employee-wise trip data"
              s={sEmp}
              api
              onDl={() =>
                runDownload(
                  setSEmp,
                  () =>
                    dlTrip({
                      LocCode: payload.locCode,
                      fromDate: payload.date,
                      toDate: payload.date,
                    }).unwrap(),
                  `employee-trip-report-${payload.date}`,
                )
              }
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
