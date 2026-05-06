import { RolesGuard } from './roles.guard';
import { ExecutionContext } from '@nestjs/common';
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

  it('should return true if no roles are defined', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);
    const mockExecutionContext = {
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockExecutionContext);
    expect(result).toBe(true);
  });

  it('should return true as a passthrough even if roles are defined', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    const mockExecutionContext = {
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(mockExecutionContext);
    expect(result).toBe(true);
  });
});
