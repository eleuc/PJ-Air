# SPRINT S08-PAYMENTS-ACCOUNTING - Sprint 08: Integración de Pasarelas de Pago y Xero
**Objetivo**: Implementar flujo de pago híbrido con Stripe y PayPal, y sincronización contable asíncrona con Xero.
**Fecha**: 2026-07-02
# SPRINT S09-QOL - Sprint 09: Correcciones de Usabilidad y Reportes (QoL)
**Objetivo**: Atender bugs y mejoras de calidad de vida reportadas que afectan la experiencia del administrador y la consistencia de los datos.
**Fecha**: 2026-07-03

- [x] **TASK-08-01** [TECH/DOMAIN] Compatibilidad de contraseñas legadas (bcrypt) y restauración de base de datos en producción.
- [x] **TASK-08-02** [TECH/DOMAIN] Infraestructura DB: Tabla 'payments', tokens de Xero y expansión de status en Orders.
- [x] **TASK-08-03** [TECH/DOMAIN] Módulo de Pagos Backend: Setup SDKs Stripe & PayPal y Controladores de Intención de Pago.
- [x] **TASK-08-04** [TECH/UI] Frontend: Integración de Stripe Elements (Interfaz Segura de Tarjetas).
- [x] **TASK-08-05** [TECH/UI] Frontend: Integración de PayPal Smart Buttons.
- [x] **TASK-08-06** [TECH/DOMAIN] Webhooks de Pasarelas: Recepción segura y actualización de estados en DB.
- [x] **TASK-08-07** [TECH/DOMAIN] Autenticación Xero: Módulo OAuth 2.0, Almacenamiento y Refresco de Tokens.
- [x] **TASK-08-08** [TECH/DOMAIN] Sincronización Xero: Lógica de negocio (Customers, Invoices y Payments).
- [x] **TASK-08-09** [TECH/DOMAIN] Cola de Tareas (Queue): Orquestación asíncrona entre Pagos y Sincronización Xero.
- [x] **TASK-08-10** [TECH/DOMAIN] Permisión de cambio de estado en órdenes entregadas/canceladas (Admin override).
- [x] **TASK-08-11** [TECH/DOMAIN] Campo Nickname en entidad Profile y sincronización en reportes Excel.
- [x] **TASK-08-12** [UI/TEST] Pruebas automatizadas de UI (Playwright) para validación de cambio de estado y Nickname.
- [x] **TASK-08-13** [UI] Ordenamiento alfabético en listas del panel de administración (Clientes, Usuarios, Productos, Zonas, Rutas).
- [x] **TASK-08-14** [TECH/DOMAIN] Backend: Módulo admin-actions independiente con endpoint PATCH /admin-actions/users/:id/reset-password. Jerarquía: admin no puede resetear a otro admin. Flag force_pwd_change en system_configs. Sin SMTP.
- [x] **TASK-08-15** [TECH/DOMAIN] Backend: Extender respuesta de login para incluir require_password_change:true cuando el flag esté activo en system_configs. Modificación mínima y quirúrgica de AuthService.
- [x] **TASK-08-16** [TECH/DOMAIN] Backend: Endpoint self-service PATCH /admin-actions/me/change-password. Verifica contraseña actual, actualiza hash con PBKDF2, elimina flag force_pwd_change de system_configs. Sin SMTP.
- [x] **TASK-08-17** [UI] Frontend: Componente ForcePasswordChangeModal que intercepta navegación cuando require_password_change es true. Integración pasiva en layout raíz via AuthContext. Sin SMTP.
- [x] **TASK-08-18** [UI] Frontend: Botón Restablecer Contraseña en detalle de usuario/cliente (admin/users y admin/clients). Botón Nuevo Usuario Staff (rol delivery/produccion/admin). Modificación aditiva mínima. Sin SMTP.
- [x] **TASK-08-19** [TECH/TEST] Suite completa de pruebas: unitarias (Jest mocks), integración e2e backend (Supertest) y automatización UI (Playwright). Usuario de prueba: pwd-test@jhpanesbakery.com. Admin tester: rubendarioc o admin@test.com.
- [x] **TASK-08-20** [TECH/UI] Habilitar formulario de cambio de contraseña para personal Staff (delivery y producción) en sus respectivas vistas de settings.
- [x] **TASK-08-21** [UI/DOMAIN] Auditoría e integración del Nickname (campo nickname en perfiles de clientes) en las vistas internas del panel de administración (listados de órdenes, clientes) y validación de consistencia en reportes Excel.
- [x] **TASK-08-22** [TECH/TEST] Suite de pruebas automatizadas (Jest y Playwright) para el cambio de contraseña de staff y visualización interna del nickname.
- [x] **TASK-09-01** [TECH/DOMAIN] **Bugfix: Guardar Costo Mínimo de Compra.**
    *   **Detalle**: Investigar y corregir el error que impide guardar el valor de "costo mínimo de compra" desde el panel de `Settings`. Implica revisar el controlador `PATCH /settings` en el backend y el servicio que lo consume en el frontend.

- [x] **TASK-09-02** [TECH/UI] **Refactor: Ordenamiento Jerárquico de Productos.**
    *   **Detalle**: Modificar las vistas and fuentes de datos de productos (listas de admin, reportes) para que se ordenen primero por nombre de categoría (A-Z) y luego por nombre de producto (A-Z) dentro de cada categoría.

- [x] **TASK-09-03** [TECH/DOMAIN] **Mejora: Usar Nickname en Hojas de Reportes Excel.**
    *   **Detalle**: Actualizar el módulo de generación de reportes Excel para que, además de usar el `nickname` en el contenido, lo utilice para nombrar las hojas de cálculo individuales de cada usuario, mejorando la navegabilidad de los reportes.

- [x] **TASK-09-04** [TECH/DOMAIN] **Bugfix: Desajuste de Rutas de Subida (Uploads Mismatch) en Controladores.**
    *   **Detalle**: Modificar ProductsController y UsersController en el backend para utilizar la ruta dinámica centralizada UPLOAD_PATH en lugar del path hardcodeado process.cwd() + '/uploads'.

- [x] **TASK-09-05** [TECH/DOMAIN] **Alineación de Base de Datos Local y Corrección de Herramientas.**
    *   **Detalle**: Restaurar base de datos de producción en la raíz, eliminar base de datos duplicada en backend/, extraer imágenes de productos y corregir rutas relativas en scripts de backend/tools/.




