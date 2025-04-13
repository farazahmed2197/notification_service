// src/modules/notification/notification.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationFactory } from './notification.factory';
import { ConsoleAdapter } from './adapters/console.adapter';
import { EmailAdapter } from './adapters/email.adapter'; // Import EmailAdapter if used by factory
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationHistory } from './entities/notification-history.entity';

// Mock the NotificationRepository
const mockNotificationRepository = {
  create: jest.fn(),
  saveNotification: jest.fn(),
  markAsSent: jest.fn(),
  markAsFailed: jest.fn(),
};

// Mock the NotificationFactory and its adapters
const mockConsoleAdapter = {
  send: jest.fn(),
};
const mockEmailAdapter = {
  send: jest.fn(),
};
const mockNotificationFactory = {
  getAdapter: jest.fn(),
};

describe('NotificationService', () => {
  let service: NotificationService;
  let factory: NotificationFactory;
  let repository: NotificationRepository;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        // Provide mocks for dependencies
        {
          provide: NotificationFactory,
          useValue: mockNotificationFactory,
        },
        {
          provide: NotificationRepository,
          useValue: mockNotificationRepository, // Provide the mock repository
        },
        // Provide mocks for adapters if needed directly or by factory mock
        { provide: ConsoleAdapter, useValue: mockConsoleAdapter },
        { provide: EmailAdapter, useValue: mockEmailAdapter },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    factory = module.get<NotificationFactory>(NotificationFactory); // Get the mocked factory
    repository = module.get<NotificationRepository>(NotificationRepository); // Get the mocked repository
  });

  it('should send a notification successfully', async () => {
    const notificationInput = {
      to: 'test@example.com',
      type: 'console_test', // Use a type that resolves to console adapter
      data: { message: 'hello' },
    };
    const notificationHistory: Partial<NotificationHistory> = {
      type: notificationInput.type,
      recipientId: notificationInput.to,
      recipientRole: 'candidate', // Assuming default role
      data: notificationInput.data,
      status: 'pending',
    };
    const savedNotificationHistory = { ...notificationHistory, id: 1 };

    // Configure mocks
    mockNotificationRepository.create.mockReturnValue(notificationHistory);
    mockNotificationRepository.saveNotification.mockResolvedValue(savedNotificationHistory);
    mockNotificationFactory.getAdapter.mockReturnValue(mockConsoleAdapter); // Factory returns console adapter
    mockConsoleAdapter.send.mockResolvedValue(undefined); // Adapter send succeeds
    mockNotificationRepository.markAsSent.mockResolvedValue(undefined); // Mark as sent succeeds

    await service.sendNotification(notificationInput);

    // Assertions
    expect(mockNotificationRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        type: notificationInput.type,
        recipientId: notificationInput.to,
        data: notificationInput.data,
        status: 'pending',
    }));
    expect(mockNotificationRepository.saveNotification).toHaveBeenCalledWith(notificationHistory);
    expect(mockNotificationFactory.getAdapter).toHaveBeenCalledWith(notificationInput.type);
    expect(mockConsoleAdapter.send).toHaveBeenCalledWith(notificationInput);
    expect(mockNotificationRepository.markAsSent).toHaveBeenCalledWith(savedNotificationHistory.id);
    expect(mockNotificationRepository.markAsFailed).not.toHaveBeenCalled(); // Ensure markAsFailed wasn't called
  });

   it('should mark notification as failed if adapter fails', async () => {
    const notificationInput = {
      to: 'fail@example.com',
      type: 'email_test', // Use a type that resolves to email adapter
      data: { message: 'fail me' },
    };
     const notificationHistory: Partial<NotificationHistory> = {
      type: notificationInput.type,
      recipientId: notificationInput.to,
      recipientRole: 'candidate',
      data: notificationInput.data,
      status: 'pending',
    };
    const savedNotificationHistory = { ...notificationHistory, id: 2 };
    const adapterError = new Error('Email service down');

    // Configure mocks
    mockNotificationRepository.create.mockReturnValue(notificationHistory);
    mockNotificationRepository.saveNotification.mockResolvedValue(savedNotificationHistory);
    mockNotificationFactory.getAdapter.mockReturnValue(mockEmailAdapter); // Factory returns email adapter
    mockEmailAdapter.send.mockRejectedValue(adapterError); // Adapter send fails
    mockNotificationRepository.markAsFailed.mockResolvedValue(undefined); // Mark as failed succeeds

    // Assertions
    await expect(service.sendNotification(notificationInput)).rejects.toThrow(adapterError); // Expect the error to be re-thrown

    expect(mockNotificationRepository.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending' }));
    expect(mockNotificationRepository.saveNotification).toHaveBeenCalledWith(notificationHistory);
    expect(mockNotificationFactory.getAdapter).toHaveBeenCalledWith(notificationInput.type);
    expect(mockEmailAdapter.send).toHaveBeenCalledWith(notificationInput);
    expect(mockNotificationRepository.markAsSent).not.toHaveBeenCalled(); // Ensure markAsSent wasn't called
    expect(mockNotificationRepository.markAsFailed).toHaveBeenCalledWith(savedNotificationHistory.id, adapterError.message);
  });
});
