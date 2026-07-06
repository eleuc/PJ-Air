# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-password-management.spec.ts >> TASK-08-19 — Password Management E2E Flow >> TASK-08-20 — Staff autogestionado password change (delivery)
- Location: tests\admin-password-management.spec.ts:147:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Contraseña actualizada con éxito')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('text=Contraseña actualizada con éxito')

```

```yaml
- button "PJ Logística"
- button "Colapsar menú"
- navigation:
  - link "Entregas":
    - /url: /delivery
  - link "Ruta":
    - /url: /delivery/route
  - link "Config.":
    - /url: /delivery/settings
- button "Cerrar Sesión"
- main:
  - heading "Preferencias de Ruta" [level=1]
  - paragraph: Gestiona tus notificaciones y ajustes de GPS
  - heading "Alertas de Reparto" [level=2]
  - paragraph: Configura cómo recibes tus órdenes asignadas
  - heading "Notificaciones en Ruta" [level=3]
  - paragraph: Nuevos Pedidos Asignados
  - paragraph: Aviso cuando se te asocia una nueva entrega
  - checkbox "Nuevos Pedidos Asignados Aviso cuando se te asocia una nueva entrega" [checked]
  - paragraph: Modo GPS Automático
  - paragraph: Registrar ubicación al confirmar la entrega
  - checkbox "Modo GPS Automático Registrar ubicación al confirmar la entrega" [checked]
  - heading "Programación de Jornada" [level=3]
  - button "Instante En el Momento":
    - paragraph: Instante
    - paragraph: En el Momento
  - button "Hoja de Ruta Entregas del Día":
    - paragraph: Hoja de Ruta
    - paragraph: Entregas del Día
  - button "Guardar Preferencias"
  - heading "Seguridad de la Cuenta" [level=2]
  - paragraph: Actualiza tu contraseña de acceso
  - text: Contraseña Actual
  - textbox "••••••••": "123132"
  - text: Nueva Contraseña
  - textbox "••••••••": NewDelivery123!
  - text: Confirmar Nueva Contraseña
  - textbox "••••••••": NewDelivery123!
  - button "Actualizar Contraseña"
