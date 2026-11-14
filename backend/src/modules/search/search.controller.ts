import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Global Search')
@Controller('families/:familyId/search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search across family members, life events, memories, and albums' })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  search(
    @CurrentUser('id') userId: string,
    @Param('familyId') familyId: string,
    @Query('q') query: string,
  ) {
    return this.searchService.globalSearch(userId, familyId, query);
  }
}
