import { IsNotEmpty, IsOptional, IsString, IsEnum, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FamilyRole } from '@prisma/client';

export class CreateFamilyDto {
  @ApiProperty({ example: 'The Sterling Legacy' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Preserving four generations of Sterling history, wisdom, and memories.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverUrl?: string;
}

export class JoinFamilyDto {
  @ApiProperty({ example: 'STERLING2026' })
  @IsString()
  @IsNotEmpty()
  inviteCode!: string;
}

export class InviteMemberDto {
  @ApiProperty({ example: 'family.member@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ enum: FamilyRole, default: FamilyRole.MEMBER })
  @IsEnum(FamilyRole)
  @IsOptional()
  role?: FamilyRole;
}
