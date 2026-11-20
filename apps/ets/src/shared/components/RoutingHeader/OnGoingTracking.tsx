import { useIsMobile } from "../../customHooks/useIsMobile";
import CommutrLogo from "./CommutrLogo";
import { T } from "./designToken";
import LiveButton from "./LiveButton";
import NotificationButton from "./NotificationButton";
import PlaySoundSwitch from "./PlaySoundSwitch";
import type { AppHeaderProps } from "./RoutingHeader";
import { BankOutlined } from "@ant-design/icons";
// import UserAvatar from "./UserAvatar";

function OnGoingTracking({
  title = "OnGoing Trip",
  onBack,
  // dateLabel,
  //   tripId,
  datetime,
  //   tripTypeName = "Pick Up",
  officeName = "",
  isLive = false,
  showLiveButton = true,
}: AppHeaderProps) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <>
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
          {onBack && (
            <button
              onClick={onBack}
              style={{
                // display:"none",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding:isMobile?2: 6,
                borderRadius: T.radiusSm,
                color: T.muted,
                // display: "flex",
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
          )}
          <CommutrLogo />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <PlaySoundSwitch />
            <NotificationButton />
          </div>
        </header>
      </>
    );
  }
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
          {onBack && (
            <button
              onClick={onBack}
              style={{
                // display:"none",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 6,
                borderRadius: T.radiusSm,
                color: T.muted,
                // display: "flex",
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
          )}
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
              fontSize: 13,
              fontWeight: 600,
              color: "#11182790",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </span>
        </div>
        {showLiveButton && (
          <>
            {/* Divider */}
            <div
              style={{
                width: 1,
                height: 18,
                background: "#E5E7EB",
              }}
            />
            <LiveButton isLive={isLive} />
          </>
        )}

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 18,
            background: "#E5E7EB",
          }}
        />

        {/* Date */}
        {datetime && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#6B7280",
              fontSize: 12,
              fontWeight: 500,
              border: "1px solid #6B7280",
              padding: "4px",
              borderRadius: 6,
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

            <span>{datetime}</span>
          </div>
        )}

        {/* Logout */}
        {officeName && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "5px 12px",
              borderRadius: "8px",
              background: "#DBEAFE",
              border: "1px solid #93C5FD",
              // background: "linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 100%)",
              color: "#1D4ED8",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              // border: "1px solid #BBF7D0",
              backdropFilter: "blur(4px)",
              transition: "all 0.2s ease",
            }}
          >
            <BankOutlined /> {officeName}
          </span>
        )}
      </div>

      {/* ───────── RIGHT SECTION ───────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <PlaySoundSwitch />
        <NotificationButton />
      </div>
    </header>
  );
}
export default OnGoingTracking;
