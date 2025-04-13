// src/modules/notification/notification-events.controller.ts
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ApplicationReceivedHandler } from './handlers/application-received.handler';
import { InterviewScheduledHandler } from './handlers/interview-scheduled.handler';
import { OfferExtendedHandler } from './handlers/offer-extended.handler';
import { NotificationEvent } from './notification-event.inteface'; // Assuming this interface defines the payload structure

@Controller() // No path needed for microservice event handlers
export class MessageEventsController {
  constructor(
    // Inject the specific handlers
    private readonly applicationReceivedHandler: ApplicationReceivedHandler,
    private readonly interviewScheduledHandler: InterviewScheduledHandler,
    private readonly offerExtendedHandler: OfferExtendedHandler,
  ) {}

  // Use @EventPattern for events (fire-and-forget)
  // The string 'application_received' MUST match the 'type' field in the event object sent
  @EventPattern('application_received')
  async handleApplicationReceived(@Payload() data: NotificationEvent): Promise<void> {
    console.log('Received application_received event:', data); // Add logging
    try {
      await this.applicationReceivedHandler.handle(data);
    } catch (error) {
      console.error('Error handling application_received:', error);
    }
  }

  @EventPattern('interview_scheduled')
  async handleInterviewScheduled(@Payload() data: NotificationEvent): Promise<void> {
    console.log('Received interview_scheduled event:', data); // Add logging
    try {
      await this.interviewScheduledHandler.handle(data);
    } catch (error) {
      console.error('Error handling interview_scheduled:', error);
    }
  }

  @EventPattern('offer_extended')
  async handleOfferExtended(@Payload() data: NotificationEvent): Promise<void> {
    console.log('Received offer_extended event:', data); // Add logging
    try {
      await this.offerExtendedHandler.handle(data);
    } catch (error) {
      console.error('Error handling offer_extended:', error);
    }
  }

  // Optional: Catch-all for debugging (if using patterns that might not match)
  // @EventPattern(/.*/) // Matches any event pattern - USE WITH CAUTION
  // async handleAllEvents(@Payload() data: any, @Ctx() context: RmqContext): Promise<void> {
  //   const pattern = context.getPattern();
  //   console.log(`Received event with pattern ${pattern}:`, data);
  //   // You might want to manually acknowledge if using noAck: false
  //   // const channel = context.getChannelRef();
  //   // const originalMsg = context.getMessage();
  //   // channel.ack(originalMsg);
  // }
}
