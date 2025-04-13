// src/modules/notification/message-queue.consumer.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MessageQueueConsumer } from './message-queue.consumer';
import { ApplicationReceivedHandler } from './handlers/application-received.handler';
import { InterviewScheduledHandler } from './handlers/interview-scheduled.handler';
import { OfferExtendedHandler } from './handlers/offer-extended.handler';
import { NotificationEvent } from './notification-event.inteface';

// Mock Handlers
const mockApplicationReceivedHandler = {
  handle: jest.fn(),
};
const mockInterviewScheduledHandler = {
  handle: jest.fn(),
};
const mockOfferExtendedHandler = {
  handle: jest.fn(),
};

describe('MessageQueueConsumer', () => {
  let consumer: MessageQueueConsumer;

  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageQueueConsumer,
        {
          provide: ApplicationReceivedHandler,
          useValue: mockApplicationReceivedHandler,
        },
        {
          provide: InterviewScheduledHandler,
          useValue: mockInterviewScheduledHandler,
        },
        {
          provide: OfferExtendedHandler,
          useValue: mockOfferExtendedHandler,
        },
      ],
    }).compile();

    consumer = module.get<MessageQueueConsumer>(MessageQueueConsumer);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  it('should call ApplicationReceivedHandler for application_received event', async () => {
    const event: NotificationEvent = {
      type: 'application_received',
      recipient_id: 'candidate123',
      recipient_role: 'candidate',
      data: { applicationId: 'app456', jobTitle: 'Software Engineer' },
    };

    await consumer.consume(event);

    expect(mockApplicationReceivedHandler.handle).toHaveBeenCalledTimes(1);
    expect(mockApplicationReceivedHandler.handle).toHaveBeenCalledWith(event);
    expect(mockInterviewScheduledHandler.handle).not.toHaveBeenCalled();
    expect(mockOfferExtendedHandler.handle).not.toHaveBeenCalled();
  });

  it('should call InterviewScheduledHandler for interview_scheduled event', async () => {
    const event: NotificationEvent = {
      type: 'interview_scheduled',
      recipient_id: 'candidate123',
      recipient_role: 'candidate',
      data: { interviewId: 'int789', time: '2024-07-20T10:00:00Z' },
    };

    await consumer.consume(event);

    expect(mockInterviewScheduledHandler.handle).toHaveBeenCalledTimes(1);
    expect(mockInterviewScheduledHandler.handle).toHaveBeenCalledWith(event);
    expect(mockApplicationReceivedHandler.handle).not.toHaveBeenCalled();
    expect(mockOfferExtendedHandler.handle).not.toHaveBeenCalled();
  });

  it('should call OfferExtendedHandler for offer_extended event', async () => {
    const event: NotificationEvent = {
      type: 'offer_extended',
      recipient_id: 'candidate123',
      recipient_role: 'candidate',
      data: { offerId: 'offer012', deadline: '2024-07-30' },
    };

    await consumer.consume(event);

    expect(mockOfferExtendedHandler.handle).toHaveBeenCalledTimes(1);
    expect(mockOfferExtendedHandler.handle).toHaveBeenCalledWith(event);
    expect(mockApplicationReceivedHandler.handle).not.toHaveBeenCalled();
    expect(mockInterviewScheduledHandler.handle).not.toHaveBeenCalled();
  });

  it('should log unhandled event type for unknown events', async () => {
    const event: NotificationEvent = {
      type: 'unknown_event',
      recipient_id: 'user456',
      recipient_role: 'manager',
      data: { info: 'some data' },
    };

    const consoleSpy = jest.spyOn(console, 'log');

    await consumer.consume(event);

    expect(consoleSpy).toHaveBeenCalledWith(`Unhandled event type: ${event.type}`);
    expect(mockApplicationReceivedHandler.handle).not.toHaveBeenCalled();
    expect(mockInterviewScheduledHandler.handle).not.toHaveBeenCalled();
    expect(mockOfferExtendedHandler.handle).not.toHaveBeenCalled();

    consoleSpy.mockRestore(); // Clean up the spy
  });
});
