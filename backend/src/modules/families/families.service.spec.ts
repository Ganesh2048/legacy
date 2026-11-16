import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FamilyRole, InviteStatus } from '@prisma/client';
import { FamiliesService } from './families.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('FamiliesService', () => {
  let service: FamiliesService;
  let prisma: {
    $transaction: jest.Mock;
    user: {
      findUnique: jest.Mock;
    };
    family: {
      create: jest.Mock;
      findUnique: jest.Mock;
    };
    familyMember: {
      create: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
    };
    invitation: {
      create: jest.Mock;
    };
  };

  const txMock = {
    family: {
      create: jest.fn(),
    },
    familyMember: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn((callback) => callback(txMock)),
      user: {
        findUnique: jest.fn(),
      },
      family: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      familyMember: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      invitation: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FamiliesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<FamiliesService>(FamiliesService);
  });

  describe('createFamily', () => {
    const userId = 'user-1';
    const user = {
      id: userId,
      fullName: 'Eleanor Sterling',
      email: 'eleanor@example.com',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    it('should create family and owner profile within a transaction', async () => {
      prisma.user.findUnique.mockResolvedValue(user);

      const createdFamily = {
        id: 'family-1',
        name: 'Sterling Family',
        description: 'Our heritage',
        coverUrl: 'https://example.com/cover.jpg',
        inviteCode: 'STER1234',
        creatorId: userId,
      };

      txMock.family.create.mockResolvedValue(createdFamily);
      txMock.familyMember.create.mockResolvedValue({
        id: 'member-1',
        familyId: createdFamily.id,
        userId: user.id,
        role: FamilyRole.OWNER,
        firstName: 'Eleanor',
        lastName: 'Sterling',
        email: user.email,
        avatarUrl: user.avatarUrl,
      });

      const result = await service.createFamily(userId, {
        name: 'Sterling Family',
        description: 'Our heritage',
        coverUrl: 'https://example.com/cover.jpg',
      });

      expect(result).toEqual(createdFamily);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(txMock.family.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Sterling Family',
            creatorId: userId,
          }),
        }),
      );
      expect(txMock.familyMember.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            familyId: createdFamily.id,
            userId: user.id,
            role: FamilyRole.OWNER,
            firstName: 'Eleanor',
            lastName: 'Sterling',
          }),
        }),
      );
    });

    it('should throw NotFoundException if creator user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createFamily(userId, { name: 'Sterling Family' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getFamilyDetails', () => {
    const userId = 'user-1';
    const familyId = 'family-1';

    it('should deny access if caller is not a member of the family', async () => {
      prisma.familyMember.findFirst.mockResolvedValue(null);

      await expect(service.getFamilyDetails(userId, familyId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if family is not found', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'member-1',
        familyId,
        userId,
        role: FamilyRole.MEMBER,
      });
      prisma.family.findUnique.mockResolvedValue(null);

      await expect(service.getFamilyDetails(userId, familyId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return family details with myRole when user is a member', async () => {
      const member = {
        id: 'member-1',
        familyId,
        userId,
        role: FamilyRole.ADMIN,
      };
      const family = {
        id: familyId,
        name: 'Sterling Family',
        members: [member],
        albums: [],
        memories: [],
        _count: { members: 1, albums: 0, memories: 0, timelineEvents: 0 },
      };

      prisma.familyMember.findFirst.mockResolvedValue(member);
      prisma.family.findUnique.mockResolvedValue(family);

      const result = await service.getFamilyDetails(userId, familyId);

      expect(result).toEqual({
        ...family,
        myRole: FamilyRole.ADMIN,
      });
    });
  });

  describe('getMyFamilies', () => {
    it('should return all family memberships for user', async () => {
      const userId = 'user-1';
      const memberships = [
        {
          id: 'member-1',
          role: FamilyRole.OWNER,
          family: {
            id: 'family-1',
            name: 'Sterling Family',
            _count: { members: 5, memories: 12, albums: 3 },
          },
        },
      ];

      prisma.familyMember.findMany.mockResolvedValue(memberships);

      const result = await service.getMyFamilies(userId);

      expect(result).toEqual([
        {
          id: 'family-1',
          name: 'Sterling Family',
          _count: { members: 5, memories: 12, albums: 3 },
          myRole: FamilyRole.OWNER,
          memberId: 'member-1',
        },
      ]);
    });
  });

  describe('joinByInviteCode', () => {
    const userId = 'user-2';
    const user = {
      id: userId,
      fullName: 'William Sterling',
      email: 'william@example.com',
      avatarUrl: null,
    };
    const family = {
      id: 'family-1',
      name: 'Sterling Family',
      inviteCode: 'STER8842',
    };

    it('should throw NotFoundException for invalid invite code', async () => {
      prisma.family.findUnique.mockResolvedValue(null);

      await expect(
        service.joinByInviteCode(userId, { inviteCode: 'INVALID' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user is already a member', async () => {
      prisma.family.findUnique.mockResolvedValue(family);
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'member-existing',
        familyId: family.id,
        userId,
      });

      await expect(
        service.joinByInviteCode(userId, { inviteCode: family.inviteCode }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user joining does not exist', async () => {
      prisma.family.findUnique.mockResolvedValue(family);
      prisma.familyMember.findFirst.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.joinByInviteCode(userId, { inviteCode: family.inviteCode }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should join family successfully with valid invite code', async () => {
      prisma.family.findUnique.mockResolvedValue(family);
      prisma.familyMember.findFirst.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(user);

      const createdMember = {
        id: 'member-new',
        familyId: family.id,
        userId: user.id,
        role: FamilyRole.MEMBER,
        firstName: 'William',
        lastName: 'Sterling',
        email: user.email,
        avatarUrl: null,
      };
      prisma.familyMember.create.mockResolvedValue(createdMember);

      const result = await service.joinByInviteCode(userId, {
        inviteCode: 'ster8842',
      });

      expect(result).toEqual({
        family,
        member: createdMember,
      });
      expect(prisma.family.findUnique).toHaveBeenCalledWith({
        where: { inviteCode: 'STER8842' },
      });
    });
  });

  describe('inviteMember', () => {
    const userId = 'user-1';
    const familyId = 'family-1';
    const inviteDto = {
      email: 'relative@example.com',
      role: FamilyRole.MEMBER,
    };

    it('should throw ForbiddenException if user is not in the family', async () => {
      prisma.familyMember.findFirst.mockResolvedValue(null);

      await expect(
        service.inviteMember(userId, familyId, inviteDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if member has role MEMBER (non-owner/non-admin)', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'member-regular',
        familyId,
        userId,
        role: FamilyRole.MEMBER,
      });

      await expect(
        service.inviteMember(userId, familyId, inviteDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow OWNER to invite new members', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'member-owner',
        familyId,
        userId,
        role: FamilyRole.OWNER,
      });

      const createdInvitation = {
        id: 'inv-1',
        familyId,
        email: 'relative@example.com',
        role: FamilyRole.MEMBER,
        code: 'ABCD1234',
        invitedById: userId,
        status: InviteStatus.PENDING,
      };
      prisma.invitation.create.mockResolvedValue(createdInvitation);

      const result = await service.inviteMember(userId, familyId, inviteDto);

      expect(result).toEqual(createdInvitation);
      expect(prisma.invitation.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            familyId,
            email: 'relative@example.com',
            role: FamilyRole.MEMBER,
            invitedById: userId,
            status: InviteStatus.PENDING,
          }),
        }),
      );
    });

    it('should allow ADMIN to invite new members', async () => {
      prisma.familyMember.findFirst.mockResolvedValue({
        id: 'member-admin',
        familyId,
        userId,
        role: FamilyRole.ADMIN,
      });

      const createdInvitation = {
        id: 'inv-2',
        familyId,
        email: 'relative@example.com',
        role: FamilyRole.CONTRIBUTOR,
        code: 'XYZ98765',
        invitedById: userId,
        status: InviteStatus.PENDING,
      };
      prisma.invitation.create.mockResolvedValue(createdInvitation);

      const result = await service.inviteMember(userId, familyId, {
        email: 'relative@example.com',
        role: FamilyRole.CONTRIBUTOR,
      });

      expect(result).toEqual(createdInvitation);
    });
  });
});
