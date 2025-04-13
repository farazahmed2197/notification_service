// src/config/rabbitmq.config.ts

// Define an interface for better typing (optional but recommended)
export interface RabbitMQConfig {
  host: string;
  port: number;
  username?: string; // Optional if using default guest/guest or no auth
  password?: string; // Optional
  queue: string;
  urls?: string[]; // Optional: Allow specifying full URLs
}

export const rabbitmqConfig: RabbitMQConfig = {
  // Read from environment variables, provide defaults
  host: process.env.RABBITMQ_HOST || 'localhost',
  port: parseInt(process.env.RABBITMQ_PORT || '5672', 10), // Parse port
  username: process.env.RABBITMQ_USERNAME || 'guest',
  password: process.env.RABBITMQ_PASSWORD || 'guest',
  queue: process.env.RABBITMQ_QUEUE || 'notification_queue',

  // Optional: Construct URLs if needed by specific RMQ client setups,
  // otherwise host/port/user/pass is usually sufficient for NestJS Transport.RMQ
  // urls: [`amqp://${process.env.RABBITMQ_USERNAME || 'guest'}:${process.env.RABBITMQ_PASSWORD || 'guest'}@${process.env.RABBITMQ_HOST || 'localhost'}:${parseInt(process.env.RABBITMQ_PORT || '5672', 10)}`],
};
