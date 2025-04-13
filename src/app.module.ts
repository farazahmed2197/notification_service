// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { appConfig } from './config/app.config';
import { MessageQueueModule } from './modules/notification/message-queue.module';
import { DataSourceOptions } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => appConfig],
    }),
    TypeOrmModule.forRoot(appConfig.database as DataSourceOptions),
    ClientsModule.register([
      {
        name: 'QUEUE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [appConfig.rabbitmq.host],
          queue: appConfig.rabbitmq.queue,
          queueOptions: {
            durable: false
          },
        },
      },
    ]),
    MessageQueueModule,
  ],
})
export class AppModule {}
