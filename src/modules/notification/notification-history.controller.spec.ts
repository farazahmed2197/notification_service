// src/modules/notification/notification-history.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationHistoryController, PaginationQueryDto } from './notificaion-history.controller';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationHistory } from './entities/notification-history.entity';
import { NotFoundException } from '@nestjs/common';
import { DeleteResult } from 'typeorm';

// Mock the NotificationRepository
const mockNotificationRepository = {
  getNotificationHistory: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  // Add other methods if the controller starts using them
};

describe('NotificationHistoryController', () => {
  let controller: NotificationHistoryController;
  let repository: NotificationRepository;

  beforeEach(async () => {
    jest.clearAllMocks(); // Reset mocks

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationHistoryController],
      providers: [
        // Provide the mock repository
        { provide: NotificationRepository, useValue: mockNotificationRepository },
      ],
    }).compile();

    controller = module.get<NotificationHistoryController>(NotificationHistoryController);
    repository = module.get<NotificationRepository>(NotificationRepository);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Tests for findAll ---
  describe('findAll', () => {
    it('should return paginated notification history', async () => {
      const page = 1;
      const limit = 5;
      const paginationQuery: PaginationQueryDto = { page, limit };
      const mockData: NotificationHistory[] = [new NotificationHistory(), new NotificationHistory()];
      const mockTotal = 10;
      const mockResult: [NotificationHistory[], number] = [mockData, mockTotal];

      mockNotificationRepository.getNotificationHistory.mockResolvedValue(mockResult);

      const result = await controller.findAll(paginationQuery);

      expect(mockNotificationRepository.getNotificationHistory).toHaveBeenCalledWith(page, limit);
      expect(result).toEqual({ data: mockData, total: mockTotal, page, limit });
    });

    it('should use default pagination if not provided', async () => {
        const defaultPage = 1;
        const defaultLimit = 10;
        const paginationQuery: PaginationQueryDto = {}; // Empty query
        const mockResult: [NotificationHistory[], number] = [[], 0];

        mockNotificationRepository.getNotificationHistory.mockResolvedValue(mockResult);

        await controller.findAll(paginationQuery);

        expect(mockNotificationRepository.getNotificationHistory).toHaveBeenCalledWith(defaultPage, defaultLimit);
    });
  });

  // --- Tests for findOne ---
  describe('findOne', () => {
    it('should return a single notification history if found', async () => {
      const id = 1;
      const mockNotification = new NotificationHistory();
      mockNotification.id = id;

      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);

      const result = await controller.findOne(id);

      expect(mockNotificationRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(mockNotification);
    });

    it('should throw NotFoundException if notification history not found', async () => {
      const id = 99;
      mockNotificationRepository.findOne.mockResolvedValue(null); // Simulate not found

      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
      expect(mockNotificationRepository.findOne).toHaveBeenCalledWith({ where: { id } });
    });
  });

  // --- Tests for remove ---
  describe('remove', () => {
    it('should delete notification history and return void', async () => {
      const id = 1;
      const mockDeleteResult: DeleteResult = { affected: 1, raw: {} };

      mockNotificationRepository.delete.mockResolvedValue(mockDeleteResult);

      await expect(controller.remove(id)).resolves.toBeUndefined(); // Should resolve with no value

      expect(mockNotificationRepository.delete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if notification history to delete is not found', async () => {
      const id = 99;
      const mockDeleteResult: DeleteResult = { affected: 0, raw: {} }; // Simulate not found

      mockNotificationRepository.delete.mockResolvedValue(mockDeleteResult);

      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
      expect(mockNotificationRepository.delete).toHaveBeenCalledWith(id);
    });
  });
});
