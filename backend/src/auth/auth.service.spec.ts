import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcryptjs';

jest.mock('nodemailer');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findForAuth: jest.fn(),
    create: jest.fn(),
    createProfile: jest.fn(),
    findOne: jest.fn(),
    updatePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should throw ConflictException if email already registered', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: '1' });
      await expect(service.signup({ email: 'test@example.com' })).rejects.toThrow(ConflictException);
    });

    it('should create user and profile and return session', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: '1', email: 'test@example.com' });
      mockUsersService.createProfile.mockResolvedValue({});

      const result = await service.signup({ email: 'test@example.com', password: 'password', full_name: 'Test' });
      expect(mockUsersService.create).toHaveBeenCalled();
      expect(mockUsersService.createProfile).toHaveBeenCalled();
      expect(result).toHaveProperty('session');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUsersService.findForAuth.mockResolvedValue(null);
      await expect(service.login('test@example.com', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
    });

    it('should return session on successful login', async () => {
      const hashedPassword = bcrypt.hashSync('password', 10);
      mockUsersService.findForAuth.mockResolvedValue({ id: '1', email: 'test@example.com', password: hashedPassword });
      const result = await service.login('test@example.com', 'password');
      expect(result).toHaveProperty('session');
      expect(result.session.access_token).toContain('local-test-token-1');
    });
  });

  describe('recoverPassword', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findForAuth.mockResolvedValue(null);
      await expect(service.recoverPassword('test@example.com')).rejects.toThrow(UnauthorizedException);
    });

    it('should trigger recovery email with correct context', async () => {
      mockUsersService.findForAuth.mockResolvedValue({ id: '1', email: 'test@example.com', password: 'mypassword' });
      
      const mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });
      const mockVerify = jest.fn().mockResolvedValue(true);
      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        verify: mockVerify,
        sendMail: mockSendMail,
      });

      const result = await service.recoverPassword('test@example.com');
      expect(mockSendMail).toHaveBeenCalled();
      expect(mockSendMail.mock.calls[0][0].text).toContain('reset-password?token=');
      expect(result).toHaveProperty('message');
    });
  });

  describe('resetPassword', () => {
    it('should throw UnauthorizedException if token is invalid', async () => {
      await expect(service.resetPassword('invalid_token', 'newpassword')).rejects.toThrow(UnauthorizedException);
    });

    it('should update password with valid token', async () => {
      mockUsersService.findForAuth.mockResolvedValue({ id: '1', email: 'test@example.com', password: 'mypassword' });
      
      const mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });
      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        verify: jest.fn().mockResolvedValue(true),
        sendMail: mockSendMail,
      });

      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';
      
      const recoverResult = await service.recoverPassword('test@example.com');
      const token = (recoverResult as any).resetToken;
      
      process.env.NODE_ENV = originalEnv;
      
      expect(token).toBeDefined();

      mockUsersService.updatePassword.mockResolvedValue(true);
      const resetResult = await service.resetPassword(token, 'newpassword');
      
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith('1', expect.any(String));
      expect(resetResult).toEqual({ message: 'Password has been successfully reset' });
    });
  });

  describe('changePassword', () => {
    it('should throw UnauthorizedException if current password is wrong', async () => {
      const oldHashedPassword = bcrypt.hashSync('oldpassword', 10);
      mockUsersService.findForAuth.mockResolvedValue({ id: '1', password: oldHashedPassword });
      await expect(service.changePassword('1', 'wrongpassword', 'newpassword')).rejects.toThrow(UnauthorizedException);
    });

    it('should update password and return success message', async () => {
      const oldHashedPassword = bcrypt.hashSync('oldpassword', 10);
      mockUsersService.findForAuth.mockResolvedValue({ id: '1', password: oldHashedPassword });
      mockUsersService.updatePassword.mockResolvedValue(true);
      
      const result = await service.changePassword('1', 'oldpassword', 'newpassword');
      
      // We expect the service to call updatePassword with a new hash
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith('1', expect.any(String));
      
      // We can also verify it's a valid bcrypt hash
      const passedHash = mockUsersService.updatePassword.mock.calls[0][1];
      expect(bcrypt.compareSync('newpassword', passedHash)).toBe(true);
      
      expect(result).toEqual({ message: 'Password updated successfully' });
    });
  });
});
