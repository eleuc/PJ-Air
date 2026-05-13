# Pedidos Jhoanes

A modern full-stack web application with a **NestJS** backend and a **Next.js** (React) frontend. The system manages product catalogs, user accounts with roles and discounts, transactional shopping orders, and administrative reports.

---

## 📂 Project Structure

This repository is split into two main directory workspaces:

- **[frontend/](frontend)**: A Next.js (React) modern single-page application utilizing TailwindCSS (v4) for premium user interfaces and styling.
- **[backend/](backend)**: A NestJS application that provides a robust REST API, backed by TypeORM with an SQLite database ([database.sqlite](database.sqlite)).
- **[docs/](docs)**: Documentation directory.
  - For an exhaustive technical reference detailing backend structure, modules, data flow, and database schema, please refer to the detailed [docs/backend.md](docs/backend.md).

---

## 🚀 Getting Started

### 1. Prerequisites & Environment Setup

Ensure you have Node.js installed on your machine. Both `frontend` and `backend` directories contain their respective `package.json` with dependency lists.

#### 🪟 Windows Compatibility (Native Dependency Compilation)

If you are running on Windows and encounter errors compiling native C++ dependencies (like `better-sqlite3` or `sqlite3`), it is because `node-gyp` requires Python and Visual C++ compiler workloads to compile from source.

You can install these easily using **Windows Package Manager (`winget`)** from an elevated **Administrator PowerShell** window:

1. **Install Python**:

   ```powershell
   winget install -e --id Python.Python.3.11
   ```

2. **Install VS Build Tools (C++ Workload)**:

   ```powershell
   winget install -e --id Microsoft.VisualStudio.2022.BuildTools --override "--add Microsoft.VisualStudio.Workload.VCTools --add Microsoft.VisualStudio.Component.Windows11SDK.22621 --passive"
   ```

3. **Restart your Terminal & IDE** to reload your environment variables.

4. **(Optional)** If npm still fails to find Python, link it manually:
   ```powershell
   npm config set python "C:\Program Files\Python311\python.exe"
   ```

_Note: I tried this fix and did not work, stopped seeing this error by ignoring npm scripts, but for new installations with this issue, update this section with the complete fix._

### ⚙️ Configuration & Environment Variables

This project uses a unified configuration model to manage environment variables across both frontend and backend workspaces.

1. **Centralized Root `.env`**: All configurations are housed in a single `.env` file located in the root of the repository. No local environment files should be committed in sub-directories.
2. **Generating/Synchronizing Configuration (`update-env`)**:
   We provide a utility script to merge local environment parameters and automatically inject overrides for remote environments:
   * **Local Development (Default)**:
     ```bash
     npm run update-env
     ```
   * **Staging Server Overrides**:
     ```bash
     npm run update-env -- --staging
     ```
   * **Production Server Overrides**:
     ```bash
     npm run update-env -- --prod
     ```
3. **Ports Decoupling**:
   * **Backend**: Bound to `BACKEND_PORT` (defaults to `3001`).
   * **Frontend**: Bound to `FRONTEND_PORT` (defaults to `3000`), managed using `cross-var` inside `frontend/package.json` for cross-platform expansion.
4. **Local Startup**:
   Running `npm run dev` at the root automatically wraps the child execution using `dotenv-cli` to feed the root `.env` values directly into the workspace processes.

---

### 2. Start the Development Environment

Follow these steps to clean ports and spin up both servers locally:

1.  **Clear Conflicts (Ports)**: Ensure no lingering process is running on the default backend port `3001` (Windows PowerShell command):

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue
```

2.  **Start the Backend API Server**:

```bash
cd backend
npm run start:dev
```

The server will start on [http://localhost:3001](http://localhost:3001).

3.  **Start the Frontend Client**:

```bash
cd frontend
npm run dev
```

The UI client will run on [http://localhost:3000](http://localhost:3000).

---

## 🧪 Running Tests

All automated tests are structured using the Jest framework and are located inside the `backend` directory. For detail on testing strategies, see the complete [.agent/plan.md](.agent/plan.md).

Navigate to the `backend` folder first:

```bash
cd backend
```

### Unit & Integration Tests

Runs tests targeting services, controllers, and TypeORM entities:

```bash
# Run all unit/integration tests
npm run test

# Run tests in live watch mode
npm run test:watch

# Generate test coverage reports
npm run test:cov
```

### End-to-End (E2E) Tests

Runs tests validating complete request-response flows with a test database:

```bash
npm run test:e2e
```

### Run Specific Test Files

To target a specific test suite or matching case description:

```bash
# Run a single file
npx jest src/users/users.service.spec.ts

