import { Injectable, ForbiddenException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { SystemConfig } from '../system-configs/system-config.entity';
import { hashPassword, verifyPassword } from '../auth/crypto.util';
import * as bcrypt from 'bcryptjs';

// Dependencia: crypto.util.ts v2.2.11 — No modificar sin actualizar esta referencia

@Injectable()
export class AdminActionsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
  ) {}

  async resetPassword(targetUserId: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: targetUserId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.role === 'admin') {
      throw new ForbiddenException('No se puede restablecer la contraseña de otro administrador');
    }

    const hashedPassword = hashPassword(newPassword);
    await this.userRepository.update(targetUserId, { password: hashedPassword });

    let config = await this.systemConfigRepository.findOne({ where: { key: `force_pwd_change:${targetUserId}` } });
    if (config) {
      config.value = 'true';
    } else {
      config = this.systemConfigRepository.create({
        key: `force_pwd_change:${targetUserId}`,
        value: 'true',
      });
    }
    await this.systemConfigRepository.save(config);

    return {
      success: true,
      message: 'Contraseña restablecida. El usuario deberá cambiarla en su próximo acceso.',
    };
  }

  async changeOwnPassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    let isMatch = false;
    const dbPassword = user.password;

    if (dbPassword && dbPassword.includes(':')) {
      isMatch = verifyPassword(currentPassword, dbPassword);
    } else if (dbPassword && (dbPassword.startsWith('$2a$') || dbPassword.startsWith('$2b$') || dbPassword.startsWith('$2y$'))) {
      const hashToCompare = dbPassword.startsWith('$2y$')
        ? dbPassword.replace(/^\$2y\$/, '$2a$')
        : dbPassword;
      isMatch = bcrypt.compareSync(currentPassword, hashToCompare);
    } else {
      isMatch = dbPassword === currentPassword;
    }

    if (!isMatch) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    const hashedNewPassword = hashPassword(newPassword);
    await this.userRepository.update(userId, { password: hashedNewPassword });

    await this.systemConfigRepository.delete({ key: `force_pwd_change:${userId}` });

    return {
      success: true,
      message: 'Contraseña actualizada correctamente.',
    };
  }
}
