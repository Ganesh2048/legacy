import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController rate limiting & guards', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    refreshTokens: jest.Mock;
    logout: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      refreshTokens: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 5,
          },
        ]),
      ],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  describe('credential endpoint rate limiting guards', () => {
    it('should have ThrottlerGuard applied to POST /auth/register', () => {
      const guards = Reflect.getMetadata('__guards__', controller.register);
      expect(guards).toBeDefined();
      expect(guards).toContain(ThrottlerGuard);
    });

    it('should have ThrottlerGuard applied to POST /auth/login', () => {
      const guards = Reflect.getMetadata('__guards__', controller.login);
      expect(guards).toBeDefined();
      expect(guards).toContain(ThrottlerGuard);
    });

    it('should have ThrottlerGuard applied to POST /auth/refresh', () => {
      const guards = Reflect.getMetadata('__guards__', controller.refresh);
      expect(guards).toBeDefined();
      expect(guards).toContain(ThrottlerGuard);
    });

    it('should NOT have ThrottlerGuard applied to GET /auth/me (read endpoint left alone)', () => {
      const guards = Reflect.getMetadata('__guards__', controller.getProfile) || [];
      expect(guards).not.toContain(ThrottlerGuard);
    });

    it('should NOT have ThrottlerGuard applied to POST /auth/logout', () => {
      const guards = Reflect.getMetadata('__guards__', controller.logout) || [];
      expect(guards).not.toContain(ThrottlerGuard);
    });
  });

  describe('controller execution delegation', () => {
    it('should delegate register to AuthService', async () => {
      const dto = { email: 'test@example.com', password: 'Password1!', fullName: 'Arthur' };
      const expected = { user: {}, tokens: {} };
      authService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);
      expect(result).toBe(expected);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });

    it('should delegate login to AuthService', async () => {
      const dto = { email: 'test@example.com', password: 'Password1!' };
      const expected = { user: {}, tokens: {} };
      authService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);
      expect(result).toBe(expected);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });

    it('should delegate refresh to AuthService', async () => {
      const dto = { refreshToken: 'valid-token' };
      const expected = { accessToken: 'new-a', refreshToken: 'new-r' };
      authService.refreshTokens.mockResolvedValue(expected);

      const result = await controller.refresh(dto);
      expect(result).toBe(expected);
      expect(authService.refreshTokens).toHaveBeenCalledWith(dto);
    });
  });
});
