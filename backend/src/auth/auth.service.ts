import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private resetTokens = new Map<string, { userId: string; expiresAt: number }>();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(body: any) {
    const { email, password, full_name, username, phone, company_name } = body;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) throw new ConflictException('Email already registered');

    if (password && password.length > 72) {
      throw new ConflictException('Password is too long (maximum 72 characters)');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await this.usersService.create({
      email,
      password: hashedPassword,
    });
    const user = Array.isArray(userResult) ? userResult[0] : userResult;

    // Create profile
    await this.usersService.createProfile({
      id: user.id,
      full_name,
      username,
      phone,
      company_name,
    });

    const payload: JwtPayload = { sub: user.id, email: user.email, role: 'client' };
    const accessToken = this.jwtService.sign(payload);

    // Return session for auto-login
    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        app_metadata: {},
        user_metadata: { full_name: full_name },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
      session: {
        access_token: accessToken,
        refresh_token: 'local-test-refresh-' + user.id,
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: user.id, email: user.email },
      }
    };
  }

  async login(identifierInput: string, password: string) {
    const identifier = identifierInput.trim().toLowerCase();
    
    const user = await this.usersService.findForAuth({ identifier });
    
    if (!user) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    const userPassword = (user as any).password;
    let isPasswordValid = false;
    if (password && userPassword) {
      isPasswordValid = await bcrypt.compare(password, userPassword);
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    const payload: JwtPayload = { 
      sub: user.id, 
      email: user.email, 
      role: (user as any).role || 'client' 
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        app_metadata: {},
        user_metadata: { 
          full_name: user.profile?.full_name,
          role: (user as any).role || 'client',
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      },
      session: {
        access_token: accessToken,
        refresh_token: 'local-test-refresh-' + user.id,
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: user.id, email: user.email },
      }
    };
  }

  async recoverPassword(identifier: string) {
    const user = await this.usersService.findForAuth({ identifier });
                 
    if (!user) {
      throw new UnauthorizedException(
        `No hemos conseguido un usuario o email que coincida con: ${identifier}`
      );
    }

    const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

    try {
      // Generate a secure reset token (15 min expiration)
      const plainToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');
      this.resetTokens.set(hashedToken, {
        userId: user.id,
        expiresAt: Date.now() + 15 * 60 * 1000,
      });

      // SMTP configuration - use env vars if available, fallback to Ethereal for dev
      let transporterParams: any;

      if (process.env.SMTP_HOST) {
        transporterParams = {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        };
      } else {
        // Fallback to Ethereal for local development
        transporterParams = {
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: 'mckenna.beier@ethereal.email',
            pass: 'JSF9re7Xh3bTzH4JUK',
          },
        };
      }

      let transporter: any = nodemailer.createTransport(transporterParams);

      try {
        await transporter.verify();
      } catch (e) {
        console.log("SMTP verify failed, creating dynamic Ethereal test account...");
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }

      const info = await transporter.sendMail({
        from: process.env.SMTP_USER ? `"Jhoanes Bakery, Order System" <${process.env.SMTP_USER}>` : '"Jhoanes Bakery, Order System" <noresponder@jhpanesbakery.com>',
        to: user.email,
        subject: "Password Recovery",
        text: `Estimado cliente, para restablecer su contraseña use el siguiente enlace: ${siteUrl}/auth/reset-password?token=${plainToken}\n\nIr a la tienda: ${siteUrl}/auth/login`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Password Recovery</h2>
            <p>Estimado cliente, para restablecer su contraseña, haga clic en el siguiente enlace:</p>
            <p><a href="${siteUrl}/auth/reset-password?token=${plainToken}">${siteUrl}/auth/reset-password?token=${plainToken}</a></p>
            <br/>
            <p>
              <a href="${siteUrl}/auth/login" 
                 style="display: inline-block; background-color: #b8860b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Ir a la tienda
              </a>
            </p>
          </div>`,
      });

      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info as any));

      const response: any = {
        message: `Gracias, se ha enviado un enlace de recuperación al correo ${user.email}`,
        email: user.email,
      };
      if (process.env.NODE_ENV === 'test') {
        response.resetToken = plainToken;
      }
      return response;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException('Error al enviar el correo de recuperación');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findForAuth({ id: userId });
    if (!user) {
      throw new UnauthorizedException('Invalid current password');
    }

    let isPasswordValid = false;
    if (currentPassword && user.password) {
      isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    if (newPassword && newPassword.length > 72) {
      throw new ConflictException('Password is too long (maximum 72 characters)');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(userId, hashedPassword);
    return { message: 'Password updated successfully' };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('Invalid reset token');
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const entry = this.resetTokens.get(hashedToken);
    
    if (!entry || Date.now() > entry.expiresAt) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (newPassword && newPassword.length > 72) {
      throw new ConflictException('Password is too long (maximum 72 characters)');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(entry.userId, hashedPassword);
    this.resetTokens.delete(hashedToken);

    return { message: 'Password has been successfully reset' };
  }
}
