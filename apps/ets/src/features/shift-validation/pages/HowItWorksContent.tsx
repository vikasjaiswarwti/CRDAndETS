import { T } from "../constants/Token";

const HowItWorksContent: React.FC = () => (
  <div style={{ maxWidth: 300, fontSize: 13, lineHeight: 1.7 }}>
    <p
      style={{
        margin: "0 0 10px",
        fontWeight: 600,
        color: T.textPrimary,
        fontSize: 13,
      }}
    >
      How Shift Management Works
    </p>
    {[
      {
        step: "1",
        color: T.green900,
        title: "Add Shift Interval",
        desc: "Define time intervals (e.g. 15 min, 30 min) that shifts are slotted into.",
      },
      {
        step: "2",
        color: T.green900,
        title: "Generate Shifts",
        desc: "Select an office and interval — this auto-generates Login & Logout shift windows.",
      },
      {
        step: "3",
        color: T.green900,
        title: "Select & Submit",
        desc: "Check the shifts applicable for the office, then hit Submit.",
      },
      {
        step: "4",
        color: T.green900,
        title: "Map to Employees",
        desc: 'Switch to "Employee & Shift Mapping" tab to assign those shifts to users / departments.',
      },
    ].map(({ step, color, title, desc }) => (
      <div key={step} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: color,
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          {step}
        </span>
        <div>
          <div style={{ fontWeight: 600, color: T.textPrimary }}>{title}</div>
          <div style={{ color: T.textSecondary }}>{desc}</div>
        </div>
      </div>
    ))}
  </div>
);

export default HowItWorksContent;
