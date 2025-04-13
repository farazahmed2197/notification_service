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
  @ApiOperation({
    summary: '[LISTENER] Handles "application_received" event', // Prefix for clarity
    description: `
      Listens for messages on the configured RabbitMQ queue with a pattern matching 'application_received'.
      This is **not** a callable HTTP endpoint.
      The service expects a payload conforming to the NotificationEvent schema.
      Triggered when a new job application is received. Sends notifications based on recipient role.
    `,
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
    summary: '[LISTENER] Handles "interview_scheduled" event',
    description: `
      Listens for messages on the configured RabbitMQ queue with a pattern matching 'interview_scheduled'.
      This is **not** a callable HTTP endpoint.
      Payload should conform to the NotificationEvent schema.
      Triggered when an interview is scheduled. Sends notifications.
    `,
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
    summary: '[LISTENER] Handles "offer_extended" event',
    description: `
      Listens for messages on the configured RabbitMQ queue with a pattern matching 'offer_extended'.
      This is **not** a callable HTTP endpoint.
      Payload should conform to the NotificationEvent schema.
      Triggered when a job offer is extended.
    `,
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
        summary: '[LISTENER] Handles "system_alert" event',
        description: `
          Listens for messages on the configured RabbitMQ queue with a pattern matching 'system_alert'.
          This is **not** a callable HTTP endpoint.
          Payload should conform to the NotificationEvent schema.
          Triggered for internal system alerts. Sends notifications to admins.
        `,
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
