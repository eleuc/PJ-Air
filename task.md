# task.md — Sprint 14: Experiencia de Pago, Transferencia Bancaria e Internacionalización Unificada (i18n)
**Bunker**: pj-air (jhoanes) | **Kernel**: 3.6.2 | **Inicio**: 2026-08-14

---

## TASK-14-01 — Reorganización Modular del Checkout y Edición Rápida de Fecha
**Label**: `FEAT/UI-UX` | **Detail**: `vault/runtime/detail_docs/TASK-14-01.md`

- `[ ]` Reorganizar layout de `/checkout` en 4 bloques: 1. Entrega, 2. Fecha de Entrega, 3. Método de Pago, 4. Notas
- `[ ]` Implementar botón de edición rápida de fecha en el sticky summary de la columna derecha
- `[ ]` Conectar scroll / focus automático hacia la sección de fecha de entrega
- `[ ]` Mantener consistencia de cálculo de fecha mínima (corte 1:00 PM NY)
- `[ ]` Validar interactividad fluida y responsive en móvil y escritorio

---

## TASK-14-02 — Flujo y Gestión de Transferencia Bancaria
**Label**: `FEAT/FULL-STACK` | **Detail**: `vault/runtime/detail_docs/TASK-14-02.md`

- `[ ]` Crear sección "Información Bancaria para Transferencias" en `/admin/settings` (Banco, Titular, Cuenta, Routing, Email)
- `[ ]` Conectar persistencia de datos bancarios con `system_configs` (`bank_transfer_info`)
- `[ ]` Añadir selector de método de pago en `/checkout` (Transferencia Bancaria vs En Cuenta)
- `[ ]` Desplegar datos bancarios dinámicos y campo opcional para número de referencia/comprobante
- `[ ]` Persistir `payment_gateway: 'bank_transfer'`, `payment_status: 'unpaid'` y `payment_transaction_id` al enviar orden
- `[ ]` Añadir modal / pantalla de confirmación con instrucciones bancarias claras post-pedido

---

## TASK-14-03 — Unificación y Auditoría de Internacionalización (i18n)
**Label**: `FEAT/I18N` | **Detail**: `vault/runtime/detail_docs/TASK-14-03.md`

- `[ ]` Establecer Inglés (`en`) como idioma maestro por defecto para nuevas sesiones
- `[ ]` Centralizar y homologar 100% de las cadenas en `frontend/lib/i18n/en.ts` y `frontend/lib/i18n/es.ts`
- `[ ]` Eliminar helpers temporales `lbl()` y textos hardcodeados en `/checkout`, `/admin/*`, `/orders/*`
- `[ ]` Auditar modales, toasts, alertas y botones para certificar paridad 1-a-1 sin mezclas de idioma
- `[ ]` Verificar cambio instantáneo EN/ES en toda la aplicación
