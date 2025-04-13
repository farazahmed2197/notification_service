// src/events/notification-event.interface.ts
export interface NotificationEvent {
  type: string;
  recipientId: string;
  recipientRole: string;
  data: Record<string, any>;
}
