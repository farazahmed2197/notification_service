// src/modules/notification/notification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { NotificationFactory } from './notification.factory';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationEvent } from './notification-event.inteface'; // Import the event interface

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly notificationFactory: NotificationFactory,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async sendNotification(event: NotificationEvent): Promise<void> {
    this.logger.log(`Processing event type "${event.type}" for recipient ${event.recipient_id} (Role: ${event.recipient_role})`);

    // 1. Create initial history record
    const notificationHistory = this.notificationRepository.create({
      type: event.type,
      recipient_id: event.recipient_id,
      recipient_role: event.recipient_role || 'unknown',
      data: event.data,
      status: 'pending',
    });

    let savedHistoryId: number;
    try {
      const savedHistory = await this.notificationRepository.saveNotification(notificationHistory);
      savedHistoryId = savedHistory.id;
      this.logger.log(`Notification history created with ID: ${savedHistoryId}`);
    } catch (error) {
       this.logger.error(`Failed to save initial notification history: ${error.message}`, error.stack);
       throw error;
    }

    // 2. Get adapters based on event context (e.g., role)
    // *** FIX: Call the correct factory method ***
    const adapters = this.notificationFactory.getAdaptersForEvent(event);
    // ********************************************
    if (adapters.length === 0) {
        this.logger.warn(`No adapters found for event role "${event.recipient_role}". Marking as failed.`);
        await this.notificationRepository.markAsFailed(savedHistoryId, 'No suitable notification channels found for recipient role.');
        return;
    }

    this.logger.debug(`Found ${adapters.length} adapter(s) for role "${event.recipient_role}": [${adapters.map(a => a.getChannelType()).join(', ')}]`);

    // 3. Attempt to send via all selected adapters
    const errors: { channel: string; message: string }[] = [];
    for (const adapter of adapters) {
      const channelType = adapter.getChannelType();
      try {
        this.logger.log(`Attempting send via adapter: ${channelType} for history ID: ${savedHistoryId}`);
        await adapter.send(event); // Pass the full event
        this.logger.log(`Successfully sent via adapter: ${channelType} for history ID: ${savedHistoryId}`);
      } catch (error) {
        this.logger.error(`Adapter ${channelType} failed for history ID ${savedHistoryId}: ${error.message}`, error.stack);
        errors.push({ channel: channelType, message: error.message });
      }
    }

    // 4. Update final history status based on errors
    if (errors.length === 0) {
      await this.notificationRepository.markAsSent(savedHistoryId);
      this.logger.log(`All adapters succeeded. Marked history ${savedHistoryId} as sent.`);
    } else {
      const failureReason = errors
        .map(e => `Channel '${e.channel}': ${e.message}`)
        .join('; ');
      await this.notificationRepository.markAsFailed(savedHistoryId, failureReason);
      this.logger.warn(`One or more adapters failed. Marked history ${savedHistoryId} as failed. Reason: ${failureReason}`);
      // Optional: throw new Error(...)
    }
  }
}
