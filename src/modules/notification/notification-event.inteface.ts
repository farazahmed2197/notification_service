// src/modules/notification/notification-event.interface.ts
export interface NotificationEvent {
  recipient_id: string;
  recipient_role: string;
  type: string;
  data: Record<string, any>;
  to?: string
}