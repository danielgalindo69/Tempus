# ==========================================
# Dockerfile Multi-stage para TimeFlow API
# Monorepo optimizado con pnpm y Node.js 20
# ==========================================

# ── ETAPA 1: BASE ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN npm install -g pnpm@8.15.0
WORKDIR /app

# ── ETAPA 2: DEPENDENCIAS DE CONSTRUCCIÓN ──────────────────────────────────────
FROM base AS dependencies
# Copiar archivos de configuración del monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/api/package.json ./apps/api/

# Instalar dependencias del monorepo
RUN pnpm install --frozen-lockfile

# ── ETAPA 3: CONSTRUCCIÓN ──────────────────────────────────────────────────────
FROM dependencies AS builder
COPY packages/shared-types ./packages/shared-types
COPY apps/api ./apps/api

# Generar cliente de Prisma
RUN pnpm --filter @tempus/api db:generate

# Construir los paquetes del monorepo
RUN pnpm build

# Eliminar dependencias de desarrollo e instalar solo producción para el bundle final
RUN rm -rf node_modules && pnpm install --prod --frozen-lockfile

# ── ETAPA 4: EJECUCIÓN (PRODUCTION RUNNER) ────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000

# Crear usuario no root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify

# Copiar archivos compilados y dependencias necesarias
COPY --from=builder --chown=fastify:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=fastify:nodejs /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder --chown=fastify:nodejs /app/packages/shared-types/package.json ./packages/shared-types/package.json
COPY --from=builder --chown=fastify:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=fastify:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=fastify:nodejs /app/apps/api/prisma ./apps/api/prisma

# Usar el usuario de baja seguridad
USER fastify

EXPOSE 3000

# Iniciar la aplicación
CMD ["pnpm", "--filter", "@tempus/api", "start"]
