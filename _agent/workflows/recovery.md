---
description: Protocolo de Auto-Sanación. Recupera continuidad cognitiva tras crash o pérdida de contexto.
Regla: Toda comunicación en español.
---

## FASE 0: Brain-First — Relay Cognitivo [G83-GENESIS] [MANDATORIO]
1. Buscar `vault/runtime/cognitive_relay.md`:
   - Si existe y NO es esqueleto (`brain_sweep_skeleton` / `[PENDIENTE]`): **leerlo íntegramente**. Es la fuente primaria de contexto.
   - Si es esqueleto vacío o no existe → continuar a Fase 0.5.
2. **Fase 0.5 — Fallback Transcript (P4: 10 pasos) [ANTI-AMNESIA]**:
   - Leer `vault/runtime/current_brain.json` (SSSoT de continuidad) para obtener la ruta exacta (`brain_path`) de la sesión crasheada a recuperar.
   - Ubicar el archivo `<brain_path>\.system_generated\logs\transcript.jsonl`.
   - Leer las **últimas 10 interacciones** (`USER_INPUT` y `PLANNER_RESPONSE`) para recuperar el hilo conceptual.
   - Contrastar la información hallada con `backlog.json` y regenerar `task.md`.
   - Extraer: tarea activa, último archivo modificado, bloqueos, próximos pasos.
3. Reportar al PO: "Contexto recuperado de [cognitive_relay / transcript]" con resumen de 3 líneas antes de proceder a /act.

## FASE -1: Detección de Lock Zombie [MANDATORIO]
- Si existe `.meta/session.lock` y ha expirado (>8h de inactividad o bloqueo persistente en UI): Lock Zombie.
- Purgar: `.\bin\logix.exe purge` para restaurar estado limpio antes de reanudar.

## 1. Sincronización de Red
- `git pull origin HEAD --rebase`. Si falla, continuar localmente y alertar.
- Conflictos: Resolver a favor de `origin` en Fleet; manual en Oracle.

## 2. Diagnóstico de Integridad y Auto-Sanación Sintáctica
- `logix takeover --force -c "<CONVERSATION_ID>"`.
- **Auto-Sanación Sintáctica Post-Crash**: `dart fix --apply && dart format .` (Sanación sintáctica de archivos heridos tras el crash).
- **Prueba de Resiliencia**: `dart test` (Garantiza veracidad de la lógica post-sanación).
- `logix audit`. Si `Drift > 0` es legítimo: `logix baseline`.
- **Silencio Forense**: Si pide firma RSA, detenerse y reportar.
- Validar sincronía de tareas de `backlog.json` con commits recientes.

## 3. Asimilación Cognitiva
- `logix recovery --brain` (ejecuta `syncBrainContinuity` con el path correcto post-G83-01).
- El binario mostrará `[COG-RELAY]` con el contenido del relay cognitivo si existe.
- Si el binario muestra `[COG-RELAY-CRITICAL]` (AMNESTY sin relay): completar el esqueleto generado automáticamente ANTES de /act.
- Reportar asimilación al PO.

## 4. Purga de Saturación
- **Oracle (con `lib/`)**: Eliminar `.dart_tool/` y `build/`.
- **Fleet (solo `bin/`)**: Omitir borrado físico, usar `logix purge`.
- **Auditoría Forense de Archivos (Mandatoria)**: Al encontrar archivos huérfanos o temporales, queda prohibido eliminarlos directamente. Se deben contrastar con el progreso en `backlog.json` y `task.md`. "No debemos borrar sin auditar".
- Limpieza cognitiva: `dart run tool/brain_sweep.dart` (genera esqueleto de `cognitive_relay.md` si no existe).

## 5. Bifurcación y Activación
- **Kernel (Oracle)**: Verificar `logix.exe` (no `Dirty`) y firmas en `vault/kernel.hashes.sig`.
- **Fleet**: Consultar `vault/runtime/fleet_registry.json` y certificar con `logix fleet-audit`.
- Re-encausar: `logix act --task-id <ID_PENDIENTE>` y regenerar `task.md` desde cero con base en `backlog.json`.
