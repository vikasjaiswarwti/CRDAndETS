export const TRIP_TYPE_OPTIONS = [
    { value: "1", label: 'Login' },
    { value: "2", label: 'Logout' },
];

export const TRIP_TYPE_LABEL: Record<string, string> = {
    "1": 'Login',
    "2": 'Logout',
};

export const ACTIVE_OPTIONS = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' },
];

export const STATUS_MAP = {
    active: { label: 'Active', color: 'green' },
    inactive: { label: 'Inactive', color: 'red' },
} as const;