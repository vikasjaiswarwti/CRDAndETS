// ─── SOS Escalation Hierarchy ─────────────────────────────────────────────────
export interface SosEscalation {
  id: string;
  locCode: number;
  orderNo: number;
  recipientName: string;
  recipientMobile: string;
  isActive: boolean;
}

export type CreateSosEscalationDto = Omit<SosEscalation, "id">;

export interface UpdateSosEscalationDto extends CreateSosEscalationDto {
  id: string;
}

// ─── Event Notification Config (AddressChangeNotificationConfig table) ────────
export interface EventNotification {
  id: string;
  // At least one of email / mobile is required.
  email: string | null;
  mobile: string | null;
  eventKey: string;
  active: boolean;
}

export type CreateEventNotificationDto = Omit<EventNotification, "id">;

export interface UpdateEventNotificationDto extends CreateEventNotificationDto {
  id: string;
}

export type NotificationManagementTab = "sos" | "event";

export type StatusFilter = "all" | "active" | "inactive";
