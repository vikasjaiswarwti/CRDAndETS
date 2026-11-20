import { T } from "./designToken";

function NotificationBell({ count = 0 }: { count?: number }) {
  return (
    <button
      style={{
        position: "relative",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 6,
        borderRadius: T.radiusSm,
        display: "flex",
        alignItems: "center",
        color: T.muted,
      }}
    >
      {/* Bell icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {count > 0 && (
        <span
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: T.danger,
            border: `1.5px solid ${T.panel}`,
          }}
        />
      )}
    </button>
  );
} export default NotificationBell;