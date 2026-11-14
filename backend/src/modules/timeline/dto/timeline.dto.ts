import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventCategory } from '@prisma/client';

export class CreateTimelineEventDto {
  @ApiProperty({ example: 'member-uuid' })
  @IsString()
  @IsNotEmpty()
  memberId!: string;

  @ApiProperty({ example: 'Appointed Chair of History Department' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ enum: EventCategory, default: EventCategory.CAREER })
  @IsEnum(EventCategory)
  @IsOptional()
  category?: EventCategory;

  @ApiProperty({ example: '1985-09-01' })
  @IsDateString()
  @IsNotEmpty()
  eventDate!: string;

  @ApiPropertyOptional({ example: 'Harvard University, Cambridge, MA' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 'Appointed full tenure professor and chair of department.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mediaUrl?: string;
}
