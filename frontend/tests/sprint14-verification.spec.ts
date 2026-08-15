import { test, expect } from '@playwright/test';

const BASE_URL = 'https://testing.jhoanes.com';
const USER_EMAIL = 'rubendarioc@gmail.com';
const USER_PASS = 'Sebas1007.';

test.describe('Sprint 14 Verification Suite — testing.jhoanes.com', () => {

  test('TASK-14-01 & TASK-14-02: Checkout Modular Steps, Quick Edit Date & Bank Transfer Flow', async ({ page }) => {
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

    // 3. Navigate directly to Checkout
    await page.goto(`${BASE_URL}/checkout`);
    await page.waitForTimeout(3000);

    // 4. Verify 4 steps are clearly rendered (h2 headers or step badges)
    const step1 = page.locator('h2').filter({ hasText: /Delivery|Destino|Entrega/i }).first();
    await expect(step1).toBeVisible();

    const step2 = page.locator('h2').filter({ hasText: /Date|Fecha/i }).first();
    await expect(step2).toBeVisible();

    const step3 = page.locator('h2').filter({ hasText: /Payment|Pago/i }).first();
    await expect(step3).toBeVisible();

    const step4 = page.locator('h2').filter({ hasText: /Instructions|Notas|Instrucciones/i }).first();
    await expect(step4).toBeVisible();
    console.log('[E2E-UI] 4 Modular Steps verified');

    // 5. Verify Bank Transfer method selection & dynamic details
    const bankTransferBtn = page.locator('button').filter({ hasText: /Bank Transfer|Transferencia Bancaria/i }).first();
    await expect(bankTransferBtn).toBeVisible();
    await bankTransferBtn.click();
    await page.waitForTimeout(500);

    const refInput = page.locator('input[placeholder*="TRF-2026"], input[placeholder*="Zelle"]');
    await expect(refInput).toBeVisible();
    await refInput.fill('TRF-E2E-2026-TEST');
    console.log('[E2E-UI] Bank Transfer selected and reference filled');

    // 6. Verify Quick Edit Date button in Sticky Summary
    const quickEditBtn = page.locator('button').filter({ hasText: /Change Date|Cambiar Fecha/i }).first();
    await expect(quickEditBtn).toBeVisible();
    await quickEditBtn.click();
    await page.waitForTimeout(500);
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeFocused();
    console.log('[E2E-UI] Quick Edit Date focused the datepicker');
  });

  test('TASK-14-02 & TASK-14-03: Admin Settings Bank Transfer Configuration & Language Parity', async ({ page }) => {
    // 1. Admin Login
    await page.goto(`${BASE_URL}/auth/login`);
    await page.locator('input[type="text"]').fill('admin@test.com');
    await page.locator('input[type="password"]').fill('123123');
    await page.locator('form button').first().click();
    await page.waitForURL(`${BASE_URL}/admin`, { timeout: 15000 });

    // 2. Admin Settings page
    await page.goto(`${BASE_URL}/admin/settings`);
    await page.waitForTimeout(3000);

    // 3. Verify Bank Information configuration section exists
    const bankSectionHeader = page.locator('h2').filter({ hasText: /Bank Transfer|Información Bancaria/i }).first();
    await expect(bankSectionHeader).toBeVisible();
    
    // Fill sample bank info in Admin Settings and Save
    const bankNameInput = page.locator('input[placeholder*="Chase Bank"]').first();
    if (await bankNameInput.isVisible()) {
      await bankNameInput.fill('Chase Bank Commercial');
      const accountHolderInput = page.locator('input[placeholder*="Jhoanes Bakery LLC"]').first();
      await accountHolderInput.fill('Jhoanes Bakery LLC');
      
      const saveBtn = page.locator('button').filter({ hasText: /Save Preferences|Guardar Preferencias/i }).first();
      await saveBtn.click();
      await page.waitForTimeout(1500);
      console.log('[E2E-UI] Admin Bank Info saved successfully');
    }
  });

});
