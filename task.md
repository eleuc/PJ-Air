# task.md — Sprint 13: Mejoras de Gestión Operacional
**Bunker**: pj-air (jhoanes) | **Kernel**: 3.6.2 | **Inicio**: 2026-08-13

---

## TASK-13-01 — Mínimo de Orden Configurable por Cliente
**Label**: `FEAT/FULL-STACK` | **Detail**: `vault/runtime/detail_docs/TASK-13-01.md`

- `[x]` ADD `min_order_amount DECIMAL(10,2) NULL` a `user.entity.ts`
- `[x]` Ejecutar migration SQL: `ALTER TABLE users ADD COLUMN min_order_amount DECIMAL(10,2) NULL DEFAULT NULL`
- `[x]` ADD `updateMinOrderAmount()` en `users.service.ts`
- `[x]` ADD `PATCH /users/:id/min-order-amount` en `users.controller.ts`
- `[x]` MODIFY `checkout/page.tsx`: leer `profile.min_order_amount` primero, fallback al global
- `[x]` ADD campo editable en admin panel del cliente (junto a `general_discount` y `delivery_fee`)
- `[x]` Verificar físicamente en SQLite: `SELECT id, min_order_amount FROM users LIMIT 5`

---

## TASK-13-02 — Eliminar Clientes y Unificación UI
**Label**: `FEAT/FULL-STACK` | **Detail**: `vault/runtime/detail_docs/TASK-13-02.md`

- `[x]` ADD `remove(userId)` en `users.service.ts` con validación de órdenes activas
- `[x]` ADD `DELETE /users/:id` en `users.controller.ts` (protegido por rol admin)
- `[x]` ADD botón "Eliminar" con modal de confirmación en lista de clientes del admin
- `[x]` Verificar que órdenes históricas (`delivered`, `cancelled`) persisten en DB tras delete
- `[x]` Unificación terminológica: filtrar `role = 'client'` como "Clientes" en UI admin

---

## TASK-13-03 — Entrega Diferida con Fecha Seleccionable
**Label**: `FEAT/UI+BACKEND` | **Detail**: `vault/runtime/detail_docs/TASK-13-03.md`

- `[x]` REMOVE bloque "Payment Policy / Payment Due Date" del checkout del cliente
- `[x]` ADD `deliveryDateISO` state con cálculo de fecha mínima (NY TZ, +2 o +3 días)
- `[x]` ADD `<input type="date">` con `min={minDeliveryDate}` en sección "Fecha de Entrega"
- `[x]` MODIFY `handleSubmit()`: pasar `deliveryDate: deliveryDateISO` (YYYY-MM-DD) al backend
- `[x]` ADD parámetro `filterBy: 'created_at' | 'delivery_date'` en `findInRange()` del service
- `[x]` ADD query param `filterBy` en `GET /orders/reports/range` del controller
- `[x]` Verificar: orden con `delivery_date` futura NO aparece en reporte de hoy

---

## TASK-13-04 — Gestión de Estado de Pago (Xero + Transferencia Bancaria)
**Label**: `FEAT/FULL-STACK` | **Detail**: `vault/runtime/detail_docs/TASK-13-04.md`

- `[x]` ADD `updatePaymentInfo()` en `orders.service.ts`
- `[x]` ADD `PATCH /orders/:id/payment` en `orders.controller.ts`
- `[x]` ADD sección "Estado de Pago" en detalle de orden del admin (badge + selector + referencia)
- `[x]` ADD handler `handleMarkPaid()` con llamada a `PATCH /orders/:id/payment`
- `[x]` ADD handler `handleSyncXero()` con llamada a `POST /xero/sync/:orderId`
- `[x]` ADD bloque informativo de pago pendiente en vista de órdenes del cliente (`/orders`)
- `[x]` Verificar: `payment_status`, `payment_gateway`, `payment_transaction_id` persisten en DB
