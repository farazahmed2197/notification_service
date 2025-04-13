// src/modules/notification/notification.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationEvent } from './notification-event.inteface';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async sendNotification(@Body() notification: { 
    to: string; 
    type: string; 
    data: Record<string, any> 
  }): Promise<void> {
    await this.notificationService.sendNotification(notification as NotificationEvent);
  }
}
