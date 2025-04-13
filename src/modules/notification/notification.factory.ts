// src/modules/notification/notification.factory.ts
import { Injectable } from '@nestjs/common';
import { ConsoleAdapter } from './adapters/console.adapter';
import { EmailAdapter } from './adapters/email.adapter';

@Injectable()
export class NotificationFactory {
  constructor(
    private readonly consoleAdapter: ConsoleAdapter,
    private readonly emailAdapter: EmailAdapter,
  ) {}

  getAdapter(type: string): ConsoleAdapter | EmailAdapter {
    switch (type) {
      case 'email':
        return this.emailAdapter;
      default:
        return this.consoleAdapter;
    }
  }
}
