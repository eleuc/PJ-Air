# NestJS Backend API Reference

This document provides a highly compact, structured directory of all REST endpoints exposed on `http://localhost:3001` (CORS-enabled), along with our security isolation guidelines.

---

## 1. Security Architecture & Scoping

1. **Authentication (JWT):** All secured endpoints require an `Authorization: Bearer <JWT_TOKEN>` header. Passport validates the signature and populates `@CurrentUser()`.
2. **Authorization (RBAC):** Restricts administrative functions (`GET /users`, catalog modifications, custom discounts, delivery reassignments) using `@Roles('admin')` and a custom global `RolesGuard`.
3. **Tenant Isolation:** Standard clients are strictly sandboxed. Handlers discard external `userId` request fields and implicitly bind transactions to `@CurrentUser().id`. 
4. **Information Concealment:** To prevent endpoint enumeration, requesting data of another user (such as order lookups or user address lists) returns `404 Not Found` rather than `403 Forbidden` for standard users. Admins can bypass this boundary safely.

---

## 2. API Endpoint Directory

### 2.1. Authentication Module (`/auth`)
Handles signup, login session creation, password recoveries, and active session password changes.

| Method & Path | Access | Request Body | Behavior / Notes |
| :--- | :--- | :--- | :--- |
| `POST /auth/signup` | Public | `{ email, password, full_name, phone, company_name }` | Registers user, hashes password, and spins up an empty profile. |
| `POST /auth/login` | Public | `{ email, password }` | Verifies credentials and returns a Bearer JWT access token. |
| `POST /auth/recover-password`| Public | `{ identifier }` | Triggers recovery (generates temporary recovery token). |
| `POST /auth/reset-password` | Public | `{ token, newPassword }` | Overwrites password with new credentials using a valid token. |
| `PATCH /auth/change-password` | JWT User | `{ currentPassword, newPassword }` | Standard password rotation for the active logged-in user. |

---

### 2.2. Users Module (`/users`)
Enables user directory listing, profile modifications, role promotions, and discount configurations.

| Method & Path | Access | Payload / Params | Behavior & Tenant Isolation |
| :--- | :--- | :--- | :--- |
| `GET /users` | Admin Only | None | Fetches all registered users, profiles, and billing configurations. |
| `GET /users/:id` | JWT User | Path: `id` | Fetches account details. **Non-admins are auto-scoped to own ID.** |
| `PATCH /users/:id/profile` | JWT User | `{ full_name, username, phone, company_name }` | Updates profile data. **Non-admins are auto-scoped to own ID.** |
| `PATCH /users/:id/role` | Admin Only | `{ role }` | Promotes/demotes user roles (e.g., `'admin'`, `'client'`). |
| `POST /users/:id/avatar` | JWT User | Form-Data: `file` (avatar) | Uploads profile image to `/uploads/avatars`. **Scoped to own ID.** |
| `PATCH /users/:id/general-discount` | Admin Only | `{ discount }` | Configures global percentage discount for all orders of a client. |
| `PATCH /users/:id/delivery-fee` | Admin Only | `{ fee }` | Configures standard flat delivery shipping fee for a client. |
| `GET /users/:id/product-discounts` | JWT User | Path: `id` | Lists active custom product-specific pricing. **Scoped to own ID.** |
| `POST /users/:id/product-discounts` | Admin Only | `{ productId, discount_percentage?, special_price? }` | Binds custom direct pricing or specific percentage discount to a user. |
| `DELETE /users/product-discounts/:discountId`| Admin Only| Path: `discountId` | Deletes a customized product-pricing rule. |

---

### 2.3. Products Module (`/products`)
Enables catalog searches, and administrative catalog additions, category batch-edits, and file imports.

| Method & Path | Access | Payload / Params | Behavior / Notes |
| :--- | :--- | :--- | :--- |
| `GET /products` | Public | None | Retrieves entire active product catalog. |
| `GET /products/category/:category`| Public | Path: `category` | Filters catalog products by category category string. |
| `GET /products/:id` | Public | Path: `id` (integer) | Fetches specific product data. |
| `POST /products` | Admin Only | `{ name, category, category_en, price, description, image, category_min_qty }` | Adds a new product record to the catalog. |
| `PATCH /products/rename-category` | Admin Only | `{ oldName, newName, newNameEn, minQty }` | Bulk updates category configuration and name across all its products. |
| `PATCH /products/:id` | Admin Only | Product fields | Updates specific product details by its numeric ID. |
| `DELETE /products/:id` | Admin Only | Path: `id` (integer) | Removes a product record from the catalog. |
| `POST /products/upload-image` | Admin Only | Form-Data: `file` (image) | Uploads product image. Saves as unique hexadecimal in `/uploads/products`. |
| `POST /products/upload` | Admin Only | Form-Data: `files` (with CSV) | Bulk imports product rows from a parsed catalog CSV. |

---

### 2.4. Orders Module (`/orders`)
Core transactional endpoints for checkout, status updates, reporting, and fulfillment.

| Method & Path | Access | Payload / Params | Behavior & Tenant Isolation |
| :--- | :--- | :--- | :--- |
| `POST /orders` | JWT User | `{ address_id, delivery_type, notes, items: [{ product_id, quantity }] }` | Generates a new purchase order. **Implicitly scoped to own ID.** |
| `GET /orders` | Admin Only | None | Lists all orders placed across the system. |
| `GET /orders/user/:userId` | JWT User | Path: `userId` | Lists orders for user. **Non-admins restricted to own ID (404 on mismatch).** |
| `GET /orders/reports/range` | Admin Only | Query: `startDate`, `endDate`, `userId?` | Lists orders within timeframe for reporting/analytics. |
| `GET /orders/:id` | JWT User | Path: `id` | Fetches single order details. **Non-admins must own order (else 404).** |
| `PATCH /orders/:id/status` | Admin Only | `{ status }` | Updates fulfillment state (e.g. `dispatched`, `delivered`). |
| `PATCH /orders/:id/assign` | Admin Only | `{ deliveryUserId }` | Assigns a driver or delivery person to an order. |
| `PATCH /orders/:id` | Admin Only | Order fields | Direct administrative modification of order attributes. |

---

### 2.5. Addresses Module (`/addresses`)
Coordinates customer billing, shipping, and geographic tracking entries.

| Method & Path | Access | Request Body / Params | Behavior & Tenant Isolation |
| :--- | :--- | :--- | :--- |
| `POST /addresses` | JWT User | `{ alias, address, zone?, city?, lat?, lng?, is_default? }` | Creates address record. **Implicitly scoped to own ID.** |
| `GET /addresses/user/:userId`| JWT User | Path: `userId` | Lists user's saved addresses. **Non-admins scoped to own ID (else 404).** |
| `PATCH /addresses/:id` | JWT User | Address fields | Modifies saved address fields. **Non-admins restricted to own addresses.** |
| `DELETE /addresses/:id` | JWT User | Path: `id` | Deletes saved address record. **Non-admins restricted to own addresses.** |

---

### 2.6. Devtools & General Modules (`/devtools` & `/`)
Development utility seeding and base server check.

| Method & Path | Access | Behavior / Notes |
| :--- | :--- | :--- |
| `POST /devtools/seed` | Admin Only | Wipes and seeds mock catalog products database. |
| `POST /devtools/seed-admin` | Admin Only | Wipes and seeds core test users (admins/clients). |
| `POST /devtools/seed-reports` | Admin Only | Wipes and seeds transaction history mock reports. |
| `GET /` | Public | Core API base health check endpoint. Returns "Hello World!". |
