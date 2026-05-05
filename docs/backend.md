# Backend Architecture & Map

This document provides a comprehensive overview of the backend structure. The backend is built using the **NestJS** framework and utilizes **TypeORM** for database interactions.

## 1. Complete File Index

Below is the exhaustive list of all files and directories within the `backend/` folder and their purposes.

### Root Files
- `.env`: Environment variables configuration file.
- `.prettierrc`: Prettier formatting rules.
- `Dockerfile`: Instructions to build the Docker image for the backend.
- `README.md`: Basic NestJS readme file.
- `database.sqlite`: The primary SQLite database file containing all application data.
- `database.sqlite.bak`: Backup of the primary SQLite database.
- `debug-users.js`: Utility script to debug or list user data from the database.
- `deduplicate-images.js`: Script to identify and remove duplicate product images.
- `eslint.config.mjs`: ESLint configuration file for code linting.
- `final_import_check.json`: Output from a data verification/import process.
- `final_products.json`: Processed product data ready for import.
- `final_verification_products.json`: Product data used for final data verification.
- `generate_sql.js`: Script to generate SQL commands (likely for remote migrations).
- `import-resource-images.js`: Script to map and import images from a resource folder.
- `nest-cli.json`: Configuration file for the NestJS CLI.
- `normalize-images.js`: Utility script to normalize image filenames.
- `normalized_products.json`: Product data mapped to normalized image paths.
- `package-lock.json`: Exact dependency tree lockfile.
- `package.json`: Project metadata and npm dependency list.
- `products_data.json`: JSON dump or source file of raw product data.
- `products_debug.json`: JSON dump used for debugging product data.
- `remote_img_update.tar.gz`: Archive containing images intended for a remote server update.
- `reset-test-users.js`: Script to reset test user accounts to their default state.
- `run_remote_sql.js`: Script to execute SQL commands directly on a remote database.
- `schema.sql`: SQL file containing the database schema definition.
- `seed-specific-client.js`: Script to seed the database with a specific client user for testing.
- `seed-test-users.js`: Script to seed the database with generic test users.
- `test-login-endpoint.js`: Script to test the login HTTP endpoint.
- `test-login-logic.ts`: TypeScript file for testing login authentication logic.
- `test-login.js`: Basic script to test user login.
- `test-product-discount.js`: Script to test the product discount calculation logic.
- `test-users.js`: Script to manage or test user accounts.
- `tsconfig.build.json`: TypeScript configuration specifically for building the application.
- `tsconfig.json`: Main TypeScript configuration file.
- `update_remote_images.sql`: SQL commands to update image paths in a remote database.

### Auto-Generated & Asset Directories
- `dist/`: Directory containing the compiled JavaScript output of the NestJS application.
- `node_modules/`: Directory containing npm dependencies.
- `uploads/`: Directory where uploaded files (like product images and CSVs) are stored locally.

### Scripts (`scripts/`)
- `deploy-data.js`: Script to deploy or synchronize data.
- `import-jhoanes-3.js`: Specific script to import legacy data or catalog items.
- `sync-images-by-name.js`: Script to synchronize image files by matching their names.

### Tools (`tools/`)
- `check-recent-products.js`: Utility to verify recently added products.
- `check-schema.js`: Utility to validate the database schema.
- `fix-images.js`: Utility to fix broken or missing image links.
- `import-products.js`: Utility to import products from external sources.
- `list-categories.js`: Utility to list all product categories.
- `list-root-categories.js`: Utility to list root-level categories.

### Test (`test/`)
- `app.e2e-spec.ts`: End-to-end tests for the root application endpoints.
- `jest-e2e.json`: Jest configuration for running e2e tests.

### Source Code (`src/`)

**Root Source Files:**
- `app.controller.spec.ts`: Unit tests for the root controller.
- `app.controller.ts`: Root controller exposing basic endpoints.
- `app.module.ts`: Root application module tying everything together.
- `app.service.ts`: Root service providing basic shared logic.
- `main.ts`: The bootstrap entry point for the application.

**Addresses Module (`src/addresses/`):**
- `address.entity.ts`: Schema for storing physical locations.
- `addresses.controller.ts`: Endpoints for managing user addresses.
- `addresses.module.ts`: Module definition for addresses.
- `addresses.service.spec.ts`: Unit tests for the addresses service.
- `addresses.service.ts`: Business logic for creating, updating, and fetching addresses.

