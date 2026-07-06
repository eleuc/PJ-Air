# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: production-verification.spec.ts >> PROD — Verificación Visual de Producción >> PROD-05 — Buscador de clientes en reportes filtra y muestra por NICKNAME
- Location: tests\production-verification.spec.ts:85:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=RUBEN-NICK').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
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
  - heading "Reportes Generales" [level=1]
  - text: Tipo de Reporte
  - combobox:
    - option "Reporte Diario" [selected]
    - option "Reporte Semanal"
    - option "Reporte Mensual"
    - option "Personalizado"
  - text: Concepto
  - combobox:
    - option "Reporte General (todos los clientes)"
    - option "Reporte por Cliente" [selected]
  - text: Buscador de Clientes
  - textbox "Buscar cliente específico...": RUBEN-NICK
  - text: Período
  - textbox: 2026-07-06
  - text: –
  - textbox: 2026-07-06
  - button "Generar Reporte"
  - heading "Historial Diario" [level=2]
  - paragraph: Unidades totales por categoría · Haz click en "Ver Detalle" para generar el reporte
  - table:
    - rowgroup:
      - row "Fecha Croissants Fruit Desserts Cakes Slices Desserts Tarts Desserts Tres Leches Savory Croissant Tres Leches Party Trays Pound Cakes Sin categoría Total Uds. Detalle":
        - columnheader "Fecha"
        - columnheader "Croissants"
        - columnheader "Fruit Desserts"
        - columnheader "Cakes Slices"
        - columnheader "Desserts"
        - columnheader "Tarts"
        - columnheader "Desserts Tres Leches"
        - columnheader "Savory Croissant"
        - columnheader "Tres Leches Party Trays"
        - columnheader "Pound Cakes"
        - columnheader "Sin categoría"
        - columnheader "Total Uds."
        - columnheader "Detalle"
    - rowgroup:
      - row "martes, 30 de junio de 2026 93 uds 245 uds 3 uds 24 uds 18 uds 0 uds 0 uds 0 uds 0 uds 0 uds 383 uds Ver Detalle":
        - cell "martes, 30 de junio de 2026"
        - cell "93 uds"
        - cell "245 uds"
        - cell "3 uds"
        - cell "24 uds"
        - cell "18 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "383 uds"
        - cell "Ver Detalle":
          - button "Ver Detalle"
      - row "lunes, 29 de junio de 2026 661 uds 954 uds 5 uds 92 uds 56 uds 18 uds 31 uds 2 uds 16 uds 0 uds 1,835 uds Ver Detalle":
        - cell "lunes, 29 de junio de 2026"
        - cell "661 uds"
        - cell "954 uds"
        - cell "5 uds"
        - cell "92 uds"
        - cell "56 uds"
        - cell "18 uds"
        - cell "31 uds"
        - cell "2 uds"
        - cell "16 uds"
        - cell "0 uds"
        - cell "1,835 uds"
        - cell "Ver Detalle":
          - button "Ver Detalle"
      - row "domingo, 28 de junio de 2026 54 uds 42 uds 0 uds 6 uds 12 uds 0 uds 0 uds 0 uds 0 uds 0 uds 114 uds Ver Detalle":
        - cell "domingo, 28 de junio de 2026"
        - cell "54 uds"
        - cell "42 uds"
        - cell "0 uds"
        - cell "6 uds"
        - cell "12 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "114 uds"
        - cell "Ver Detalle":
          - button "Ver Detalle"
      - row "sábado, 27 de junio de 2026 531 uds 363 uds 7 uds 26 uds 13 uds 0 uds 39 uds 0 uds 0 uds 0 uds 979 uds Ver Detalle":
        - cell "sábado, 27 de junio de 2026"
        - cell "531 uds"
        - cell "363 uds"
        - cell "7 uds"
        - cell "26 uds"
        - cell "13 uds"
        - cell "0 uds"
        - cell "39 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "979 uds"
        - cell "Ver Detalle":
          - button "Ver Detalle"
      - row "viernes, 26 de junio de 2026 184 uds 142 uds 2 uds 18 uds 30 uds 12 uds 12 uds 0 uds 16 uds 0 uds 416 uds Ver Detalle":
        - cell "viernes, 26 de junio de 2026"
        - cell "184 uds"
        - cell "142 uds"
        - cell "2 uds"
        - cell "18 uds"
        - cell "30 uds"
        - cell "12 uds"
        - cell "12 uds"
        - cell "0 uds"
        - cell "16 uds"
        - cell "0 uds"
        - cell "416 uds"
        - cell "Ver Detalle":
          - button "Ver Detalle"
      - row "jueves, 25 de junio de 2026 330 uds 799 uds 6 uds 33 uds 35 uds 24 uds 3 uds 0 uds 0 uds 0 uds 1,230 uds Ver Detalle":
        - cell "jueves, 25 de junio de 2026"
        - cell "330 uds"
        - cell "799 uds"
        - cell "6 uds"
        - cell "33 uds"
        - cell "35 uds"
        - cell "24 uds"
        - cell "3 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "1,230 uds"
        - cell "Ver Detalle":
          - button "Ver Detalle"
      - row "miércoles, 24 de junio de 2026 219 uds 217 uds 12 uds 50 uds 42 uds 18 uds 49 uds 5 uds 24 uds 2 uds 638 uds Ver Detalle":
        - cell "miércoles, 24 de junio de 2026"
        - cell "219 uds"
        - cell "217 uds"
        - cell "12 uds"
        - cell "50 uds"
        - cell "42 uds"
        - cell "18 uds"
        - cell "49 uds"
        - cell "5 uds"
        - cell "24 uds"
        - cell "2 uds"
        - cell "638 uds"
        - cell "Ver Detalle":
          - button "Ver Detalle"
      - row "martes, 23 de junio de 2026 246 uds 369 uds 12 uds 44 uds 42 uds 0 uds 24 uds 2 uds 0 uds 1 uds 740 uds Ver Detalle":
        - cell "martes, 23 de junio de 2026"
        - cell "246 uds"
        - cell "369 uds"
        - cell "12 uds"
        - cell "44 uds"
        - cell "42 uds"
        - cell "0 uds"
        - cell "24 uds"
        - cell "2 uds"
        - cell "0 uds"
        - cell "1 uds"
        - cell "740 uds"
        - cell "Ver Detalle":
          - button "Ver Detalle"
      - row "lunes, 22 de junio de 2026 350 uds 455 uds 12 uds 56 uds 70 uds 12 uds 12 uds 0 uds 0 uds 0 uds 967 uds Ver Detalle":
        - cell "lunes, 22 de junio de 2026"
        - cell "350 uds"
        - cell "455 uds"
        - cell "12 uds"
        - cell "56 uds"
        - cell "70 uds"
        - cell "12 uds"
        - cell "12 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "967 uds"
        - cell "Ver Detalle":
          - button "Ver Detalle"
      - row "domingo, 21 de junio de 2026 81 uds 453 uds 2 uds 43 uds 21 uds 0 uds 0 uds 0 uds 0 uds 0 uds 600 uds Ver Detalle":
        - cell "domingo, 21 de junio de 2026"
        - cell "81 uds"
        - cell "453 uds"
        - cell "2 uds"
        - cell "43 uds"
        - cell "21 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "0 uds"
        - cell "600 uds"
        - cell "Ver Detalle":
          - button "Ver Detalle"
  - paragraph: Página 1 de 5 · 48 días
  - button [disabled]
  - button
- alert
```

# Test source

```ts
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
  61  |     await expect(page.locator(`text=${CLIENT_NICKNAME}`).first()).toBeVisible({ timeout: 10000 });
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
> 103 |     await expect(page.locator(`text=${CLIENT_NICKNAME}`).first()).toBeVisible({ timeout: 5000 });
      |                                                                   ^ Error: expect(locator).toBeVisible() failed
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