import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

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
    const user = await this.usersService.findByIdentifier(identifier);
    
    if (!user || (user as any).password !== password) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        app_metadata: {},
        user_metadata: { full_name: user.profile?.full_name },
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
}
