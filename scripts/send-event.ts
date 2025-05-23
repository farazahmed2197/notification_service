// scripts/send-event.ts
import * as amqp from 'amqplib';
import { rabbitmqConfig } from '../src/config/rabbitmq.config'; // Adjust path if needed
import { NotificationEvent } from '../src/modules/notification/notification-event.inteface'; // Adjust path

// --- Sample Event Data (Ensure 'type' matches @EventPattern strings) ---
const sampleEvents: Record<string, NotificationEvent> = {
  application_received: {
    type: 'application_received', // This MUST match @EventPattern('application_received')
    recipient_id: 'candidate-123@example.com',
    recipient_role: 'candidate',
    data: { applicationId: `APP-${Date.now()}`, jobTitle: 'Software Engineer' },
  },
  interview_scheduled_candidate: {
    type: 'interview_scheduled', // This MUST match @EventPattern('interview_scheduled')
    recipient_id: 'candidate-456@example.com',
    recipient_role: 'candidate',
    data: { interviewId: `INT-${Date.now()}`, time: new Date().toISOString() },
  },
   interview_scheduled_manager: {
    type: 'interview_scheduled', // This MUST match @EventPattern('interview_scheduled')
    recipient_id: 'manager-xyz@example.com',
    recipient_role: 'manager',
    data: { interviewId: `INT-${Date.now()}`, time: new Date().toISOString() },
  },
  offer_extended: {
    type: 'offer_extended', // This MUST match @EventPattern('offer_extended')
    recipient_id: 'candidate-789@example.com',
    recipient_role: 'candidate',
    data: { offerId: `OFF-${Date.now()}`, deadline: new Date().toISOString() },
  },
  system_alert: {
    type: 'system_alert', // This MUST match @EventPattern('system_alert')
    recipient_id: 'admin@internal.com',
    recipient_role: 'admin',
    data: { code: 'DB_CONN_HIGH', severity: 'WARN' },
  }
};
// --- End Sample Event Data ---

async function sendEvent(eventType: string) {
  const eventData = sampleEvents[eventType]; // Get the original event data object
  if (!eventData) {
    console.error(`Error: Unknown event type "${eventType}".`);
    console.log('Available types:', Object.keys(sampleEvents).join(', '));
    process.exit(1);
  }

  // *** Create the message in the format NestJS expects ***
  const messageToSend = {
    pattern: eventType, // Use the event type string as the pattern
    data: eventData,    // Send the original event object as data
  };
  // ********************************************************

  let connection: amqp.Connection | null = null;
  let channel: amqp.Channel | null = null;
  const queue = rabbitmqConfig.queue;
  const url = `amqp://${rabbitmqConfig.username}:${rabbitmqConfig.password}@${rabbitmqConfig.host}:${rabbitmqConfig.port}`;

  try {
    console.log(`Connecting to RabbitMQ at ${rabbitmqConfig.host}...`);
    connection = await amqp.connect(url);
    channel = await connection.createChannel();

    console.log(`Asserting queue "${queue}"...`);
    await channel.assertQueue(queue, { durable: false });

    // Serialize the new message structure
    const messageBuffer = Buffer.from(JSON.stringify(messageToSend));

    console.log(`Sending message with pattern "${eventType}" to queue "${queue}":`);
    console.log(JSON.stringify(messageToSend, null, 2)); // Log the structured message

    channel.sendToQueue(queue, messageBuffer);

    console.log('Message sent successfully.');

  } catch (error) {
    console.error('Error sending event:', error);
    process.exit(1);
  } finally {
    if (channel) {
      await channel.close();
      console.log('Channel closed.');
    }
    if (connection) {
      await connection.close();
      console.log('Connection closed.');
    }
  }
}

// --- Script Execution (Keep as is) ---
const eventTypeArg = process.argv[2];

if (!eventTypeArg) {
  console.error('Error: Please provide an event type as a command line argument.');
  console.log('Usage: ts-node scripts/send-event.ts <event_type>');
  console.log('Available types:', Object.keys(sampleEvents).join(', '));
  process.exit(1);
}

sendEvent(eventTypeArg);
// --- End Script Execution ---
