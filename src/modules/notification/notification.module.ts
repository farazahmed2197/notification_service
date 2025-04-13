// src/modules/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationFactory } from './notification.factory';
import { ConsoleAdapter } from './adapters/console.adapter';
import { EmailAdapter } from './adapters/email.adapter';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationHistory } from './entities/notification-history.entity';
import { NotificationHistoryController } from './notificaion-history.controller'; // Import the new controller

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationHistory]),
  ],
  controllers: [
    NotificationHistoryController, // Add the HTTP controller
  ],
  providers: [
    NotificationService,
    NotificationFactory,
    ConsoleAdapter,
    EmailAdapter,
    NotificationRepository,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