# Run matching tests by pattern
npx jest -t "should calculate product price"
```

## Future Work

## Setup

Setting up the application involves multiple complex stages, which aren't fully documented nor consistently located.
The best approach is to implement all of these as scripts, rather than documenting the process, and then point users and admins to the necessary scripts at each stage.

- **Install**: Involves cloning the repository and installing node dependencies.
  - The dependency situation for scripts is not resolved.
  - There are also SO MANY SCRIPTS EVERYWHERE. Probably most of them are useless, but the useful ones are still all over the place. Requires consolidation and cleanup.
- **Build**: Both backend and frontend have to be built separately
  - Frontend needs `NEXT_PUBLIC_API_URL` env configured in [frontend/.env.local] to point to the api host (undocumented)
    - I think development DOES NOT need this. Very confusing.
- **Deploy**: Configure nginx site, ensure certificates. Only for remote envionments, production and staging
- **Start**: Start both frontend and backend servers, which run separately
  - Backend may need [backend/.env] configured for some things (undocumented)
  - Production and staging use pm2 with ecosystem configs
  - Development simply launch them manually in the terminal (undocumented)
  - Backend has `npm run start:prod` which sometimes is used but it's unclear when
  - Both frontend and backend have `npm run start` that uses a different script than pm2. Inconsistent!
- **Update**: Involves pulling changes, rebuilding, and restarting the pm2 processes. Likely also requires repeating install and deploy.
- **Other Stages**: In the chaos, there are other steps necessary to run the application correctly that don't quite fit in the previous stages, although they should
  - Seeding data
  - Testing?
  - Monitoring uptime is completely missing. It could be done from a user machine or from the server.

There is a lot of important local configuration to setup, depending on the setup stage, environment, and binary (frontend/backend), and it's also not located consistently. These could be potentially generated as part of the setup process, but more importantly, properly consolidated with time.

- pm2 ecosystem script
- nginx site config
- env variables (local and pm2 defined?)

## Issues

Errores reportados en produccion:

- Agregar fecha de entrega configurable en checkout.
- Todo el programa mezcla ingles y español por tolao.
- Recuperar Contraseña no funciona.
- En profile/adresses/new, el mapa embedido muestra el mensaje "This page can't load Google Maps correctly.", pero el mapa si funciona
- En checkout, la cantidad de un producto no es modificable a mano, solo con los botones de + y -
  - En la lista de productos si se puede modificar. Se deben combinar ambos como el mismo componente.
- Estoy seguro de que la seleccion de mapa en checkout "Other Address" es diferente que la de addresses/new. Tambien deben compartir componente.
- Contraseñas se guardan sin hashear.
- El pdf generado al imprimir reporte incluye el mismo boton de imprimir.
- En el panel de informacion de usuario en admin/users, un pedido sin procesar muestra "Pedido Enviado".Buscar otra terminologia para evitar confusiones.
- El boton "Ver Detalle" de pedido en la info de usuarios en admin no funciona bien.
- Usuarios tipo produccion y delivery no tienen dashboard.
- No se puede subir foto de avatar. Se muestra como un archivo roto.
- En admin/users al agregar descuento por producto, se muestran las dos opciones de precio fijo y descuento a la vez. Deberia verse una sola porque es confuso.
- Los descuentos o precios adicionales registrados al usuario no se aplican. Ni en el checkout, ni en la orden final.
- Hacer configuable los tipos de flota.
- admin/orders
  - no se puede asignar.
  - info de pedido muestra "Linea de Tiempo" cuando deberia ser "Estado".
  - estado por defecto es "Pedido Enviado", que no aparece en la lista de estados disponibles, y de paso es bien confuso.
  - En info, logistica de entrega, deberia ser asignable tambien, no solo en la lista principal.
  - Linea de Productos no muestra el titulo del producto, sino el default "Articulo Invitado".
  - WTF es "Archivar Cierre"? el boton no hace nada. Probablemente deberia ser "Eliminar Orden", con sus respectivos chequeos de seguridad.
- Unificar componentes de tablas en cada categoria en admin.
- Eliminar categoria de clientes en admin, es redundante.

## Authentication Context (JWT `userId` Inference)

Currently, several backend endpoints expect the `userId` to be provided explicitly in the request body or URL parameters instead of securely inferring it from the authenticated user's JWT session. This bypasses proper tenant isolation and could theoretically allow unauthorized access if a user supplies another user's ID.

The following endpoints need to be refactored to extract `req.user.id` via an `AuthGuard`:

- **Users Module**: Most profile endpoints (`PATCH /users/:id/profile`, `POST /users/:id/avatar`, `PATCH /users/:id/role`, `PATCH /users/:id/general-discount`) fully trust the `:id` URL parameter.
- **Auth Module**: `PATCH /auth/change-password` expects `userId` inside the JSON body payload.
- **Addresses Module**: `POST /addresses` expects `userId` in the body payload, and `GET /addresses/user/:userId` expects it in the URL.
- **Orders Module**: `POST /orders` expects `userId` in the body payload, and `GET /orders/user/:userId` expects it in the URL.

_Note: For administrative workflows, an override option to pass a specific `userId` can be preserved (e.g. `GET /orders/reports/range?userId=xxx`), but standard user operations must default strictly to their own authenticated session context._

## Security & Authorization Testing Gaps

While the project has an extensive testing plan, several critical security validation tests are currently skipped or unimplemented:

- **Tenant Isolation Boundaries**: Tests preventing users from accessing or modifying other users' addresses or orders (`resource-ownership.e2e-spec.ts`) are currently bypassed (`it.skip`).
- **Role-Based Access Control (RBAC)**: Tests ensuring standard users cannot access administrative product and user management endpoints (`roles-guard.e2e-spec.ts`) are currently bypassed (`it.skip`).
- **Production Environment Hardening**: The validation to ensure potentially dangerous `Devtools` wiping and seeding endpoints are strictly disabled in production is not actively enforced.
- **Bootstrapping Security**: Integration validations for Cross-Origin Resource Sharing (CORS) configurations are currently missing.

---

## Ideas

_These are suggestions for future enhancements, not currently planned on the active roadmap and require further consideration._

- **Third-Party Payment Gateways**: Integrating and testing external payment processors (e.g., Stripe, PayPal) within the current checkout flow.
- **Rate Limiting & Throttling**: Implementing strict endpoint protections against brute-force and DDoS attacks (e.g., `@nestjs/throttler`).
- **Performance & Load Testing**: Stress-testing the application under high concurrency to validate inventory deduction integrity and database locks.
- **Security Vulnerability Audits**: Adding explicit tests against common OWASP threats such as SQL Injection, XSS, and CSRF payloads.
- **Environment Validation**: Adding strict startup validation schemas to ensure the application fails fast if critical environment variables are missing or misconfigured.
