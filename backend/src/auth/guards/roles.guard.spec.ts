import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '../../common/enums/role.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockContext = (handlerRoles: Role[] | undefined, userRole: Role): any => ({
    getHandler: () => ({ roles: handlerRoles }),
    switchToHttp: () => ({
      getRequest: () => ({ user: { role: userRole } }),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: { get: jest.fn() } },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should return true when no roles are defined', () => {
    reflector.get = jest.fn().mockReturnValue(undefined);
    const context = mockContext(undefined, Role.USER);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return true when user role is in the allowed roles', () => {
    reflector.get = jest.fn().mockReturnValue([Role.ADMIN, Role.USER]);
    const context = mockContext([Role.ADMIN, Role.USER], Role.USER);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return true when user role matches exactly', () => {
    reflector.get = jest.fn().mockReturnValue([Role.ADMIN]);
    const context = mockContext([Role.ADMIN], Role.ADMIN);

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return false when user role is not in the allowed roles', () => {
    reflector.get = jest.fn().mockReturnValue([Role.ADMIN]);
    const context = mockContext([Role.ADMIN], Role.USER);

    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('USER must not be allowed to access ADMIN endpoints', () => {
    reflector.get = jest.fn().mockReturnValue([Role.ADMIN]);
    const context = mockContext([Role.ADMIN], Role.USER);

    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });

  it('ADMIN must not be allowed to access USER-only endpoints', () => {
    reflector.get = jest.fn().mockReturnValue([Role.USER]);
    const context = mockContext([Role.USER], Role.ADMIN);

    const result = guard.canActivate(context);

    expect(result).toBe(false);
  });
});
