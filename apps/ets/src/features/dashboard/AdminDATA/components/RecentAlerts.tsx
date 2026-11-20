import React from "react";

// ---------- Types ----------

export type AlertSeverity = "high" | "medium" | "info" | "low";

export type AlertType = "sos" | "noShow" | "documentExpiry" | "safeReach";

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  subtitle: string; // e.g. "User ID: YTT816" or "3 Trips"
  time: string; // e.g. "09:25 AM"
  severity: AlertSeverity;
}

interface RecentAlertsProps {
  alerts: AlertItem[];
  onViewAll?: () => void;
  onAlertClick?: (alert: AlertItem) => void;
}

// ---------- Severity config ----------

const severityConfig: Record<
  AlertSeverity,
  { label: string; color: string; bg: string }
> = {
  high: { label: "High", color: "#e5484d", bg: "#fdecec" },
  medium: { label: "Medium", color: "#d9822b", bg: "#fdf3e3" },
  info: { label: "Info", color: "#3b82f6", bg: "#e9f1fe" },
  low: { label: "Low", color: "#16a08a", bg: "#e4f6f2" },
};

// ---------- Icon config ----------

const iconConfig: Record<
  AlertType,
  { color: string; bg: string; svg: React.ReactNode }
> = {
  sos: {
    color: "#e5484d",
    bg: "#fdecec",
    svg: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  noShow: {
    color: "#d9822b",
    bg: "#fdf3e3",
    svg: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="17" y1="8" x2="22" y2="13" />
        <line x1="22" y1="8" x2="17" y2="13" />
      </svg>
    ),
  },
  documentExpiry: {
    color: "#3b82f6",
    bg: "#e9f1fe",
    svg: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  safeReach: {
    color: "#16a08a",
    bg: "#e4f6f2",
    svg: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
};

// ---------- Styles ----------

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: "16px",
    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.08)",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1f2937",
    margin: 0,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: 600,
    color: "#16a08a",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px",
    borderRadius: 10,
    border: "1px solid #eef0f3",
    background: "#ffffff",
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  iconWrap: {
    width: 36,
    height: 36,
    minWidth: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1f2937",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  itemMeta: {
    fontSize: 12,
    color: "#8a94a6",
    marginTop: 2,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: "50%",
    background: "#c3c9d3",
    display: "inline-block",
  },
  badge: {
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: 999,
    whiteSpace: "nowrap",
  },
  empty: {
    textAlign: "center",
    color: "#8a94a6",
    fontSize: 13,
    padding: "24px 0",
  },
};

// ---------- Component ----------

const RecentAlerts: React.FC<RecentAlertsProps> = ({
  alerts,
  onViewAll,
  onAlertClick,
}) => {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Recent Alerts</h3>
        <button type="button" style={styles.viewAll} onClick={onViewAll}>
          View All
        </button>
      </div>

      <div style={styles.list}>
        {alerts.length === 0 ? (
          <div style={styles.empty}>No recent alerts</div>
        ) : (
          alerts.map((alert) => {
            const icon = iconConfig[alert.type];
            const severity = severityConfig[alert.severity];
            return (
              <div
                key={alert.id}
                style={styles.item}
                onClick={() => onAlertClick?.(alert)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#ffffff")
                }
              >
                <div
                  style={{
                    ...styles.iconWrap,
                    background: icon.bg,
                    color: icon.color,
                  }}
                >
                  {icon.svg}
                </div>
                <div style={styles.body}>
                  <p style={styles.itemTitle}>{alert.title}</p>
                  <div style={styles.itemMeta}>
                    <span>{alert.subtitle}</span>
                    <span style={styles.dot} />
                    <span>{alert.time}</span>
                  </div>
                </div>
                <span
                  style={{
                    ...styles.badge,
                    color: severity.color,
                    background: severity.bg,
                  }}
                >
                  {severity.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentAlerts;

// ---------- Example usage ----------
//
// const sampleAlerts: AlertItem[] = [
//   { id: '1', type: 'sos',            title: 'SOS Alert Triggered',     subtitle: 'User ID: YTT816',   time: '09:25 AM', severity: 'high' },
//   { id: '2', type: 'noShow',         title: 'No Show Alert',           subtitle: 'User ID: EMP1921',  time: '09:54 AM', severity: 'medium' },
//   { id: '3', type: 'documentExpiry', title: 'Vehicle Document Expiry', subtitle: 'User ID: MNMN1T224', time: '05:34 AM', severity: 'info' },
//   { id: '4', type: 'safeReach',      title: 'Safe Reach Pending',      subtitle: '3 Trips',           time: '09:33 AM', severity: 'low' },
// ];
//
// <RecentAlerts
//   alerts={sampleAlerts}
//   onViewAll={() => navigate('/alerts')}
//   onAlertClick={(a) => console.log('clicked', a)}
// />
