// src/modules/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Make sure this is imported
import { NotificationController } from './notification.controller'; // Keep if needed, remove if microservice only
import { NotificationService } from './notification.service';
import { NotificationFactory } from './notification.factory';
import { ConsoleAdapter } from './adapters/console.adapter';
import { EmailAdapter } from './adapters/email.adapter';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationHistory } from './entities/notification-history.entity'; // Import entity

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationHistory]), // Ensure the repository's dependency is here
  ],
  // Remove controllers if this is purely a microservice backend
  // controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationFactory,
    ConsoleAdapter,
    EmailAdapter,
    // Use the custom repository provider if you defined it like that
    // If using default TypeORM repository injection, this might not be needed here
    // but ensure TypeOrmModule.forFeature is imported. Let's assume you need the custom provider:
    NotificationRepository,
  ],
  // Export NotificationService so other modules can import it
  exports: [NotificationService],
})
export class NotificationModule {}
