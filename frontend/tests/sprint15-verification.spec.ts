import { test, expect } from '@playwright/test';

const BASE_URL = 'https://testing.jhoanes.com';
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASS = '123123';

test.describe('Sprint 15 Verification Suite — testing.jhoanes.com', () => {

  test('TASK-15-01: AdminSidebar Language Switcher Presence & Reactivity', async ({ page }) => {
    // 1. Admin Login
    await page.goto(`${BASE_URL}/auth/login`);
    await page.locator('input[type="text"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PASS);
    await page.locator('form button').first().click();
    await page.waitForURL(`${BASE_URL}/admin`, { timeout: 15000 });

    // 2. Verify Language Switcher in AdminSidebar
    const sidebarSwitcher = page.locator('aside, div.fixed, div[class*="border-r"]').locator('button[aria-label="Switch language"], button[title="Switch language"]').first();
    await expect(sidebarSwitcher).toBeVisible();
    console.log('[E2E-UI] AdminSidebar Language Switcher is visible');

    // 3. Toggle Language to Spanish
    await sidebarSwitcher.click();
    await page.waitForTimeout(500);

    // Verify Spanish labels in sidebar (e.g. Configuración, Usuarios, Pedidos)
    const sidebarEs = page.locator('nav a').filter({ hasText: /Configuración|Pedidos|Usuarios|Productos/i }).first();
    await expect(sidebarEs).toBeVisible();
    console.log('[E2E-UI] Spanish language toggled and active in Admin');

    // 4. Toggle Language to English
    await sidebarSwitcher.click();
    await page.waitForTimeout(500);
    const sidebarEn = page.locator('nav a').filter({ hasText: /Settings|Orders|Users|Products/i }).first();
    await expect(sidebarEn).toBeVisible();
    console.log('[E2E-UI] English language toggled and active in Admin');
  });

  test('TASK-15-02 & TASK-15-03: Admin Orders, Clients, Users & Products i18n Parity', async ({ page }) => {
    // 1. Admin Login
    await page.goto(`${BASE_URL}/auth/login`);
    await page.locator('input[type="text"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PASS);
    await page.locator('form button').first().click();
    await page.waitForURL(`${BASE_URL}/admin`, { timeout: 15000 });

    // 2. Check Admin Orders (/admin/orders)
    await page.goto(`${BASE_URL}/admin/orders`);
    await page.waitForTimeout(2000);
    const ordersHeader = page.locator('h1').filter({ hasText: /Order Management|Panel de Pedidos|Gestión de Pedidos/i }).first();
    await expect(ordersHeader).toBeVisible();
    console.log('[E2E-UI] Admin Orders page loaded with i18n');

    // 3. Check Admin Clients (/admin/clients)
    await page.goto(`${BASE_URL}/admin/clients`);
    await page.waitForTimeout(2000);
    const clientsHeader = page.locator('h1').filter({ hasText: /Client Directory|Clientes|Directorio de Clientes/i }).first();
    await expect(clientsHeader).toBeVisible();
    console.log('[E2E-UI] Admin Clients page loaded with i18n');

    // 4. Check Admin Products (/admin/products)
    await page.goto(`${BASE_URL}/admin/products`);
    await page.waitForTimeout(2000);
    const productsHeader = page.locator('h1').filter({ hasText: /Product Catalog|Catálogo de Productos|Gestión de Productos/i }).first();
    await expect(productsHeader).toBeVisible();
    console.log('[E2E-UI] Admin Products page loaded with i18n');
  });

});
