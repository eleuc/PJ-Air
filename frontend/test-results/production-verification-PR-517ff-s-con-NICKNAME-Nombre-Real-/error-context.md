# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: production-verification.spec.ts >> PROD — Verificación Visual de Producción >> PROD-03 — Admin puede ver listado de clientes con NICKNAME (Nombre Real)
- Location: tests\production-verification.spec.ts:49:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=RUBEN-NICK').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('text=RUBEN-NICK').first()

```

```yaml
- button "PJ Admin Panel"
- button "Collapse menu"
- navigation:
  - link "Dashboard":
    - /url: /admin
  - link "Reports":
    - /url: /admin/reports
  - link "Orders":
    - /url: /admin/orders
  - link "Products":
    - /url: /admin/products
  - link "Categories":
    - /url: /admin/categories
  - link "Users":
    - /url: /admin/users
  - link "Clients":
    - /url: /admin/clients
  - link "Routes":
    - /url: /admin/routes
  - link "Settings":
    - /url: /admin/settings
- button "Sign Out"
- main:
  - heading "Clientes" [level=1]
  - paragraph: 1 Clientes registrados
  - textbox "Buscar por nombre, email o ID...": rubendarioc@gmail.com
  - text: "Filtro: Clientes"
  - table:
    - rowgroup:
      - row "Nombre / Usuario Contacto Info Acciones":
        - columnheader "Nombre / Usuario"
        - columnheader "Contacto"
        - columnheader "Info"
        - columnheader "Acciones"
    - rowgroup:
      - row "R Ruben @Castellanos rubendarioc@gmail.com +584168752677 1 0 Editar":
        - cell "R Ruben @Castellanos":
          - text: R
          - paragraph: Ruben
          - paragraph: "@Castellanos"
        - cell "rubendarioc@gmail.com +584168752677"
        - cell "1 0"
        - cell "Editar":
          - button "Editar"
