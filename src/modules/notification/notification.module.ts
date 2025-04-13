// src/modules/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { NotificationController } from './notification.controller'; // Remove if microservice only
import { NotificationService } from './notification.service';
import { NotificationFactory } from './notification.factory';
import { ConsoleAdapter } from './adapters/console.adapter';
import { EmailAdapter } from './adapters/email.adapter';
import { NotificationRepository } from './repositories/notification.repository'; // Keep this import
import { NotificationHistory } from './entities/notification-history.entity';

@Module({
  imports: [
    // This is crucial for @InjectRepository(NotificationHistory) to work
    TypeOrmModule.forFeature([NotificationHistory]),
  ],
  // controllers: [NotificationController], // Remove if microservice only
  providers: [
    NotificationService,
    NotificationFactory,
    ConsoleAdapter,
    EmailAdapter,
    NotificationRepository, // Ensure the custom repository is listed as a provider
  ],
  exports: [NotificationService], // Keep exporting the service if needed by other modules
})
export class NotificationModule {}
