// src/config/database.config.ts
import { join } from 'path';

export const databaseConfig = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'notification_service',
  entities: [join(__dirname, '/../**/*.entity.ts')],
  migrations: [join(__dirname, '/../migrations/*{.ts,.js}')],
  synchronize: false, // set to false in production
  migrationsRun: true,
};
