// src/modules/notification/adapters/email.adapter.ts
import { Injectable, Logger } from '@nestjs/common';
import { NotificationAdapter } from './notification-adapter.interface';
import { NotificationEvent } from '../notification-event.inteface';
import * as nodemailer from 'nodemailer'; // Keep nodemailer import

@Injectable()
export class EmailAdapter implements NotificationAdapter {
  private readonly logger = new Logger(EmailAdapter.name);
  // Keep transporter setup (ensure configuration is externalized via ConfigService in a real app)
  private transporter = nodemailer.createTransport({
    host: 'smtp.example.com', // Replace with actual SMTP config or use process.env
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@example.com', // Use process.env
      pass: 'your-password',       // Use process.env
    },
    // For testing, consider using a service like Ethereal Email or Mailtrap
    // Or use nodemailer's built-in test account feature:
    // let testAccount = await nodemailer.createTestAccount();
    // transporter = nodemailer.createTransport({ host: 'smtp.ethereal.email', ... auth: { user: testAccount.user, pass: testAccount.pass } });
  });

  getChannelType(): string {
    return 'email';
  }

  async send(event: NotificationEvent): Promise<void> {
    const mailOptions = {
      from: '"Notification Service" <your-email@example.com>', // Use process.env
      to: event.recipient_id, // Use recipientId from the event
      subject: `Notification: ${event.type.replace(/_/g, ' ')}`, // Create subject from event type
      text: `Dear Recipient,\n\nA new event '${event.type}' occurred.\n\nDetails:\n${JSON.stringify(event.data, null, 2)}\n\nRegards,\nNotification Service`,
      // html: `<p>Details: ${JSON.stringify(event.data)}</p>` // Optional HTML body
    };

    try {
      this.logger.log(`Attempting to send email for event ${event.type} to ${event.recipient_id}`);
      // In a real app, uncomment the sendMail line. For now, we log.
      // const info = await this.transporter.sendMail(mailOptions);
      // this.logger.log(`Email sent: ${info.messageId}`);
      // For testing without sending real emails:
      this.logger.log(`[EMAIL SIMULATION] To: ${mailOptions.to} | Subject: ${mailOptions.subject}`);
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
      // To view test emails with Ethereal: console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
      this.logger.error(`Failed to send email to ${event.recipient_id}: ${error.message}`, error.stack);
      // Re-throw the error so the service layer knows it failed
      throw error;
    }
  }
}
