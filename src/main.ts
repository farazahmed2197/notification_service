// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { appConfig } from './config/app.config';
import { Logger, ValidationPipe } from '@nestjs/common'; // Import Logger and ValidationPipe
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Import Swagger

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('Application bootstrap starting (Hybrid Mode)...');

  // 1. Create the main NestJS application instance (for HTTP)
  const app = await NestFactory.create(AppModule);

  // Apply global pipes (e.g., for validation)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Optional: Add global prefix for API endpoints
  app.setGlobalPrefix('api');

  // --- Swagger Configuration ---
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Notification Service API')
    .setDescription('API documentation for managing notification history and receiving events.')
    .setVersion('1.0')
    .addTag('Notification History', 'Endpoints for managing notification history records') // Tag for HTTP endpoints
    .addTag('Notification Events', 'Microservice event listeners') // Tag for Events
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document); // Serve Swagger UI at /api-docs
  logger.log(`Swagger UI available at /api-docs`);
  // --- End Swagger Configuration ---

  // 2. Connect the RabbitMQ microservice listener
  const rmqOptions = appConfig.rabbitmq;
  logger.log(`Connecting RMQ Microservice with options: ${JSON.stringify({
      urls: [`amqp://${rmqOptions.username}:***@${rmqOptions.host}:${rmqOptions.port}`],
      queue: rmqOptions.queue,
      queueOptions: { durable: false, noAck: false }
  })}`);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://${rmqOptions.username}:${rmqOptions.password}@${rmqOptions.host}:${rmqOptions.port}`],
      queue: rmqOptions.queue,
      queueOptions: {
        durable: false,
        noAck: false, // Ensure manual ack is used
      },
    },
  });

  // 3. Start all microservice listeners
  await app.startAllMicroservices();
  logger.log(`Microservice listener started on queue: ${rmqOptions.queue}`);

  // 4. Start the HTTP server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`HTTP server listening on port ${port}`);
  logger.log(`Application running at: ${await app.getUrl()}`);
}
bootstrap();
