// src/modules/notification/notification-event.interface.ts
import { ApiProperty } from '@nestjs/swagger';

export class NotificationEvent { // Use class for potential future validation/decorators
  @ApiProperty({
    description: 'The type of event being processed (e.g., application_received, interview_scheduled). This matches the @EventPattern.',
    example: 'application_received',
  })
  type: string;

  @ApiProperty({
    description: 'Identifier for the primary recipient of the notification.',
    example: 'candidate-123@example.com',
  })
  recipient_id: string;

  @ApiProperty({
    description: 'Role of the recipient, used to determine notification channels.',
    example: 'candidate',
  })
  recipient_role: string;

  @ApiProperty({
    description: 'Specific data payload associated with the event type.',
    type: 'object',
    additionalProperties: true,
    example: { applicationId: 'APP-123', jobTitle: 'Software Engineer' },
  })
  data: Record<string, any>;
}
