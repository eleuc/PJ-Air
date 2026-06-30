# Workflow: /recovery (Protocolo de Auto-SanaciÃ³n SÃ³nica)

## FASE -1: Detección de Lock Zombie [MANDATORIO]
- Si existe .meta/session.lock y ha expirado (>8 horas de inactividad o bloqueo persistente en UI), se considera un Lock Zombie.
- Purgar de forma preventiva ejecutando: .\bin\logix.exe purge para restaurar el estado limpio antes de reanudar.

// Protocolo de RecuperaciÃ³n de Emergencia (/recovery)

Este workflow detalla los pasos crÃ­ticos para la reanudaciÃ³n autÃ¡rquica tras un crash del sistema o una pÃ©rdida de contexto masiva. Su objetivo es garantizar que la IA entrante pueda establecer una lÃ­nea base de verdad sin heredar deriva del estado fallido.

## 1. Fase de SincronizaciÃ³n (Takeover)
Antes de cualquier anÃ¡lisis, es imperativo sincronizar el bÃºnker con la realidad fÃ­sica del repositorio.
## 1. FASE 0: SincronizaciÃ³n de Red [MANDATORIO]
Antes de iniciar la recuperaciÃ³n, sincronizar el ADN con el repositorio remoto para evitar desincronizaciÃ³n cognitiva.
1. Ejecutar `git pull origin HEAD --rebase`.
2. Si falla (offline): Continuar con estado local y alertar al PO sobre posible desincronizaciÃ³n de hilos.
3. Si hay conflictos: Resolver a favor de `origin` si es un nodo Fleet, o manual si es el Oracle.

## 2. FASE 1: DiagnÃ³stico de Integridad (Autonomous Audit)
Identificar dÃ³nde se detuvo el motor antes de la falla.

- [ ] **Ejecutar Takeover**: `logix takeover --force`
- [ ] **Validar ADN**: `logix audit`
  - Si `Drift > 0`: Identificar si es deuda delegada (backlog/sprints) o corrupciÃ³n real.
  - Si es deuda delegada vÃ¡lida: `logix baseline` para sellar el ADN y resetear deriva.
- [ ] **Verificar BitÃ¡cora**: `view_file` sobre `backlog.json` y `HISTORY.md`.
- [ ] **Validar Tareas**:
  - Comparar el `current_task` en `backlog.json` con los commits de Git recientes.
  - Si una tarea estÃ¡ marcada como `DONE` pero el cÃ³digo no refleja el cambio: Marcar como `PENDING/IN_PROGRESS` y re-ejecutar.
  - Si la tarea estaba en `IN_PROGRESS`: Verificar la integridad de los archivos modificados parcialmente.

## 3. AsimilaciÃ³n de Continuidad Cognitiva
- Leer el mensaje del Agente Saliente (si existe) inyectado en el `relay`.
- Incorporar la nota estratÃ©gica al contexto actual y reportarla al PO antes de iniciar el workflow `/act`.

## 4. Purga de SaturaciÃ³n (Healing)
Neutralizar la fatiga cognitiva residual (SHS) para prevenir alucinaciones de continuidad.

- [ ] 1. **Purga de Artefactos (Diferenciada)**:
   - **En Servidor Oracle (tiene `lib/`)**: Ejecutar limpieza profunda de compilaciÃ³n: `Remove-Item .dart_tool, build -Recurse -Force`.
   - **En Nodos Fleet (solo `bin/`)**: Omitir purga de artefactos. Solo ejecutar `logix purge`.
- [ ] 2. **Purga del BÃºnker**: Ejecutar protocol `/purge-saturation`.
- [ ] **Reset de Odometer**: Verificar que `vault/runtime/turns_since_act.txt` estÃ© en 0 tras el takeover.

## 5. BifurcaciÃ³n de Escenario
El protocolo de recuperaciÃ³n varÃ­a segÃºn el objetivo (Target).

### Caso A: NÃºcleo de Gobernanza (Kernel)
- [ ] **CertificaciÃ³n de Binarios**: Ejecutar `logix audit` y verificar que el `logix.exe` no estÃ© en estado `Dirty/Mismatch`.
- [ ] **Sello de Manifiesto**: Asegurar que `vault/kernel.hashes.sig` coincida con el estado actual.

### Caso B: Nodo de Flota (ej. miniduo)
- [ ] **ValidaciÃ³n de Registro**: Consultar `vault/runtime/fleet_registry.json`.
- [ ] **Purga Local**: Eliminar `build/`, `.dart_tool/` y archivos `.lock` que puedan haber quedado "zombies".
- [ ] **Veracity Check**: Ejecutar `logix fleet-audit` desde el Kernel para certificar el nodo.

## 5. Re-Encausamiento Nominal
- [ ] **Activar Tarea**: `logix act --task-id <ID_PENDIENTE>`.
- [ ] **Actualizar Dashboard**: Verificar que `DASHBOARD.md` muestre Integridad NOMINAL y el Sprint correcto.
- [ ] **Notificar al PO**: Resumir el estado de recuperaciÃ³n y los hitos rescatados.

---
> [!IMPORTANT]
> **REGLA DE ORO**: Nunca proceder con lÃ³gica de negocio si el ADN reporta `DRIFT`. El sellado mediante `baseline` es la Ãºnica "medicina" autorizada.

