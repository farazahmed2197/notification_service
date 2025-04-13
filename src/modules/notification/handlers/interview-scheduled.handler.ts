// src/modules/notification/handlers/interview-scheduled.handler.ts
import { Injectable } from '@nestjs/common';
import { NotificationEvent } from '../notification-event.inteface';
import { NotificationService } from '../notification.service';
import { NotificationHandler } from './notification-handler.interace';

@Injectable()
export class InterviewScheduledHandler implements NotificationHandler<NotificationEvent> {
  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: NotificationEvent): Promise<void> {
    await this.notificationService.sendNotification({
      to: event.recipientId,
      type: 'interview_scheduled',
      data: event.data,
    });
  }
}
