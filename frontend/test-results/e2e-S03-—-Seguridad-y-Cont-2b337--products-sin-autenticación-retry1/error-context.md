# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> S03 — Seguridad y Control de Accesos >> 1.2 — Bloquea acceso a /admin/products sin autenticación
- Location: tests\e2e.spec.ts:30:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/admin/products
Call log:
  - navigating to "http://localhost:3000/admin/products", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | 
  3   | const FRONTEND_URL = 'http://localhost:3000';
  4   | const ADMIN_EMAIL = 'admin@test.com';
  5   | const ADMIN_PASS = '123123';
  6   | 
  7   | // ─────────────────────────────────────────────
  8   | // Helper: login as admin and wait for dashboard
  9   | // ─────────────────────────────────────────────
  10  | async function loginAsAdmin(page: Page) {
  11  |   await page.goto(`${FRONTEND_URL}/auth/login`);
  12  |   await page.locator('input[type="text"]').fill(ADMIN_EMAIL);
  13  |   await page.locator('input[type="password"]').fill(ADMIN_PASS);
  14  |   await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Iniciar Sesión")');
  15  |   await page.waitForURL(`${FRONTEND_URL}/admin`, { timeout: 15000 });
  16  | }
  17  | 
  18  | // ─────────────────────────────────────────────────────
  19  | // SUITE 1 — SEGURIDAD Y CONTROL DE ACCESOS (TASK-03-02)
  20  | // ─────────────────────────────────────────────────────
  21  | test.describe('S03 — Seguridad y Control de Accesos', () => {
  22  | 
  23  |   test('1.1 — Bloquea acceso a /admin sin autenticación (redirige)', async ({ page }) => {
  24  |     await page.goto(`${FRONTEND_URL}/admin`);
  25  |     await page.waitForTimeout(2000);
  26  |     const url = page.url();
  27  |     expect(url).not.toContain('/admin');
  28  |   });
  29  | 
  30  |   test('1.2 — Bloquea acceso a /admin/products sin autenticación', async ({ page }) => {
> 31  |     await page.goto(`${FRONTEND_URL}/admin/products`);
      |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/admin/products
  32  |     await page.waitForTimeout(2000);
  33  |     const url = page.url();
  34  |     expect(url).not.toContain('/admin/products');
  35  |   });
  36  | 
  37  |   test('1.3 — Bloquea acceso a /admin/categories sin autenticación', async ({ page }) => {
  38  |     await page.goto(`${FRONTEND_URL}/admin/categories`);
  39  |     await page.waitForTimeout(2000);
  40  |     const url = page.url();
  41  |     expect(url).not.toContain('/admin/categories');
  42  |   });
  43  | 
  44  |   test('1.4 — Bloquea acceso a /admin/reports sin autenticación', async ({ page }) => {
  45  |     await page.goto(`${FRONTEND_URL}/admin/reports`);
  46  |     await page.waitForTimeout(2000);
  47  |     const url = page.url();
  48  |     expect(url).not.toContain('/admin/reports');
  49  |   });
  50  | 
  51  |   test('1.5 — Admin puede acceder al Dashboard y ve el h1', async ({ page }) => {
  52  |     await loginAsAdmin(page);
  53  |     await expect(page.locator('h1').first()).toBeVisible();
  54  |     expect(page.url()).toContain('/admin');
  55  |   });
  56  | 
  57  | });
  58  | 
  59  | // ─────────────────────────────────────────────────────────────────
  60  | // SUITE 2 — CRUD DE PRODUCTOS + SOFT DELETE (TASK-03-01)
  61  | // ─────────────────────────────────────────────────────────────────
  62  | test.describe('S03 — CRUD de Productos y Soft Delete', () => {
  63  | 
  64  |   test.beforeEach(async ({ page }) => {
  65  |     await loginAsAdmin(page);
  66  |     await page.goto(`${FRONTEND_URL}/admin/products`);
  67  |     await page.waitForTimeout(2000);
  68  |   });
  69  | 
  70  |   test('2.1 — Gestión de Productos carga con h1 correcto', async ({ page }) => {
  71  |     await expect(page.locator('h1')).toContainText('Gestión de Productos');
  72  |   });
  73  | 
  74  |   test('2.2 — Lista productos del catálogo (al menos 1 visible)', async ({ page }) => {
  75  |     // Waits for products to render (grid or list cards)
  76  |     const cards = page.locator('[data-testid="product-card"], .group').first();
  77  |     // Fallback: check that product count text appears
  78  |     await expect(page.locator('p:has-text("productos en el catálogo")')).toBeVisible({ timeout: 8000 });
  79  |   });
  80  | 
  81  |   test('2.3 — Abre modal de "Añadir Producto" correctamente', async ({ page }) => {
  82  |     await page.click('button:has-text("Añadir Producto")');
  83  |     await expect(page.locator('h2, h3').filter({ hasText: /producto/i }).first()).toBeVisible({ timeout: 5000 });
  84  |   });
  85  | 
  86  |   test('2.4 — Crea un producto nuevo y aparece en la lista', async ({ page }) => {
  87  |     const uniqueName = `TestProd-${Date.now()}`;
  88  | 
  89  |     await page.click('button:has-text("Añadir Producto")');
  90  |     await page.waitForTimeout(800);
  91  | 
  92  |     // Nombre (placeholder: "Ej: Croissant de Mantequilla")
  93  |     await page.locator('input[placeholder*="Croissant de Mantequilla"]').fill(uniqueName);
  94  | 
  95  |     // Categoría ES (placeholder: "Ej: Croissants") — first one
  96  |     await page.locator('input[placeholder="Ej: Croissants"]').first().fill('Croissants');
  97  | 
  98  |     // Categoría EN (placeholder: "Ej: Croissants") — second one
  99  |     await page.locator('input[placeholder="Ej: Croissants"]').nth(1).fill('Croissants');
  100 | 
  101 |     // Precio (type="number", placeholder: "0.00")
  102 |     await page.locator('input[type="number"][placeholder="0.00"]').fill('3.50');
  103 | 
  104 |     // Click "Crear Producto" — the exact button text when editingProduct is null
  105 |     await page.click('button:has-text("Crear Producto")');
  106 |     await page.waitForTimeout(2500);
  107 | 
  108 |     // Verify the product appears in the list
  109 |     await expect(page.locator(`text=${uniqueName}`)).toBeVisible({ timeout: 8000 });
  110 |   });
  111 | 
  112 |   test('2.5 — Soft Delete: producto desaparece de la lista tras eliminar', async ({ page }) => {
  113 |     // Get the first product name visible
  114 |     await page.waitForTimeout(1500);
  115 | 
  116 |     // Find the first delete button and click it
  117 |     const deleteButtons = page.locator('button:has(svg[class*="trash"], svg[data-lucide="trash-2"])');
  118 |     const count = await deleteButtons.count();
  119 |     if (count === 0) {
  120 |       // Fallback: try Trash2 icon button
  121 |       const trashBtn = page.locator('button').filter({ has: page.locator('svg') }).nth(2);
  122 |       await trashBtn.click();
  123 |     } else {
  124 |       await deleteButtons.first().click();
  125 |     }
  126 | 
  127 |     // Confirm dialog should appear
  128 |     await page.waitForTimeout(500);
  129 |     const confirmBtn = page.locator('button:has-text("Eliminar"), button:has-text("Confirmar"), button:has-text("Delete"), button:has-text("Confirm")');
  130 |     await expect(confirmBtn.first()).toBeVisible({ timeout: 5000 });
  131 | 
```