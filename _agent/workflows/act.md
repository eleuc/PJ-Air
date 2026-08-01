---
description: Punto de entrada universal para el Núcleo de Gobernanza. Sincroniza el búnker y ejecuta.
Regla: Toda comunicación con el usuario debe ser exclusivamente en español.
---

// Protocolo de Acción Autárquica (/act)

1. **Sinceramiento del Búnker (MANDATORIO)**:
   - Ejecutar `.\bin\logix.exe sync-context` para sincronizar el estado del ADN.
   - **Protocolo de Onboarding**: Si el `SESSION_UUID` ha cambiado o el sistema detecta una nueva sesión de IA, ejecutar `/takeover` de forma proactiva. No se permite el desarrollo sin tomar posesión previa.
   - Sincronizar objetivos con el `task.md` activo.

1.2. **Validación de Frontera (PREVENTIVO)**:
   - **Regla Oro**: Verificar que todos los archivos a modificar pertenecen al búnker activo. 
   - Si se detecta un intento de acceso a rutas de otros proyectos (ej. `antigravity_dpi` desde `miniduo`), **ABORTAR** e informar al PO de la violación del §6.5 de GEMINI.md.

2. **Detección de Escenario Estratégico**:

   **A) Tarea en Progreso (status = IN_PROGRESS)**:
   - Cargar el diseño desde el archivo en `.meta/sprints/[SPRINT-ID]/[TASK-ID].md`.
   - **Auditoría Técnica (Inspector AI)**: Ejecutar `dart test` para validar lógica aritmética (`Pulse`). Registrar pulso volumétrico con `.\bin\logix.exe act --bytes-in <V_IN> --bytes-out <V_OUT>`.
   - Marcar progreso en `task.md`.
   - **Registro de Actividad Libre**: Si el IA interactúa de forma continua sin usar herramientas, DEBE registrar el volumen consumido manualmente con `.\bin\logix.exe ping --bytes <N>`.
   - **Sincronización de ADN**: Ejecutar `.\bin\logix.exe sync-tasks`. (Falla si el audit de veracidad no es CLEAN).

   **B) Iniciación de Tarea (status = PENDING)**:
   - Seleccionar la siguiente tarea del backlog.
   - Activar con `status: IN_PROGRESS` en `backlog.json`.
   - Proceder al Escenario A.

   **C) Bloqueo de Integridad (DNA Mismatch)**:
   - Si `.\bin\logix.exe audit` detecta deriva no autorizada: Ejecutar `logix baseline` para certificar el nuevo estado (Requiere aprobación PO).
   - Ejecutar `/takeover` para limpiar la saturación (Profundidad).

   **D) Security Hold (Firma Requerida)**:
   - Si el motor devuelve un `[YIELD]`, detenerse.
   - Informar al PO: "Se detectó modificación en ARCHIVOS SAGRADOS. Requiere firma física en Sentinel."

3. **Restricciones de Autarquía Kernélica**:
   - PROHIBIDO agregar código sin su correspondiente test unitario en `test/`.
   - PROHIBIDO modificar `VISION.md`, `GEMINI.md` o `rules/` sin autorización vinculada.
   - Si no hay archivo de referencia técnica en `.meta/sprints/`: BLOQUEAR e informar al PO.

4. **Cierre de Ciclo**:
   - Sprints GOLD/ARCH: No hacer baseline individual, esperar cierre de sesión colegiado.
   - Validar integridad final con `.\bin\logix.exe audit --final`.
