import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { RelationType, FamilyRole, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMemberDto, CreateRelationshipDto } from './dto/member.dto';

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async createMember(userId: string, familyId: string, dto: CreateMemberDto) {
    const isMember = await this.prisma.familyMember.findFirst({
      where: { familyId, userId },
    });
    if (
      !isMember ||
      (isMember.role !== FamilyRole.OWNER &&
        isMember.role !== FamilyRole.ADMIN &&
        isMember.role !== FamilyRole.CONTRIBUTOR)
    ) {
      throw new ForbiddenException('Insufficient permissions to add family members');
    }

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
    if (fromMemberId === dto.toMemberId) {
      throw new BadRequestException('Cannot create relationship to self');
    }

    const fromMember = await this.prisma.familyMember.findUnique({
      where: { id: fromMemberId },
    });
    if (!fromMember) throw new NotFoundException('Source member not found');

    const isMember = await this.prisma.familyMember.findFirst({
      where: { familyId: fromMember.familyId, userId },
    });
    if (
      !isMember ||
      (isMember.role !== FamilyRole.OWNER &&
        isMember.role !== FamilyRole.ADMIN &&
        isMember.role !== FamilyRole.CONTRIBUTOR)
    ) {
      throw new ForbiddenException('Insufficient permissions to modify relationships');
    }

    const toMember = await this.prisma.familyMember.findUnique({
      where: { id: dto.toMemberId },
    });
    if (!toMember) throw new NotFoundException('Target member not found');

    if (toMember.familyId !== fromMember.familyId) {
      throw new BadRequestException('Target member belongs to a different family');
    }

    const ancestryTypes: RelationType[] = [
      RelationType.FATHER,
      RelationType.MOTHER,
      RelationType.CHILD,
      RelationType.ADOPTED_CHILD,
    ];

    if (ancestryTypes.includes(dto.relationType)) {
      const isParentType =
        dto.relationType === RelationType.FATHER || dto.relationType === RelationType.MOTHER;
      const proposedParentId = isParentType ? fromMemberId : dto.toMemberId;
      const proposedChildId = isParentType ? dto.toMemberId : fromMemberId;

      const existingRelationships = await this.prisma.relationship.findMany({
        where: {
          fromMember: { familyId: fromMember.familyId },
        },
        select: {
          fromMemberId: true,
          toMemberId: true,
          relationType: true,
        },
      });

      const parentMap = new Map<string, string[]>();
      for (const rel of existingRelationships) {
        if (rel.relationType === RelationType.FATHER || rel.relationType === RelationType.MOTHER) {
          const parents = parentMap.get(rel.toMemberId) || [];
          parents.push(rel.fromMemberId);
          parentMap.set(rel.toMemberId, parents);
        } else if (
          rel.relationType === RelationType.CHILD ||
          rel.relationType === RelationType.ADOPTED_CHILD
        ) {
          const parents = parentMap.get(rel.fromMemberId) || [];
          parents.push(rel.toMemberId);
          parentMap.set(rel.fromMemberId, parents);
        }
      }

      const visited = new Set<string>();
      const queue: { id: string; depth: number }[] = [{ id: proposedParentId, depth: 0 }];
      visited.add(proposedParentId);

      while (queue.length > 0) {
        const { id: currentId, depth } = queue.shift()!;
        if (depth >= 64) continue;

        const parents = parentMap.get(currentId) || [];
        for (const parentId of parents) {
          if (parentId === proposedChildId) {
            throw new BadRequestException('Relationship would create an ancestry cycle');
          }
          if (!visited.has(parentId)) {
            visited.add(parentId);
            queue.push({ id: parentId, depth: depth + 1 });
          }
        }
      }
    }

    try {
      return await this.prisma.relationship.create({
        data: {
          fromMemberId,
          toMemberId: dto.toMemberId,
          relationType: dto.relationType,
          notes: dto.notes,
        },
      });
    } catch (error) {
      if (
        (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') ||
        (error as { code?: string })?.code === 'P2002'
      ) {
        throw new ConflictException('Relationship already exists');
      }
      throw error;
    }
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
