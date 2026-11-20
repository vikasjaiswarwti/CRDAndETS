import { useNavigate } from "react-router-dom";
const C = {
  white: "#ffffff",
  pageBg: "#F9FAFB",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  gray100: "#F3F4F6",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray700: "#374151",
  gray900: "#111827",
  green: "#3E9B73",
  greenLight: "#ECFDF5",
  errorRed: "#EF4444",
  errorBg: "#FEF2F2",
};

const ReportNotFound: React.FC<{ reportId: string }> = ({ reportId }) => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        background: C.pageBg,
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center", color: C.gray400 }}>
        <svg
          width="48"
          height="48"
          fill="none"
          viewBox="0 0 24 24"
          stroke={C.border}
          strokeWidth={1.2}
          style={{ marginBottom: 16 }}
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: C.gray700,
            margin: "0 0 4px",
          }}
        >
          Report not found
        </p>
        <p style={{ fontSize: 13, color: C.gray400, margin: "0 0 20px" }}>
          No report matches id "{reportId}".
        </p>
        <button
          onClick={() => navigate("/reports/analytics")}
          style={{
            height: 36,
            padding: "0 20px",
            borderRadius: 999,
            background: C.green,
            color: C.white,
            border: "none",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          ← Back to Reports
        </button>
      </div>
    </div>
  );
};
export default ReportNotFound;
