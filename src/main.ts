// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { appConfig } from './config/app.config'; // Ensure config is loaded correctly

async function bootstrap() {
  // Ensure appConfig is loaded (ConfigModule should handle this if global)
  const rmqOptions = appConfig.rabbitmq;

  // Create the application as a microservice
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${rmqOptions.username}:${rmqOptions.password}@${rmqOptions.host}:${rmqOptions.port}`],
        queue: rmqOptions.queue,
        queueOptions: {
          durable: false, // Make sure this matches the durability setting of your queue/sender
          // noAck: false, // Default is false, set to true if you want auto-acknowledgment (usually false is better for reliability)
        },
      },
    },
  );

  // Start the microservice listener
  await app.listen(); // For microservices, app.listen() starts the listener
  console.log(`Microservice is listening on queue: ${rmqOptions.queue}`);
}
bootstrap();
