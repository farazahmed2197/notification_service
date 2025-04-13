// src/modules/notification/event-consumer.ts
import { Injectable } from '@nestjs/common';
import { NotificationEvent } from './notification-event.inteface';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationEventConsumer {
  constructor(private readonly notificationService: NotificationService) {}

  async consume(event: NotificationEvent): Promise<void> {
    await this.notificationService.sendNotification({
      to: event.recipientId,
      type: event.type,
      data: event.data,
    });
  }
}
