# Authentication and Authorization Flow Documentation

## Overview

This document describes the authentication and authorization flows implemented in Pedidos Jhoanes (Next.js frontend + NestJS backend).

## Table of Contents

1. [Authentication Flow](#authentication-flow)
2. [Password Recovery Flow](#password-recovery-flow)
3. [Authorization Flow](#authorization-flow)
4. [Frontend Implementation](#frontend-implementation)
5. [Backend Implementation](#backend-implementation)

---

## Authentication Flow

### Frontend View - Login Page

**Location:** `frontend/app/auth/login/page.tsx`

The login page is the user's entry point for authentication. It displays:
- A centered login card with glass morphism design
- Email/username and password fields (with icons)
- Error message display area
- Links to register and forgot password pages

**User Interface:**
- Accepts either email or username in the identifier field
- Password field with type="password"
- Submit button with loading state

### UI Module - LoginForm Component

**Location:** `frontend/components/auth/LoginForm.tsx`

The `LoginForm` component handles the actual form submission:

**Key Props:**
- `identifier`: User's email or username
- `setIdentifier`: Function to update identifier state
- `password`: User's password
- `setPassword`: Function to update password state
- `onSubmit`: Function to handle form submission
- `isLoading`: Boolean flag for loading state
- `error`: Optional error message to display

**Form Structure:**
1. Error message display (if error exists)
2. Email/username input with User icon
3. Password input with Lock icon
4. Submit button with loading spinner
5. Link to forgot password page

### Data Sending - API Call

**Location:** `frontend/app/auth/login/page.tsx` (handleLogin function)

**Flow:**
1. User submits form → `handleLogin` function is triggered
2. Validations: Form is not empty, error state cleared
3. API call: `api.post('/auth/login', { email, password })`
4. **API Configuration:** `frontend/lib/api.ts`

**API Client Setup (`frontend/lib/api.ts`):**
```typescript
let activeToken: string | null = null;

export function setApiToken(token: string | null) {
  activeToken = token;
}

function getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  return headers;
}
```

The API client:
- Stores the active JWT token in memory
- Automatically attaches `Authorization: Bearer <token>` header to authenticated requests
- Supports POST, PATCH, GET, DELETE, and upload methods

### Response Handling

On successful login:
1. Receive response with `session` object containing:
   - `access_token`: JWT token for authenticated requests
   - `refresh_token`: Mock refresh token
   - `expires_in`: Token expiration time (3600s)
   - `token_type`: 'bearer'
   - `user`: User object with id, email

2. **Update Local Session:**
   ```typescript
   updateLocalSession(data)
   ```
   Updates the AuthContext with the new session data

3. **Redirect Logic:**
   - Fetch full user profile to determine role
   - Redirect based on role:
     - `admin` → `/admin`
     - `produccion` → `/produccion`
     - `delivery` → `/delivery`
     - `client` → `/`

### Session Management - Frontend

**Location:** `frontend/context/AuthContext.tsx`

The AuthContext manages user session state:

**Context Interface:**
```typescript
interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: any | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    updateLocalSession: (data: { user: User, session: Session }) => void;
}
```

**Session Initialization:**
1. On app mount, reads from `localStorage.getItem('local_session')`
2. Parses stored session data
3. Sets `activeToken` in API client for authenticated requests
4. Sets user and session state
5. Fetches full user profile from backend (includes role, discounts, etc.)

**Updating Session (`updateLocalSession`):**
1. Sets API token
2. Updates user and session state
3. Saves to localStorage (`local_session`)
4. Fetches live user profile immediately after login

**Sign Out (`signOut`):**
1. Clears API token
2. Sets user and session state to null
3. Removes session from localStorage
4. Clears profile state

### Session Management - Backend

**Location:** `backend/src/auth/auth.service.ts` (login method)

**Authentication Flow:**

1. **Input Validation:**
   ```typescript
   const { email, password } = body;
   if (!email || !password) {
       throw new BadRequestException('Email and password are required');
   }
   ```

2. **User Lookup:**
   ```typescript
   const user = await this.usersService.findForAuth({ identifier });
   ```
   - Search by email
   - If not found, search by username (in profile.username)
   - Returns user with email, password (hashed), and role

3. **Password Verification:**
   ```typescript
   const isPasswordValid = await bcrypt.compare(password, user.password);
   ```
   - Uses bcrypt with 10 salt rounds
   - Throws UnauthorizedException if invalid

4. **JWT Token Generation:**
   ```typescript
   const payload: JwtPayload = { sub: user.id, email: user.email, role };
   const accessToken = this.jwtService.sign(payload);
   ```

5. **Response Construction:**
   ```typescript
   return {
       user: { id, email, app_metadata, user_metadata, aud, created_at },
       session: { access_token, refresh_token, expires_in, token_type, user }
   };
   ```

**Token Configuration:**
- Uses `JWT_SECRET` environment variable (or fallback)
- Expiration: 3600 seconds (1 hour) by default
- Configured in `backend/src/auth/auth.module.ts`

---

## Password Recovery Flow

### Frontend View - Forgot Password Page

**Location:** `frontend/app/auth/forgot-password/page.tsx`

The forgot password page allows users to request a password reset email.

**UI Components:**
- Email/username input field
- Submit button
- Success/error message display
- Link to return to login page

### Data Sending - Password Recovery API Call

**Location:** `frontend/app/auth/forgot-password/page.tsx` (handleSubmit function)

**Flow:**
1. User enters email or username
2. Submit button clicked
3. API call: `api.post('/auth/recover-password', { identifier })`

### Backend Recovery Process

**Location:** `backend/src/auth/auth.service.ts` (recoverPassword method)

**Process Flow:**

1. **User Lookup:**
   ```typescript
   const user = await this.usersService.findForAuth({ identifier });
   ```
   - Searches by email or username

2. **Token Generation:**
   ```typescript
   const plainToken = crypto.randomBytes(32).toString('hex');
   const hashedToken = crypto.createHash('sha256').update(plainToken).digest('hex');
   this.resetTokens.set(hashedToken, { userId, expiresAt: Date.now() + 15 * 60 * 1000 });
   ```
   - Generates 32-character random token
   - Hashes token with SHA-256
   - Stores token with 15-minute expiration

3. **Email Configuration:**
   - Priority: SMTP environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`)
   - Fallback: Ethereal email for development
   - Tests SMTP connection before sending

4. **Email Sending:**
   ```typescript
   await transporter.sendMail({
       from: '"Jhoanes Bakery, Order System" <noresponder@jhpanesbakery.com>',
       to: user.email,
       subject: "Password Recovery",
       text: `...reset link...`,
       html: `<html>...reset link...`
   });
   ```
   - Sends email with:
     - Site URL
     - Reset token URL parameter
     - HTML and plain text versions
     - Login button link

5. **Response:**
   ```typescript
   {
       message: `Thanks, password reset email sent to ${user.email}`,
       email: user.email
   }
   ```

### Token Verification and Password Reset

**Location:** `backend/src/auth/auth.service.ts` (resetPassword method)

**Process Flow:**

1. **Token Validation:**
   ```typescript
   const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
   const entry = this.resetTokens.get(hashedToken);
   if (!entry || Date.now() > entry.expiresAt) {
       throw new UnauthorizedException('Invalid or expired reset token');
   }
   ```
   - Hashes the provided token
   - Checks token exists and is not expired (15 min)

2. **Password Update:**
   ```typescript
   const hashedPassword = await bcrypt.hash(newPassword, 10);
   await this.usersService.updatePassword(userId, hashedPassword);
   ```
   - Hashes new password with bcrypt (10 rounds)
   - Updates user's password in database

3. **Cleanup:**
   ```typescript
   this.resetTokens.delete(hashedToken);
   ```
   - Removes token from memory

4. **Response:**
   ```typescript
   { message: 'Password has been successfully reset' }
   ```

**Frontend Reset Implementation:**
- Currently, no frontend page is implemented to handle `/auth/reset-password` (where users enter the new password)
- The email template contains a link to `/auth/reset-password?token=XXX`
- This page needs to be created in the frontend

---

## Authorization Flow

### Role-Based Access Control (RBAC)

**Roles Implemented:**
- `admin` - Full administrative access
- `produccion` - Production management
- `delivery` - Delivery personnel
- `client` - Regular customers

### Backend Authorization

#### Guard - AuthGuard

**Location:** `backend/src/auth/auth.guard.ts`

```typescript
@Injectable()
export class AuthGuard extends NestAuthGuard('jwt') {}
```

- Extends Passport's JWT auth guard
- Validates JWT token from Authorization header
- Automatically extracts and validates user from token

#### Decorator - @UseGuards

**Location:** `backend/src/users/users.controller.ts`

```typescript
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
    // Controller methods
}
```

- Applied to controllers to protect routes
- Combines JWT authentication with role-based authorization

#### Guard - RolesGuard

**Location:** `backend/src/auth/roles.guard.ts`

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!requiredRoles) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.role) {
            throw new ForbiddenException('User roles not found');
        }

        const hasRole = requiredRoles.includes(user.role);
        if (!hasRole) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
```

**Functionality:**
1. Retrieves required roles from `@Roles()` decorator
2. Extracts user from request
3. Checks if user has required role
4. Throws ForbiddenException if insufficient permissions

#### Decorator - @Roles

**Location:** `backend/src/auth/roles.decorator.ts`

```typescript
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

**Usage:**
```typescript
@Post(':id/avatar')
@Roles('admin')
async uploadAvatar(...) {
    // Only accessible by admin users
}
```

#### Decorator - @CurrentUser

**Location:** `backend/src/auth/user.decorator.ts`

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Populated by JwtStrategy
  },
);
```

**Usage:**
```typescript
@Get(':id')
async findOne(@CurrentUser() currentUser: any, @Param('id') id: string) {
    // currentUser.id is the logged-in user's ID
}
```

#### Strategy - JwtStrategy

**Location:** `backend/src/auth/jwt.strategy.ts`

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecretChangeMe',
    });
  }

  async validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
```

**Functionality:**
1. Extracts JWT from `Authorization: Bearer <token>` header
2. Validates token signature and expiration
3. Passes token payload to `validate()` method
4. Returns user object with id, email, role

### Example Protected Route

**Location:** `backend/src/users/users.controller.ts`

```typescript
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get(':id/avatar')
    @Roles('admin')
    async uploadAvatar(@CurrentUser() currentUser: any, @Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
        const targetId = currentUser.role === 'admin' ? id : currentUser.id;
        // Only accessible by admin users
    }
}
```

### Frontend Authorization

#### Profile Data with Role

**Location:** `frontend/context/AuthContext.tsx`

The AuthContext stores the full user profile including role:

```typescript
const [profile, setProfile] = useState<any | null>(null);

