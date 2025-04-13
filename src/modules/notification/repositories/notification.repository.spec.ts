// src/modules/notification/repositories/notification.repository.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationRepository } from './notification.repository';
import { NotificationHistory } from '../entities/notification-history.entity';
import { getRepositoryToken } from '@nestjs/typeorm'; // Import getRepositoryToken

// Mock TypeORM repository methods we'll use
const mockRepository = {
  create: jest.fn(),
  save: jest.fn(), // Mock the save method used by saveNotification
  // Add mocks for other methods if needed in other tests
};

describe('NotificationRepository', () => {
  let repository: NotificationRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationRepository,
        // Provide the mock repository using the TypeORM token
        {
          provide: getRepositoryToken(NotificationHistory),
          useValue: mockRepository,
        },
      ],
    }).compile();

    // Get the repository instance from the module
    repository = module.get<NotificationRepository>(NotificationRepository);
  });

  // Reset mocks before each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should save a notification', async () => {
    const notificationData: Omit<NotificationHistory, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'test',
      recipientId: 'test@example.com',
      recipientRole: 'test',
      data: {},
      status: 'pending',
    };

    const createdNotification = { ...notificationData, id: 1, createdAt: new Date(), updatedAt: new Date() };

    // Configure mocks
    mockRepository.create.mockReturnValue(notificationData); // Mock create if needed, though save is often sufficient
    mockRepository.save.mockResolvedValue(createdNotification); // Mock save to return the saved entity

    // Call the method under test
    const savedNotification = await repository.saveNotification(notificationData as NotificationHistory); // Cast might be needed depending on strictness

    // Assertions
    expect(mockRepository.save).toHaveBeenCalledWith(notificationData); // Verify save was called correctly
    expect(savedNotification).toBeDefined();
    expect(savedNotification.id).toBe(1); // Check the returned value from the mock
  });
});
