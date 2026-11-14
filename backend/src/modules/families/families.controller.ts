import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FamiliesService } from './families.service';
import { CreateFamilyDto, JoinFamilyDto, InviteMemberDto } from './dto/family.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Families')
@Controller('families')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new family workspace' })
  createFamily(@CurrentUser('id') userId: string, @Body() dto: CreateFamilyDto) {
    return this.familiesService.createFamily(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all families the current user belongs to' })
  getMyFamilies(@CurrentUser('id') userId: string) {
    return this.familiesService.getMyFamilies(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get family details and overview' })
  getFamilyDetails(@CurrentUser('id') userId: string, @Param('id') familyId: string) {
    return this.familiesService.getFamilyDetails(userId, familyId);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join a family using an invite code' })
  joinFamily(@CurrentUser('id') userId: string, @Body() dto: JoinFamilyDto) {
    return this.familiesService.joinByInviteCode(userId, dto);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite a member to the family via email' })
  inviteMember(
    @CurrentUser('id') userId: string,
    @Param('id') familyId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.familiesService.inviteMember(userId, familyId, dto);
  }
}