// Fetch full user profile including role
const fetchUserProfile = async (userId: string, fallbackMeta?: any) => {
    try {
        const data = await api.get(`/users/${userId}`) as any;
        setProfile({
            ...(fallbackMeta || {}),
            ...data?.profile,
            role: data?.role || fallbackMeta?.role || 'client',
            general_discount: data?.general_discount || 0,
            delivery_fee: data?.delivery_fee || 0,
            productDiscounts: data?.productDiscounts || [],
        });
    } catch {
        if (fallbackMeta) setProfile(fallbackMeta);
    }
};
```

#### Navbar Authorization Check

**Location:** `frontend/components/layout/Navbar.tsx`

```typescript
const { user, profile } = useAuth();
const isAdmin = profile?.role === 'admin' || user?.email === 'admin@test.com';

// Conditionally render admin-specific links
{isAdmin && (
    <>
        <Link href="/admin">Admin Panel</Link>
        <Link href="/admin/products">Products</Link>
    </>
)}
```

---

## Backend Controllers and Services

### AuthController

**Location:** `backend/src/auth/auth.controller.ts`

**Routes:**

1. **POST /auth/signup**
   - Registers a new user
   - Creates user and profile
   - Returns session data
   ```typescript
   @Post('signup')
   async signup(@Body() body: any) {
       return this.authService.signup(body);
   }
   ```

2. **POST /auth/login**
   - Authenticates user
   - Returns JWT session
   ```typescript
   @Post('login')
   async login(@Body() body: any) {
       return this.authService.login(email, password);
   }
   ```

3. **POST /auth/recover-password**
   - Initiates password recovery
   - Generates reset token
   - Sends recovery email
   ```typescript
   @Post('recover-password')
   async recoverPassword(@Body() body: { identifier: string }) {
       return this.authService.recoverPassword(body.identifier);
   }
   ```

4. **POST /auth/reset-password**
   - Resets password with valid token
   ```typescript
   @Post('reset-password')
   async resetPassword(@Body() body: any) {
       return this.authService.resetPassword(token, newPassword);
   }
   ```

5. **PATCH /auth/change-password**
   - Changes password for logged-in user
   - Requires authentication
   ```typescript
   @Patch('change-password')
   @UseGuards(AuthGuard('jwt'))
   async changePassword(@CurrentUser() currentUser: any, @Body() body: any) {
       return this.authService.changePassword(currentUser.id, currentPassword, newPassword);
   }
   ```

### AuthService

**Location:** `backend/src/auth/auth.service.ts`

**Key Methods:**

#### `signup(body: any)`
1. Validates email not already registered
2. Validates password length (< 72 chars)
3. Hashes password with bcrypt (10 rounds)
4. Creates user entity
5. Creates user profile
6. Generates JWT token
7. Returns session with token

#### `login(identifierInput: string, password: string)`
1. Trims and lowercases identifier
2. Finds user by email or username
3. Verifies password with bcrypt
4. Generates JWT token
5. Returns session data

#### `recoverPassword(identifier: string)`
1. Finds user by email or username
2. Generates secure random token (32 bytes)
3. Hashes token with SHA-256
4. Stores token with 15-minute expiration
5. Configures SMTP (or falls back to Ethereal)
6. Sends email with reset link
7. Returns success message

#### `resetPassword(token: string, newPassword: string)`
1. Validates token format
2. Hashes token and checks in memory store
3. Verifies token is not expired
4. Hashes new password with bcrypt
5. Updates user's password in database
6. Removes token from memory
7. Returns success message

#### `changePassword(userId: string, currentPassword: string, newPassword: string)`
1. Finds user by ID
2. Verifies current password with bcrypt
3. Hashes new password with bcrypt
4. Updates user's password
5. Returns success message

### UsersService

**Location:** `backend/src/users/users.service.ts`

**Key Methods:**

#### `findForAuth(criteria: { id?: string; identifier?: string })`
- Searches user by ID or identifier (email/username)
- Returns minimal user data (id, email, password, role, profile)

#### `findByEmail(email: string)`
- Full user lookup with profile relations

#### `updatePassword(userId: string, newPassword: string)`
- Updates password in database

#### `updateProfile(userId: string, profileData: Partial<Profile>)`
- Updates or creates user profile

#### `updateRole(id: string, role: string)`
- Admin-only: changes user's role

### AuthModule

**Location:** `backend/src/auth/auth.module.ts`

**Dependencies:**
- UsersModule
- PassportModule (JWT strategy)
- JwtModule (JWT service)

**Configuration:**
```typescript
JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET') || 'defaultSecretChangeMe',
    signOptions: {
      expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '3600s') as any,
    },
  }),
  inject: [ConfigService],
})
```

---

## Security Considerations

### Password Security
- **Hashing:** bcrypt with 10 salt rounds
- **Token Storage:** SHA-256 hashed tokens stored in memory with expiration
- **Reset Token:** 32-byte random token, 15-minute expiration
- **JWT Secret:** Configured via environment variable

### Session Management
- **Frontend:** Session stored in localStorage (`local_session`)
- **Backend:** Token stored in memory (reset tokens), JWT in headers
- **Expiration:** 1 hour for JWT tokens
- **Invalidate:** Clear on sign-out

### Authorization
- **Role-Based Access Control:** 4 roles (admin, produccion, delivery, client)
- **Guard Strategy:** Combines JWT authentication with role verification
- **Decorator Pattern:** `@Roles()` and `@CurrentUser()` for protecting routes

### Email Security
- **SMTP Configuration:** Environment variables preferred
- **Fallback:** Ethereal email for development
- **Security:** Tokens in URL parameters (not emails)

---

## Areas for Improvement

1. **Reset Password Page:** Implement frontend page at `/auth/reset-password` to handle password reset with token
2. **Refresh Token:** Implement refresh token mechanism for handling expired JWTs
3. **Rate Limiting:** Add rate limiting to login and password recovery endpoints
4. **Password Requirements:** Implement password strength requirements
5. **Audit Logging:** Log failed login attempts and password changes
6. **Token Revocation:** Implement mechanism to revoke tokens (logout from all devices)
7. **CSRF Protection:** Add CSRF tokens for state-changing operations
8. **HTTPS:** Enforce HTTPS in production
9. **Environment Variables:** Move sensitive secrets to production environment
10. **Token Storage:** Consider using httpOnly cookies instead of localStorage

---

## Flow Diagrams

### Authentication Flow
```
User → Login Page → Submit Form
    → API POST /auth/login
    → AuthController.login
    → UsersService.findForAuth
    → Password Verification (bcrypt.compare)
    → JWT Token Generation (jwt.sign)
    → Response with Session
    → Frontend: updateLocalSession
    → Session stored in localStorage
    → API Token set for authenticated requests
    → Redirect based on role
