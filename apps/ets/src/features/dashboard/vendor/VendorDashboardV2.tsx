import React, {
  // useState,
  useEffect,
  useRef,
} from "react";
// import { T } from "../../../styles/tokens";
import {
  IconCancelAction,
  IconCheckIn,
  IconNoShow,
  IconRoasterUser,
  IconRoute,
  IconClock,
} from "../../../assets/dashboard/index";
import QuickAction from "./component/QuickAction";
import {
  useGetAllAddressChangesQuery,
  useGetDriverStagesQuery,
  useGetAllStageVehicleQuery,
  useGetUserStagesQuery,
} from "./services/vendorDashboardApi";

interface StatCardProps {
  icon: string | React.ReactElement;
  label: string;
  value: string;
}

// interface FilterSelectProps {
//   label: string;
//   value: string;
//   options: string[];
//   onChange: (v: string) => void;
// }

interface ChartDataset {
  label: string;
  data: number[];
  color: string;
  dashed?: boolean;
}

interface LineChartProps {
  title: string;
  subtitle: string;
  datasets: ChartDataset[];
  labels: string[];
}

interface ExportButtonProps {
  onClick?: () => void;
}

// ─── Tokens ──────────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#1A2E1A",
  accent: "#2E7D32",
  accentHover: "#1B5E20",
  yellow: "#F5C842",
  border: "#E4E7E4",
  bg: "#FFFFFF",
  surface: "#F8FAF8",
  textPrimary: "#111A11",
  textSecondary: "#5A6B5A",
  textMuted: "#8A9A8A",
  green: "#2E7D32",
  greenLight: "#81C784",
  amber: "#F9A825",
  navy: "#1A237E",
  navyLight: "#90A4AE",
};

// ─── Gradient configs per card ────────────────────────────────────────────────
const CARD_GRADIENTS: Record<string, string> = {
  "Trip Count": "linear-gradient(135deg, #29b6f6 0%, #0288d1 100%)",
  "Check In": "linear-gradient(135deg, #66bb6a 0%, #2e7d32 100%)",
  "No Show": "linear-gradient(135deg, #ef5350 0%, #b71c1c 100%)",
  "Rostered User": "linear-gradient(135deg, #ffa726 0%, #e65100 100%)",
  OTA: "linear-gradient(135deg, #ab47bc 0%, #6a1b9a 100%)",
  Cancellation: "linear-gradient(135deg, #ef5350 0%, #c62828 100%)",
};
const IconProps = {
  width: 20,
  height: 20,
  pathColor: "#fff",
};
// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function VendorDashboardV2() {
  const stats: StatCardProps[] = [
    { icon: <IconRoute {...IconProps} />, label: "Trip Count", value: "804" },
    { icon: <IconCheckIn {...IconProps} />, label: "Check In", value: "95%" },
    { icon: <IconNoShow {...IconProps} />, label: "No Show", value: "1%" },
    {
      icon: <IconRoasterUser {...IconProps} />,
      label: "Rostered User",
      value: "26,387",
    },
    { icon: <IconClock {...IconProps} />, label: "OTA", value: "95%" },
    {
      icon: <IconCancelAction {...IconProps} />,
      label: "Cancellation",
      value: "1%",
    },
  ];
  const { data: addressChanges, isLoading: addressLoading } =
    useGetAllAddressChangesQuery();

  const { data: driverStages, isLoading: driverLoading } =
    useGetDriverStagesQuery();

  const { data: vehicleStages, isLoading: vehicleLoading } =
    useGetAllStageVehicleQuery();

  const { data: userStages, isLoading: userLoading } = useGetUserStagesQuery();

  const isLoading =
    addressLoading || driverLoading || vehicleLoading || userLoading;

  console.log(isLoading, "isLoading");
  //   if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  const tripLabels = ["MAR 03", "MAR 10", "MAR 17", "MAR 24", "APR 02"];

  const tripDatasets: ChartDataset[] = [
    {
      label: "Login",
      data: [38, 52, 45, 70, 55],
      color: "#2E7D32",
    },
    {
      label: "Logout",
      data: [25, 35, 52, 58, 42],
      color: "#F5C842",
    },
  ];

  const TotalCountObj = {
    addressCount: addressChanges?.totalCount ?? 0,
    driverCount: driverStages?.totalCount ?? 0,
    vehicleCount: vehicleStages?.totalCount ?? 0,
    userCount: userStages?.totalCount ?? 0,
  };
  return (
    <div
      style={{
        // background: "#fff",
        minHeight: "100vh",
        borderRadius: 12,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      {/* <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: COLORS.textPrimary,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Transport Dashboard
        </h1>
      </div> */}

      {/* Stats Grid */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 16,
          marginBottom: 16,
          alignItems: "start",
        }}
      >
        <LineChart
          title="Trip Summary"
          subtitle="Login and Logout volumes"
          datasets={tripDatasets}
          labels={tripLabels}
        />
        <QuickAction data={TotalCountObj} />
      </div>
    </div>
  );
}
// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div
      style={{
        background: CARD_GRADIENTS[label] ?? CARD_GRADIENTS["Trip Count"],
        borderRadius: 16,
        padding: "14px 14px 16px",
        display: "flex",
        flexDirection: "column",
        flex: "1 1 0",
        minWidth: 110,
        minHeight: 110,
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
    >
      {/* decorative circle */}
      <span
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          pointerEvents: "none",
        }}
      />

      {/* icon */}
      <span
        style={{
          fontSize: 14,
          color: "rgba(255,255,255,0.9)",
          marginBottom: 14,
          lineHeight: 1,
        }}
      >
        {icon}
      </span>

      {/* label */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.75)",
          marginBottom: 5,
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>

      {/* value */}
      <span
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: "#ffffff",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </span>
    </div>
  );
}
// ─── ExportButton ─────────────────────────────────────────────────────────────
function ExportButton({ onClick }: ExportButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 12px",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 7,
        background: COLORS.bg,
        fontSize: 12,
        fontWeight: 500,
        color: COLORS.textSecondary,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      Export
    </button>
  );
}

