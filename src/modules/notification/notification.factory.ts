// src/modules/notification/notification.factory.ts
import { Injectable } from '@nestjs/common';
import { ConsoleAdapter } from './adapters/console.adapter';
import { EmailAdapter } from './adapters/email.adapter';
import { NotificationAdapter } from './adapters/notification-adapter.interface';
import { NotificationEvent } from './notification-event.inteface';

@Injectable()
export class NotificationFactory {
  // Inject all available adapters
  constructor(
    private readonly consoleAdapter: ConsoleAdapter,
    private readonly emailAdapter: EmailAdapter,
    // Add other adapters here if you create more (e.g., SmsAdapter)
  ) {}

  // Method to get relevant adapters based on the event context (e.g., role)
  getAdaptersForEvent(event: NotificationEvent): NotificationAdapter[] {
    const adapters: NotificationAdapter[] = [];

    // Example Logic: Determine adapters based on recipientRole
    switch (event.recipient_role?.toLowerCase()) {
      case 'candidate':
        adapters.push(this.emailAdapter); // Candidates get emails
        break;
      case 'manager':
        adapters.push(this.consoleAdapter); // Managers get console logs
        adapters.push(this.emailAdapter); // Managers also get emails
        break;
      case 'admin':
         adapters.push(this.consoleAdapter); // Admins only get console logs
         break;
      default:
        // Default or unknown role might get console logs only
        adapters.push(this.consoleAdapter);
        break;
    }

    // Add more complex logic here if needed (e.g., check user preferences from DB)

    return adapters;
  }
}
