// ormconfig.ts
import { databaseConfig } from './src/config/database.config';
import { DataSource, DataSourceOptions } from 'typeorm';

const dataSourceOptions = {
  ...databaseConfig,
  type: 'postgres', // Explicitly define the type
} as DataSourceOptions;

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
