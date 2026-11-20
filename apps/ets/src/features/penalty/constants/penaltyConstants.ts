import type { SelectOption } from "../types/penalty.types";

// Default filter value — "All" statuses
export const DEFAULT_STATUS_FILTER = 1;

export const STATUS_OPTIONS:SelectOption[] = [
    { label: "Pending", value:"0" },
    { label: "Closed", value: "1" },
]