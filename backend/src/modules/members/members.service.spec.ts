import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { RelationType, FamilyRole } from '@prisma/client';
import { MembersService } from './members.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('MembersService', () => {
  let service: MembersService;
  let prisma: {
    familyMember: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
    };
    relationship: {
      findMany: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      familyMember: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
      relationship: {
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  describe('createMember role authorization', () => {
    const userId = 'user-1';
    const familyId = 'family-1';
    const createDto = {
      firstName: 'Jane',
      lastName: 'Sterling',
    };

    it('should allow OWNER to create a member', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'caller-1',
        familyId,
        userId,
        role: FamilyRole.OWNER,
      });
      const createdMember = { id: 'new-member', familyId, ...createDto };
      prisma.familyMember.create.mockResolvedValue(createdMember);

      const result = await service.createMember(userId, familyId, createDto);

      expect(result).toEqual(createdMember);
      expect(prisma.familyMember.create).toHaveBeenCalled();
    });

    it('should allow ADMIN to create a member', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'caller-1',
        familyId,
        userId,
        role: FamilyRole.ADMIN,
      });
      const createdMember = { id: 'new-member', familyId, ...createDto };
      prisma.familyMember.create.mockResolvedValue(createdMember);

      const result = await service.createMember(userId, familyId, createDto);

      expect(result).toEqual(createdMember);
      expect(prisma.familyMember.create).toHaveBeenCalled();
    });

    it('should allow CONTRIBUTOR to create a member', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'caller-1',
        familyId,
        userId,
        role: FamilyRole.CONTRIBUTOR,
      });
      const createdMember = { id: 'new-member', familyId, ...createDto };
      prisma.familyMember.create.mockResolvedValue(createdMember);

      const result = await service.createMember(userId, familyId, createDto);

      expect(result).toEqual(createdMember);
      expect(prisma.familyMember.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if caller has role MEMBER', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'caller-1',
        familyId,
        userId,
        role: FamilyRole.MEMBER,
      });

      await expect(service.createMember(userId, familyId, createDto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.familyMember.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if caller has role VIEWER', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'caller-1',
        familyId,
        userId,
        role: FamilyRole.VIEWER,
      });

      await expect(service.createMember(userId, familyId, createDto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.familyMember.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if caller is not a family member', async () => {
      prisma.familyMember.findFirst.mockResolvedValue(null);

      await expect(service.createMember(userId, familyId, createDto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.familyMember.create).not.toHaveBeenCalled();
    });
  });

  describe('addRelationship role authorization', () => {
    const userId = 'user-1';
    const familyId = 'family-1';
    const fromMember = {
      id: 'from-member',
      familyId,
      firstName: 'Arthur',
      lastName: 'Sterling',
    };
    const toMember = {
      id: 'to-member',
      familyId,
      firstName: 'William',
      lastName: 'Sterling',
    };
    const relDto = {
      toMemberId: toMember.id,
      relationType: RelationType.SPOUSE,
    };

    beforeEach(() => {
      prisma.familyMember.findUnique
        .mockResolvedValueOnce(fromMember)
        .mockResolvedValueOnce(toMember);
    });

    it('should allow OWNER to add a relationship', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'caller-1',
        familyId,
        userId,
        role: FamilyRole.OWNER,
      });
      const createdRel = { id: 'rel-1', fromMemberId: fromMember.id, ...relDto };
      prisma.relationship.create.mockResolvedValue(createdRel);

      const result = await service.addRelationship(userId, fromMember.id, relDto);

      expect(result).toEqual(createdRel);
      expect(prisma.relationship.create).toHaveBeenCalled();
    });

    it('should allow ADMIN to add a relationship', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'caller-1',
        familyId,
        userId,
        role: FamilyRole.ADMIN,
      });
      const createdRel = { id: 'rel-1', fromMemberId: fromMember.id, ...relDto };
      prisma.relationship.create.mockResolvedValue(createdRel);

      const result = await service.addRelationship(userId, fromMember.id, relDto);

      expect(result).toEqual(createdRel);
      expect(prisma.relationship.create).toHaveBeenCalled();
    });

    it('should allow CONTRIBUTOR to add a relationship', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'caller-1',
        familyId,
        userId,
        role: FamilyRole.CONTRIBUTOR,
      });
      const createdRel = { id: 'rel-1', fromMemberId: fromMember.id, ...relDto };
      prisma.relationship.create.mockResolvedValue(createdRel);

      const result = await service.addRelationship(userId, fromMember.id, relDto);

      expect(result).toEqual(createdRel);
      expect(prisma.relationship.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if caller has role MEMBER', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'caller-1',
        familyId,
        userId,
        role: FamilyRole.MEMBER,
      });

      await expect(service.addRelationship(userId, fromMember.id, relDto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.relationship.create).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if caller has role VIEWER', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'caller-1',
        familyId,
        userId,
        role: FamilyRole.VIEWER,
      });

      await expect(service.addRelationship(userId, fromMember.id, relDto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.relationship.create).not.toHaveBeenCalled();
    });
  });

  describe('read access for VIEWER and MEMBER', () => {
    const userId = 'user-1';
    const familyId = 'family-1';
    const memberId = 'member-1';

    it('should allow VIEWER to read member profile', async () => {
      const profile = { id: memberId, familyId, firstName: 'Arthur', lastName: 'Sterling' };
      prisma.familyMember.findUnique.mockResolvedValue(profile);
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'viewer-id',
        familyId,
        userId,
        role: FamilyRole.VIEWER,
      });

      const result = await service.getMemberProfile(userId, memberId);

      expect(result).toEqual(profile);
    });

    it('should allow MEMBER to read member profile', async () => {
      const profile = { id: memberId, familyId, firstName: 'Arthur', lastName: 'Sterling' };
      prisma.familyMember.findUnique.mockResolvedValue(profile);
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'member-id',
        familyId,
        userId,
        role: FamilyRole.MEMBER,
      });

      const result = await service.getMemberProfile(userId, memberId);

      expect(result).toEqual(profile);
    });

    it('should allow VIEWER to read family tree', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'viewer-id',
        familyId,
        userId,
        role: FamilyRole.VIEWER,
      });
      prisma.familyMember.findMany.mockResolvedValue([]);
      prisma.relationship.findMany.mockResolvedValue([]);

      const result = await service.getFamilyTree(userId, familyId);

      expect(result).toEqual({
        familyId,
        nodes: [],
        links: [],
      });
    });

    it('should allow MEMBER to read family tree', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'member-id',
        familyId,
        userId,
        role: FamilyRole.MEMBER,
      });
      prisma.familyMember.findMany.mockResolvedValue([]);
      prisma.relationship.findMany.mockResolvedValue([]);

      const result = await service.getFamilyTree(userId, familyId);

      expect(result).toEqual({
        familyId,
        nodes: [],
        links: [],
      });
    });
  });

  describe('addRelationship integrity & validation', () => {
    const userId = 'user-1';
    const familyId = 'family-1';

    const memberA = {
      id: 'member-a',
      familyId,
      firstName: 'Arthur',
      lastName: 'Sterling',
      role: FamilyRole.OWNER,
    };
    const memberB = {
      id: 'member-b',
      familyId,
      firstName: 'William',
      lastName: 'Sterling',
      role: FamilyRole.OWNER,
    };
    const memberC = {
      id: 'member-c',
      familyId,
      firstName: 'Robert',
      lastName: 'Sterling',
      role: FamilyRole.OWNER,
    };
    const crossFamilyMember = {
      id: 'member-x',
      familyId: 'family-2',
      firstName: 'Other',
      lastName: 'Family',
      role: FamilyRole.MEMBER,
    };

    it('should create relationship on happy path', async () => {
      prisma.familyMember.findUnique
        .mockResolvedValueOnce(memberA)
        .mockResolvedValueOnce(memberB);
      prisma.familyMember.findFirst.mockResolvedValue(memberA);
      prisma.relationship.findMany.mockResolvedValue([]);
      const expectedRel = {
        id: 'rel-1',
        fromMemberId: memberA.id,
        toMemberId: memberB.id,
        relationType: RelationType.FATHER,
        notes: undefined,
      };
      prisma.relationship.create.mockResolvedValue(expectedRel);

      const result = await service.addRelationship(userId, memberA.id, {
        toMemberId: memberB.id,
        relationType: RelationType.FATHER,
      });

      expect(result).toEqual(expectedRel);
      expect(prisma.relationship.create).toHaveBeenCalledWith({
        data: {
          fromMemberId: memberA.id,
          toMemberId: memberB.id,
          relationType: RelationType.FATHER,
          notes: undefined,
        },
      });
    });

    it('should throw NotFoundException if source member not found', async () => {
      prisma.familyMember.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.addRelationship(userId, 'non-existent', {
          toMemberId: memberB.id,
          relationType: RelationType.FATHER,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user has no access to family', async () => {
      prisma.familyMember.findUnique.mockResolvedValueOnce(memberA);
      prisma.familyMember.findFirst.mockResolvedValue(null);

      await expect(
        service.addRelationship(userId, memberA.id, {
          toMemberId: memberB.id,
          relationType: RelationType.FATHER,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if toMemberId is unknown', async () => {
      prisma.familyMember.findUnique
        .mockResolvedValueOnce(memberA)
        .mockResolvedValueOnce(null);
      prisma.familyMember.findFirst.mockResolvedValue(memberA);

      await expect(
        service.addRelationship(userId, memberA.id, {
          toMemberId: 'unknown-id',
          relationType: RelationType.FATHER,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if toMember belongs to a different family', async () => {
      prisma.familyMember.findUnique
        .mockResolvedValueOnce(memberA)
        .mockResolvedValueOnce(crossFamilyMember);
      prisma.familyMember.findFirst.mockResolvedValue(memberA);

      await expect(
        service.addRelationship(userId, memberA.id, {
          toMemberId: crossFamilyMember.id,
          relationType: RelationType.FATHER,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on self-relation', async () => {
      await expect(
        service.addRelationship(userId, memberA.id, {
          toMemberId: memberA.id,
          relationType: RelationType.FATHER,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on direct cycle (A parent of B, then B parent of A)', async () => {
      prisma.familyMember.findUnique
        .mockResolvedValueOnce(memberB)
        .mockResolvedValueOnce(memberA);
      prisma.familyMember.findFirst.mockResolvedValue(memberB);
      prisma.relationship.findMany.mockResolvedValue([
        {
          fromMemberId: memberA.id,
          toMemberId: memberB.id,
          relationType: RelationType.FATHER,
        },
      ]);

      await expect(
        service.addRelationship(userId, memberB.id, {
          toMemberId: memberA.id,
          relationType: RelationType.FATHER,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on indirect cycle (A->B->C, then C->A)', async () => {
      prisma.familyMember.findUnique
        .mockResolvedValueOnce(memberC)
        .mockResolvedValueOnce(memberA);
      prisma.familyMember.findFirst.mockResolvedValue(memberC);
      prisma.relationship.findMany.mockResolvedValue([
        {
          fromMemberId: memberA.id,
          toMemberId: memberB.id,
          relationType: RelationType.FATHER,
        },
        {
          fromMemberId: memberB.id,
          toMemberId: memberC.id,
          relationType: RelationType.MOTHER,
        },
      ]);

      await expect(
        service.addRelationship(userId, memberC.id, {
          toMemberId: memberA.id,
          relationType: RelationType.FATHER,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should not block SPOUSE-type edges with ancestry walk', async () => {
      prisma.familyMember.findUnique
        .mockResolvedValueOnce(memberB)
        .mockResolvedValueOnce(memberA);
      prisma.familyMember.findFirst.mockResolvedValue(memberB);
      prisma.relationship.findMany.mockResolvedValue([
        {
          fromMemberId: memberA.id,
          toMemberId: memberB.id,
          relationType: RelationType.FATHER,
        },
      ]);
      const expectedRel = {
        id: 'rel-spouse',
        fromMemberId: memberB.id,
        toMemberId: memberA.id,
        relationType: RelationType.SPOUSE,
        notes: undefined,
      };
      prisma.relationship.create.mockResolvedValue(expectedRel);

      const result = await service.addRelationship(userId, memberB.id, {
        toMemberId: memberA.id,
        relationType: RelationType.SPOUSE,
      });

      expect(result).toEqual(expectedRel);
      expect(prisma.relationship.findMany).not.toHaveBeenCalled();
    });

    it('should detect cycles with CHILD and ADOPTED_CHILD types', async () => {
      prisma.familyMember.findUnique
        .mockResolvedValueOnce(memberA)
        .mockResolvedValueOnce(memberB);
      prisma.familyMember.findFirst.mockResolvedValue(memberA);
      prisma.relationship.findMany.mockResolvedValue([
        {
          fromMemberId: memberA.id,
          toMemberId: memberB.id,
          relationType: RelationType.FATHER,
        },
      ]);

      await expect(
        service.addRelationship(userId, memberA.id, {
          toMemberId: memberB.id,
          relationType: RelationType.CHILD,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