// ─── LineChart (Canvas) ────────────────────────────────────────────────────────
function LineChart({ title, subtitle, datasets, labels }: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const padL = 8,
      padR = 16,
      padT = 12,
      padB = 36;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    const gridCount = 4;
    ctx.strokeStyle = "#EEF1EE";
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridCount; i++) {
      const y = padT + (chartH / gridCount) * i;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
    }

    // X labels
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = "10px 'DM Mono', monospace";
    ctx.textAlign = "center";
    labels.forEach((lbl, i) => {
      const x = padL + (i / (labels.length - 1)) * chartW;
      ctx.fillText(lbl, x, H - 8);
    });

    // Datasets
    datasets.forEach((ds) => {
      const allVals = datasets.flatMap((d) => d.data);
      const maxVal = Math.max(...allVals) * 1.15;
      const minVal = Math.min(...allVals) * 0.85;
      const range = maxVal - minVal;

      const points = ds.data.map((v, i) => ({
        x: padL + (i / (ds.data.length - 1)) * chartW,
        y: padT + chartH - ((v - minVal) / range) * chartH,
      }));

      // Fill
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const mx = (points[i].x + points[i + 1].x) / 2;
        const my = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
      }
      ctx.quadraticCurveTo(
        points[points.length - 2].x,
        points[points.length - 2].y,
        points[points.length - 1].x,
        points[points.length - 1].y,
      );
      ctx.lineTo(points[points.length - 1].x, padT + chartH);
      ctx.lineTo(points[0].x, padT + chartH);
      ctx.closePath();
      ctx.fillStyle = ds.color + "1A";
      ctx.fill();

      // Line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const mx = (points[i].x + points[i + 1].x) / 2;
        const my = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
      }
      ctx.quadraticCurveTo(
        points[points.length - 2].x,
        points[points.length - 2].y,
        points[points.length - 1].x,
        points[points.length - 1].y,
      );

      if (ds.dashed) {
        ctx.setLineDash([5, 4]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.strokeStyle = ds.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }, [datasets, labels]);

  return (
    <div
      style={{
        background: COLORS.bg,
        // border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        padding: "20px 20px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        flex: "1 1 320px",
        minWidth: 0,
        border: "1px solid #E8F5EE",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{ fontSize: 14, fontWeight: 600, color: COLORS.textPrimary }}
          >
            {title}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
            {subtitle}
          </div>
        </div>
        <ExportButton />
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {datasets.map((ds) => (
          <span
            key={ds.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: COLORS.textSecondary,
              fontWeight: 500,
            }}
          >
            <span
              style={{
                width: ds.dashed ? 18 : 10,
                height: ds.dashed ? 2 : 10,
                borderRadius: ds.dashed ? 0 : "50%",
                background: ds.color,
                flexShrink: 0,
                ...(ds.dashed
                  ? {
                      backgroundImage: `repeating-linear-gradient(90deg, ${ds.color} 0 4px, transparent 4px 7px)`,
                      background: "none",
                      height: 2,
                    }
                  : {}),
              }}
            />
            {ds.label.toUpperCase()}
          </span>
        ))}
      </div>

      {/* Chart Controls */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        {["⊕", "⊖", "↺"].map((icon, i) => (
          <button
            key={i}
            style={{
              width: 28,
              height: 28,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              background: COLORS.bg,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: COLORS.textSecondary,
              fontFamily: "inherit",
            }}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div style={{ position: "relative", height: 240, width: "100%" }}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block" }}
          role="img"
          aria-label={`${title} line chart`}
        />
      </div>
    </div>
  );
}
