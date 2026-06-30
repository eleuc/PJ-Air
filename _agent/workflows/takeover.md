---
description: Workflow: /takeover (Protocolo de Onboarding). Sincroniza la sesión de la IA con el ADN del Búnker.
Regla: Toda comunicación en español.
---

1. **Sincronización Sónica**:
   - Si SHS < 50% y ADN es VALID, ejecutar: `dart run tool/brain_sweep.dart; .\bin\logix.exe sync-context; .\bin\logix.exe takeover`.
   - **Asimilación**: Leer `TASK_RELAY.json` o nota de handover. Generar resumen explícito de continuidad.
   - **HWC Check**: Verificar si el relay anterior tiene `hwc_complete: true`. Si es `false` o ausente → emitir advertencia `[RELAY-INCOMPLETO]` y leer con más cuidado el `TASK_RELAY.json`.
   - **SSC Check**: El BAP reporta el `SSC` (pasos de sesión anterior del IDE). Si SSC > 1500 → emitir `[ZONA-CRITICA]`; si SSC > 400 → emitir `[ZONA-AMBAR]`.
   - **Silencio Forense**: Ante solicitud de firma RSA, detenerse y reportar. PROHIBIDO indagar.

2. **Detección de Deriva**:
   - Si hay deriva crítica en archivos GOLD (Banner ASCII / Sentinel Popup), ejecutar `.\bin\logix.exe audit`.

3. **Verificación de CODE_MAP**:
   - Confirmar que `vault/runtime/CODE_MAP.md` existe y tiene > 100 líneas.
   - Si no existe o está vacío: ejecutar `dart run tool/generate_code_map.dart` antes de proceder.
   - El logix lo valida automáticamente al final del takeover, pero el agente debe verificarlo explícitamente.

4. **Activación**:
   - **Resiliencia (CRP)**: Si estaba `IN_PROGRESS` con odómetro saturado, ejecutar `logix audit`. Si es `VALID`, restaurar `PENDING_REVIEW`. Si es `DRIFT`, revertir al commit estable.
   - Transitar a `/act`. Validar sprint en `DASHBOARD.md` contra `backlog.json`.


