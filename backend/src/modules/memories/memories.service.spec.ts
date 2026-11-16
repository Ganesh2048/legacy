import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { MemoriesService } from './memories.service';
import { PrismaService } from '../../prisma/prisma.service';
import { GetMemoriesQueryDto } from './dto/memory.dto';

describe('MemoriesService', () => {
  let service: MemoriesService;
  let prisma: {
    familyMember: {
      findFirst: jest.Mock;
    };
    memory: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      familyMember: {
        findFirst: jest.fn(),
      },
      memory: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemoriesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<MemoriesService>(MemoriesService);
  });

  describe('getMemories pagination', () => {
    const userId = 'user-1';
    const familyId = 'family-1';
    const mockMemories = [
      { id: 'mem-1', title: 'Summer 1980', familyId },
      { id: 'mem-2', title: 'Winter 1982', familyId },
    ];

    it('should throw ForbiddenException if user is not a family member', async () => {
      prisma.familyMember.findFirst.mockResolvedValue(null);

      await expect(service.getMemories(userId, familyId, {})).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should paginate with default page=1 and limit=20', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({ id: 'member-1', familyId, userId });
      prisma.memory.count.mockResolvedValue(45);
      prisma.memory.findMany.mockResolvedValue(mockMemories);

      const result = await service.getMemories(userId, familyId, {});

      expect(result).toEqual({
        data: mockMemories,
        total: 45,
        page: 1,
        limit: 20,
      });
      expect(prisma.memory.count).toHaveBeenCalledWith({
        where: { familyId },
      });
      expect(prisma.memory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { familyId },
          skip: 0,
          take: 20,
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should paginate with custom page and limit', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({ id: 'member-1', familyId, userId });
      prisma.memory.count.mockResolvedValue(45);
      prisma.memory.findMany.mockResolvedValue(mockMemories);

      const result = await service.getMemories(userId, familyId, {
        page: 3,
        limit: 10,
      });

      expect(result).toEqual({
        data: mockMemories,
        total: 45,
        page: 3,
        limit: 10,
      });
      expect(prisma.memory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { familyId },
          skip: 20, // (3 - 1) * 10
          take: 10,
        }),
      );
    });

    it('should apply albumId filter when provided', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({ id: 'member-1', familyId, userId });
      prisma.memory.count.mockResolvedValue(5);
      prisma.memory.findMany.mockResolvedValue(mockMemories);

      const result = await service.getMemories(userId, familyId, {
        albumId: 'album-xyz',
        page: 1,
        limit: 20,
      });

      expect(result).toEqual({
        data: mockMemories,
        total: 5,
        page: 1,
        limit: 20,
      });
      expect(prisma.memory.count).toHaveBeenCalledWith({
        where: { familyId, albumId: 'album-xyz' },
      });
      expect(prisma.memory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { familyId, albumId: 'album-xyz' },
          skip: 0,
          take: 20,
        }),
      );
    });
  });

  describe('GetMemoriesQueryDto validation', () => {
    it('should accept valid query params', async () => {
      const dto = plainToInstance(GetMemoriesQueryDto, {
        page: '2',
        limit: '50',
        albumId: 'album-1',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.page).toBe(2);
      expect(dto.limit).toBe(50);
    });

    it('should reject limit greater than 100 (e.g. limit=1000)', async () => {
      const dto = plainToInstance(GetMemoriesQueryDto, {
        limit: '1000',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const limitError = errors.find((e) => e.property === 'limit');
      expect(limitError).toBeDefined();
      expect(limitError?.constraints).toHaveProperty('max');
    });

    it('should reject limit less than 1', async () => {
      const dto = plainToInstance(GetMemoriesQueryDto, {
        limit: '0',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const limitError = errors.find((e) => e.property === 'limit');
      expect(limitError).toBeDefined();
      expect(limitError?.constraints).toHaveProperty('min');
    });

    it('should reject page less than 1', async () => {
      const dto = plainToInstance(GetMemoriesQueryDto, {
        page: '0',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const pageError = errors.find((e) => e.property === 'page');
      expect(pageError).toBeDefined();
      expect(pageError?.constraints).toHaveProperty('min');
    });
  });
});
