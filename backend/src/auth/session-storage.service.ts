import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface SessionData {
  userId: string;
  email: string;
  role: string;
  createdAt: number;
  expiresAt: number;
}

interface SessionFileData {
  [token: string]: SessionData;
}

@Injectable()
export class SessionStorageService {
  private readonly logger = new Logger(SessionStorageService.name);
  private readonly SESSION_FILE = path.join(process.cwd(), 'sessions.json');
  private sessions: SessionFileData = {};

  constructor() {
    this.loadSessions();
  }

  private loadSessions(): void {
    try {
      if (fs.existsSync(this.SESSION_FILE)) {
        const data = fs.readFileSync(this.SESSION_FILE, 'utf-8');
        this.sessions = JSON.parse(data);
        this.cleanupExpiredSessions();
        this.logger.log(`Loaded ${Object.keys(this.sessions).length} active sessions from file`);
      }
    } catch (error) {
      this.logger.error('Error loading sessions from file:', error);
      this.sessions = {};
    }
  }

  private saveSessions(): void {
    try {
      fs.writeFileSync(this.SESSION_FILE, JSON.stringify(this.sessions, null, 2));
    } catch (error) {
      this.logger.error('Error saving sessions to file:', error);
    }
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredTokens = Object.keys(this.sessions).filter(
      token => this.sessions[token].expiresAt < now
    );

    expiredTokens.forEach(token => {
      delete this.sessions[token];
    });

    if (expiredTokens.length > 0) {
      this.logger.log(`Cleaned up ${expiredTokens.length} expired sessions`);
    }
  }

  createSession(token: string, userId: string, email: string, role: string): void {
    this.cleanupExpiredSessions();
    this.sessions[token] = {
      userId,
      email,
      role,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600 * 1000, // 1 hour expiration
    };
    this.saveSessions();
    this.logger.log(`Created session for user ${userId}`);
  }

  validateToken(token: string): SessionData | null {
    this.cleanupExpiredSessions();

    const session = this.sessions[token];
    if (!session) {
      return null;
    }

    if (session.expiresAt < Date.now()) {
      delete this.sessions[token];
      this.saveSessions();
      return null;
    }

    return session;
  }

  deleteToken(token: string): void {
    if (this.sessions[token]) {
      delete this.sessions[token];
      this.saveSessions();
      this.logger.log(`Deleted session for user ${this.sessions[token]?.userId}`);
    }
  }

  getUserFromToken(token: string): { id: string; email: string; role: string } | null {
    const session = this.validateToken(token);
    if (!session) {
      return null;
    }

    return {
      id: session.userId,
      email: session.email,
      role: session.role,
    };
  }
}