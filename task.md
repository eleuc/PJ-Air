# Sprint 15: Internacionalización Completa del Panel de Administración y Selector de Idioma

## TASK-15-01 — Selector de Idioma Interactivo en AdminSidebar y Header Administrativo
**Label**: `FEAT/UI-UX` | **Detail**: `vault/runtime/detail_docs/TASK-15-01.md`

- `[x]` Integrar selector de idioma en `frontend/components/layout/AdminSidebar.tsx` (modo expandido y colapsado)
- `[x]` Añadir indicador visual activo del idioma seleccionado (🇺🇸 English / 🇪🇸 Español)
- `[x]` Garantizar persistencia inmediata en `localStorage` y reactividad global sin recargar página
- `[x]` Validar diseño armónico en móvil y desktop

---

## TASK-15-02 — Internacionalización Total de Gestión de Pedidos (`/admin/orders`)
**Label**: `FEAT/I18N` | **Detail**: `vault/runtime/detail_docs/TASK-15-02.md`

- `[x]` Crear claves de diccionario completas para `adminOrders` en `en.ts` y `es.ts`
- `[x]` Traducir estados de órdenes (`Pedido`, `En Producción`, `Finalizado`, `En camino`, `En Entrega`, `Entregado`, `Cancelado`)
- `[x]` Traducir selector de fechas, barra de búsqueda por cliente/nickname y filtros de estado
- `[x]` Traducir modales de detalle de pedido, edición de ítems, asignación de chofer y sincronización de Xero
- `[x]` Traducir vista de impresión de pedido (`Printer`)

---

## TASK-15-03 — Internacionalización de Clientes, Usuarios y Productos (`/admin/clients`, `/admin/users`, `/admin/products`)
**Label**: `FEAT/I18N` | **Detail**: `vault/runtime/detail_docs/TASK-15-03.md`

- `[x]` Crear claves de diccionario para `adminClients`, `adminUsers` y `adminProducts` en `en.ts` y `es.ts`
- `[x]` Traducir tablas y cabeceras de columnas en `/admin/clients` y `/admin/users`
- `[x]` Traducir modal de cambio/reseteo de contraseña de usuarios y clientes
- `[x]` Traducir formulario de creación/edición de productos y subida de imágenes en `/admin/products`
- `[x]` Certificar con prueba automatizada Playwright en `https://testing.jhoanes.com`