```

### Password Recovery Flow
```
User → Forgot Password Page → Enter Email/Username
    → API POST /auth/recover-password
    → AuthController.recoverPassword
    → UsersService.findForAuth
    → Generate 32-byte random token
    → Hash token (SHA-256)
    → Store token with 15-min expiration
    → Send Email (SMTP/Ethereal)
    → Email contains: /reset-password?token=XXX
    → User clicks link
    → (Frontend reset page needed)
    → User enters new password
    → API POST /auth/reset-password?token=XXX
    → AuthController.resetPassword
    → Validate token (hash + expiration)
    → Hash new password (bcrypt)
    → Update user password
    → Remove token from memory
    → Response: Success
```

### Authorization Flow
```
Protected Route Request
    → Authorization Header: Bearer <token>
    → Passport AuthGuard
    → Extract JWT from header
    → Validate token signature & expiration
    → JwtStrategy.validate()
    → Extract payload (sub, email, role)
    → Return user object
    → @CurrentUser() decorator extracts user
    → @UseGuards(AuthGuard, RolesGuard)
    → RolesGuard.canActivate()
    → Get required roles from @Roles decorator
    → Check if user.role in requiredRoles
    → Allow access if authorized
    → Execute controller method
    → Return response or 403 Forbidden
```

---

## Configuration

### Environment Variables (Required)

**Authentication:**
- `JWT_SECRET`: Secret for signing JWT tokens
- `JWT_EXPIRES_IN`: Token expiration time (default: 3600s)

**Database:**
- `DATABASE_PATH`: Path to SQLite database (default: `database.sqlite`)

**Email:**
- `SMTP_HOST`: SMTP server host
- `SMTP_PORT`: SMTP server port (default: 587)
- `SMTP_SECURE`: Whether to use SSL/TLS (boolean)
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password

**Application:**
- `SITE_URL`: Base URL for the application (default: http://localhost:3000)

### Token Configuration

- **JWT Token:** Access token only (1 hour expiration)
- **Reset Token:** Single-use, 15-minute expiration
- **Storage:** SHA-256 hashed tokens in memory
- **Transport:** Tokens sent via URL parameters in email

---

## Test Coverage

**Location:** `backend/src/auth/auth.service.spec.ts`

Tests include:
- Signup success and validation
- Login validation and authentication
- Password recovery email sending
- Password reset with valid/invalid tokens
- Password change with valid/invalid current password

---
