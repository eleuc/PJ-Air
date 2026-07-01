import { test, expect, Page } from '@playwright/test';

const FRONTEND_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASS = '123123';

const RUBEN_EMAIL = 'rubendarioc@gmail.com';
const RUBEN_CURRENT_PASS = 'Sebas1007.';
const RUBEN_RESET_PASS = 'ResetRuben2026!';

const TEST_USER_EMAIL = 'pwd-test@jhpanesbakery.com';

async function loginAs(page: Page, email: string, pass: string) {
  await page.goto(`${FRONTEND_URL}/auth/login`);
  await page.locator('input[type="text"]').fill(email);
  await page.locator('input[type="password"]').fill(pass);
  await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Iniciar Sesión")');
}

test.describe('TASK-08-19 — Password Management E2E Flow', () => {

  test('3.1 — Admin can see "Restablecer Contraseña" button in client detail', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });

    await page.goto(`${FRONTEND_URL}/admin/clients`);
    await page.waitForTimeout(2000);

    // Search or find a client card/row
    const clientRow = page.locator('tr').filter({ hasText: RUBEN_EMAIL }).first();
    await clientRow.locator('button:has-text("Editar")').click();
    await page.waitForTimeout(1000);

    // Button should be visible
    const btn = page.locator('button:has-text("Restablecer Contraseña")');
    await expect(btn).toBeVisible();
  });

  test('3.2 a 3.5 — Full reset and mandatory password change flow for client', async ({ page }) => {
    // 1. Admin resets rubendarioc's password
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });

    await page.goto(`${FRONTEND_URL}/admin/clients`);
    await page.waitForTimeout(2000);

    const clientRow = page.locator('tr').filter({ hasText: RUBEN_EMAIL }).first();
    await clientRow.locator('button:has-text("Editar")').click();
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("Restablecer Contraseña")').click();
    await page.waitForTimeout(500);

    // Modal appears, fill new password
    await page.locator('input[type="password"]').fill(RUBEN_RESET_PASS);
    await page.click('button:has-text("Confirmar")');

    // Toast check
    await expect(page.locator('text=Contraseña restablecida')).toBeVisible();
    await page.waitForTimeout(2000);

    // 2. Ruben logs in, sees mandatory modal
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    await loginAs(page, RUBEN_EMAIL, RUBEN_RESET_PASS);
    await page.waitForTimeout(3000);

    // Modal should be visible
    await expect(page.locator('text=Cambio de contraseña obligatorio')).toBeVisible();

    // 3. Ruben completes change back to original password
    await page.locator('input[placeholder="••••••••"]').nth(0).fill(RUBEN_RESET_PASS);
    await page.locator('input[placeholder="••••••••"]').nth(1).fill(RUBEN_CURRENT_PASS);
    await page.locator('input[placeholder="••••••••"]').nth(2).fill(RUBEN_CURRENT_PASS);
    await page.click('button:has-text("Actualizar Contraseña")');

    await expect(page.locator('text=¡Contraseña actualizada!')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Modal disappears, redirected or at catalog
    await expect(page.locator('text=Cambio de contraseña obligatorio')).not.toBeVisible();

    // 4. Clean login check
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    await loginAs(page, RUBEN_EMAIL, RUBEN_CURRENT_PASS);
    await page.waitForTimeout(3000);

    // Access directly without modal
    await expect(page.locator('text=Cambio de contraseña obligatorio')).not.toBeVisible();
  });

  test('3.6 — Admin can create new staff user from /admin/users', async ({ page }) => {
    const uniqueEmail = `staff-${Date.now()}@test.com`;

    await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });

    await page.goto(`${FRONTEND_URL}/admin/users`);
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Nuevo Usuario")');
    await page.waitForTimeout(500);

    await page.locator('input[type="text"]').nth(1).fill('New Staff Member');
    await page.locator('input[type="email"]').fill(uniqueEmail);
    await page.locator('input[type="password"]').fill('StaffPassword123!');
    await page.locator('select').nth(1).selectOption('delivery');
    await page.click('button:has-text("Crear Usuario")');

    await expect(page.locator('text=Usuario Staff creado')).toBeVisible();
    await page.waitForTimeout(2000);

    // Verify it is on the list
    await page.locator('input[placeholder*="Buscar"]').fill(uniqueEmail);
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${uniqueEmail}`)).toBeVisible();
  });

  test('3.7 — Admin cannot reset password for another admin', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });

    await page.goto(`${FRONTEND_URL}/admin/users`);
    await page.waitForTimeout(2000);

    // Search or find another admin
    await page.locator('input[placeholder*="Buscar"]').fill('admin@test.com');
    await page.waitForTimeout(1000);

    // Click admin row
    const adminRow = page.locator('tr').filter({ hasText: 'admin@test.com' }).first();
    await adminRow.click();
    await page.waitForTimeout(1000);

    // Restablecer Contraseña button should NOT be visible
    const btn = page.locator('button:has-text("Restablecer Contraseña")');
    await expect(btn).not.toBeVisible();
  });

  test('TASK-08-20 — Staff autogestionado password change (delivery)', async ({ page }) => {
    // Login as delivery staff
    await loginAs(page, 'user2@test.com', '123132');
    await page.waitForTimeout(3000);
    
    // Go to settings page
    await page.goto(`${FRONTEND_URL}/delivery/settings`);
    await page.waitForTimeout(2000);

    // Verify Key/Seguridad section is visible
    await expect(page.locator('text=Seguridad de la Cuenta')).toBeVisible();

    // Fill password form
    await page.locator('input[placeholder="••••••••"]').nth(0).fill('123132');
    await page.locator('input[placeholder="••••••••"]').nth(1).fill('NewDelivery123!');
    await page.locator('input[placeholder="••••••••"]').nth(2).fill('NewDelivery123!');
    await page.click('button:has-text("Actualizar Contraseña")');

    await expect(page.locator('text=Contraseña actualizada con éxito')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Logout and verify new password works
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await loginAs(page, 'user2@test.com', 'NewDelivery123!');
    await page.waitForTimeout(3000);
    
    // Switch back to original password for test idempotency
    await page.goto(`${FRONTEND_URL}/delivery/settings`);
    await page.waitForTimeout(2000);
    await page.locator('input[placeholder="••••••••"]').nth(0).fill('NewDelivery123!');
    await page.locator('input[placeholder="••••••••"]').nth(1).fill('123132');
    await page.locator('input[placeholder="••••••••"]').nth(2).fill('123132');
    await page.click('button:has-text("Actualizar Contraseña")');
    await expect(page.locator('text=Contraseña actualizada con éxito')).toBeVisible();
  });

  test('TASK-08-21 — Client nickname presentation in admin views', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });

    // 1. Check orders view shows RUBEN-NICK
    await page.goto(`${FRONTEND_URL}/admin/orders`);
    await page.waitForTimeout(3000);
    await expect(page.locator('text=RUBEN-NICK').first()).toBeVisible();

    // 2. Check clients view shows RUBEN-NICK (Ruben Dario)
    await page.goto(`${FRONTEND_URL}/admin/clients`);
    await page.waitForTimeout(3000);
    await expect(page.locator('text=RUBEN-NICK (Ruben Dario)').first()).toBeVisible();
  });
});
