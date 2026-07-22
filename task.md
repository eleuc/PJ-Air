# SPRINT S12-EXTERNAL-BACKUPS - Respaldos Periódicos Automáticos en Google Drive
**Objetivo**: Configuración de rclone en el VPS para respaldos automatizados diarios de la base de datos y uploads hacia Google Drive.
**Fecha**: 2026-07-22

- [x] **TASK-12-01** [TECH/INFRA] Instalación y vinculación interactiva de rclone en el VPS con la cuenta de Google Drive del cliente.
- [x] **TASK-12-02** [TECH/INFRA] Creación del script de respaldo automático (/root/backup_to_gdrive.sh) e integración incremental con crontab (2:00 AM diario).
