# 📬 Notification Service App

A simple NestJS-based service that utilizes PostgreSQL and RabbitMQ for notifications.

---

## 🚀 Getting Started

### ✅ Prerequisites

Make sure the following are installed and properly configured:

- **Node.js** (includes `npm` and node version v20.16.0)
- **Docker** and **Docker Compose** (usually bundled with Docker Desktop)
- **Git** (optional, but recommended)

---

## 🧾 Steps to Set Up

### 1. Clone the Repository (if not already cloned)

```bash
git clone https://github.com/farazahmed2197/notification_service.git
cd notification_service
```

### 2. Install Dependencies
Navigate to the root of your project and run:

```bash
npm install
```
This installs all necessary packages defined in package.json.

### 3. Set Up Environment Variables
Create a .env file in the root directory (if it doesn’t exist) and add the following:

```bash
# .env

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=notification_service

RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
RABBITMQ_QUEUE=notification_queue
```
Make sure the DB_PASSWORD matches the password used in the PostgreSQL container.

### 4. Start External Services (PostgreSQL & RabbitMQ)
Run the following Docker commands to spin up the necessary containers:

```bash
# Start PostgreSQL
docker run -d --name postgres-notification -p 5432:5432 \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=notification_service \
  postgres

# Start RabbitMQ with Management UI
docker run -d --name rabbitmq-notification -p 5672:5672 -p 15672:15672 \
  rabbitmq:3-management
```

### 5. Create Database (If Not Done by Docker)
To ensure the database is created use the following script or create database manually:

```bash
npm run create:db
```

### 6. Run Database Migrations
Apply schema changes using:
```bash
npm run migration:run
```
### 7. Start the NestJS Application
For Development (auto-reload):
```bash
npm run start:dev
```

For Production:
```bash
npm run build
npm run start:prod
```
You should see output confirming the app is running and connected to the database and RabbitMQ.

## Access Swagger docs
Visit to following endpoint after starting the application to access the Swagger UI.
``` Visit
http://localhost:3000/api-docs#/
```

## Misc step to send manual event 

### Run the utility script to send pipeline events manually to test the app

#### Send an application_received event
```npx ts-node scripts/send-event.ts application_received```

#### Send an interview_scheduled event
``npx ts-node scripts/send-event.ts interview_scheduled``

#### Send an offer_extended event
``npx ts-node scripts/send-event.ts offer_extended``

## Project Analysis: Notification Service

1. Problem statement:

The primary purpose of this notification service is to decouple and centralize notification logic for a larger system (implied to be a hiring platform). Instead of the core hiring application being directly responsible for formatting and sending emails, console logs, or other alerts for events like application_received or interview_scheduled, it simply publishes an event to a message queue (RabbitMQ).

This dedicated notification service listens for these events and takes on the responsibility of:

Processing Events: Receiving messages from the queue.
Determining Recipients & Channels: Using event data (like recipientRole) to decide who should be notified and how (e.g., email, console).
Formatting Messages: (Implicitly handled within adapters) Preparing the notification content for the specific channel.
Dispatching Notifications: Sending the notification via the appropriate channel adapter (Console, Email).
Tracking History: Recording each notification attempt (pending, sent, failed) in a database for auditing and potential retries.
Providing History Access: Exposing an HTTP API for administrators or other services to view and manage the notification history (CRUD operations).

2. Core Functionality & Architecture:

Framework: Built using NestJS (v11) with TypeScript, leveraging its modular structure, dependency injection, and decorators.
Architecture: A Hybrid Application combining:
Microservice Listener: Listens for events on a RabbitMQ queue using the @nestjs/microservices package and @EventPattern decorators.
HTTP API Server: Exposes RESTful endpoints using standard NestJS controllers (@Controller, @Get, @Delete, etc.) for managing NotificationHistory.
Communication:
Inbound: Asynchronous via RabbitMQ for receiving notification events.
Outbound (Notifications): Potentially synchronous or asynchronous depending on the adapter (e.g., console is sync, email is async).
Outbound (API): Synchronous via HTTP for history CRUD.
Persistence: Uses PostgreSQL via TypeORM, employing Entities (NotificationHistory) and a custom Repository pattern (NotificationRepository) wrapping the base TypeORM repository. Migrations manage schema changes.
Notification Channels: Implements the Adapter pattern (NotificationAdapter interface) with concrete implementations for Console (ConsoleAdapter) and Email (EmailAdapter). A NotificationFactory selects appropriate adapters based on event context (currently recipientRole).
Configuration: Uses @nestjs/config to load environment variables from a .env file for database, RabbitMQ, and application settings.
API Documentation: Integrates Swagger (@nestjs/swagger) to provide interactive documentation for the HTTP API and descriptive documentation for the microservice event listeners.
Testing: Includes unit tests for the service, repository, and HTTP controller using Jest and @nestjs/testing.

3. Assumptions Made During Implementation:

**Environment:**
A local development environment with Node.js, npm, and Docker (for PostgreSQL & RabbitMQ) is available.
Standard ports (5432 for Postgres, 5672/15672 for RabbitMQ, 3000 for HTTP) are available or configurable via .env.
**Input (Events):**
Events published to RabbitMQ will follow the { pattern: string, data: NotificationEvent } structure expected by NestJS.
The data part (NotificationEvent) will reliably contain type, recipientId, recipientRole, and a data payload.
The type field within NotificationEvent accurately reflects the event and matches the @EventPattern strings.
**Notification Logic:**
Routing notifications based solely on recipientRole (as implemented in NotificationFactory) is sufficient for this version. Real-world scenarios might require more complex logic (user preferences, event type specifics, etc.).
The specific content/formatting within the Console and Email adapters is acceptable.
**Adapters:**
Console logging is a sufficient notification channel.
The Email adapter requires separate configuration of valid SMTP credentials (or a testing service like Ethereal/Mailtrap) to actually send emails; the current implementation simulates sending via logs.
**Persistence:**
Storing the full event data payload as JSONB in the history is acceptable.
Basic status tracking (pending, sent, failed) is sufficient.
**Error Handling:**
Manual message acknowledgement (noAck: false) in RabbitMQ handlers is desired for reliability.
Logging errors and marking history as 'failed' is the primary error handling strategy. No automatic retry mechanisms or dead-letter queue configurations were implemented.
If multiple adapters are used for one event, the overall status is marked 'failed' if any adapter fails.
**History API:**
Exposing GET (list, single) and DELETE operations for notification history is sufficient.
Creating/Updating history records via the API is not required (history is generated internally).
No authentication or authorization is needed for the history API endpoints in this version.

## What I would improve with more time

Given more time and resources, the following enhancements would be considered to further improve the robustness and maintainability of the Notification Service:

- **Full Dockerization of the Application**  
  Containerize the NestJS application itself to streamline deployment and ensure consistency across environments.

- **Structured Logging and Monitoring**  
  Integrate a production-grade logging system with contextual logging, log levels, and optional integration with centralized log aggregators.

- **Production-Level Optimization**  
  Apply best practices for performance tuning, security hardening, and environment-specific configurations to ensure readiness for large-scale deployment.

- **Template Engine Implementation**  
  Introduce a server-side template engine (e.g., Handlebars or EJS) for rendering dynamic email/notification templates with improved flexibility and customization.
