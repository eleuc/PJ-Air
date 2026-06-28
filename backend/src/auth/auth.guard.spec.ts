import { AuthGuard } from './auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { signJwt } from './crypto.util';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    guard = new AuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should correctly identify valid sessions or tokens and allow access', async () => {
    const validToken = signJwt({ id: 'user-123', email: 'test@example.com' });
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: `Bearer ${validToken}` }
        }),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockExecutionContext);
    expect(result).toBe(true);
  });

  it('should correctly identify invalid sessions or tokens and throw UnauthorizedException', async () => {
    const mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: 'Bearer invalid_token' }
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
  });
});

