# SPRINT S08-PAYMENTS-ACCOUNTING - Sprint 08: Integración de Pasarelas de Pago y Xero
**Objetivo**: Implementar flujo de pago híbrido con Stripe y PayPal, y sincronización contable asíncrona con Xero.
**Fecha**: 2026-07-01

- [/] **TASK-08-01** [TECH/DOMAIN] Compatibilidad de contraseñas legadas (bcrypt) y restauración de base de datos en producción.
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
- [/] **TASK-08-13** [UI] Ordenamiento alfabético en listas del panel de administración (Clientes, Usuarios, Productos, Zonas, Rutas).
- [ ] **TASK-08-14** [TECH/DOMAIN] Backend: Módulo admin-actions independiente con endpoint PATCH /admin-actions/users/:id/reset-password. Jerarquía: admin no puede resetear a otro admin. Flag force_pwd_change en system_configs. Sin SMTP.
- [ ] **TASK-08-15** [TECH/DOMAIN] Backend: Extender respuesta de login para incluir require_password_change:true cuando el flag esté activo en system_configs. Modificación mínima y quirúrgica de AuthService.
- [ ] **TASK-08-16** [TECH/DOMAIN] Backend: Endpoint self-service PATCH /admin-actions/me/change-password. Verifica contraseña actual, actualiza hash con PBKDF2, elimina flag force_pwd_change de system_configs. Sin SMTP.
- [ ] **TASK-08-17** [UI] Frontend: Componente ForcePasswordChangeModal que intercepta navegación cuando require_password_change es true. Integración pasiva en layout raíz via AuthContext. Sin SMTP.
- [ ] **TASK-08-18** [UI] Frontend: Botón Restablecer Contraseña en detalle de usuario/cliente (admin/users y admin/clients). Botón Nuevo Usuario Staff (rol delivery/produccion/admin). Modificación aditiva mínima. Sin SMTP.
- [ ] **TASK-08-19** [TECH/TEST] Suite completa de pruebas: unitarias (Jest mocks), integración e2e backend (Supertest) y automatización UI (Playwright). Usuario de prueba: pwd-test@jhpanesbakery.com. Admin tester: rubendarioc o admin@test.com.
