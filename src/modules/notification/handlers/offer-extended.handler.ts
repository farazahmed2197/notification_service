// src/modules/notification/handlers/offer-extended.handler.ts
import { Injectable } from '@nestjs/common';
import { NotificationEvent } from '../notification-event.inteface';
import { NotificationService } from '../notification.service';
import { NotificationHandler } from './notification-handler.interace';

@Injectable()
export class OfferExtendedHandler implements NotificationHandler<NotificationEvent> {
    constructor(private readonly notificationService: NotificationService) { }

    async handle(event: NotificationEvent): Promise<void> {
        await this.notificationService.sendNotification({
            to: event.recipientId,
            type: 'offer_extended',
            data: event.data,
        });
    }
}
