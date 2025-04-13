// src/modules/notification/entities/notification-history.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class NotificationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  recipientId: string;

  @Column()
  recipientRole: string;

  @Column('json')
  data: Record<string, any>;

  @Column()
  status: 'pending' | 'sent' | 'failed';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
