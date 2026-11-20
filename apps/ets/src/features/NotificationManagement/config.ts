// src/features/NotificationManagement/config.ts

// Backend base routes — change here if the controller paths differ.
export const NOTIFICATION_MANAGEMENT_ENDPOINTS = {
  sosEscalation: "/api/v1/SosEscalationHierarchy",
  eventNotification: "/api/v1/AddressChangeNotificationConfig",
} as const;

// NOTE: backend has no role/permission check on these controllers yet.
export const NOTIFICATION_MANAGEMENT_CONFIG = {
  canCreate: true,
  canUpdate: true,
  canDeactivate: true,
} as const;