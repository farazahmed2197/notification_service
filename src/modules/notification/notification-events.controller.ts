// src/modules/notification/notification-events.controller.ts
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices'; // Keep imports
import { NotificationEvent } from './notification-event.inteface';
import { NotificationService } from './notification.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger'; // Import Swagger

@ApiTags('Notification Events') // Group event handlers
@Controller()
export class NotificationEventsController {
  private readonly logger = new Logger(NotificationEventsController.name);

  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  // --- Specific Handlers (Keep the ack logic here) ---
  @EventPattern('application_received')
  @ApiOperation({ // Describe the event handler
    summary: 'Handles the "application_received" event',
    description: 'Triggered when a new job application is received in the hiring pipeline. Sends notifications based on recipient role.',
  })
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
  @ApiOperation({
    summary: 'Handles the "interview_scheduled" event',
    description: 'Triggered when an interview is scheduled. Sends notifications (e.g., to candidate, interviewer).',
  })
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
   @ApiOperation({
    summary: 'Handles the "offer_extended" event',
    description: 'Triggered when a job offer is extended to a candidate.',
  })
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
    @ApiOperation({
        summary: 'Handles the "system_alert" event',
        description: 'Triggered for internal system alerts (e.g., high DB load). Sends notifications typically to admins.',
      })
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
}
