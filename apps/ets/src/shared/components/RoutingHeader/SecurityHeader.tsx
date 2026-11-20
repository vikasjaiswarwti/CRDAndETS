import CommutrLogo from "./CommutrLogo";
import PlaySoundSwitch from "./PlaySoundSwitch";
// import { T } from "./designToken";
import type { AppHeaderProps } from "./RoutingHeader";
import LiveButton from "./LiveButton";

function SecurityHeader({
  title = "Security Dashboard",
  //   onBack,
  dateLabel,
  datetime,
  sosLabel = "SOS/Alerts",
  onSosClick,
  showSos = true,

  secondaryActionLabel = "Safe Reach Home",
  onSecondaryActionClick,
  showSecondaryAction = true,
  secondaryActionActive = false,
  sosActive,
  isLive = false,
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
  const showPillGroup = showSos || showSecondaryAction;

  return (
    <header
      style={{
        height: 54,
        background: "#fff",
        borderBottom: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        // justifyContent: "space-between",
        gap: 16,
        padding: "0 20px",
        position: "relative",
        zIndex: 100,
      }}
    >
      {/* ───────── LEFT SECTION ───────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          minWidth: 0,
        }}
      >
        <CommutrLogo />

        {/* Vertical divider */}
        <div style={{ width: 1, height: 20, background: "#E5E7EB" }} />

        {/* Page Title */}
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#111827",
            whiteSpace: "nowrap",
            letterSpacing: "-0.1px",
          }}
        >
          {title}
        </span>
      </div>

      <>
        <span style={{ color: "#D1D5DB" }}>|</span>
        <LiveButton isLive={isLive} />
      </>

      <span style={{ color: "#D1D5DB" }}>|</span>

      {/* ───────── RIGHT SECTION ───────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          // justifyContent: "space-around",
          width: "70%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#374151",
            fontSize: 12,
            fontWeight: 500,
            border: "1px solid #D1D5DB",
            padding: "5px 10px",
            borderRadius: 8,
            whiteSpace: "nowrap",
            background: "#F3F4F6",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ flexShrink: 0 }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{datetime ?? now}</span>
        </div>
        <span style={{ color: "#D1D5DB" }}>|</span>
        {/* SOS / Safe Reach pill group — only renders if at least one button is visible */}
        {showPillGroup && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: "#F3F4F6",
              borderRadius: 999,
              padding: "3px",
            }}
          >
            {showSos && (
              <button
                onClick={onSosClick}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "5px 16px",
                  borderRadius: 999,
                  background: sosActive ? "#3B55FF" : "none",
                  color: sosActive ? "#fff" : "#374151",
                  fontSize: 11,
                  fontWeight: sosActive ? 600 : 500,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.1px",
                  boxShadow: sosActive
                    ? "0 1px 3px rgba(79,70,229,0.3)"
                    : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {sosLabel}
              </button>
            )}

            {showSecondaryAction && (
              <button
                onClick={onSecondaryActionClick}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "5px 14px",
                  borderRadius: 999,
                  background: secondaryActionActive ? "#3B55FF" : "none",
                  color: secondaryActionActive ? "#fff" : "#374151",
                  fontSize: 11,
                  fontWeight: secondaryActionActive ? 600 : 500,
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {secondaryActionLabel}
              </button>
            )}
          </div>
        )}
        <div>
          <PlaySoundSwitch />
        </div>
      </div>
    </header>
  );
}

export default SecurityHeader;
