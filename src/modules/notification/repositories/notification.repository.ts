// src/modules/notification/repositories/notification.repository.ts
import { EntityRepository, Repository } from 'typeorm';
import { NotificationHistory } from '../entities/notification-history.entity';

@EntityRepository(NotificationHistory)
export class NotificationRepository extends Repository<NotificationHistory> {
  async saveNotification(notification: Omit<NotificationHistory, 'id'>): Promise<NotificationHistory> {
    return this.save(notification);
  }

  async markAsSent(id: number): Promise<void> {
    await this.update(id, { status: 'sent' });
  }

  async markAsFailed(id: number, reason: string): Promise<void> {
    const notification = await this.findOne({where : {id}});
    if (!notification) {
      throw new Error('Notification not found');
    }

    const updatedData = {
      ...notification.data,
      failureReason: reason
    };

    await this.update(id, { 
      status: 'failed',
      ...updatedData
    });
  }

  async getNotificationHistory(page: number = 1, limit: number = 10): Promise<[NotificationHistory[], number]> {
    const query = this.createQueryBuilder('notification')
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return query.getManyAndCount();
  }
}
