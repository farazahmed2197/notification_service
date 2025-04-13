// src/modules/notification/notification-events.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationEventsController } from './notification-events.controller';
import { NotificationService } from './notification.service';
import { NotificationEvent } from './notification-event.inteface';
import { RmqContext } from '@nestjs/microservices'; // Import RmqContext

// Mock NotificationService
const mockNotificationService = {
    sendNotification: jest.fn(),
};

// Mock RmqContext and its methods needed (getMessage, getChannelRef)
const mockChannel = {
    ack: jest.fn(),
    nack: jest.fn(), // Add nack if you implement error handling with it
    isClosed: false,
};
const mockMessage = { content: Buffer.from('{}') }; // Default empty message content
const mockRmqContext = {
    getMessage: jest.fn().mockReturnValue(mockMessage),
    getChannelRef: jest.fn().mockReturnValue(mockChannel),
};

// Helper to create a mock context instance easily
const createMockContext = (): RmqContext => ({
    getMessage: mockRmqContext.getMessage,
    getChannelRef: mockRmqContext.getChannelRef,
    getPattern: jest.fn(), // Add getPattern if used
}) as unknown as RmqContext;


describe('NotificationEventsController', () => {
    let controller: NotificationEventsController;
    let service: NotificationService;

    beforeEach(async () => {
        // Reset mocks
        jest.clearAllMocks();
        // Reset mock message content if needed per test
        mockMessage.content = Buffer.from('{}');

        const module: TestingModule = await Test.createTestingModule({
            controllers: [NotificationEventsController],
            providers: [
                { provide: NotificationService, useValue: mockNotificationService },
            ],
        }).compile();

        controller = module.get<NotificationEventsController>(NotificationEventsController);
        service = module.get<NotificationService>(NotificationService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('handleApplicationReceived', () => {
        it('should call notificationService.sendNotification and ack message', async () => {
            const testEvent: NotificationEvent = { type: 'application_received', recipient_id: 'test@test.com', recipient_role: 'candidate', data: {} };
            const context = createMockContext(); // Create mock context

            mockNotificationService.sendNotification.mockResolvedValue(undefined); // Mock service success

            await controller.handleApplicationReceived(testEvent, context);

            expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(testEvent);
            expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage); // Verify ack was called
            expect(mockChannel.nack).not.toHaveBeenCalled();
        });

        it('should log error and ack message if service throws', async () => {
            const testEvent: NotificationEvent = { type: 'application_received', recipient_id: 'fail@test.com', recipient_role: 'candidate', data: {} };
            const context = createMockContext();
            const error = new Error("Service Failed");

            mockNotificationService.sendNotification.mockRejectedValue(error); // Mock service failure

            // We expect the controller to catch the error internally
            await controller.handleApplicationReceived(testEvent, context);

            expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(testEvent);
            // Still expect ack because it's in finally block
            expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
            expect(mockChannel.nack).not.toHaveBeenCalled();
            // Could also spy on logger to ensure error was logged
        });
    });

    // Add similar describe blocks for handleInterviewScheduled, handleOfferExtended, etc.

});
