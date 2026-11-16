import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAlbumDto, CreateMemoryDto, AddCommentDto, AddReactionDto, GetMemoriesQueryDto } from './dto/memory.dto';

@Injectable()
export class MemoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async createAlbum(userId: string, familyId: string, dto: CreateAlbumDto) {
    const isMember = await this.prisma.familyMember.findFirst({
      where: { familyId, userId },
    });
    if (!isMember) throw new ForbiddenException('Access denied to family');

    return this.prisma.album.create({
      data: {
        familyId,
        title: dto.title,
        description: dto.description,
        coverUrl: dto.coverUrl,
      },
    });
  }

  async getAlbums(userId: string, familyId: string) {
    const isMember = await this.prisma.familyMember.findFirst({
      where: { familyId, userId },
    });
    if (!isMember) throw new ForbiddenException('Access denied to family');

    return this.prisma.album.findMany({
      where: { familyId },
      include: {
        _count: {
          select: { memories: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMemory(userId: string, familyId: string, dto: CreateMemoryDto) {
    const isMember = await this.prisma.familyMember.findFirst({
      where: { familyId, userId },
    });
    if (!isMember) throw new ForbiddenException('Access denied to family');

    return this.prisma.memory.create({
      data: {
        familyId,
        albumId: dto.albumId || null,
        title: dto.title,
        description: dto.description,
        location: dto.location,
        memoryDate: dto.memoryDate ? new Date(dto.memoryDate) : null,
        mediaFiles: dto.mediaFiles
          ? {
              create: dto.mediaFiles.map((m) => ({
                fileUrl: m.fileUrl,
                fileKey: m.fileKey,
                fileType: m.fileType,
                fileName: m.fileName,
                fileSize: m.fileSize,
                mimeType: m.mimeType,
              })),
            }
          : undefined,
        taggedMembers: dto.taggedMemberIds
          ? {
              create: dto.taggedMemberIds.map((memberId) => ({ memberId })),
            }
          : undefined,
      },
      include: {
        mediaFiles: true,
        taggedMembers: {
          include: { member: true },
        },
      },
    });
  }

  async getMemories(userId: string, familyId: string, query?: GetMemoriesQueryDto) {
    const isMember = await this.prisma.familyMember.findFirst({
      where: { familyId, userId },
    });
    if (!isMember) throw new ForbiddenException('Access denied to family');

    const page = Math.max(1, query?.page ?? 1);
    const limit = Math.min(100, Math.max(1, query?.limit ?? 20));
    const skip = (page - 1) * limit;

    const where = {
      familyId,
      ...(query?.albumId ? { albumId: query.albumId } : {}),
    };

    const [total, data] = await Promise.all([
      this.prisma.memory.count({ where }),
      this.prisma.memory.findMany({
        where,
        include: {
          mediaFiles: true,
          taggedMembers: {
            include: { member: true },
          },
          comments: {
            orderBy: { createdAt: 'asc' },
          },
          reactions: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getMemoryDetails(userId: string, memoryId: string) {
    const memory = await this.prisma.memory.findUnique({
      where: { id: memoryId },
      include: {
        mediaFiles: true,
        taggedMembers: {
          include: { member: true },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
        },
        reactions: true,
      },
    });

    if (!memory) throw new NotFoundException('Memory not found');

    const isMember = await this.prisma.familyMember.findFirst({
      where: { familyId: memory.familyId, userId },
    });
    if (!isMember) throw new ForbiddenException('Access denied');

    return memory;
  }

  async addComment(userId: string, memoryId: string, dto: AddCommentDto) {
    const memory = await this.prisma.memory.findUnique({
      where: { id: memoryId },
    });
    if (!memory) throw new NotFoundException('Memory not found');

    const isMember = await this.prisma.familyMember.findFirst({
      where: { familyId: memory.familyId, userId },
    });
    if (!isMember) throw new ForbiddenException('Access denied');

    return this.prisma.comment.create({
      data: {
        memoryId,
        authorId: userId,
        content: dto.content,
      },
    });
  }

  async addReaction(userId: string, memoryId: string, dto: AddReactionDto) {
    const memory = await this.prisma.memory.findUnique({
      where: { id: memoryId },
    });
    if (!memory) throw new NotFoundException('Memory not found');

    const isMember = await this.prisma.familyMember.findFirst({
      where: { familyId: memory.familyId, userId },
    });
    if (!isMember) throw new ForbiddenException('Access denied');

    return this.prisma.reaction.upsert({
      where: {
        memoryId_authorId_emoji: {
          memoryId,
          authorId: userId,
          emoji: dto.emoji,
        },
      },
      create: {
        memoryId,
        authorId: userId,
        emoji: dto.emoji,
      },
      update: {},
    });
  }
}
