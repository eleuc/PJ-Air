# Informe de Consolidación - Módulo Cliente

Este documento detalla los archivos, ubicaciones y datos implicados en las funciones orientadas al cliente dentro del sistema de Panadería Jhoanes.

## 1. Frontend (Capas de Interfaz y Lógica)

### Páginas (App Router)

- **`frontend/app/page.tsx`**: Página principal del sistema (Catálogo). Gestiona el listado de productos, búsqueda y filtrado por categorías.
- **`frontend/app/catalog/[id]/page.tsx`**: Detalle individual de un producto.
- **`frontend/app/auth/login/page.tsx`**: Interfaz de inicio de sesión para el cliente.
- **`frontend/app/auth/register/page.tsx`**: Interfaz de registro de nuevos clientes.
- **`frontend/app/checkout/page.tsx`**: Proceso de finalización de compra, selección de dirección y confirmación de pedido.
- **`frontend/app/profile/page.tsx`**: Gestión del perfil del cliente (datos personales y acceso a direcciones).
- **`frontend/app/profile/addresses/page.tsx`**: Gestión de direcciones de entrega del cliente.
- **`frontend/app/orders/page.tsx`**: Listado histórico de pedidos del cliente.
- **`frontend/app/orders/[id]/page.tsx`**: Detalle específico de un pedido realizado.

### Componentes Críticos

- **`frontend/components/catalog/ProductCard.tsx`**: Representación visual del producto en el catálogo.
- **`frontend/components/catalog/CategoryFilters.tsx`**: Filtros de categorías en el catálogo.
- **`frontend/components/layout/Navbar.tsx`**: Navegación principal que incluye el acceso al carrito y perfil.
- **`frontend/context/CartContext.tsx`**: Contexto global para la gestión del carrito de compras (estado persistente).

### Comunicación API

- **`frontend/lib/api.ts`**: Configuración de Axios para peticiones al backend.
- **`frontend/lib/products.ts`**: Tipado y utilidades relacionadas con productos.

---

## 2. Backend (Servidores y Lógica de Negocio)

### Módulos y Controladores

- **`backend/src/auth/`**:
  - `auth.controller.ts`: Endpoints para login y registro.
  - `auth.service.ts`: Lógica de validación de credenciales.
- **`backend/src/products/`**:
  - `products.controller.ts`: Endpoint `GET /products` para el catálogo.
  - `products.service.ts`: Recuperación de productos desde la base de datos.
- **`backend/src/orders/`**:
  - `orders.controller.ts`: Endpoints `POST /orders` (creación) y `GET /orders/user/:userId` (historial).
  - `orders.service.ts`: Lógica de creación de pedidos y asignación de items.
- **`backend/src/addresses/`**:
  - `addresses.controller.ts`: Gestión de direcciones (CRUD).
  - `addresses.service.ts`: Persistencia de direcciones por usuario.
- **`backend/src/users/`**:
  - `users.controller.ts`: Gestión de perfiles.
  - `users.service.ts`: Lógica de actualización de datos de usuario.

---

## 3. Base de Datos (Estructura y Persistencia)

### Archivo Principal

- **`database.sqlite`**: Ubicado en el directorio raíz. Contiene todas las tablas del sistema consolidado.

### Entidades (Tablas)

- **`User`** (`backend/src/users/user.entity.ts`): Datos de cuenta (email, password, rol).
- **`Profile`** (`backend/src/users/profile.entity.ts`): Información personal (nombre, teléfono, avatar).
- **`Product`** (`backend/src/products/product.entity.ts`): Catálogo de productos (nombre, precio, descripción, imagen).
- **`Address`** (`backend/src/addresses/address.entity.ts`): Direcciones de entrega vinculadas a cada usuario.
- **`Order`** (`backend/src/orders/order.entity.ts`): Cabecera del pedido (usuario, total, estado, dirección).
- **`OrderItem`** (`backend/src/orders/order-item.entity.ts`): Detalle de productos por cada pedido (producto, cantidad, precio histórico).

---

## 5. Análisis Dinámico (Flujo de Sesión Registrado)

Durante el proceso de prueba realizado, se identificaron las siguientes interacciones directas con el sistema:

### Registro e Inicio de Sesión

- **Archivos**: `frontend/app/auth/register/page.tsx`, `backend/src/auth/auth.controller.ts`.
- **Acción**: Creación de un nuevo registro en la tabla `users`. Se observó el uso del servicio de encriptación para la contraseña.

### Gestión de Perfil

- **Archivos**: `frontend/app/profile/page.tsx`, `backend/src/users/users.service.ts`.
- **Acción**: Actualización de la entidad `Profile`. El sistema vinculó correctamente la información personal al `userId` recién creado.

### Selección de Dirección y Checkout

- **Archivos**: `frontend/app/checkout/page.tsx`, `backend/src/addresses/addresses.controller.ts`.
- **Acción**: Se registró una nueva entrada en la tabla `addresses`. Se detectó la lógica de validación de zonas (ej: "Zona Sur") antes de permitir la finalización.

### Confirmación de Pedido

- **Archivos**: `frontend/app/checkout/page.tsx`, `backend/src/orders/orders.service.ts`.
- **Acción**: Se insertaron datos en `orders` y múltiples registros en `order_items` (uno por cada producto del carrito). El estado inicial se estableció como `pending`.

## 6. Conclusión de la Observación

El sistema presenta una arquitectura desacoplada donde el Frontend gestiona el estado del carrito localmente hasta el momento del Checkout, donde se sincroniza con el Backend mediante peticiones REST. La base de datos `database.sqlite` centraliza toda la persistencia, manteniendo la integridad referencial entre usuarios, direcciones y pedidos.

---

## 7. Flujo de Datos Indirecto

- El sistema utiliza **TypeORM** para la comunicación entre el backend y SQLite.
- Los datos de sesión se gestionan mediante **localStorage** en el frontend para persistir el carrito y el token de usuario.
- Las imágenes de productos se sirven actualmente desde URLs externas o almacenadas en el servidor (gestionado en el frontend).
