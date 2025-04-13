// scripts/send-event.ts
import * as amqp from 'amqplib';
import { rabbitmqConfig } from '../src/config/rabbitmq.config'; // Adjust path if needed
import { NotificationEvent } from '../src/modules/notification/notification-event.inteface'; // Adjust path

// --- Sample Event Data ---
const sampleEvents: Record<string, NotificationEvent> = {
    application_received: {
        type: 'application_received',
        recipientId: 'candidate-123@example.com',
        recipientRole: 'candidate',
        data: {
            applicationId: `APP-${Date.now()}`,
            jobTitle: 'Software Engineer',
            candidateName: 'Jane Doe',
        },
    },
    interview_scheduled: {
        type: 'interview_scheduled',
        recipientId: 'candidate-456@example.com',
        recipientRole: 'candidate',
        data: {
            interviewId: `INT-${Date.now()}`,
            jobTitle: 'Product Manager',
            interviewer: 'John Smith',
            time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            location: 'Virtual Meeting Link',
        },
    },
    offer_extended: {
        type: 'offer_extended',
        recipientId: 'candidate-789@example.com',
        recipientRole: 'candidate',
        data: {
            offerId: `OFF-${Date.now()}`,
            jobTitle: 'Data Scientist',
            salary: 95000,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        },
    },
};
// --- End Sample Event Data ---

async function sendEvent(eventType: string) {
    const eventToSend = sampleEvents[eventType];
    if (!eventToSend) {
        console.error(`Error: Unknown event type "${eventType}".`);
        console.log('Available types:', Object.keys(sampleEvents).join(', '));
        process.exit(1);
    }

    let connection: amqp.Connection | null = null;
    let channel: amqp.Channel | null = null;
    const queue = rabbitmqConfig.queue;
    const url = `amqp://${rabbitmqConfig.username}:${rabbitmqConfig.password}@${rabbitmqConfig.host}:${rabbitmqConfig.port}`;

    try {
        console.log(`Connecting to RabbitMQ at ${rabbitmqConfig.host}...`);
        connection = await amqp.connect(url);
        channel = await connection.createChannel();

        console.log(`Asserting queue "${queue}"...`);
        await channel.assertQueue(queue, { durable: false }); // Match durability with consumer if needed

        const message = JSON.stringify(eventToSend);
        console.log(`Sending event of type "${eventType}" to queue "${queue}":`);
        console.log(message);

        channel.sendToQueue(queue, Buffer.from(message));

        console.log('Event sent successfully.');

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

// --- Script Execution ---
const eventTypeArg = process.argv[2]; // Get the event type from command line argument

if (!eventTypeArg) {
    console.error('Error: Please provide an event type as a command line argument.');
    console.log('Usage: ts-node scripts/send-event.ts <event_type>');
    console.log('Available types:', Object.keys(sampleEvents).join(', '));
    process.exit(1);
}

sendEvent(eventTypeArg);
// --- End Script Execution ---
