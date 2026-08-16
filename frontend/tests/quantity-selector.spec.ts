import { test, expect } from '@playwright/test';

const BASE_URL = 'https://testing.jhoanes.com';
const USER_EMAIL = 'e2e-client@jhoanes.com';
const USER_PASS = 'Sebas1007.';

test.describe('Quantity Selector Full-Width & Interactivity Verification', () => {

  test('Catalog Page: Product card quantity selector covers full width and responds to clicks and typing', async ({ page }) => {
    // 1. Iniciar sesión y navegar al catálogo
    await page.goto(`${BASE_URL}/auth/login`);
    await page.locator('input[type="text"]').fill(USER_EMAIL);
    await page.locator('input[type="password"]').fill(USER_PASS);
    await page.locator('form button').first().click();
    await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });

    // Esperar a que se carguen los productos
    const productHeading = page.getByRole('heading', { name: 'Apple Cheesecake x10' }).first();
    await expect(productHeading).toBeVisible({ timeout: 10000 });

    // Localizar la tarjeta que contiene este producto
    const card = page.locator('div.group').filter({ has: productHeading }).first();
    await expect(card).toBeVisible();

    // 2. Verificar el spinbutton (input numérico) y sus botones hermanos
    const spinInput = card.getByRole('spinbutton');
    await expect(spinInput).toBeVisible();

    const qtyContainer = spinInput.locator('xpath=..');
    await expect(qtyContainer).toBeVisible();

    const cartButton = card.getByRole('button', { name: /Add to Order|Agregar al Pedido/i });
    await expect(cartButton).toBeVisible();

    // 3. Comparar anchos del selector y el botón de orden
    const qtyBox = await qtyContainer.boundingBox();
    const cartBox = await cartButton.boundingBox();

    console.log(`[E2E-Catalog] Qty Container width: ${qtyBox?.width}px | Cart Button width: ${cartBox?.width}px`);
    expect(qtyBox).not.toBeNull();
    expect(cartBox).not.toBeNull();
    if (qtyBox && cartBox) {
      // El selector debe tener un ancho idéntico o casi idéntico (+- 4px) al botón de agregar
      expect(Math.abs(qtyBox.width - cartBox.width)).toBeLessThan(5);
    }

    // 4. Probar botones de incremento (+) y decremento (-)
    const buttons = qtyContainer.locator('button');
    const minusBtn = buttons.first();
    const plusBtn = buttons.last();

    const initialVal = await spinInput.inputValue();
    console.log(`[E2E-Catalog] Initial quantity value: "${initialVal}"`);

    // Click en +
    await plusBtn.click();
    await page.waitForTimeout(300);
    const incrementedVal = await spinInput.inputValue();
    console.log(`[E2E-Catalog] Value after + click: "${incrementedVal}"`);
    expect(Number(incrementedVal)).toBe(Number(initialVal || 1) + 1);

    // Click en -
    await minusBtn.click();
    await page.waitForTimeout(300);
    const decrementedVal = await spinInput.inputValue();
    console.log(`[E2E-Catalog] Value after - click: "${decrementedVal}"`);
    expect(Number(decrementedVal)).toBe(Number(incrementedVal) - 1);

    // 5. Probar edición directa por teclado
    await spinInput.click();
    await spinInput.fill('5');
    await page.waitForTimeout(300);
    const typedVal = await spinInput.inputValue();
    console.log(`[E2E-Catalog] Value after typing: "${typedVal}"`);
    expect(typedVal).toBe('5');
  });

  test('Category Page: Product card quantity selector covers full width and responds to clicks and typing', async ({ page }) => {
    // Navegar directamente a la categoría Cakes Slices
    await page.goto(`${BASE_URL}/catalog/category/Cakes%20Slices`);
    await page.waitForTimeout(2000);

    const productHeading = page.getByRole('heading', { name: 'Apple Cheesecake x10' }).first();
    await expect(productHeading).toBeVisible({ timeout: 10000 });

    const card = page.locator('div.group').filter({ has: productHeading }).first();
    await expect(card).toBeVisible();

    const spinInput = card.getByRole('spinbutton');
    await expect(spinInput).toBeVisible();

    const qtyContainer = spinInput.locator('xpath=..');
    await expect(qtyContainer).toBeVisible();

    const cartButton = card.getByRole('button', { name: /Add to Order|Agregar al Pedido/i });
    await expect(cartButton).toBeVisible();

    // Validar anchos
    const qtyBox = await qtyContainer.boundingBox();
    const cartBox = await cartButton.boundingBox();

    console.log(`[E2E-Category] Qty Container width: ${qtyBox?.width}px | Cart Button width: ${cartBox?.width}px`);
    expect(qtyBox).not.toBeNull();
    expect(cartBox).not.toBeNull();
    if (qtyBox && cartBox) {
      expect(Math.abs(qtyBox.width - cartBox.width)).toBeLessThan(5);
    }

    // Probar interactividad
    const buttons = qtyContainer.locator('button');
    const minusBtn = buttons.first();
    const plusBtn = buttons.last();

    await plusBtn.click();
    await page.waitForTimeout(200);
    const incVal = await spinInput.inputValue();
    expect(Number(incVal)).toBe(2);

    await minusBtn.click();
    await page.waitForTimeout(200);
    const decVal = await spinInput.inputValue();
    expect(Number(decVal)).toBe(1);
  });

});
