// src/modules/notification/repositories/notification.repository.ts
import { Injectable } from '@nestjs/common'; // Import Injectable
import { InjectRepository } from '@nestjs/typeorm'; // Import InjectRepository
import { DeleteResult, FindOneOptions, Repository } from 'typeorm';
import { NotificationHistory } from '../entities/notification-history.entity';

@Injectable() // Add Injectable decorator
export class NotificationRepository {
  constructor(
    // Inject the standard TypeORM repository for NotificationHistory
    @InjectRepository(NotificationHistory)
    private readonly historyRepository: Repository<NotificationHistory>,
  ) {}

  // Use the injected repository for operations
  create(
    entityLike: Partial<NotificationHistory>,
  ): NotificationHistory {
    return this.historyRepository.create(entityLike);
  }

  async saveNotification(
    notification: NotificationHistory,
  ): Promise<NotificationHistory> {
    console.log(`Going to save notification in DB: `, JSON.stringify(notification))

    return this.historyRepository.save(notification);
  }

  async markAsSent(id: number): Promise<void> {
    await this.historyRepository.update(id, { status: 'sent' });
  }

  async markAsFailed(id: number, reason: string): Promise<void> {
    const notification = await this.historyRepository.findOne({ where: { id } }); // Use findOne with options
    if (!notification) {
      // Consider throwing a NotFoundException from @nestjs/common
      throw new Error(`Notification with ID ${id} not found`);
    }

    const updatedData = {
      ...(notification.data || {}), // Handle case where data might be null/undefined initially
      failureReason: reason,
    };

    await this.historyRepository.update(id, {
      status: 'failed',
      ...updatedData,
    });
  }

  async getNotificationHistory(
    page: number = 1,
    limit: number = 10,
  ): Promise<[NotificationHistory[], number]> {
    const query = this.historyRepository
      .createQueryBuilder('notification')
      .orderBy('notification.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return query.getManyAndCount();
  }

  /**
   * Finds first entity that matches given options.
   */
  async findOne(options: FindOneOptions<NotificationHistory>): Promise<NotificationHistory | null> {
    return this.historyRepository.findOne(options);
  }

  /**
   * Deletes entities by a given criteria.
   * Returns promise indicating if entity was found and deleted.
   */
  async delete(criteria: number | number[] | string | string[]): Promise<DeleteResult> {
    // TypeORM's delete accepts various criteria, including just the ID(s)
    return this.historyRepository.delete(criteria);
  }
}
