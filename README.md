# TimeFlow — Premium Time Management Backend API (Monorepo)

Este es el backend oficial de **TimeFlow**, un gestor de tiempo y productividad diseñado bajo los estándares más altos del desarrollo de software. Implementa una arquitectura en capas limpia, modular y desacoplada, empacada dentro de un monorepo administrado por **Turborepo** y **pnpm**.

El sistema integra control de tareas, cronometraje detallado por sesiones, resúmenes automáticos de productividad diaria, gamificación de rachas (cultivo y crecimiento de un árbol virtual interactivo), notificaciones push nativas del navegador (Web Push API) y configuraciones de personalización avanzadas.

---

## 🛠️ Stack Tecnológico

- **Core**: Node.js v20+, TypeScript 5 (tipado estricto, sin `any`), Fastify v4 (alto rendimiento).
- **Base de Datos**: PostgreSQL 16 & Prisma ORM 5.
- **Caché y Límites**: Redis (`ioredis`) para rate-limiting y almacenamiento en caché de tokens de refresco.
- **Seguridad**: JWT (Tokens de acceso de vida corta) + Refresh tokens rotativos seguros guardados en Cookies `httpOnly` con Redis allow-list.
- **Asincronía & Jobs**: `node-cron` para calendarizar cálculos diarios de streaks, evolución de árboles y generación de resúmenes.
- **Notificaciones**: Web Push API con encriptación VAPID.
- **Validación**: Zod schemas compartidos entre API y frontend para una experiencia de desarrollo óptima (DX).
- **Pruebas**: Vitest y Fastify Inject.

---

## 📂 Estructura del Monorepo

```
Tempus/
├── apps/
│   └── api/                  # Servidor backend de Fastify + Prisma
│       ├── prisma/           # Esquema relacional y semillero (seeding)
│       ├── src/
│       │   ├── config/       # Base de datos, Redis, validación de .env
│       │   ├── jobs/         # Scheduler de crons programados
│       │   ├── modules/      # Lógica de dominio organizada por módulos
│       │   └── shared/       # Middleware, utilidades de fecha/hash, errores custom
│       └── tests/            # Suite completa de pruebas unitarias e integración
├── packages/
│   └── shared-types/         # Contratos de tipos y Zod schemas compartidos
└── FrontEnd/                 # Aplicación cliente
```

---

## 🚀 Guía de Inicio Rápido

### 1. Requisitos Previos
Asegúrate de tener instalados:
- Node.js >= 20.0.0
- pnpm >= 8.0.0
- PostgreSQL en ejecución
- Redis en ejecución

### 2. Instalar Dependencias
Desde la raíz del monorepo, ejecuta:
```bash
pnpm install
```

### 3. Configurar Entorno
Crea un archivo `.env` en `apps/api/` a partir de `.env.example`:
```bash
cp apps/api/.env.example apps/api/.env
```
Asegúrate de rellenar los datos de conexión de base de datos (`DATABASE_URL`), Redis, JWT secrets y las llaves VAPID para notificaciones push (opcional para desarrollo local).

### 4. Generar y Poblar la Base de Datos
Ejecuta las migraciones de Prisma y corre la semilla inicial de categorías del sistema:
```bash
# Generar el cliente de Prisma
pnpm --filter @tempus/api db:generate

# Correr migraciones locales
pnpm --filter @tempus/api db:migrate

# Ejecutar el seed inicial
pnpm --filter @tempus/api db:seed
```

### 5. Levantar el Entorno de Desarrollo
Lanza el monorepo en modo desarrollo. Turborepo iniciará en paralelo la API y el compilador de tipos compartidos:
```bash
pnpm dev
```
La API estará disponible en `http://localhost:3000`. Puedes verificar su estado en `http://localhost:3000/health`.

---

## 🧪 Pruebas Automatizadas

Vitest se encuentra mockeado de forma global para que Redis y las llamadas de red a Web Push no impidan ejecutar las pruebas localmente:
```bash
# Correr todas las pruebas (unitarias y de integración)
pnpm test
```

---

## 🏛️ Arquitectura y Flujo del Backend

Cada módulo en `apps/api/src/modules/` implementa una división limpia de responsabilidades:
1. **`routes.ts`**: Registra los endpoints en Fastify e inyecta el middleware de autenticación y rate-limit.
2. **`schema.ts`**: Importa los esquemas Zod de `@tempus/shared-types` y expone tipos estrictos para el tipado de cuerpos de petición.
3. **`controller.ts`**: Realiza el parsing y validación Zod de cuerpos, parámetros y query-strings, llamando al servicio y respondiendo consistentemente.
4. **`service.ts`**: Contiene la lógica de negocio pura, reglas del sistema y llamadas directas transaccionales de Prisma ORM.

---

## 🛡️ Endpoints Principales

| Módulo | Endpoint | Método | Descripción |
|---|---|---|---|
| **Auth** | `/api/auth/register` | `POST` | Registra usuario y le asigna configuración inicial |
| **Auth** | `/api/auth/login` | `POST` | Autentica al usuario y guarda cookies `httpOnly` |
| **Tasks** | `/api/tasks` | `GET` | Lista las tareas del usuario por filtros (fecha, semana, estado) |
| **Tasks** | `/api/tasks` | `POST` | Crea una tarea, calcula posición y planifica notificaciones |
| **Tasks** | `/api/tasks/:id/position` | `PATCH` | Reordena interactivamente la posición de las tareas |
| **Time Sessions** | `/api/sessions/start` | `POST` | Inicia un temporizador auto-cerrando la sesión previa |
| **Time Sessions** | `/api/sessions/stop` | `POST` | Detiene el temporizador y calcula la duración final |
| **Analytics** | `/api/analytics/summary` | `GET` | Retorna tasa de completitud y métricas de productividad |
| **Analytics** | `/api/analytics/categories` | `GET` | Retorna la distribución porcentual de tiempo por categoría |
| **Habits** | `/api/habits/settings` | `PUT` | Configura los criterios diarios para conseguir rachas |
| **Audio** | `/api/audio/thresholds` | `PUT` | Guarda el mapeo interactivo de colores de temporizador |
