import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MemoriesService } from './memories.service';
import { CreateAlbumDto, CreateMemoryDto, AddCommentDto, AddReactionDto, GetMemoriesQueryDto } from './dto/memory.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Memories & Media')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MemoriesController {
  constructor(private readonly memoriesService: MemoriesService) {}

  @Post('families/:familyId/albums')
  @ApiOperation({ summary: 'Create a new media album in a family' })
  createAlbum(
    @CurrentUser('id') userId: string,
    @Param('familyId') familyId: string,
    @Body() dto: CreateAlbumDto,
  ) {
    return this.memoriesService.createAlbum(userId, familyId, dto);
  }

  @Get('families/:familyId/albums')
  @ApiOperation({ summary: 'Get all media albums in a family' })
  getAlbums(@CurrentUser('id') userId: string, @Param('familyId') familyId: string) {
    return this.memoriesService.getAlbums(userId, familyId);
  }

  @Post('families/:familyId/memories')
  @ApiOperation({ summary: 'Create a new memory post with photos/videos' })
  createMemory(
    @CurrentUser('id') userId: string,
    @Param('familyId') familyId: string,
    @Body() dto: CreateMemoryDto,
  ) {
    return this.memoriesService.createMemory(userId, familyId, dto);
  }

  @Get('families/:familyId/memories')
  @ApiOperation({ summary: 'Get memories feed for a family with pagination' })
  getMemories(
    @CurrentUser('id') userId: string,
    @Param('familyId') familyId: string,
    @Query() query: GetMemoriesQueryDto,
  ) {
    return this.memoriesService.getMemories(userId, familyId, query);
  }

  @Get('memories/:id')
  @ApiOperation({ summary: 'Get memory details, comments, and reactions' })
  getMemoryDetails(@CurrentUser('id') userId: string, @Param('id') memoryId: string) {
    return this.memoriesService.getMemoryDetails(userId, memoryId);
  }

  @Post('memories/:id/comments')
  @ApiOperation({ summary: 'Add a comment to a memory' })
  addComment(
    @CurrentUser('id') userId: string,
    @Param('id') memoryId: string,
    @Body() dto: AddCommentDto,
  ) {
    return this.memoriesService.addComment(userId, memoryId, dto);
  }

  @Post('memories/:id/reactions')
  @ApiOperation({ summary: 'Add an emoji reaction to a memory' })
  addReaction(
    @CurrentUser('id') userId: string,
    @Param('id') memoryId: string,
    @Body() dto: AddReactionDto,
  ) {
    return this.memoriesService.addReaction(userId, memoryId, dto);
  }
}
