import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(userId: string, familyId: string, query: string) {
    const isMember = await this.prisma.familyMember.findFirst({
      where: { familyId, userId },
    });
    if (!isMember) throw new ForbiddenException('Access denied');

    if (!query || query.trim().length === 0) {
      return { members: [], events: [], memories: [], albums: [] };
    }

    const q = query.trim();

    const [members, events, memories, albums] = await Promise.all([
      this.prisma.familyMember.findMany({
        where: {
          familyId,
          OR: [
            { firstName: { contains: q, mode: 'insensitive' } },
            { lastName: { contains: q, mode: 'insensitive' } },
            { occupation: { contains: q, mode: 'insensitive' } },
            { bio: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
      this.prisma.timelineEvent.findMany({
        where: {
          familyId,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { member: true },
        take: 10,
      }),
      this.prisma.memory.findMany({
        where: {
          familyId,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { location: { contains: q, mode: 'insensitive' } },
          ],
        },
        include: { mediaFiles: true },
        take: 10,
      }),
      this.prisma.album.findMany({
        where: {
          familyId,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),
    ]);

    return {
      members,
      events,
      memories,
      albums,
    };
  }
}
