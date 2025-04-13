// src/modules/notification/adapters/console.adapter.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConsoleAdapter {
  async send(notification: { 
    to: string; 
    type: string; 
    data: Record<string, any> 
  }): Promise<void> {
    console.log(`Notification to ${notification.to} of type ${notification.type}:`, notification.data);
  }
}
