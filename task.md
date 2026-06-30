# SPRINT S08-PAYMENTS-ACCOUNTING - Sprint 08: Integración de Pasarelas de Pago y Xero
**Objetivo**: Implementar flujo de pago híbrido con Stripe y PayPal, y sincronización contable asíncrona con Xero.
**Fecha**: 2026-06-30

- [ ] **TASK-08-01** [TECH/DOMAIN] Compatibilidad de contraseñas legadas (bcrypt) y restauración de base de datos en producción.
- [ ] **TASK-08-02** [TECH/DOMAIN] Infraestructura DB: Tabla 'payments', tokens de Xero y expansión de status en Orders.
- [ ] **TASK-08-03** [TECH/DOMAIN] Módulo de Pagos Backend: Setup SDKs Stripe & PayPal y Controladores de Intención de Pago.
- [ ] **TASK-08-04** [TECH/UI] Frontend: Integración de Stripe Elements (Interfaz Segura de Tarjetas).
- [ ] **TASK-08-05** [TECH/UI] Frontend: Integración de PayPal Smart Buttons.
- [ ] **TASK-08-06** [TECH/DOMAIN] Webhooks de Pasarelas: Recepción segura y actualización de estados en DB.
- [ ] **TASK-08-07** [TECH/DOMAIN] Autenticación Xero: Módulo OAuth 2.0, Almacenamiento y Refresco de Tokens.
- [ ] **TASK-08-08** [TECH/DOMAIN] Sincronización Xero: Lógica de negocio (Customers, Invoices y Payments).
- [ ] **TASK-08-09** [TECH/DOMAIN] Cola de Tareas (Queue): Orquestación asíncrona entre Pagos y Sincronización Xero.
- [/] **TASK-08-10** [TECH/DOMAIN] Permisión de cambio de estado en órdenes entregadas/canceladas (Admin override).
- [/] **TASK-08-11** [TECH/DOMAIN] Campo Nickname en entidad Profile y sincronización en reportes Excel.
- [/] **TASK-08-12** [UI/TEST] Pruebas automatizadas de UI (Playwright) para validación de cambio de estado y Nickname.
