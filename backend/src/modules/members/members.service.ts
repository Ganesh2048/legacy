import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMemberDto, CreateRelationshipDto } from './dto/member.dto';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async createMember(userId: string, familyId: string, dto: CreateMemberDto) {
    const isMember = await this.prisma.familyMember.findFirst({
      where: { familyId, userId },
    });
    if (!isMember) throw new ForbiddenException('Access denied to family');

    return this.prisma.familyMember.create({
      data: {
        familyId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        maidenName: dto.maidenName,
        gender: dto.gender,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        birthPlace: dto.birthPlace,
        deathDate: dto.deathDate ? new Date(dto.deathDate) : null,
        deathPlace: dto.deathPlace,
        isDeceased: dto.isDeceased ?? false,
        avatarUrl: dto.avatarUrl,
        bio: dto.bio,
        occupation: dto.occupation,
        education: dto.education,
        achievements: dto.achievements,
      },
    });
  }

  async getMemberProfile(userId: string, memberId: string) {
    const member = await this.prisma.familyMember.findUnique({
      where: { id: memberId },
      include: {
        family: true,
        relationshipsFrom: {
          include: { toMember: true },
        },
        relationshipsTo: {
          include: { fromMember: true },
        },
        timelineEvents: {
          orderBy: { eventDate: 'asc' },
        },
        taggedMemories: {
          include: {
            memory: {
              include: { mediaFiles: true },
            },
          },
        },
      },
    });

    if (!member) throw new NotFoundException('Member profile not found');

    const isFamilyMember = await this.prisma.familyMember.findFirst({
      where: { familyId: member.familyId, userId },
    });
    if (!isFamilyMember) throw new ForbiddenException('Access denied');

    return member;
  }

  async addRelationship(userId: string, fromMemberId: string, dto: CreateRelationshipDto) {
    const fromMember = await this.prisma.familyMember.findUnique({
      where: { id: fromMemberId },
    });
    if (!fromMember) throw new NotFoundException('Source member not found');

    const isMember = await this.prisma.familyMember.findFirst({
      where: { familyId: fromMember.familyId, userId },
    });
    if (!isMember) throw new ForbiddenException('Access denied');

    return this.prisma.relationship.create({
      data: {
        fromMemberId,
        toMemberId: dto.toMemberId,
        relationType: dto.relationType,
        notes: dto.notes,
      },
    });
  }

  async getFamilyTree(userId: string, familyId: string) {
    const isMember = await this.prisma.familyMember.findFirst({
      where: { familyId, userId },
    });
    if (!isMember) throw new ForbiddenException('Access denied to family tree');

    const members = await this.prisma.familyMember.findMany({
      where: { familyId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        maidenName: true,
        gender: true,
        birthDate: true,
        deathDate: true,
        isDeceased: true,
        avatarUrl: true,
        occupation: true,
        role: true,
      },
    });

    const relationships = await this.prisma.relationship.findMany({
      where: {
        fromMember: { familyId },
      },
      select: {
        id: true,
        fromMemberId: true,
        toMemberId: true,
        relationType: true,
      },
    });

    return {
      familyId,
      nodes: members,
      links: relationships,
    };
  }
}
