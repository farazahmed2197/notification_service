// src/modules/notification/notification-history.controller.ts
import { Controller, Get, Param, ParseIntPipe, Query, NotFoundException, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationRepository } from './repositories/notification.repository';
import { NotificationHistory } from './entities/notification-history.entity';

import { ApiPropertyOptional } from '@nestjs/swagger'; // Import
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiNotFoundResponse, ApiNoContentResponse } from '@nestjs/swagger'; // Import Swagger decorators


export class PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Page number for pagination', minimum: 1, default: 1 }) // Add decorator
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', minimum: 1, default: 10 }) // Add decorator
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

@ApiTags('Notification History') // Group endpoints under this tag
@Controller('notification-history')
export class NotificationHistoryController {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve paginated notification history' }) // Describe the operation
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' }) // Document query params
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiResponse({ // Document successful response
    status: 200,
    description: 'Paginated list of notification history records.',
    // Type definition for the response structure
    schema: {
        type: 'object',
        properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/NotificationHistory' } },
            total: { type: 'number', example: 100 },
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
        }
    }
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<{ data: NotificationHistory[], total: number, page: number, limit: number }> {
    const { page = 1, limit = 10 } = paginationQuery;
    const [data, total] = await this.notificationRepository.getNotificationHistory(page, limit);
    return { data, total, page, limit };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single notification history record by ID' })
  @ApiParam({ name: 'id', description: 'ID of the notification history record', type: Number }) // Document path param
  @ApiResponse({ status: 200, description: 'The found notification history record.', type: NotificationHistory }) // Use the entity class for schema
  @ApiNotFoundResponse({ description: 'Notification history with the specified ID not found.' }) // Document 404
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<NotificationHistory> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException(`Notification history with ID ${id} not found`);
    }
    return notification;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification history record by ID' })
  @ApiParam({ name: 'id', description: 'ID of the notification history record to delete', type: Number })
  @ApiNoContentResponse({ description: 'Notification history successfully deleted.' }) // Document 204
  @ApiNotFoundResponse({ description: 'Notification history with the specified ID not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const result = await this.notificationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Notification history with ID ${id} not found`);
    }
  }
}