- alert
```

# Test source

```ts
  65  | 
  66  |     // 2. Ruben logs in, sees mandatory modal
  67  |     await page.context().clearCookies();
  68  |     await page.evaluate(() => localStorage.clear());
  69  | 
  70  |     await loginAs(page, RUBEN_EMAIL, RUBEN_RESET_PASS);
  71  |     await page.waitForTimeout(3000);
  72  | 
  73  |     // Modal should be visible
  74  |     await expect(page.locator('text=Cambio de contraseña obligatorio')).toBeVisible();
  75  | 
  76  |     // 3. Ruben completes change back to original password
  77  |     await page.locator('input[placeholder="••••••••"]').nth(0).fill(RUBEN_RESET_PASS);
  78  |     await page.locator('input[placeholder="••••••••"]').nth(1).fill(RUBEN_CURRENT_PASS);
  79  |     await page.locator('input[placeholder="••••••••"]').nth(2).fill(RUBEN_CURRENT_PASS);
  80  |     await page.click('button:has-text("Actualizar Contraseña")');
  81  | 
  82  |     await expect(page.locator('text=¡Contraseña actualizada!')).toBeVisible({ timeout: 10000 });
  83  |     await page.waitForTimeout(2000);
  84  | 
  85  |     // Modal disappears, redirected or at catalog
  86  |     await expect(page.locator('text=Cambio de contraseña obligatorio')).not.toBeVisible();
  87  | 
  88  |     // 4. Clean login check
  89  |     await page.context().clearCookies();
  90  |     await page.evaluate(() => localStorage.clear());
  91  | 
  92  |     await loginAs(page, RUBEN_EMAIL, RUBEN_CURRENT_PASS);
  93  |     await page.waitForTimeout(3000);
  94  | 
  95  |     // Access directly without modal
  96  |     await expect(page.locator('text=Cambio de contraseña obligatorio')).not.toBeVisible();
  97  |   });
  98  | 
  99  |   test('3.6 — Admin can create new staff user from /admin/users', async ({ page }) => {
  100 |     const uniqueEmail = `staff-${Date.now()}@test.com`;
  101 | 
  102 |     await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
  103 |     await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });
  104 | 
  105 |     await page.goto(`${FRONTEND_URL}/admin/users`);
  106 |     await page.waitForTimeout(2000);
  107 | 
  108 |     await page.click('button:has-text("Nuevo Usuario")');
  109 |     await page.waitForTimeout(500);
  110 | 
  111 |     await page.locator('input[type="text"]').nth(1).fill('New Staff Member');
  112 |     await page.locator('input[type="email"]').fill(uniqueEmail);
  113 |     await page.locator('input[type="password"]').fill('StaffPassword123!');
  114 |     await page.locator('select').nth(1).selectOption('delivery');
  115 |     await page.click('button:has-text("Crear Usuario")');
  116 | 
  117 |     await expect(page.locator('text=Usuario Staff creado')).toBeVisible();
  118 |     await page.waitForTimeout(2000);
  119 | 
  120 |     // Verify it is on the list
  121 |     await page.locator('input[placeholder*="Buscar"]').fill(uniqueEmail);
  122 |     await page.waitForTimeout(1000);
  123 |     await expect(page.locator(`text=${uniqueEmail}`)).toBeVisible();
  124 |   });
  125 | 
  126 |   test('3.7 — Admin cannot reset password for another admin', async ({ page }) => {
  127 |     await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
  128 |     await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });
  129 | 
  130 |     await page.goto(`${FRONTEND_URL}/admin/users`);
  131 |     await page.waitForTimeout(2000);
  132 | 
  133 |     // Search or find another admin
  134 |     await page.locator('input[placeholder*="Buscar"]').fill('admin@test.com');
  135 |     await page.waitForTimeout(1000);
  136 | 
  137 |     // Click admin row
  138 |     const adminRow = page.locator('tr').filter({ hasText: 'admin@test.com' }).first();
  139 |     await adminRow.click();
  140 |     await page.waitForTimeout(1000);
  141 | 
  142 |     // Restablecer Contraseña button should NOT be visible
  143 |     const btn = page.locator('button:has-text("Restablecer Contraseña")');
  144 |     await expect(btn).not.toBeVisible();
  145 |   });
  146 | 
  147 |   test('TASK-08-20 — Staff autogestionado password change (delivery)', async ({ page }) => {
  148 |     // Login as delivery staff
  149 |     await loginAs(page, 'user2@test.com', '123132');
  150 |     await page.waitForTimeout(3000);
  151 |     
  152 |     // Go to settings page
  153 |     await page.goto(`${FRONTEND_URL}/delivery/settings`);
  154 |     await page.waitForTimeout(2000);
  155 | 
  156 |     // Verify Key/Seguridad section is visible
  157 |     await expect(page.locator('text=Seguridad de la Cuenta')).toBeVisible();
  158 | 
  159 |     // Fill password form
  160 |     await page.locator('input[placeholder="••••••••"]').nth(0).fill('123132');
  161 |     await page.locator('input[placeholder="••••••••"]').nth(1).fill('NewDelivery123!');
  162 |     await page.locator('input[placeholder="••••••••"]').nth(2).fill('NewDelivery123!');
  163 |     await page.click('button:has-text("Actualizar Contraseña")');
  164 | 
> 165 |     await expect(page.locator('text=Contraseña actualizada con éxito')).toBeVisible({ timeout: 10000 });
      |                                                                         ^ Error: expect(locator).toBeVisible() failed
  166 |     await page.waitForTimeout(2000);
  167 | 
  168 |     // Logout and verify new password works
  169 |     await page.context().clearCookies();
  170 |     await page.evaluate(() => localStorage.clear());
  171 |     await loginAs(page, 'user2@test.com', 'NewDelivery123!');
  172 |     await page.waitForTimeout(3000);
  173 |     
  174 |     // Switch back to original password for test idempotency
  175 |     await page.goto(`${FRONTEND_URL}/delivery/settings`);
  176 |     await page.waitForTimeout(2000);
  177 |     await page.locator('input[placeholder="••••••••"]').nth(0).fill('NewDelivery123!');
  178 |     await page.locator('input[placeholder="••••••••"]').nth(1).fill('123132');
  179 |     await page.locator('input[placeholder="••••••••"]').nth(2).fill('123132');
  180 |     await page.click('button:has-text("Actualizar Contraseña")');
  181 |     await expect(page.locator('text=Contraseña actualizada con éxito')).toBeVisible();
  182 |   });
  183 | 
  184 |   test('TASK-08-21 — Client nickname presentation in admin views', async ({ page }) => {
  185 |     await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
  186 |     await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });
  187 | 
  188 |     // 1. Check orders view shows RUBEN-NICK
  189 |     await page.goto(`${FRONTEND_URL}/admin/orders`);
  190 |     await page.waitForTimeout(3000);
  191 |     await expect(page.locator('text=RUBEN-NICK').first()).toBeVisible();
  192 | 
  193 |     // 2. Check clients view shows RUBEN-NICK (Ruben Dario)
  194 |     await page.goto(`${FRONTEND_URL}/admin/clients`);
  195 |     await page.waitForTimeout(3000);
  196 |     await page.locator('input[placeholder*="Buscar por nombre"]').fill(RUBEN_EMAIL);
  197 |     await page.waitForTimeout(1000);
  198 |     await expect(page.locator('text=RUBEN-NICK (Ruben Dario)').first()).toBeVisible();
  199 |   });
  200 | });
  201 | 
```