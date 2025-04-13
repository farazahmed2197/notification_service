// src/modules/notification/notification.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationFactory } from './notification.factory';
import { ConsoleAdapter } from './adapters/console.adapter';
import { EmailAdapter } from './adapters/email.adapter';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationHistory } from './entities/notification-history.entity';
import { NotificationEvent } from './notification-event.inteface';
import { Logger } from '@nestjs/common'; // Import Logger

// --- FIX: Define Mocks Completely ---

// Mock the NotificationRepository with all methods used by NotificationService
const mockNotificationRepository = {
  create: jest.fn(),
  saveNotification: jest.fn(),
  markAsSent: jest.fn(),
  markAsFailed: jest.fn(),
  // Add other methods like findOne, getNotificationHistory if NotificationService uses them directly
};

// Mock the ConsoleAdapter
const mockConsoleAdapter = {
  getChannelType: jest.fn().mockReturnValue('console'), // Mock channel type
  send: jest.fn(), // Mock the send method
};

// Mock the EmailAdapter
const mockEmailAdapter = {
  getChannelType: jest.fn().mockReturnValue('email'), // Mock channel type
  send: jest.fn(), // Mock the send method
};

// Mock the NotificationFactory
const mockNotificationFactory = {
  // Ensure this matches the actual method name used in NotificationService
  getAdaptersForEvent: jest.fn(),
};

// --- End Mock Definitions ---

