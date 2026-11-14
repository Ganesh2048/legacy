import { IsNotEmpty, IsOptional, IsString, IsArray, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';

export class CreateAlbumDto {
  @ApiProperty({ example: 'Summers at Cape Cod' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Annual Sterling family reunions on the coast.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverUrl?: string;
}

export class MediaFileInputDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileUrl!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fileKey!: string;

  @ApiProperty({ enum: MediaType, example: MediaType.PHOTO })
  @IsEnum(MediaType)
  fileType!: MediaType;

  @ApiProperty({ example: 'summer_1974.jpg' })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({ example: 2048500 })
  fileSize!: number;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  @IsNotEmpty()
  mimeType!: string;
}

export class CreateMemoryDto {
  @ApiProperty({ example: 'Grandpa William Reading to the Children' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Captured on a warm July afternoon in the cottage library.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'Cape Cod, MA' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: '1978-07-15' })
  @IsDateString()
  @IsOptional()
  memoryDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  albumId?: string;

  @ApiPropertyOptional({ type: [MediaFileInputDto] })
  @IsArray()
  @IsOptional()
  mediaFiles?: MediaFileInputDto[];

  @ApiPropertyOptional({ type: [String], example: ['member-uuid-1', 'member-uuid-2'] })
  @IsArray()
  @IsOptional()
  taggedMemberIds?: string[];
}

export class AddCommentDto {
  @ApiProperty({ example: 'I remember this day so vividly! Such a cherished memory.' })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class AddReactionDto {
  @ApiProperty({ example: '❤️' })
  @IsString()
  @IsNotEmpty()
  emoji!: string;
}
