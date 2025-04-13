// src/modules/notification/message-queue.module.ts
import { Module } from '@nestjs/common';
import { NotificationModule } from './notification.module';
import { NotificationEventsController } from './notification-events.controller';
// import { MessageEventsController } from './message-events.controller';
// Remove handler imports if they are not directly injected anywhere in this module
import { ApplicationReceivedHandler } from './handlers/application-received.handler';
import { InterviewScheduledHandler } from './handlers/interview-scheduled.handler';
import { OfferExtendedHandler } from './handlers/offer-extended.handler';

@Module({
  imports: [
    NotificationModule, // Needed for NotificationService
  ],
  controllers: [
    NotificationEventsController,
    // MessageEventsController
  ],
  providers: [
    // Remove handlers if NotificationService is solely responsible now
    // ApplicationReceivedHandler,
    // InterviewScheduledHandler,
    // OfferExtendedHandler,
  ],
})
export class MessageQueueModule {}
