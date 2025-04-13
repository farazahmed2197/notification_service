// src/modules/notification/handlers/application-received.handler.ts
import { Injectable } from '@nestjs/common';
import { NotificationEvent } from '../notification-event.inteface';
import { NotificationService } from '../notification.service';
import { NotificationHandler } from './notification-handler.interace';

@Injectable()
export class ApplicationReceivedHandler implements NotificationHandler<NotificationEvent> {
  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: NotificationEvent): Promise<void> {
    await this.notificationService.sendNotification(event);
  }
}
