# Security Implementation Plan

This plan addresses critical security vulnerabilities identified in the Pedidos Jhoanes application, focusing on authentication, authorization, data protection, and environment hardening.

## 1. Password Security (Hashing)
**Goal**: Eliminate plain-text password storage.

- **Dependencies**: Install `bcrypt` and `@types/bcrypt`.
- **Implementation**:
    - `AuthService`: 
        - Update `register` (or equivalent user creation method) to hash passwords using `bcrypt.hash()` before saving to the database.
        - Update `validateUser` to use `bcrypt.compare()` instead of string equality.
    - **Migration**: Create a script to hash existing plain-text passwords in the `User` entity/database or implement a "hash-on-login" mechanism.
- **Edge Cases**:
    - Handling extremely long passwords (bcrypt has a 72-byte limit).
    - Ensuring the salt rounds are consistent (e.g., 10).

## 2. Robust Authentication (JWT)
**Goal**: Replace fake tokens with cryptographically signed JWTs.

- **Dependencies**: Install `@nestjs/jwt`, `passport-jwt`, and `@nestjs/passport`.
- **Implementation**:
    - `AuthService`: Implement `login` method to return a signed JWT containing `userId` and `role`.
    - `JwtStrategy`: Create a new strategy to validate the JWT from the `Authorization: Bearer <token>` header and populate `req.user`.
    - `AuthGuard`: Update to extend `AuthGuard('jwt')` from `@nestjs/passport`.
- **Pitfalls**:
    - Token expiration: Set a reasonable `expiresIn` value.
    - Secret management: Use an environment variable for the JWT secret.

## 3. Role-Based Access Control (RBAC)
**Goal**: Enforce access restrictions for administrative endpoints.

- **Implementation**:
    - `RolesGuard`: Update to check the `user.role` from `req.user` against the metadata provided by `@Roles()` decorator.
    - Return `ForbiddenException` if the user lacks the required role.
- **Verification**:
    - Ensure `RolesGuard` is applied after `AuthGuard` in the global or controller level.

## 4. Tenant Isolation (Identity Inference)
**Goal**: Prevent users from accessing or modifying data belonging to other users.

- **Refactoring**:
    - Instead of trusting `userId` from `@Body()` or `@Param(':id')`, use `req.user.id` provided by the `AuthGuard`.
    - **Users Module** (`UsersController`):
        - `PATCH /users/:id/profile` $\rightarrow$ Use `req.user.id`.
        - `POST /users/:id/avatar` $\rightarrow$ Use `req.user.id`.
        - `PATCH /users/:id/role` $\rightarrow$ Keep `:id` but ensure requester is `ADMIN`.
    - **Auth Module** (`AuthController`):
        - `PATCH /auth/change-password` $\rightarrow$ Use `req.user.id`.
    - **Addresses Module** (`AddressesController`):
        - `POST /addresses` $\rightarrow$ Use `req.user.id`.
        - `GET /addresses/user/:userId` $\rightarrow$ Use `req.user.id` unless requester is `ADMIN`.
    - **Orders Module** (`OrdersController`):
        - `POST /orders` $\rightarrow$ Use `req.user.id`.
        - `GET /orders/user/:userId` $\rightarrow$ Use `req.user.id` unless requester is `ADMIN`.
- **Admin Overrides**: Maintain the ability for administrators to view/edit other users' data by checking for the `ADMIN` role before falling back to the URL parameter.

## 5. Environment Hardening
**Goal**: Disable dangerous tools and restrict network access in production.

- **Devtools Protection**:
    - `DevtoolsController`: Implement a guard or check `process.env.NODE_ENV` in every method to ensure endpoints like `/seed` are disabled in `production`.
- **CORS Configuration**:
    - `main.ts`: Replace `app.enableCors()` with a configuration that restricts `origin` to the trusted frontend URL in production.
- **Secret Management**:
    - Ensure all sensitive keys (JWT secret, etc.) are moved to `.env` and not hardcoded.

## 6. Verification & Testing
**Goal**: Validate that fixes work and no regressions were introduced.

- **Enable Skipped Tests**:
    - `resource-ownership.e2e-spec.ts`: Verify that User A cannot access User B's orders.
    - `roles-guard.e2e-spec.ts`: Verify that non-admins cannot access admin endpoints.
- **Manual Audit**:
    - Test the "Password Recovery" flow to ensure plain-text passwords are no longer sent.
    - Verify that modifying the `userId` in the request body no longer changes the target resource.