- alert
```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | 
  3   | const FRONTEND_URL = 'http://localhost:3000';
  4   | const ADMIN_EMAIL = 'admin@test.com';
  5   | const ADMIN_PASS = '123123';
  6   | const CLIENT_EMAIL = 'rubendarioc@gmail.com';
  7   | const CLIENT_PASS = 'Sebas1007.';
  8   | const CLIENT_NICKNAME = 'RUBEN-NICK';
  9   | 
  10  | async function loginAs(page: Page, email: string, pass: string) {
  11  |   await page.goto(`${FRONTEND_URL}/auth/login`);
  12  |   await page.locator('input[type="text"]').fill(email);
  13  |   await page.locator('input[type="password"]').fill(pass);
  14  |   await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Iniciar Sesión")');
  15  | }
  16  | 
  17  | test.describe('PROD — Verificación Visual de Producción', () => {
  18  | 
  19  |   test('PROD-01 — Cliente puede iniciar sesión y ver su catálogo', async ({ page }) => {
  20  |     await loginAs(page, CLIENT_EMAIL, CLIENT_PASS);
  21  |     await page.waitForTimeout(3000);
  22  | 
  23  |     // Should NOT be redirected to admin/delivery/produccion
  24  |     const url = page.url();
  25  |     expect(url).not.toContain('/admin');
  26  |     expect(url).not.toContain('/delivery');
  27  |     expect(url).not.toContain('/produccion');
  28  | 
  29  |     // Should land at home or catalog
  30  |     await page.screenshot({ path: 'test-results/prod-01-client-login.png', fullPage: true });
  31  | 
  32  |     // No mandatory password change modal should block them
  33  |     await expect(page.locator('text=Cambio de contraseña obligatorio')).not.toBeVisible();
  34  |   });
  35  | 
  36  |   test('PROD-02 — Admin puede acceder al panel de pedidos y ver NICKNAME del cliente', async ({ page }) => {
  37  |     await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
  38  |     await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });
  39  | 
  40  |     await page.goto(`${FRONTEND_URL}/admin/orders`);
  41  |     await page.waitForTimeout(3000);
  42  | 
  43  |     await page.screenshot({ path: 'test-results/prod-02-admin-orders.png', fullPage: true });
  44  | 
  45  |     // The nickname RUBEN-NICK should appear in the orders list
  46  |     await expect(page.locator(`text=${CLIENT_NICKNAME}`).first()).toBeVisible({ timeout: 10000 });
  47  |   });
  48  | 
  49  |   test('PROD-03 — Admin puede ver listado de clientes con NICKNAME (Nombre Real)', async ({ page }) => {
  50  |     await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
  51  |     await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });
  52  | 
  53  |     await page.goto(`${FRONTEND_URL}/admin/clients`);
  54  |     await page.waitForTimeout(3000);
  55  |     await page.locator('input[placeholder*="Buscar por nombre"]').fill(CLIENT_EMAIL);
  56  |     await page.waitForTimeout(1000);
  57  | 
  58  |     await page.screenshot({ path: 'test-results/prod-03-admin-clients.png', fullPage: true });
  59  | 
  60  |     // Nickname formatted as NICK (Name) should be visible
> 61  |     await expect(page.locator(`text=${CLIENT_NICKNAME}`).first()).toBeVisible({ timeout: 10000 });
      |                                                                   ^ Error: expect(locator).toBeVisible() failed
  62  |   });
  63  | 
  64  |   test('PROD-04 — Admin puede generar reporte y encabezados de columna muestran NICKNAME', async ({ page }) => {
  65  |     await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
  66  |     await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });
  67  | 
  68  |     await page.goto(`${FRONTEND_URL}/admin/reports`);
  69  |     await page.waitForTimeout(2000);
  70  | 
  71  |     // Set report type to daily and click generate
  72  |     await page.locator('select').first().selectOption('daily');
  73  |     await page.waitForTimeout(500);
  74  | 
  75  |     // Click generate button
  76  |     await page.click('button:has-text("Generar")');
  77  |     await page.waitForTimeout(4000);
  78  | 
  79  |     await page.screenshot({ path: 'test-results/prod-04-admin-reports.png', fullPage: true });
  80  | 
  81  |     // The page should load without error
  82  |     await expect(page.locator('h1:has-text("Reportes Generales")')).toBeVisible();
  83  |   });
  84  | 
  85  |   test('PROD-05 — Buscador de clientes en reportes filtra y muestra por NICKNAME', async ({ page }) => {
  86  |     await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
  87  |     await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });
  88  | 
  89  |     await page.goto(`${FRONTEND_URL}/admin/reports`);
  90  |     await page.waitForTimeout(2000);
  91  | 
  92  |     // Switch to specific-client view
  93  |     await page.locator('select').nth(1).selectOption('specific-client');
  94  |     await page.waitForTimeout(500);
  95  | 
  96  |     // Search by nickname
  97  |     await page.locator('input[placeholder*="Buscar cliente"]').fill(CLIENT_NICKNAME);
  98  |     await page.waitForTimeout(1000);
  99  | 
  100 |     await page.screenshot({ path: 'test-results/prod-05-reports-nickname-search.png', fullPage: true });
  101 | 
  102 |     // The dropdown should show the client by NICKNAME
  103 |     await expect(page.locator(`text=${CLIENT_NICKNAME}`).first()).toBeVisible({ timeout: 5000 });
  104 |   });
  105 | 
  106 |   test('PROD-06 — Delivery staff puede acceder a su panel y ver cambio de contraseña', async ({ page }) => {
  107 |     await loginAs(page, 'user2@test.com', '123132');
  108 |     await page.waitForTimeout(3000);
  109 | 
  110 |     await page.goto(`${FRONTEND_URL}/delivery/settings`);
  111 |     await page.waitForTimeout(2000);
  112 | 
  113 |     await page.screenshot({ path: 'test-results/prod-06-delivery-settings.png', fullPage: true });
  114 | 
  115 |     // Security section must be visible
  116 |     await expect(page.locator('text=Seguridad de la Cuenta')).toBeVisible({ timeout: 8000 });
  117 |   });
  118 | 
  119 | });
  120 | 
```