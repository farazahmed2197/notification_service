// src/config/app.config.ts
import { databaseConfig } from './database.config';
import { rabbitmqConfig } from './rabbitmq.config';

export const appConfig = {
    database: databaseConfig,
    rabbitmq: rabbitmqConfig,
};