**Auth Module (`src/auth/`):**
- `auth.controller.ts`: Endpoints for login, signup, password recovery, and password changes.
- `auth.guard.ts`: NestJS Guard to protect routes requiring authentication.
- `auth.module.ts`: Module definition for authentication.
- `auth.service.spec.ts`: Unit tests for the auth service.
- `auth.service.ts`: Implements authentication verification and recovery via email.
- `roles.guard.ts`: NestJS Guard for role-based authorization.

**Devtools Module (`src/devtools/`):**
- `devtools.controller.ts`: Development-only endpoints to seed database.
- `devtools.module.ts`: Module definition for devtools.
- `devtools.service.spec.ts`: Unit tests for the devtools service.
- `devtools.service.ts`: Logic to wipe and seed the database with mock data.
- `products.seed.ts`: Seed data representing products for development.

**Orders Module (`src/orders/`):**
- `order-item.entity.ts`: Schema for individual line items in an order.
- `order.entity.ts`: Schema for a purchase order.
- `orders.controller.ts`: Endpoints for generating and tracking orders.
- `orders.module.ts`: Module definition for orders.
- `orders.service.spec.ts`: Unit tests for the orders service.
- `orders.service.ts`: Business logic for order management, status updates, and reports.

**Products Module (`src/products/`):**
- `product.entity.ts`: Schema for products in the catalog.
- `products.controller.ts`: Endpoints for product CRUD and uploads.
- `products.module.ts`: Module definition for products.
- `products.service.spec.ts`: Unit tests for the products service.
- `products.service.ts`: Business logic for catalog management and CSV processing.

**Users Module (`src/users/`):**
- `product-discount.entity.ts`: Schema mapping specific product discounts to users.
- `profile.entity.ts`: Schema for extended user information (name, avatar, phone).
- `user.entity.ts`: Schema for core authentication data.
- `users.controller.ts`: Endpoints for user profile and discount management.
- `users.module.ts`: Module definition for users.
- `users.service.spec.ts`: Unit tests for the users service.
- `users.service.ts`: Business logic for users, roles, avatars, and discounts.

---

## 2. Additional Information: Flow and Architecture

### 2.1. Starting Points and Application Flow
- **`src/main.ts`**: Initializes the NestJS server instance using Express under the hood, configures CORS for client communication, and explicitly serves static assets (like uploaded images) from the `uploads/` directory on port 3001.
- **`src/app.module.ts`**: The root module that registers global configurations, initializes the TypeORM database connection, and imports all the domain-specific feature modules.
- **Application Flow**: 
  1. An HTTP Request hits the NestJS server.
  2. The routing mechanism directs it to the appropriate **Controller** (e.g., `ProductsController`).
  3. The Controller parses the request, extracts parameters/bodies, and delegates the task to a **Service** (e.g., `ProductsService`).
  4. The Service executes business logic and uses TypeORM **Repositories** to interact with the database.
  5. Data is retrieved, manipulated, and returned through the Controller back to the client.

### 2.2. Data Sources
- **Relational Database (`database.sqlite`)**: The backend uses SQLite as its primary persistent store. TypeORM automatically synchronizes the entities to this file in development. It contains all relational data including users, products, orders, and addresses.
- **File System (`uploads/` & Frontend Assets)**: 
  - Product images and bulk CSV files are uploaded and saved to the `uploads/` directory within the backend context using Multer.
  - User avatars uploaded via the backend are saved directly to the frontend's `public/images/avatars` folder, serving as a cross-boundary data interaction.

### 2.3. Modules Functional Breakdown

- **Auth Module**: Manages authentication, registration, and credential recovery using sessions and Nodemailer.
- **Users Module**: Manages user accounts, extended profile information, roles, and personalized business rules (global or per-product discounts).
- **Products Module**: Manages the catalog of products and inventory categories. Handles single image uploads and bulk CSV parsing.
- **Orders Module**: The core transactional module handling the creation, tracking, and modification of purchase orders, along with audit logging in the order's notes.
- **Addresses Module**: Management of user shipping and billing addresses.
- **Devtools Module**: A utility module designed strictly for development environments to seed the database with mock data.
