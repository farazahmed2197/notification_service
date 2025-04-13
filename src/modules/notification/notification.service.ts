// src/modules/notification/notification.service.ts
import { Injectable } from '@nestjs/common';
import { NotificationFactory } from './notification.factory';
import { NotificationHistory } from './entities/notification-history.entity';
import { NotificationRepository } from './repositories/notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationFactory: NotificationFactory,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async sendNotification(notification: { 
    to: string; 
    type: string; 
    data: Record<string, any> 
  }): Promise<void> {
    const notificationHistory = this.notificationRepository.create({
      type: notification.type,
      recipientId: notification.to,
      recipientRole: 'candidate', // Default role
      data: notification.data,
      status: 'pending',
    });

    await this.notificationRepository.saveNotification(notificationHistory);

    try {
      const adapter = this.notificationFactory.getAdapter(notification.type);
      await adapter.send(notification);

      await this.notificationRepository.markAsSent(notificationHistory.id);
    } catch (error) {
      await this.notificationRepository.markAsFailed(notificationHistory.id, error.message);
      throw error;
    }
  }
}
