import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AdminActionsService } from './admin-actions.service';
import { User } from '../users/user.entity';
import { SystemConfig } from '../system-configs/system-config.entity';
import { hashPassword } from '../auth/crypto.util';

describe('AdminActionsService', () => {
  let service: AdminActionsService;
  let userRepositoryMock: any;
  let systemConfigRepositoryMock: any;

  beforeEach(async () => {
    userRepositoryMock = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    systemConfigRepositoryMock = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminActionsService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
        {
          provide: getRepositoryToken(SystemConfig),
          useValue: systemConfigRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<AdminActionsService>(AdminActionsService);
  });

  describe('resetPassword', () => {
    it('debería restablecer la contraseña y activar el flag force_pwd_change', async () => {
      const user = { id: 'user-1', email: 'test@email.com', role: 'client' };
      userRepositoryMock.findOne.mockResolvedValue(user);
      systemConfigRepositoryMock.findOne.mockResolvedValue(null);

      const result = await service.resetPassword('user-1', 'NuevaClave123!');

      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(userRepositoryMock.update).toHaveBeenCalledWith('user-1', expect.any(Object));
      expect(systemConfigRepositoryMock.save).toHaveBeenCalledWith({
        key: 'force_pwd_change:user-1',
        value: 'true',
      });
      expect(result.success).toBe(true);
    });

    it('debería lanzar ForbiddenException si el usuario objetivo es administrador', async () => {
      const adminUser = { id: 'admin-1', email: 'admin@email.com', role: 'admin' };
      userRepositoryMock.findOne.mockResolvedValue(adminUser);

      await expect(service.resetPassword('admin-1', 'NuevaClave123!'))
        .rejects
        .toThrow(ForbiddenException);

      expect(userRepositoryMock.update).not.toHaveBeenCalled();
    });
  });

  describe('changeOwnPassword', () => {
    it('debería cambiar la contraseña y eliminar el flag force_pwd_change si la clave actual es válida (PBKDF2)', async () => {
      const currentPasswordText = 'ClaveActual123!';
      const hashedPassword = hashPassword(currentPasswordText);
      const user = { id: 'user-1', password: hashedPassword };
      
      userRepositoryMock.findOne.mockResolvedValue(user);

      const result = await service.changeOwnPassword('user-1', currentPasswordText, 'NuevaClave123!');

      expect(userRepositoryMock.update).toHaveBeenCalledWith('user-1', expect.any(Object));
      expect(systemConfigRepositoryMock.delete).toHaveBeenCalledWith({ key: 'force_pwd_change:user-1' });
      expect(result.success).toBe(true);
    });

    it('debería lanzar UnauthorizedException si la contraseña actual es incorrecta', async () => {
      const user = { id: 'user-1', password: hashPassword('ClaveCorrecta!') };
      userRepositoryMock.findOne.mockResolvedValue(user);

      await expect(service.changeOwnPassword('user-1', 'ClaveIncorrecta!', 'NuevaClave123!'))
        .rejects
        .toThrow(UnauthorizedException);

      expect(userRepositoryMock.update).not.toHaveBeenCalled();
    });
  });
});
