import { RolesGuard } from './roles.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when user roles match required roles', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    const mockExecutionContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: 'admin' }
        }),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockExecutionContext);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user roles do not match required roles', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    const mockExecutionContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: { role: 'customer' }
        }),
      }),
    } as unknown as ExecutionContext;

    try {
      await guard.canActivate(mockExecutionContext);
    } catch (e) {
      expect(e).toBeInstanceOf(ForbiddenException);
    }
  });
});
