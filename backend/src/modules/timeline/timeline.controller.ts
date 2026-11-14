import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TimelineService } from './timeline.service';
import { CreateTimelineEventDto } from './dto/timeline.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { EventCategory } from '@prisma/client';

@ApiTags('Life Event Timeline')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Post('families/:familyId/timeline')
  @ApiOperation({ summary: 'Add a life event to family member timeline' })
  createEvent(
    @CurrentUser('id') userId: string,
    @Param('familyId') familyId: string,
    @Body() dto: CreateTimelineEventDto,
  ) {
    return this.timelineService.createEvent(userId, familyId, dto);
  }

  @Get('families/:familyId/timeline')
  @ApiOperation({ summary: 'Get chronological timeline of all family life events' })
  @ApiQuery({ name: 'category', enum: EventCategory, required: false })
  getTimeline(
    @CurrentUser('id') userId: string,
    @Param('familyId') familyId: string,
    @Query('category') category?: EventCategory,
  ) {
    return this.timelineService.getFamilyTimeline(userId, familyId, category);
  }
}
