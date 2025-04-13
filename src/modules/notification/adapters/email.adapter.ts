// src/modules/notification/adapters/email.adapter.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailAdapter {
  private transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@example.com',
      pass: 'your-password',
    },
  });

  async send(notification: { 
    to: string; 
    type: string; 
    data: Record<string, any> 
  }): Promise<void> {
    const mailOptions = {
      from: 'your-email@example.com',
      to: notification.to,
      subject: `Notification of type ${notification.type}`,
      text: JSON.stringify(notification.data),
    };

    await this.transporter.sendMail(mailOptions);
  }
}