describe('NotificationService', () => {
  let service: NotificationService;
  let factory: NotificationFactory; // Keep if needed for direct assertions on factory mock
  let repository: NotificationRepository; // Keep if needed for direct assertions on repo mock

  // Suppress console logs during tests if they become noisy
  // jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  // jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
  // jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  // jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});


  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        // Provide the complete mocks
        { provide: NotificationFactory, useValue: mockNotificationFactory },
        { provide: NotificationRepository, useValue: mockNotificationRepository },
        { provide: ConsoleAdapter, useValue: mockConsoleAdapter },
        { provide: EmailAdapter, useValue: mockEmailAdapter },
        // Provide Logger if NotificationService injects it, otherwise Nest handles it
        // { provide: Logger, useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() } }
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    factory = module.get<NotificationFactory>(NotificationFactory);
    repository = module.get<NotificationRepository>(NotificationRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a notification successfully via one adapter', async () => {
    const testEvent: NotificationEvent = {
      type: 'console_test',
      recipient_id: 'test@example.com',
      recipient_role: 'candidate',
      data: { message: 'hello' },
    };
    const notificationHistory: Partial<NotificationHistory> = {
        type: testEvent.type,
        recipient_id: testEvent.recipient_id,
        recipient_role: testEvent.recipient_role,
        data: testEvent.data,
        status: 'pending',
    };
    // Simulate the ID being added after save
    const savedNotificationHistory = { ...notificationHistory, id: 1 } as NotificationHistory;

    // --- Configure Mocks ---
    mockNotificationRepository.create.mockReturnValue(notificationHistory as NotificationHistory); // Return the object to be saved
    mockNotificationRepository.saveNotification.mockResolvedValue(savedNotificationHistory); // Return the saved object with ID
    mockNotificationFactory.getAdaptersForEvent.mockReturnValue([mockConsoleAdapter]); // Factory returns only console adapter
    mockConsoleAdapter.send.mockResolvedValue(undefined); // Console adapter send succeeds
    mockNotificationRepository.markAsSent.mockResolvedValue(undefined); // Mark as sent succeeds
    // --- End Configure Mocks ---

    await service.sendNotification(testEvent);

    // --- Assertions ---
    expect(mockNotificationRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        type: testEvent.type,
        recipient_id: testEvent.recipient_id,
        recipient_role: testEvent.recipient_role,
        data: testEvent.data,
        status: 'pending',
    }));
    expect(mockNotificationRepository.saveNotification).toHaveBeenCalledWith(notificationHistory);
    expect(mockNotificationFactory.getAdaptersForEvent).toHaveBeenCalledWith(testEvent);
    expect(mockConsoleAdapter.send).toHaveBeenCalledTimes(1);
    expect(mockConsoleAdapter.send).toHaveBeenCalledWith(testEvent);
    expect(mockEmailAdapter.send).not.toHaveBeenCalled(); // Ensure other adapters not called
    expect(mockNotificationRepository.markAsSent).toHaveBeenCalledWith(savedNotificationHistory.id);
    expect(mockNotificationRepository.markAsFailed).not.toHaveBeenCalled();
    // --- End Assertions ---
  });

  it('should attempt send via multiple adapters and mark sent if all succeed', async () => {
    const testEvent: NotificationEvent = {
      type: 'multi_channel_event',
      recipient_id: 'multi@example.com',
      recipient_role: 'manager', // Role that gets multiple adapters
      data: { info: 'important' },
    };
     const notificationHistory: Partial<NotificationHistory> = { /* ... */ };
     const savedNotificationHistory = { ...notificationHistory, id: 2 } as NotificationHistory;

     // --- Configure Mocks ---
     mockNotificationRepository.create.mockReturnValue(notificationHistory as NotificationHistory);
     mockNotificationRepository.saveNotification.mockResolvedValue(savedNotificationHistory);
     // Factory returns both adapters
     mockNotificationFactory.getAdaptersForEvent.mockReturnValue([mockConsoleAdapter, mockEmailAdapter]);
     mockConsoleAdapter.send.mockResolvedValue(undefined); // Console succeeds
     mockEmailAdapter.send.mockResolvedValue(undefined); // Email succeeds
     mockNotificationRepository.markAsSent.mockResolvedValue(undefined);
     // --- End Configure Mocks ---

     await service.sendNotification(testEvent);

     // --- Assertions ---
     expect(mockNotificationFactory.getAdaptersForEvent).toHaveBeenCalledWith(testEvent);
     expect(mockConsoleAdapter.send).toHaveBeenCalledTimes(1);
     expect(mockConsoleAdapter.send).toHaveBeenCalledWith(testEvent);
     expect(mockEmailAdapter.send).toHaveBeenCalledTimes(1);
     expect(mockEmailAdapter.send).toHaveBeenCalledWith(testEvent);
     expect(mockNotificationRepository.markAsSent).toHaveBeenCalledWith(savedNotificationHistory.id);
     expect(mockNotificationRepository.markAsFailed).not.toHaveBeenCalled();
     // --- End Assertions ---
  });


   it('should mark notification as failed if one adapter fails', async () => {
    const testEvent: NotificationEvent = {
      type: 'email_test_fail',
      recipient_id: 'fail@example.com',
      recipient_role: 'manager', // Role that gets multiple adapters
      data: { message: 'fail me' },
    };
    const notificationHistory: Partial<NotificationHistory> = { /* ... */ };
    const savedNotificationHistory = { ...notificationHistory, id: 3 } as NotificationHistory;
    const adapterError = new Error('Email service down');

    // --- Configure Mocks ---
    mockNotificationRepository.create.mockReturnValue(notificationHistory as NotificationHistory);
    mockNotificationRepository.saveNotification.mockResolvedValue(savedNotificationHistory);
    // Factory returns both adapters
    mockNotificationFactory.getAdaptersForEvent.mockReturnValue([mockConsoleAdapter, mockEmailAdapter]);
    mockConsoleAdapter.send.mockResolvedValue(undefined); // Console succeeds
    mockEmailAdapter.send.mockRejectedValue(adapterError); // Email fails
    mockNotificationRepository.markAsFailed.mockResolvedValue(undefined); // Mark as failed succeeds
    // --- End Configure Mocks ---

    // Service should handle the error internally and not re-throw by default (unless designed otherwise)
    await service.sendNotification(testEvent);
    // If the service *is* designed to re-throw, use:
    // await expect(service.sendNotification(testEvent)).rejects.toThrow(adapterError);

    // --- Assertions ---
    expect(mockNotificationFactory.getAdaptersForEvent).toHaveBeenCalledWith(testEvent);
    expect(mockConsoleAdapter.send).toHaveBeenCalledTimes(1); // Console was still called
    expect(mockConsoleAdapter.send).toHaveBeenCalledWith(testEvent);
    expect(mockEmailAdapter.send).toHaveBeenCalledTimes(1); // Email was called
    expect(mockEmailAdapter.send).toHaveBeenCalledWith(testEvent);
    expect(mockNotificationRepository.markAsSent).not.toHaveBeenCalled(); // Not marked as sent
    // Check that markAsFailed was called with the correct ID and a reason containing the error message
    expect(mockNotificationRepository.markAsFailed).toHaveBeenCalledWith(
        savedNotificationHistory.id,
        expect.stringContaining(adapterError.message) // Check if the error message is part of the reason
    );
     // --- End Assertions ---
  });

  it('should mark as failed if no adapters are found', async () => {
    const testEvent: NotificationEvent = {
      type: 'no_adapter_event',
      recipient_id: 'nobody@example.com',
      recipient_role: 'unknown_role', // Role that gets no adapters
      data: { message: 'lost' },
    };
    const notificationHistory: Partial<NotificationHistory> = { /* ... */ };
    const savedNotificationHistory = { ...notificationHistory, id: 4 } as NotificationHistory;

    // --- Configure Mocks ---
    mockNotificationRepository.create.mockReturnValue(notificationHistory as NotificationHistory);
    mockNotificationRepository.saveNotification.mockResolvedValue(savedNotificationHistory);
    mockNotificationFactory.getAdaptersForEvent.mockReturnValue([]); // Factory returns empty array
    mockNotificationRepository.markAsFailed.mockResolvedValue(undefined);
    // --- End Configure Mocks ---

    await service.sendNotification(testEvent);

    // --- Assertions ---
    expect(mockNotificationFactory.getAdaptersForEvent).toHaveBeenCalledWith(testEvent);
    expect(mockConsoleAdapter.send).not.toHaveBeenCalled();
    expect(mockEmailAdapter.send).not.toHaveBeenCalled();
    expect(mockNotificationRepository.markAsSent).not.toHaveBeenCalled();
    expect(mockNotificationRepository.markAsFailed).toHaveBeenCalledWith(
        savedNotificationHistory.id,
        expect.stringContaining('No suitable notification channels') // Check the reason
    );
    // --- End Assertions ---
  });

});
