import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let jwtService: {
    sign: jest.Mock;
    verify: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'test_jwt_secret';
        if (key === 'JWT_REFRESH_SECRET') return 'test_refresh_secret';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'StrongPassword123!',
      fullName: 'Arthur Sterling',
    };

    it('should throw ConflictException if user with email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-id', email: 'newuser@example.com' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should register new user, hash password, issue tokens, and store hashed refresh token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock)
        .mockResolvedValueOnce('hashed_password')
        .mockResolvedValueOnce('hashed_refresh_token');

      const createdUser = {
        id: 'user-new',
        email: 'newuser@example.com',
        fullName: 'Arthur Sterling',
        avatarUrl: null,
        createdAt: new Date(),
      };
      prisma.user.create.mockResolvedValue(createdUser);

      jwtService.sign
        .mockReturnValueOnce('access_token_123')
        .mockReturnValueOnce('refresh_token_123');

      prisma.user.update.mockResolvedValue({ ...createdUser, refreshToken: 'hashed_refresh_token' });

      const result = await service.register(registerDto);

      expect(result).toEqual({
        user: createdUser,
        tokens: {
          accessToken: 'access_token_123',
          refreshToken: 'refresh_token_123',
        },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith('StrongPassword123!', 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'newuser@example.com',
          passwordHash: 'hashed_password',
          fullName: 'Arthur Sterling',
          emailVerified: true,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          createdAt: true,
        },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-new' },
        data: { refreshToken: 'hashed_refresh_token' },
      });
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'user@example.com',
      password: 'CorrectPassword123!',
    };

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user has no passwordHash', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        passwordHash: null,
      });

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        passwordHash: 'stored_hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should return user and tokens on valid login credentials', async () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
        fullName: 'Eleanor Sterling',
        passwordHash: 'stored_hash',
        refreshToken: 'old_refresh_hash',
        avatarUrl: 'https://example.com/avatar.jpg',
      };
      prisma.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_refresh_token');

      jwtService.sign
        .mockReturnValueOnce('new_access_token')
        .mockReturnValueOnce('new_refresh_token');

      prisma.user.update.mockResolvedValue({ ...user, refreshToken: 'new_hashed_refresh_token' });

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user: {
          id: 'user-1',
          email: 'user@example.com',
          fullName: 'Eleanor Sterling',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
        tokens: {
          accessToken: 'new_access_token',
          refreshToken: 'new_refresh_token',
        },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { refreshToken: 'new_hashed_refresh_token' },
      });
    });
  });

  describe('refreshTokens', () => {
    const refreshTokenDto = { refreshToken: 'valid_refresh_token' };

    it('should throw UnauthorizedException if refresh token verification fails (expired or invalid)', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found or has no stored refresh token', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1', email: 'user@example.com' });
      prisma.user.findUnique.mockResolvedValue({ id: 'user-1', refreshToken: null });

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if refresh token does not match stored hash', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1', email: 'user@example.com' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        refreshToken: 'stored_hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should rotate tokens: verify old token, issue new pair, update hash, and return new tokens', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1', email: 'user@example.com' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        refreshToken: 'stored_hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('rotated_refresh_hash');

      jwtService.sign
        .mockReturnValueOnce('rotated_access_token')
        .mockReturnValueOnce('rotated_refresh_token');

      prisma.user.update.mockResolvedValue({});

      const result = await service.refreshTokens(refreshTokenDto);

      expect(result).toEqual({
        accessToken: 'rotated_access_token',
        refreshToken: 'rotated_refresh_token',
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { refreshToken: 'rotated_refresh_hash' },
      });
    });
  });

  describe('logout', () => {
    it('should clear stored refresh token in database', async () => {
      const userId = 'user-1';
      prisma.user.update.mockResolvedValue({ id: userId, refreshToken: null });

      const result = await service.logout(userId);

      expect(result).toEqual({ success: true, message: 'Logged out successfully' });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { refreshToken: null },
      });
    });
  });
});
