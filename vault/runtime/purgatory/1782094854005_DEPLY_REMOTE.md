# Guía de Despliegue a Remoto

Esta guía detalla los pasos y configuraciones necesarias para pasar el proyecto **PJ-Air** de un entorno local a un servidor remoto (VPS, Heroku, DigitalOcean, etc.).

## 1. Variables de Entorno

Debes configurar las siguientes variables de entorno en tu plataforma de hosting.

### Backend (`/backend/.env`)

| Variable          | Descripción                      | Ejemplo                 |
| ----------------- | -------------------------------- | ----------------------- |
| `PORT`            | Puerto donde correrá el servidor | `3001`                  |
| `DATABASE_PATH`   | Ruta absoluta al archivo SQLite  | `/data/database.sqlite` |
| `NODE_ENV`        | Entorno de ejecución             | `production`            |
| `SUPABASE_URL`    | URL de Supabase para imágenes    | _(Tu URL)_              |
| `SUPABASE_KEY`    | Key de Supabase                  | _(Tu Key)_              |
| `GOOGLE_MAPS_KEY` | Key de Google Maps               | _(Tu Key)_              |

### Frontend (`/frontend/.env.local`)

| Variable                      | Descripción                  | Ejemplo                  |
| ----------------------------- | ---------------------------- | ------------------------ |
| `NEXT_PUBLIC_API_URL`         | URL pública de tu Backend    | `https://api.tu-app.com` |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Key de Google Maps (cliente) | _(Misma que el backend)_ |

## 2. Preparación de la Base de Datos

El sistema usa **SQLite** por defecto. Para un entorno remoto:

1. Asegúrate de que la carpeta donde esté el `DATABASE_PATH` tenga permisos de escritura.
2. Si usas Docker, monta un volumen para que la base de datos sea persistente.
3. Copia el archivo `database.sqlite` actual al servidor si deseas mantener los datos de prueba, o deja que se cree uno nuevo (asegúrate de correr los seeds si es necesario).

## 3. Comandos de Producción

### Backend

```bash
cd backend
npm install
npm run build
npm run start:prod
```

### Frontend

```bash
cd frontend
npm install
npm run build
npm run start
```

## 4. CORS (Seguridad)

En producción, es recomendable restringir qué dominios pueden acceder al backend.
Actualmente el backend tiene `app.enableCors()` abierto. En `backend/src/main.ts` puedes restringirlo a tu URL de frontend:

```typescript
app.enableCors({
  origin: "https://tu-frontend.com",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
});
```

## 5. Notas Importantes

- **Suspense Boundaries**: Se han corregido los errores de compilación de Next.js envolviendo el uso de `useSearchParams` en bloques `Suspense`.
- **Imágenes**: Asegúrate de que las URLs de las imágenes en la base de datos sean accesibles desde el dominio público.
