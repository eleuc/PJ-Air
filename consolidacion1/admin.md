# Informe de Consolidación - Módulo Administrador

Este documento detalla los archivos, ubicaciones y datos implicados en las funciones de administración central dentro del sistema de Panadería Jhoanes.

## 1. Frontend (Panel de Control y Gestión)

### Páginas Administrativas (App Router)

- **`frontend/app/admin/page.tsx`**: Dashboard principal. Muestra estadísticas rápidas (conteo de productos, usuarios, etc.) y accesos directos a la gestión.
- **`frontend/app/admin/orders/page.tsx`**: Gestión central de pedidos. Permite filtrar por estado, asignar repartidores, editar productos dentro de un pedido y ver el historial de auditoría.
- **`frontend/app/admin/users/page.tsx`**: Lista de usuarios registrados. Permite la actualización de roles (Admin, Cliente, Producción, Repartidor) y ver el detalle de actividad (direcciones y pedidos).
- **`frontend/app/admin/products/page.tsx`**: CRUD completo de productos. Creación, edición y eliminación de ítems del catálogo.
- **`frontend/app/admin/categories/page.tsx`**: Gestión de categorías de productos para el catálogo.
- **`frontend/app/admin/zones/page.tsx`**: Configuración de zonas geográficas para la logística de entregas.
- **`frontend/app/admin/routes/page.tsx`**: Gestión de rutas de reparto y asignación de zonas a conductores.

### Componentes Administrativos

- **`frontend/components/layout/AdminSidebar.tsx`**: Menú lateral de navegación con control de acceso basado en el rol del usuario conectado.

---

## 2. Backend (Control y Persistencia de Cambios)

### Endpoints Administrativos (NestJS Controllers)

- **`backend/src/orders/orders.controller.ts`**:
  - `PATCH /orders/:id/status`: Cambio manual del flujo de pedidos.
  - `PATCH /orders/:id/assign`: Asignación de un `delivery_user_id` a un pedido específico.
  - `PATCH /orders/:id`: Edición administrativa de un pedido (modificación de cantidades, precios u observaciones).
- **`backend/src/users/users.controller.ts`**:
  - `PATCH /users/:id/role`: Cambio de permisos globales para cualquier usuario.
  - `GET /users`: Recuperación de todos los perfiles con sus relaciones (direcciones y pedidos).
- **`backend/src/products/products.controller.ts`**:
  - `POST /products`: Creación de nuevos productos con carga de metadatos.
  - `PATCH /products/:id` & `DELETE /products/:id`: Mantenimiento del catálogo.

---

## 3. Base de Datos e Integridad Técncia

### Tablas bajo Control Admin

- **`users`**: Modificación directa de la columna `role`.
- **`orders`**: Modificación de las columnas `status`, `delivery_user_id`, `notes` y `total`.
- **`order_items`**: Re-escritura física de registros si el administrador modifica un pedido existente (borrado y reinserción).
- **`products`**: Modificación total de registros (precios, nombres, stock).

---

## 4. Análisis Dinámico (Observación del Flujo Admin)

Durante la sesión de exploración administrativa, se detectaron los siguientes patrones de interacción:

1.  **Auditoría de Pedidos**: Al modificar un pedido, el sistema genera automáticamente un `auditLog` dentro del campo `notes` de la tabla `orders`, registrando el motivo del cambio y el estado original del pedido.
2.  **Consolidación de Identidad**: El administrador utiliza el `id` global de los usuarios para orquestar la logística, vinculando direcciones de la tabla `addresses` con repartidores en la tabla `orders`.
3.  **Seguridad por Rol**: El backend aplica guards que verifican si el token JWT del usuario tiene el valor `admin` en la columna `role` antes de permitir peticiones `PATCH` o `POST`.

---

## 5. Conclusión de la Observación

El módulo administrador actúa como el orquestador del sistema, teniendo permisos de escritura sobre casi todas las entidades persistidas en `database.sqlite`. La lógica está diseñada para que cualquier "cambio menor" (Mecanec) en la logística sea registrado para evitar la pérdida de trazabilidad en los pedidos modificados manualmente.
