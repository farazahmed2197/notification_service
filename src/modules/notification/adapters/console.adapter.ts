// src/modules/notification/adapters/console.adapter.ts
import { Injectable, Logger } from '@nestjs/common';
import { NotificationAdapter } from './notification-adapter.interface';
import { NotificationEvent } from '../notification-event.inteface';

@Injectable()
export class ConsoleAdapter implements NotificationAdapter {
  private readonly logger = new Logger(ConsoleAdapter.name);

  getChannelType(): string {
    return 'console';
  }

  async send(event: NotificationEvent): Promise<void> {
    this.logger.log(
      `[CONSOLE NOTIFICATION] To: ${event.recipient_id} | Role: ${event.recipient_role} | Event Type: ${event.type} | Data: ${JSON.stringify(event.data)}`
    );
    // Simulate async operation if needed
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
