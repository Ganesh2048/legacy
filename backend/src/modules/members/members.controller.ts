import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto, CreateRelationshipDto } from './dto/member.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Family Members & Tree')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post('families/:familyId/members')
  @ApiOperation({ summary: 'Add a new member profile to a family' })
  createMember(
    @CurrentUser('id') userId: string,
    @Param('familyId') familyId: string,
    @Body() dto: CreateMemberDto,
  ) {
    return this.membersService.createMember(userId, familyId, dto);
  }

  @Get('members/:id')
  @ApiOperation({ summary: 'Get full profile details for a family member' })
  getMemberProfile(@CurrentUser('id') userId: string, @Param('id') memberId: string) {
    return this.membersService.getMemberProfile(userId, memberId);
  }

  @Post('members/:id/relationships')
  @ApiOperation({ summary: 'Add a relationship link from one member to another' })
  addRelationship(
    @CurrentUser('id') userId: string,
    @Param('id') fromMemberId: string,
    @Body() dto: CreateRelationshipDto,
  ) {
    return this.membersService.addRelationship(userId, fromMemberId, dto);
  }

  @Get('families/:familyId/tree')
  @ApiOperation({ summary: 'Get interactive family tree structure (nodes and links)' })
  getFamilyTree(@CurrentUser('id') userId: string, @Param('familyId') familyId: string) {
    return this.membersService.getFamilyTree(userId, familyId);
  }
}
