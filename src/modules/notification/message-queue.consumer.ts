// src/modules/notification/message-queue.consumer.ts
import { Injectable } from '@nestjs/common';
import { NotificationEvent } from './notification-event.inteface';
import { ApplicationReceivedHandler } from './handlers/application-received.handler';
import { InterviewScheduledHandler } from './handlers/interview-scheduled.handler';
import { OfferExtendedHandler } from './handlers/offer-extended.handler';

@Injectable()
export class MessageQueueConsumer {
  constructor(
    private readonly applicationReceivedHandler: ApplicationReceivedHandler,
    private readonly interviewScheduledHandler: InterviewScheduledHandler,
    private readonly offerExtendedHandler: OfferExtendedHandler,
  ) {}

  async consume(event: NotificationEvent): Promise<void> {
    console.log(`Received event: ${event.type}`);
    switch (event.type) {
      case 'application_received':
        await this.applicationReceivedHandler.handle(event);
        break;
      case 'interview_scheduled':
        await this.interviewScheduledHandler.handle(event);
        break;
      case 'offer_extended':
        await this.offerExtendedHandler.handle(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }
}
