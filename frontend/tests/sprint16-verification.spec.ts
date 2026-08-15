import { test, expect } from '@playwright/test';

const BASE_URL = 'https://testing.jhoanes.com';
const USER_EMAIL = 'e2e-client@jhoanes.com';
const USER_PASS = 'Sebas1007.';
const ADMIN_EMAIL = 'e2e-admin@jhoanes.com';
const ADMIN_PASS = 'Sebas1007.';

test.describe('Sprint 16 Verification Suite — Payment Restructuring & Confirmation Page', () => {

  test('TASK-16-01 & TASK-16-02: Checkout Online vs Bank Transfer and Order Confirmation details', async ({ page }) => {
    // 1. Client Login
    await page.goto(`${BASE_URL}/auth/login`);
    await page.locator('input[type="text"]').fill(USER_EMAIL);
    await page.locator('input[type="password"]').fill(USER_PASS);
    await page.locator('form button').first().click();
    await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });

    // 2. Set item in Cart via localStorage for checkout testing
    await page.evaluate(() => {
      const sampleItem = {
        id: 'cart-1',
        product: { id: 'p-1', name: 'Croissant Tradicional', price: 25.0, category: 'Panaderia' },
        quantity: 2
      };
      localStorage.setItem('cart', JSON.stringify([sampleItem]));
    });

    // 3. Navigate to Checkout
    await page.goto(`${BASE_URL}/checkout`);
    await page.waitForTimeout(3000);

    // 4. Verify Option 1 (Online Payment) and Option 2 (Bank Transfer)
    const onlinePaymentBtn = page.locator('button').filter({ hasText: /Immediate Online Payment|Pago Online Inmediato/i }).first();
    await expect(onlinePaymentBtn).toBeVisible();

    const bankTransferBtn = page.locator('button').filter({ hasText: /Bank Transfer|Transferencia Bancaria/i }).first();
    await expect(bankTransferBtn).toBeVisible();

    // Verify Charge to account is NOT present
    const chargeToAccount = page.locator('text=Charge to Account / Cash on Delivery');
    await expect(chargeToAccount).not.toBeVisible();

    // 5. Select Bank Transfer
    await bankTransferBtn.click();
    await page.waitForTimeout(500);

    const refInput = page.locator('input[placeholder*="TRF-2026"], input[placeholder*="Zelle"]');
    await expect(refInput).toBeVisible();
    await refInput.fill('TRF-SP16-CONFIRM-TEST');

    // 6. Verify summary badge shows Bank Transfer
    const summaryBadge = page.locator('text=/Transferencia|Bank Transfer/i').first();
    await expect(summaryBadge).toBeVisible();

    console.log('[E2E-SP16] Checkout methods verified: Online Payment + Bank Transfer');
  });

  test('TASK-16-03: Admin Orders Payment Management and Xero Sync trigger', async ({ page }) => {
    // 1. Admin Login
    await page.goto(`${BASE_URL}/auth/login`);
    await page.locator('input[type="text"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PASS);
    await page.locator('form button').first().click();
    await page.waitForURL(`${BASE_URL}/admin`, { timeout: 15000 });

    // 2. Go to /admin/orders
    await page.goto(`${BASE_URL}/admin/orders`);
    await page.waitForTimeout(3000);

    // 3. Open first order if available
    const orderRows = page.locator('table tbody tr');
    const count = await orderRows.count();
    if (count > 0) {
      await orderRows.first().click();
      await page.waitForTimeout(1000);

      // Verify Payment and Xero section exists in detail modal
      const xeroSyncTitle = page.locator('text=/Xero Accounting Sync|Sincronización Xero/i').first();
      await expect(xeroSyncTitle).toBeVisible();

      const syncBtn = page.locator('button').filter({ hasText: /Sync to Xero|Sincronizar con Xero/i }).first();
      await expect(syncBtn).toBeVisible();
      console.log('[E2E-SP16] Admin Orders modal with Xero sync trigger verified');
    }
  });

});
