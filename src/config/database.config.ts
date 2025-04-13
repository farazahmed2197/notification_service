// src/config/database.config.ts
import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

// Define the type for clarity
export const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  // Read from environment variables, provide defaults for local dev
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10), // Parse port to integer
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres', // Ensure this matches your .env or container setup
  database: process.env.DB_NAME || 'notification_service',

  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
  synchronize: false, // Keep false
  migrationsRun: process.env.NODE_ENV !== 'production', // Example: Run migrations automatically only in dev/test
  logging: process.env.NODE_ENV !== 'production', // Example: Enable logging only in dev/test
  // Add SSL options if needed for production database connection
  // ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};
