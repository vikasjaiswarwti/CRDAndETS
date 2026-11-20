import NotificationBell from "./NotificationBell";
import type { AppHeaderProps } from "./RoutingHeader";
import UserAvatar from "./UserAvatar";

function RouteMakerHeader({
  title = "Route Tracking",
  onBack,
  notificationCount = 0,
  userInitials = "AM",
  dateLabel,
}: AppHeaderProps) {
  const now =
    dateLabel ??
    new Date()
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", "");

  return (
    <header
      style={{
        height: 54,
        background: "#fff",
        borderBottom: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        position: "relative",
        zIndex: 100,
      }}
    >
      {/* ───────── LEFT SECTION ───────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          minWidth: 0,
        }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "#6B7280",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#111827",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </span>

          <div
            style={{
              width: 1,
              height: 18,
              background: "#E5E7EB",
            }}
          />

          <span
            style={{
              fontSize: 12,
              color: "#6B7280",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Trip ID: 110593
          </span>
        </div>
      </div>

      {/* ───────── RIGHT SECTION ───────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        {/* Driver Icon */}
        <button
          style={{
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            color: "#4B5563",
          }}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="7" r="4" />
            <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
          </svg>
        </button>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 18,
            background: "#E5E7EB",
          }}
        />

        {/* Date */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#6B7280",
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>

          <span>{now}</span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 18,
            background: "#E5E7EB",
          }}
        />

        {/* Logout */}
        <button
          style={{
            border: "none",
            background: "transparent",
            color: "#16A34A",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
          }}
        >
          Logout
        </button>

        {/* Notification */}
        <NotificationBell count={notificationCount} />

        {/* User */}
        <UserAvatar initials={userInitials} />
      </div>
    </header>
  );
}
export default RouteMakerHeader;