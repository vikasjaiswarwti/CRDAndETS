import { T } from "./designToken";
import NotificationBell from "./NotificationBell";
import OnGoingTracking from "./OnGoingTracking";
import RouteMakerHeader from "./RouteMaker";
import RouteTracking from "./RouteTracking";
import SecurityHeader from "./SecurityHeader";
import UserAvatar from "./UserAvatar";
import VendorHeader from "./VendorHeader";
// // ─── Types ────────────────────────────────────────────────────────────────────

type HeaderVariant =
  | "default"
  | "route-maker"
  | "route-tracking"
  | "vendor-trip"
  | "security"
  | "ongoing"
  | "multiple-trip";

export interface AppHeaderProps {
  variant?: HeaderVariant;
  /** Page title shown in center (route-maker only) */
  title?: string;
  /** Called when back chevron is clicked (route-maker only) */
  onBack?: () => void;
  /** Notification count badge */
  notificationCount?: number;
  /** User display name / initials */
  userInitials?: string;
  /** User full name for tooltip */
  userName?: string;
  /** Called when Logout is clicked (route-maker only) */
  onLogout?: () => void;
  /** Formatted date string shown in header (route-maker only) */
  dateLabel?: string;
  tripId?: string | number;
  datetime?: string | number;
  tripTypeName?: string;
  tripType?: number;
  officeName?: string;
  isGuard?: boolean;
  // ----------------
  // ── Security variant ────────────────────────────────

  /** Label for the primary SOS button. Defaults to "SOS/Alerts" */
  sosLabel?: string;

  /** Called when SOS/Alerts button is clicked */
  onSosClick?: () => void;

  /** Whether to show the SOS button. Defaults to true */
  showSos?: boolean;

  /** Label for the secondary action button. Defaults to "Safe Reach Home" */
  secondaryActionLabel?: string;

  /** Called when secondary action button (Safe Reach Home) is clicked */
  onSecondaryActionClick?: () => void;

  /** Whether to show the secondary action button. Defaults to true */
  showSecondaryAction?: boolean;

  /** Highlight/active state for secondary action button */
  secondaryActionActive?: boolean;
  sosActive?: boolean;
  isLive?: boolean;
  showLiveButton?:boolean;
}

function DefaultHeader({
  notificationCount = 0,
  userInitials = "AM",
}: AppHeaderProps) {
  return (
    <header
      style={{
        height: T.headerH,
        background: T.panel,
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        paddingInline: T.sp20,
        gap: T.sp16,
        boxShadow: T.shadow,
        zIndex: 100,
      }}
    >
      <div style={{ flex: 1 }} />
      <NotificationBell count={notificationCount} />
      <UserAvatar initials={userInitials} />
    </header>
  );
}

export default function AppHeader({
  variant = "default",
  ...props
}: AppHeaderProps) {
  if (variant === "route-maker") return <RouteMakerHeader {...props} />;
  if (variant === "route-tracking") return <RouteTracking {...props} />;
  if (variant === "vendor-trip") return <VendorHeader {...props} />;
  if (variant === "security") return <SecurityHeader {...props} />;
  if (variant === "ongoing") return <OnGoingTracking {...props} />;

  return <DefaultHeader {...props} />;
}
