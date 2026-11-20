import CommutrLogo from "./CommutrLogo";
import { T } from "./designToken";
import NotificationBell from "./NotificationBell";
import type { AppHeaderProps } from "./RoutingHeader";
import UserAvatar from "./UserAvatar";

function VendorHeader({
  title = "Route Tracking",
  notificationCount = 0,
  userInitials = "AM",
}: AppHeaderProps) {
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
        <div style={{ display: "flex", alignItems: "center", gap: T.sp12 }}>
          <button
            onClick={() => history.back()}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 6,
              borderRadius: T.radiusSm,
              color: T.muted,
              display: "flex",
              alignItems: "center",
            }}
            title="Go back"
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
          <CommutrLogo />
        </div>
        <div
          style={{
            width: 1,
            height: 18,
            background: "#E5E7EB",
          }}
        />

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
        {/* Notification */}
        <NotificationBell count={notificationCount} />

        {/* User */}
        <UserAvatar initials={userInitials} />
      </div>
    </header>
  );
}
export default VendorHeader;
