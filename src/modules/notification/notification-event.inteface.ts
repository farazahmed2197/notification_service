// src/modules/notification/notification-event.interface.ts
export interface NotificationEvent {
  recipientId: string;
  recipientRole: string;
  type: string;
  data: Record<string, any>;
}