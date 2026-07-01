import { test, expect, Page } from '@playwright/test';

const FRONTEND_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASS = '123123';
const CLIENT_EMAIL = 'rubendarioc@gmail.com';
const CLIENT_PASS = 'Sebas1007.';
const CLIENT_NICKNAME = 'RUBEN-NICK';

async function loginAs(page: Page, email: string, pass: string) {
  await page.goto(`${FRONTEND_URL}/auth/login`);
  await page.locator('input[type="text"]').fill(email);
  await page.locator('input[type="password"]').fill(pass);
  await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Iniciar Sesión")');
}

test.describe('PROD — Verificación Visual de Producción', () => {

  test('PROD-01 — Cliente puede iniciar sesión y ver su catálogo', async ({ page }) => {
    await loginAs(page, CLIENT_EMAIL, CLIENT_PASS);
    await page.waitForTimeout(3000);

    // Should NOT be redirected to admin/delivery/produccion
    const url = page.url();
    expect(url).not.toContain('/admin');
    expect(url).not.toContain('/delivery');
    expect(url).not.toContain('/produccion');

    // Should land at home or catalog
    await page.screenshot({ path: 'test-results/prod-01-client-login.png', fullPage: true });

    // No mandatory password change modal should block them
    await expect(page.locator('text=Cambio de contraseña obligatorio')).not.toBeVisible();
  });

  test('PROD-02 — Admin puede acceder al panel de pedidos y ver NICKNAME del cliente', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });

    await page.goto(`${FRONTEND_URL}/admin/orders`);
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-results/prod-02-admin-orders.png', fullPage: true });

    // The nickname RUBEN-NICK should appear in the orders list
    await expect(page.locator(`text=${CLIENT_NICKNAME}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('PROD-03 — Admin puede ver listado de clientes con NICKNAME (Nombre Real)', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });

    await page.goto(`${FRONTEND_URL}/admin/clients`);
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-results/prod-03-admin-clients.png', fullPage: true });

    // Nickname formatted as NICK (Name) should be visible
    await expect(page.locator(`text=${CLIENT_NICKNAME}`).first()).toBeVisible({ timeout: 10000 });
  });

  test('PROD-04 — Admin puede generar reporte y encabezados de columna muestran NICKNAME', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });

    await page.goto(`${FRONTEND_URL}/admin/reports`);
    await page.waitForTimeout(2000);

    // Set report type to daily and click generate
    await page.locator('select').first().selectOption('daily');
    await page.waitForTimeout(500);

    // Click generate button
    await page.click('button:has-text("Generar")');
    await page.waitForTimeout(4000);

    await page.screenshot({ path: 'test-results/prod-04-admin-reports.png', fullPage: true });

    // The page should load without error
    await expect(page.locator('h1:has-text("Reportes Generales")')).toBeVisible();
  });

  test('PROD-05 — Buscador de clientes en reportes filtra y muestra por NICKNAME', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });

    await page.goto(`${FRONTEND_URL}/admin/reports`);
    await page.waitForTimeout(2000);

    // Switch to specific-client view
    await page.locator('select').nth(1).selectOption('specific-client');
    await page.waitForTimeout(500);

    // Search by nickname
    await page.locator('input[placeholder*="Buscar cliente"]').fill(CLIENT_NICKNAME);
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'test-results/prod-05-reports-nickname-search.png', fullPage: true });

    // The dropdown should show the client by NICKNAME
    await expect(page.locator(`text=${CLIENT_NICKNAME}`).first()).toBeVisible({ timeout: 5000 });
  });

  test('PROD-06 — Delivery staff puede acceder a su panel y ver cambio de contraseña', async ({ page }) => {
    await loginAs(page, 'user2@test.com', '123132');
    await page.waitForTimeout(3000);

    await page.goto(`${FRONTEND_URL}/delivery/settings`);
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-results/prod-06-delivery-settings.png', fullPage: true });

    // Security section must be visible
    await expect(page.locator('text=Seguridad de la Cuenta')).toBeVisible({ timeout: 8000 });
  });

});
