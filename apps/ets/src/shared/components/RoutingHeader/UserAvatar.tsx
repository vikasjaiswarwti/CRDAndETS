import { T } from "./designToken";

function UserAvatar({
  initials = "AM",
  onClick,
}: {
  initials?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px 6px",
        borderRadius: T.radiusSm,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "#1D6BF3",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: T.fontSm,
          fontWeight: 700,
        }}
      >
        {initials}
      </div>
      {/* Dropdown chevron */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke={T.muted}
        strokeWidth="2.5"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}
export default UserAvatar;
