import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFamilyDto, JoinFamilyDto, InviteMemberDto } from './dto/family.dto';
import { FamilyRole, InviteStatus } from '@prisma/client';

@Injectable()
export class FamiliesService {
  constructor(private readonly prisma: PrismaService) {}

  private generateInviteCode(familyName: string): string {
    const prefix = familyName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() || 'LEGACY';
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${random}`;
  }

  async createFamily(userId: string, dto: CreateFamilyDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const inviteCode = this.generateInviteCode(dto.name);

    return this.prisma.$transaction(async (tx) => {
      const family = await tx.family.create({
        data: {
          name: dto.name,
          description: dto.description,
          coverUrl: dto.coverUrl,
          inviteCode,
          creatorId: userId,
        },
      });

      // Create owner family member profile
      const nameParts = user.fullName.trim().split(' ');
      const firstName = nameParts[0] || 'Member';
      const lastName = nameParts.slice(1).join(' ') || '';

      await tx.familyMember.create({
        data: {
          familyId: family.id,
          userId: user.id,
          role: FamilyRole.OWNER,
          firstName,
          lastName,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });

      return family;
    });
  }

  async getMyFamilies(userId: string) {
    const memberships = await this.prisma.familyMember.findMany({
      where: { userId },
      include: {
        family: {
          include: {
            _count: {
              select: {
                members: true,
                memories: true,
                albums: true,
              },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.family,
      myRole: m.role,
      memberId: m.id,
    }));
  }

  async getFamilyDetails(userId: string, familyId: string) {
    const member = await this.prisma.familyMember.findFirst({
      where: { familyId, userId },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this family');
    }

    const family = await this.prisma.family.findUnique({
      where: { id: familyId },
      include: {
        members: true,
        albums: { take: 6 },
        memories: {
          take: 6,
          orderBy: { createdAt: 'desc' },
          include: { mediaFiles: true },
        },
        _count: {
          select: {
            members: true,
            albums: true,
            memories: true,
            timelineEvents: true,
          },
        },
      },
    });

    if (!family) throw new NotFoundException('Family not found');

    return {
      ...family,
      myRole: member.role,
    };
  }

  async joinByInviteCode(userId: string, dto: JoinFamilyDto) {
    const family = await this.prisma.family.findUnique({
      where: { inviteCode: dto.inviteCode.toUpperCase() },
    });

    if (!family) {
      throw new NotFoundException('Invalid invitation code');
    }

    const existingMember = await this.prisma.familyMember.findFirst({
      where: { familyId: family.id, userId },
    });

    if (existingMember) {
      throw new BadRequestException('You are already a member of this family');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const nameParts = user.fullName.trim().split(' ');
    const firstName = nameParts[0] || 'Member';
    const lastName = nameParts.slice(1).join(' ') || '';

    const newMember = await this.prisma.familyMember.create({
      data: {
        familyId: family.id,
        userId: user.id,
        role: FamilyRole.MEMBER,
        firstName,
        lastName,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    });

    return {
      family,
      member: newMember,
    };
  }

  async inviteMember(userId: string, familyId: string, dto: InviteMemberDto) {
    const currentMember = await this.prisma.familyMember.findFirst({
      where: { familyId, userId },
    });

    if (!currentMember || (currentMember.role !== FamilyRole.OWNER && currentMember.role !== FamilyRole.ADMIN)) {
      throw new ForbiddenException('Only owners and admins can invite members');
    }

    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return this.prisma.invitation.create({
      data: {
        familyId,
        email: dto.email.toLowerCase(),
        role: dto.role || FamilyRole.MEMBER,
        code,
        invitedById: userId,
        expiresAt,
        status: InviteStatus.PENDING,
      },
    });
  }
}
