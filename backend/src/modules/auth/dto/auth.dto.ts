import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'eleanor.sterling@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecretPassword123!' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'Eleanor Vance Sterling' })
  @IsString()
  @IsNotEmpty()
  fullName!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'eleanor.sterling@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecretPassword123!' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
