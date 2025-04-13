-- create_database.sql
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'notification_service') THEN
        CREATE DATABASE notification_service;
    END IF;
END $$;
