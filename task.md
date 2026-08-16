# SPRINT S16 - Sprint 16: Reestructuracion de Pagos, Vista de Confirmacion y Circuito Xero
**Objetivo**: Reestructurar metodos de pago en checkout (Pago Inmediato Online vs Transferencia Bancaria), adaptar la vista de confirmacion /orders/[id] para respetar pedidos por transferencia y certificar el circuito con Xero.
**Fecha**: 2026-08-16

- [x] **TASK-16-01** [FEAT/UI-UX] Reestructuracion de metodos de pago en Checkout: Pago Inmediato Online (Stripe/PayPal) como opcion 1 y Transferencia Bancaria como opcion 2, eliminando Charge to Account.
- [x] **TASK-16-02** [FEAT/UI-UX] Vista de confirmacion adaptativa (/orders/[id]): mostrar resumen e instrucciones de transferencia para pedidos bank_transfer sin forzar widget de Stripe.
- [x] **TASK-16-03** [FEAT/FULL-STACK] Certificacion y barrido del circuito de sincronizacion con Xero para pagos online y transferencias aprobadas.
- [x] **TASK-16-04** [FEAT/UI-UX] Revision diagnostica y pulido visual UI/UX: tablas responsivas (admin/produccion) y seccion de promociones bilingue con badges.
- [x] **TASK-16-05** [FEAT/I18N] Purga de textos hardcodeados en espanol en vistas de orders, admin y produccion para garantizar persistencia y cobertura de i18n.
