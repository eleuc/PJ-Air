# Session Storage Implementation

## Overview
Implemented file-based session storage to persist JWT tokens across backend restarts without modifying the database.

## Changes Made

### 1. Created SessionStorageService (`backend/src/auth/session-storage.service.ts`)
- Simple file-based session storage using JSON file
- Automatically loads sessions on startup
- Cleans up expired sessions automatically
- Stores session token, userId, email, role, createdAt, expiresAt
- Session expiration: 1 hour (3600 seconds)

### 2. Updated AuthService (`backend/src/auth/auth.service.ts`)
- Added `SessionStorageService` dependency injection
- Store session in file after creating JWT token in `signup()` method
- Store session in file after creating JWT token in `login()` method

### 3. Updated AuthModule (`backend/src/auth/auth.module.ts`)
- Added `SessionStorageService` to providers

### 4. Updated AuthController (`backend/src/auth/auth.controller.ts`)
- Fixed method name from `requestPasswordReset` to `recoverPassword`

### 5. Created .gitignore (`backend/.gitignore`)
- Added `sessions.json` to ignore list (file-based storage)

## How It Works

1. When a user logs in or signs up, a JWT token is generated
2. The token is immediately saved to `sessions.json` file
3. On backend restart, the service loads all valid sessions from the file
4. The JWT strategy validates tokens against the file-based storage
5. Expired sessions are automatically cleaned up

## File Structure

```
backend/
├── sessions.json          # Stores active sessions (auto-created)
├── src/
│   ├── auth/
│   │   ├── session-storage.service.ts  # New file
│   │   ├── auth.service.ts             # Updated
│   │   ├── auth.module.ts              # Updated
│   │   └── auth.controller.ts          # Updated
│   └── .gitignore                    # New file
```

## Session File Format

```json
{
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...": {
    "userId": "123",
    "email": "user@example.com",
    "role": "client",
    "createdAt": 1717000000000,
    "expiresAt": 1717003600000
  }
}
```

## Testing

1. Login with valid credentials
2. Check that `sessions.json` is created
3. Restart the backend
4. Verify that the session is still valid
5. Check that `sessions.json` still contains the session

## Notes

- Sessions expire after 1 hour (configurable in `session-storage.service.ts`)
- The file is automatically created on first use
- Sessions are stored as plain text (JWT tokens are already signed and encrypted)
- The file is excluded from git to avoid committing sensitive session data