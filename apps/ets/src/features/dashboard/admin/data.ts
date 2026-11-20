type AlertSeverity = "high" | "medium" | "info" | "low";

type AlertType = "sos" | "noShow" | "documentExpiry" | "safeReach";

interface AlertItem {
    id: string;
    type: AlertType;
    title: string;
    subtitle: string; // e.g. "User ID: YTT816" or "3 Trips"
    time: string; // e.g. "09:25 AM"
    severity: AlertSeverity;
}

export const dummyAlerts: AlertItem[] = [
    {
        id: 'ALT-001',
        type: 'sos',
        title: 'SOS Alert Triggered',
        subtitle: 'User ID: YTT816',
        time: '09:25 AM',
        severity: 'high',
    },
    {
        id: 'ALT-002',
        type: 'noShow',
        title: 'No Show Alert',
        subtitle: 'User ID: EMP1921',
        time: '09:54 AM',
        severity: 'medium',
    },
    {
        id: 'ALT-003',
        type: 'documentExpiry',
        title: 'Vehicle Document Expiry',
        subtitle: 'User ID: MNMN1T224',
        time: '05:34 AM',
        severity: 'info',
    },
    {
        id: 'ALT-004',
        type: 'safeReach',
        title: 'Safe Reach Pending',
        subtitle: '3 Trips',
        time: '09:33 AM',
        severity: 'low',
    },
    {
        id: 'ALT-005',
        type: 'sos',
        title: 'SOS Alert Triggered',
        subtitle: 'User ID: EMP2047',
        time: '08:12 AM',
        severity: 'high',
    },
    {
        id: 'ALT-006',
        type: 'noShow',
        title: 'No Show Alert',
        subtitle: 'User ID: EMP1188',
        time: '07:45 AM',
        severity: 'medium',
    },
    {
        id: 'ALT-007',
        type: 'documentExpiry',
        title: 'Vehicle Document Expiry',
        subtitle: 'Vehicle: DL-1CAB-4521',
        time: 'Yesterday',
        severity: 'info',
    },
    {
        id: 'ALT-008',
        type: 'safeReach',
        title: 'Safe Reach Pending',
        subtitle: '5 Trips',
        time: 'Yesterday',
        severity: 'low',
    },
];

// For the dashboard card, show only the latest few:
export const recentDummyAlerts = dummyAlerts.slice(0, 4);