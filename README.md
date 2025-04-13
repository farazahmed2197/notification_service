# 📬 Notification Service App

A simple NestJS-based service that utilizes PostgreSQL and RabbitMQ for notifications.

---

## 🚀 Getting Started

### ✅ Prerequisites

Make sure the following are installed and properly configured:

- **Node.js** (includes `npm`)
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


## Run the utility script to send pipeline events manually to test the app

# Send an application_received event
```npx ts-node scripts/send-event.ts application_received```

# Send an interview_scheduled event
``npx ts-node scripts/send-event.ts interview_scheduled``

# Send an offer_extended event
``npx ts-node scripts/send-event.ts offer_extended``