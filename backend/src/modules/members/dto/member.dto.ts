import { IsNotEmpty, IsOptional, IsString, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, RelationType } from '@prisma/client';

export class CreateMemberDto {
  @ApiProperty({ example: 'William' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ example: 'Sterling' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiPropertyOptional({ example: 'Vance' })
  @IsString()
  @IsOptional()
  maidenName?: string;

  @ApiPropertyOptional({ enum: Gender, default: Gender.UNKNOWN })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ example: '1942-05-14' })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiPropertyOptional({ example: 'Boston, MA' })
  @IsString()
  @IsOptional()
  birthPlace?: string;

  @ApiPropertyOptional({ example: '2021-11-20' })
  @IsDateString()
  @IsOptional()
  deathDate?: string;

  @ApiPropertyOptional({ example: 'Cambridge, MA' })
  @IsString()
  @IsOptional()
  deathPlace?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isDeceased?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'Distinguished Professor of Maritime History at Harvard University.' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: 'Professor & Historian' })
  @IsString()
  @IsOptional()
  occupation?: string;

  @ApiPropertyOptional({ example: 'Ph.D. Harvard University, B.A. Yale University' })
  @IsString()
  @IsOptional()
  education?: string;

  @ApiPropertyOptional({ example: 'Author of three prize-winning historical accounts.' })
  @IsString()
  @IsOptional()
  achievements?: string;
}

export class CreateRelationshipDto {
  @ApiProperty({ description: 'ID of the target member' })
  @IsString()
  @IsNotEmpty()
  toMemberId!: string;

  @ApiProperty({ enum: RelationType, example: RelationType.FATHER })
  @IsEnum(RelationType)
  relationType!: RelationType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
