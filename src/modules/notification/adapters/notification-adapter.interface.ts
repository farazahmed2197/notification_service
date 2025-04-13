// src/modules/notification/adapters/notification-adapter.interface.ts
import { NotificationEvent } from '../notification-event.inteface';

export interface NotificationAdapter {
  // Get the channel type this adapter represents (e.g., 'email', 'console')
  getChannelType(): string;
  // Send method now takes the full event
  send(event: NotificationEvent): Promise<void>;
}
