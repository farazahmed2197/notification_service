import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationHistoryMigration implements MigrationInterface {
  name = 'NotificationHistoryMigration1744499717000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notification_history (
        id SERIAL PRIMARY KEY,
        type VARCHAR(255) NOT NULL,
        recipient_id VARCHAR(255) NOT NULL,
        recipient_role VARCHAR(255) NOT NULL,
        data JSONB NOT NULL,
        status VARCHAR(50) NOT NULL CHECK(status IN ('pending', 'sent', 'failed')),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS notification_history;');
  }
}
