// src/modules/notification/notification-events.controller.ts
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices'; // Keep imports
import { NotificationEvent } from './notification-event.inteface';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationEventsController {
  private readonly logger = new Logger(NotificationEventsController.name);

  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  // --- Specific Handlers (Keep the ack logic here) ---
  @EventPattern('application_received')
  async handleApplicationReceived(@Payload() event: NotificationEvent, @Ctx() context: RmqContext): Promise<void> {
    const originalMessage = context.getMessage();
    this.logger.log(`>>> Handler 'application_received' INVOKED. Payload: ${JSON.stringify(event)}`);
    this.logger.debug(`Raw message content: ${originalMessage.content.toString()}`);
    try {
      await this.notificationService.sendNotification(event);
    } catch (error) {
      this.logger.error(`Error processing application_received: ${error.message}`, error.stack);
    }
  }

  @EventPattern('interview_scheduled')
  async handleInterviewScheduled(@Payload() event: NotificationEvent, @Ctx() context: RmqContext): Promise<void> {
    const originalMessage = context.getMessage();
    this.logger.log(`>>> Handler 'interview_scheduled' INVOKED. Payload: ${JSON.stringify(event)}`);
    this.logger.debug(`Raw message content: ${originalMessage.content.toString()}`);
    try {
      await this.notificationService.sendNotification(event);
    } catch (error) {
      this.logger.error(`Error processing interview_scheduled: ${error.message}`, error.stack);
    }
  }

  // Add similar logging and ack logic for offer_extended, system_alert...
   @EventPattern('offer_extended')
    async handleOfferExtended(@Payload() event: NotificationEvent, @Ctx() context: RmqContext): Promise<void> {
        const originalMessage = context.getMessage();
        this.logger.log(`>>> Handler 'offer_extended' INVOKED. Payload: ${JSON.stringify(event)}`);
        this.logger.debug(`Raw message content: ${originalMessage.content.toString()}`);
        try {
        await this.notificationService.sendNotification(event);
        } catch (error) {
        this.logger.error(`Error processing offer_extended: ${error.message}`, error.stack);
        }
    }

    @EventPattern('system_alert')
    async handleSystemAlert(@Payload() event: NotificationEvent, @Ctx() context: RmqContext): Promise<void> {
        const originalMessage = context.getMessage();
        this.logger.log(`>>> Handler 'system_alert' INVOKED. Payload: ${JSON.stringify(event)}`);
        this.logger.debug(`Raw message content: ${originalMessage.content.toString()}`);
        try {
        await this.notificationService.sendNotification(event);
        } catch (error) {
        this.logger.error(`Error processing system_alert: ${error.message}`, error.stack);
        }
    }


//   // --- REMOVE OR COMMENT OUT CATCH-ALL HANDLER ---
//   /** */
//   @EventPattern(/.*/) // Matches any event pattern *not caught above*
//   async handleAnyEvent(@Payload() data: any, @Ctx() context: RmqContext): Promise<void> {
//       const originalMessage = context.getMessage();
//       const rawContent = originalMessage.content.toString();
//       const actualPattern = context.getPattern();

//       this.logger.warn(`>>> CATCH-ALL HANDLER INVOKED <<<`);
//       this.logger.warn(`>>> Matched Pattern (from context): ${actualPattern}`);
//       this.logger.warn(`>>> Raw Message Content: ${rawContent}`);
//       // ... other logging ...

//       // Acknowledge the message
//       const channel = context.getChannelRef();
//       if (!channel.isClosed) {
//           channel.ack(originalMessage); // This was likely causing the double-ack
//           this.logger.warn(`Acknowledged message via CATCH-ALL handler.`);
//       } else {
//           this.logger.warn(`CATCH-ALL: Channel closed before ack.`);
//       }
//   }

//   // --- End Catch-All Removal ---
}
