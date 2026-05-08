# Guía de Despliegue Remoto (PJ-Air)

Esta guía documenta el procedimiento simplificado de despliegue y gestión de certificados SSL en el servidor VPS (`187.124.67.53`).

---

## 1. Configuración de Entornos

| Entorno        | Dominio               | Puerto Frontend | Puerto Backend | Base de Datos             | Config PM2                    |
| :------------- | :-------------------- | :-------------: | :------------: | :------------------------ | :---------------------------- |
| **Producción** | `app.jhoanes.com`     |     `3000`      |     `3001`     | `database.sqlite`         | `ecosystem.config.js`         |
| **Staging**    | `staging.jhoanes.com` |     `3100`      |     `3101`     | `database-staging.sqlite` | `ecosystem.staging.config.js` |

_Nota: Configura tus archivos `.env` en `backend/` y `frontend/` con las credenciales de Supabase, Google Maps y la respectiva API URL (ej. `https://staging.jhoanes.com/api` o `https://app.jhoanes.com/api`)._

---

## 2. Creación de Certificados SSL (Let's Encrypt)

Al agregar un nuevo dominio como `staging.jhoanes.com` en `nginx.conf`, Nginx fallará al iniciar si el certificado aún no existe. Sigue este procedimiento para "bootstrapear" el certificado sin tumbar producción:

1. **Comenta las directivas SSL** del bloque de staging en tu archivo Nginx remoto:
   ```nginx
   # listen 443 ssl;
   # ssl_certificate /etc/letsencrypt/live/staging.jhoanes.com/...;
   ```
2. **Recarga Nginx** para aplicar el puerto 80 únicamente:
   `sudo nginx -t && sudo systemctl reload nginx`
3. **Genera el certificado** sin alterar la configuración de Nginx:
   `sudo certbot certonly --nginx -d staging.jhoanes.com`
4. **Descomenta las directivas SSL** en Nginx.
5. **Verifica y recarga de forma final:**
   `sudo nginx -t && sudo systemctl reload nginx`

> [!TIP]
> Para renovar certificados y recargar Nginx automáticamente: `sudo certbot renew --deploy-hook "systemctl reload nginx"`

---

## 3. Procedimiento de Despliegue (Git-Based)

Cada vez que lances una nueva actualización, ejecuta los siguientes comandos directo en el servidor:

```bash
# 1. Acceder al servidor e ir a la raíz del proyecto
ssh root@187.124.67.53
cd /var/www/pj-air # staging esta en /var/www/pj-air-staging

# 2. Obtener la última versión desde GitHub
git checkout main   # (o git checkout staging para el entorno de Staging)
git pull origin main

# 3. Compilar Backend
cd backend && npm install && npm run build

# 4. Compilar Frontend
cd ../frontend && npm install && npm run build

# 5. Reiniciar servicios en PM2
cd ..
# Para Producción:
pm2 restart ecosystem.config.js --env production
# Para Staging:
pm2 restart ecosystem.staging.config.js --env production
```

---

## 4. Mantenimiento Rápido

- **Ver logs en tiempo real:** `pm2 logs`
- **Monitoreo interactivo:** `pm2 monit`
- **Estado de procesos:** `pm2 list`
- **Persistir configuración tras reinicio del VPS:** `pm2 save`
- **Logs de error de Nginx:** `sudo tail -n 50 /var/log/nginx/error.log`
