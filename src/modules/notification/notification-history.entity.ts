// src/modules/notification/entities/notification-history.entity.ts
import { ApiProperty } from '@nestjs/swagger'; // Import
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class NotificationHistory {
  @ApiProperty({ description: 'Unique identifier for the history record' }) // Add decorator
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Type of the original event (e.g., application_received)', example: 'interview_scheduled' }) // Add decorator
  @Column()
  type: string;

  @ApiProperty({ description: 'Identifier of the recipient', example: 'candidate-123@example.com' }) // Add decorator
  @Column()
  recipientId: string;

  @ApiProperty({ description: 'Role of the recipient', example: 'candidate' }) // Add decorator
  @Column()
  recipientRole: string;

  @ApiProperty({ description: 'Data payload associated with the event', type: 'object', additionalProperties: true }) // Add decorator
  @Column('jsonb') // Use jsonb for better querying if needed
  data: Record<string, any>;

  @ApiProperty({ description: 'Status of the notification sending attempt', enum: ['pending', 'sent', 'failed'] }) // Add decorator
  @Column({ type: 'varchar', length: 50 }) // Explicit type
  status: 'pending' | 'sent' | 'failed';

  @ApiProperty({ description: 'Timestamp when the record was created' }) // Add decorator
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp when the record was last updated' }) // Add decorator
  @UpdateDateColumn()
  updatedAt: Date;
}
