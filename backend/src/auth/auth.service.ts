import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(body: any) {
    const { email, password, full_name, username, phone } = body;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) throw new ConflictException('Email already registered');

    // Create user
    const userResult = await this.usersService.create({
      email,
      password,
    });
    const user = Array.isArray(userResult) ? userResult[0] : userResult;

    // Create profile
    await this.usersService.createProfile({
      id: user.id,
      full_name,
      username,
      phone,
    });

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
        access_token: 'local-test-token-' + user.id,
        refresh_token: 'local-test-refresh-' + user.id,
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: user.id, email: user.email },
      }
    };
  }

  async login(identifier: string, password: string) {
    const user = await this.usersService.findByEmailWithRole(identifier) ||
                 await this.usersService.findByIdentifier(identifier);
    
    if (!user || (user as any).password !== password) {
      throw new UnauthorizedException('Invalid login credentials');
    }

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
        access_token: 'local-test-token-' + user.id,
        refresh_token: 'local-test-refresh-' + user.id,
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: user.id, email: user.email },
      }
    };
  }

  async recoverPassword(identifier: string) {
    const user = await this.usersService.findByEmail(identifier) ||
                 await this.usersService.findByIdentifier(identifier);
                 
    if (!user) {
      throw new UnauthorizedException(
        `No hemos conseguido un usuario o email que coincida con: ${identifier}`
      );
    }

    const siteUrl = process.env.SITE_URL || 'http://localhost:3000';

    try {
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
        from: '"JH Panes Bakery" <noresponder@jhpanesbakery.com>',
        to: user.email,
        subject: "Password Recovery",
        text: `Estimado cliente, su contraseña es: ${user.password}\n\nIr a la tienda: ${siteUrl}/auth/login`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Password Recovery</h2>
            <p>Estimado cliente, su contraseña es: <strong>${user.password}</strong></p>
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

      return {
        message: `Gracias, su contraseña se ha enviado al correo ${user.email}`,
        email: user.email,
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new InternalServerErrorException('Error al enviar el correo de recuperación');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || user.password !== currentPassword) {
      throw new UnauthorizedException('Invalid current password');
    }
    await this.usersService.updatePassword(userId, newPassword);
    return { message: 'Password updated successfully' };
  }
}
