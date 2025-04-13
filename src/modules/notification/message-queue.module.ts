// src/modules/notification/message-queue.module.ts
import { Module } from '@nestjs/common';
// Remove MessageQueueConsumer import
// import { MessageQueueConsumer } from './message-queue.consumer';
import { ApplicationReceivedHandler } from './handlers/application-received.handler';
import { InterviewScheduledHandler } from './handlers/interview-scheduled.handler';
import { OfferExtendedHandler } from './handlers/offer-extended.handler';
import { NotificationModule } from './notification.module';
import { MessageEventsController } from './message-events.controller'; // Import the new controller

@Module({
  imports: [
    NotificationModule, // Still needed for NotificationService dependency in handlers
  ],
  controllers: [
    MessageEventsController, // Register the controller
  ],
  providers: [
    // Keep the handlers as providers so the controller can inject them
    ApplicationReceivedHandler,
    InterviewScheduledHandler,
    OfferExtendedHandler,
    // Remove MessageQueueConsumer from providers
    // MessageQueueConsumer,
  ],
})
export class MessageQueueModule {}
