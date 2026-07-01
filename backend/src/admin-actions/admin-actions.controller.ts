import { Controller, Patch, Param, Body, UseGuards, Req, ForbiddenException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AdminActionsService } from './admin-actions.service';

@Controller('admin-actions')
export class AdminActionsController {
  constructor(private readonly adminActionsService: AdminActionsService) {}

  @Patch('users/:id/reset-password')
  @UseGuards(AuthGuard)
  async resetPassword(
    @Param('id') id: string,
    @Body() body: { newPassword?: string },
    @Req() req: any,
  ) {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden realizar esta acción');
    }
    const { newPassword } = body;
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
    }
    return this.adminActionsService.resetPassword(id, newPassword);
  }

  @Patch('me/change-password')
  @UseGuards(AuthGuard)
  async changePassword(
    @Body() body: { currentPassword?: string; newPassword?: string },
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('No autenticado');
    }
    const { currentPassword, newPassword } = body;
    if (!currentPassword) {
      throw new BadRequestException('Contraseña actual requerida');
    }
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('La nueva contraseña debe tener al menos 8 caracteres');
    }
    return this.adminActionsService.changeOwnPassword(userId, currentPassword, newPassword);
  }
}
