import { Controller, Post, Body, UnauthorizedException, BadRequestException, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CurrentUser } from './user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: any) {
    try {
      return await this.authService.signup(body);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  async login(@Body() body: any) {
    const { email, password } = body;
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    return this.authService.login(email, password);
  }

  @Post('recover-password')
  async recoverPassword(@Body() body: { identifier: string }) {
    if (!body.identifier) {
      throw new BadRequestException('Identifier is required');
    }
    return this.authService.recoverPassword(body.identifier);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    const { token, newPassword } = body;
    if (!token || !newPassword) {
      throw new BadRequestException('Token and new password are required');
    }
    return this.authService.resetPassword(token, newPassword);
  }

  @Patch('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(@CurrentUser() currentUser: any, @Body() body: any) {
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('All fields are required');
    }
    return this.authService.changePassword(currentUser.id, currentPassword, newPassword);
  }
}
