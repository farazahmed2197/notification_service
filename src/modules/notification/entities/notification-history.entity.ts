// src/modules/notification/entities/notification-history.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class NotificationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  recipient_id: string;

  @Column()
  recipient_role: string;

  @Column('json')
  data: Record<string, any>;

  @Column()
  status: 'pending' | 'sent' | 'failed';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
