import { test, expect, Page } from '@playwright/test';

const FRONTEND_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASS = '123123';

async function loginAsAdmin(page: Page) {
  await page.goto(`${FRONTEND_URL}/auth/login`);
  await page.locator('input[type="text"]').fill(ADMIN_EMAIL);
  await page.locator('input[type="password"]').fill(ADMIN_PASS);
  await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Iniciar Sesión")');
  await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });
}

test.describe('Configuración Dinámica de Monto Mínimo de Pedido', () => {

  test('Debería cargar, guardar y persistir la configuración del monto mínimo', async ({ page }) => {
    // 1. Iniciar sesión como administrador
    await loginAsAdmin(page);

    // 2. Ir a la página de configuraciones
    await page.goto(`${FRONTEND_URL}/admin/settings`);
    await page.waitForTimeout(2000);

    // 3. Verificar que el input de monto mínimo esté presente
    const minOrderInput = page.locator('input[type="number"]');
    await expect(minOrderInput).toBeVisible();

    // 4. Cambiar el monto mínimo a 600
    await minOrderInput.fill('600');

    // 5. Guardar preferencias
    const saveButton = page.locator('button:has-text("Guardar Preferencias"), button:has-text("Save Preferences")');
    await saveButton.click();

    // 6. Verificar mensaje de éxito (toast)
    const successToast = page.locator('.fixed.bottom-10.right-10');
    await expect(successToast).toBeVisible({ timeout: 8000 });

    // 7. Recargar la página y verificar persistencia
    await page.reload();
    await page.waitForTimeout(2000);
    await expect(minOrderInput).toHaveValue('600');

    // 8. Restaurar el valor por defecto a 500
    await minOrderInput.fill('500');
    await saveButton.click();
    await expect(page.locator('.fixed.bottom-10.right-10')).toBeVisible({ timeout: 8000 });
  });

});
