import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTimelineEventDto } from './dto/timeline.dto';
import { EventCategory } from '@prisma/client';

@Injectable()
export class TimelineService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(userId: string, familyId: string, dto: CreateTimelineEventDto) {
    const isMember = await this.prisma.familyMember.findFirst({
      where: { familyId, userId },
    });
    if (!isMember) throw new ForbiddenException('Access denied to family');

    return this.prisma.timelineEvent.create({
      data: {
        familyId,
        memberId: dto.memberId,
        title: dto.title,
        category: dto.category || EventCategory.OTHER,
        eventDate: new Date(dto.eventDate),
        location: dto.location,
        description: dto.description,
        mediaUrl: dto.mediaUrl,
      },
      include: {
        member: true,
      },
    });
  }

  async getFamilyTimeline(userId: string, familyId: string, category?: EventCategory) {
    const isMember = await this.prisma.familyMember.findFirst({
      where: { familyId, userId },
    });
    if (!isMember) throw new ForbiddenException('Access denied to family');

    return this.prisma.timelineEvent.findMany({
      where: {
        familyId,
        ...(category ? { category } : {}),
      },
      include: {
        member: true,
      },
      orderBy: { eventDate: 'desc' },
    });
  }
}
