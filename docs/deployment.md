# Deployment Guide

Esta guia cubre el despliegue de Tempus con:

- Frontend: Vercel
- Backend: Render
- Base de datos principal: Supabase Postgres

## 1. Supabase

1. Crea o abre el proyecto en Supabase.
2. En el dashboard, entra a `Connect`.
3. Copia la cadena `Supavisor Session pooler`; debe usar el puerto `5432`.
4. Usala como `DATABASE_URL` en Render.

Formato esperado:

```env
DATABASE_URL="postgres://[USER].[PROJECT_REF]:[PASSWORD]@[REGION].pooler.supabase.com:5432/postgres"
```

Para Prisma en un backend persistente como Render, usa el pooler en modo session. Si mas adelante movemos la API a un entorno serverless, se debe revisar el modo transaction.

## 2. Render Backend

Render debe desplegar el backend desde el repositorio usando el Dockerfile en `apps/api/Dockerfile`.

Variables necesarias:

```env
DATABASE_URL="postgres://..."
JWT_SECRET="genera_un_valor_seguro_de_32_o_mas_caracteres"
JWT_REFRESH_SECRET="genera_otro_valor_seguro_de_32_o_mas_caracteres"
ACCESS_TOKEN_EXPIRY="15m"
REFRESH_TOKEN_EXPIRY="7d"
CORS_ORIGIN="https://TU_FRONTEND.vercel.app"
NODE_ENV="production"
HOST="0.0.0.0"
LOG_LEVEL="info"
VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
VAPID_SUBJECT="mailto:admin@tempus.app"
```

Redis es opcional en el estado actual del codigo. Si no defines `REDIS_URL`, la API usa almacenamiento en memoria como fallback. Para produccion real, crea un Redis en Render o en otro proveedor y define:

```env
REDIS_URL="redis://..."
```

Flujo de despliegue:

1. Crea un nuevo Web Service en Render desde el repo.
2. Selecciona despliegue con Docker.
3. Configura el Dockerfile path como `apps/api/Dockerfile`.
4. Agrega las variables de entorno.
5. Antes del primer arranque, ejecuta las migraciones con `pnpm --filter @tempus/api db:deploy`.
6. Despliega.
7. Verifica `https://TU_BACKEND.onrender.com/health`.

Seed inicial opcional:

```bash
pnpm --filter @tempus/api db:seed
```

Ejecutalo una vez con `DATABASE_URL` apuntando a Supabase para crear/actualizar las categorias del sistema.

## 3. Vercel Frontend

Vercel debe desplegar el proyecto con `Root Directory` en `FrontEnd`.

Configuracion:

- Framework Preset: `Vite`
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm build`
- Output Directory: `dist`

Variable necesaria:

```env
VITE_API_BASE_URL="https://TU_BACKEND.onrender.com/api"
```

Despues del primer deploy de Vercel, vuelve a Render y actualiza `CORS_ORIGIN` con la URL real de Vercel.

## 4. Checklist Final

- `https://TU_BACKEND.onrender.com/health` responde `{ "status": "ok" }`.
- `VITE_API_BASE_URL` termina en `/api`.
- `CORS_ORIGIN` es la URL exacta del frontend, sin slash final.
- Supabase tiene las tablas creadas por Prisma migrations.
- El seed de categorias fue ejecutado al menos una vez.
