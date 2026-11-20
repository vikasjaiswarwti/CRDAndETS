export const ACTION_TYPE_MAP = {
  APPROVE: { label: 'Approved', color: 'green' },
  REJECT:  { label: 'Rejected', color: 'red'   },
  PENDING: { label: 'Pending',  color: 'orange' },
} as const;

export const ACTION_TYPE_OPTIONS = [
  { value: 'APPROVE', label: 'Approved' },
  { value: 'REJECT',  label: 'Rejected' },
  { value: 'PENDING', label: 'Pending'  },
] as const;

export const ACTION_TYPE_LABEL_MAP = Object.fromEntries(
  ACTION_TYPE_OPTIONS.map((o) => [o.value, o.label])
) as Record<string, string>;