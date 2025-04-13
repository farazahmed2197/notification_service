// src/events/notification-event.interface.ts
export interface NotificationEvent {
  type: string;
  recipient_id: string;
  recipient_role: string;
  data: Record<string, any>;
}
