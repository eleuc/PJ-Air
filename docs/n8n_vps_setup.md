# Escenario Técnico y Acceso VPS - Servidor N8N

Documento de separación arquitectónica y técnica para la instancia independiente de **N8N** alojada en la infraestructura VPS.

---

## 1. Información de Infraestructura VPS

| Parámetro | Detalle |
| :--- | :--- |
| **IP del Servidor (VPS)** | `187.124.67.53` |
| **Usuario SSH** | `root` |
| **Método de Acceso** | Llave SSH / SSH Password (según política del VPS) |
| **Comando de Conexión** | `ssh root@187.124.67.53` |
| **Sistema Operativo** | Linux (Ubuntu / Debian LTS) |
| **Reverse Proxy Global** | Nginx |

---

## 2. Configuración del Servicio N8N

| Parámetro | Valor / Ruta |
| :--- | :--- |
| **Dominio / Subdominio** | `n8n.jhoanes.com` *(o subdominio asignado para automatizaciones)* |
| **Puerto Interno (Container/Process)** | `5678` |
| **Directorio de Despliegue** | `/var/www/n8n` *(o `/opt/n8n` si se despliega via Docker)* |
| **Orquestación / Gestor de Proceso** | Docker Compose / PM2 (`n8n`) |
| **Certificado SSL** | Let's Encrypt (Certbot via Nginx Reverse Proxy) |

---

## 3. Arquitectura del Reverse Proxy (Nginx)

Configuración recomendada en `/etc/nginx/sites-available/n8n.conf` para aislar las peticiones de N8N del proyecto PJ-Air:

```nginx
server {
    listen 80;
    server_name n8n.jhoanes.com;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name n8n.jhoanes.com;

    ssl_certificate /etc/letsencrypt/live/n8n.jhoanes.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/n8n.jhoanes.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Soporte para WebSockets en N8N
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 4. Despliegue con Docker Compose (Recomendado para Separación)

En el VPS, la instancia de N8N opera de forma aislada en su propia red de contenedores:

**Ruta en VPS**: `/var/www/n8n/docker-compose.yml`

```yaml
version: '3.8'

services:
  n8n:
    image: docker.n8n.io/n8nio/n8n
    container_name: n8n_app
    restart: always
    ports:
      - "127.0.0.1:5678:5678"
    environment:
      - N8N_HOST=n8n.jhoanes.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://n8n.jhoanes.com/
      - GENERIC_TIMEZONE=America/Santo_Domingo
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
    external: true
```

---

## 5. Mantenimiento y Comandos Útiles

- **Ver Estado del Servicio N8N**:
  - Docker: `docker ps | grep n8n`
  - Logs en tiempo real: `docker logs -f n8n_app`
- **Reiniciar N8N**:
  - Docker: `cd /var/www/n8n && docker compose restart`
- **Renovación SSL de N8N**:
  - `sudo certbot renew --deploy-hook "systemctl reload nginx"`

---

## 6. Aislamiento respecto a PJ-Air

1. **Sin dependencias compartidas**: N8N corre en su puerto dedicado (`5678`) y contenedor aislado. No comparte librerías ni runtime con la aplicación PJ-Air (Backend Node en puerto `3001` / `3101`).
2. **Reverse Proxy Independiente**: Manejado de forma modular mediante un bloque `server` propio en Nginx.
3. **Persistencia**: La base de datos interna y credenciales de N8N se almacenan de forma independiente en el volumen `n8n_data`.
