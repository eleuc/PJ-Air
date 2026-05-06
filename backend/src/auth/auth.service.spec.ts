import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findByIdentifier: jest.fn(),
    findByEmailWithRole: jest.fn(),
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
      mockUsersService.findByEmailWithRole.mockResolvedValue(null);
      mockUsersService.findByIdentifier.mockResolvedValue(null);
      await expect(service.login('test@example.com', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
    });

    it('should return session on successful login', async () => {
      mockUsersService.findByEmailWithRole.mockResolvedValue({ id: '1', email: 'test@example.com', password: 'password' });
      const result = await service.login('test@example.com', 'password');
      expect(result).toHaveProperty('session');
      expect(result.session.access_token).toContain('local-test-token-1');
    });
  });

  describe('recoverPassword', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.findByIdentifier.mockResolvedValue(null);
      await expect(service.recoverPassword('test@example.com')).rejects.toThrow(UnauthorizedException);
    });

    it('should trigger recovery email with correct context', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: '1', email: 'test@example.com', password: 'mypassword' });
      
      const mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });
      const mockVerify = jest.fn().mockResolvedValue(true);
      (nodemailer.createTransport as jest.Mock).mockReturnValue({
        verify: mockVerify,
        sendMail: mockSendMail,
      });

      const result = await service.recoverPassword('test@example.com');
      expect(mockSendMail).toHaveBeenCalled();
      expect(mockSendMail.mock.calls[0][0].text).toContain('mypassword');
      expect(result).toHaveProperty('message');
    });
  });

  describe('changePassword', () => {
    it('should throw UnauthorizedException if current password is wrong', async () => {
      mockUsersService.findOne.mockResolvedValue({ id: '1', password: 'oldpassword' });
      await expect(service.changePassword('1', 'wrongpassword', 'newpassword')).rejects.toThrow(UnauthorizedException);
    });

    it('should update password and return success message', async () => {
      mockUsersService.findOne.mockResolvedValue({ id: '1', password: 'oldpassword' });
      mockUsersService.updatePassword.mockResolvedValue(true);
      const result = await service.changePassword('1', 'oldpassword', 'newpassword');
      expect(mockUsersService.updatePassword).toHaveBeenCalledWith('1', 'newpassword');
      expect(result).toEqual({ message: 'Password updated successfully' });
    });
  });
});
