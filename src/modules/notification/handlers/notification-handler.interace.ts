// src/modules/notification/handlers/notification-handler.interface.ts
import { NotificationEvent } from '../notification-event.inteface';

export interface NotificationHandler<T extends NotificationEvent> {
  handle(event: T): Promise<void>;
}
