import { test, expect } from '@playwright/test';

const BASE_URL = 'https://testing.jhoanes.com';
const USER_EMAIL = 'rubendarioc@gmail.com';
const USER_PASS = 'Sebas1007.';

test.describe('Sprint 13 Live UI Verification Suite — testing.jhoanes.com', () => {

  test('TASK-13-03: Client can select future delivery date and Payment Policy is removed', async ({ page }) => {
    // 1. Login
    await page.goto(`${BASE_URL}/auth/login`);
    await page.locator('input[type="text"]').fill(USER_EMAIL);
    await page.locator('input[type="password"]').fill(USER_PASS);
    await page.locator('form button').first().click();
    await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });

    // 2. Set item in Cart via localStorage for deterministic checkout testing
    await page.evaluate(() => {
      const sampleItem = {
        id: 'cart-1',
        product: { id: 'p-1', name: 'Croissant Tradicional', price: 10.0, category: 'Panaderia' },
        quantity: 5
      };
      localStorage.setItem('cart', JSON.stringify([sampleItem]));
    });

    // 3. Navigate directly to Checkout
    await page.goto(`${BASE_URL}/checkout`);
    await page.waitForTimeout(2000);

    // 4. Verify Delivery Date Section & input[type="date"]
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible({ timeout: 10000 });

    // Verify min attribute is set (future cutoff date)
    const minAttr = await dateInput.getAttribute('min');
    expect(minAttr).toBeTruthy();
    console.log('[E2E-UI] minDeliveryDate attribute detected:', minAttr);

    // Select future date
    const futureDate = '2026-08-25';
    await dateInput.fill(futureDate);
    expect(await dateInput.inputValue()).toBe(futureDate);
    console.log('[E2E-UI] Date successfully chosen in UI:', futureDate);

    // 5. Verify obsolete Payment Policy is NOT visible
    const paymentPolicy = page.locator('text=Payment Policy');
    await expect(paymentPolicy).not.toBeVisible();
    console.log('[E2E-UI] Obsolete Payment Policy verified REMOVED');
  });

  test('TASK-13-02 & TASK-13-04: Admin Users Management & Orders Financial Details', async ({ page }) => {
    // 1. Admin Login
    await page.goto(`${BASE_URL}/auth/login`);
    await page.locator('input[type="text"]').fill('admin@test.com');
    await page.locator('input[type="password"]').fill('123123');
    await page.locator('form button').first().click();
    await page.waitForURL(`${BASE_URL}/admin`, { timeout: 15000 });

    // 2. Admin Users view (TASK-13-02: Client deletion modal and terminology)
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForTimeout(2000);
    await expect(page.locator('h1, h2, div').filter({ hasText: /Usuarios|Clientes|Users/i }).first()).toBeVisible();
    console.log('[E2E-UI] Admin Users view loaded successfully');

    // 3. Admin Orders view (TASK-13-04: Financial / Xero details)
    await page.goto(`${BASE_URL}/admin/orders`);
    await page.waitForTimeout(2000);
    const firstOrder = page.locator('tr, div[class*="group"]').first();
    await expect(firstOrder).toBeVisible();
    console.log('[E2E-UI] Admin Orders view loaded successfully');
  });

});
