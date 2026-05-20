# Requisitos de Implementacion: Conexion Frontend - Backend

## 1. Objetivo

Implementar una capa de integracion robusta entre el frontend React/Vite y la API Fastify de TimeFlow, reemplazando progresivamente los datos mock por datos reales del backend sin romper la experiencia actual de usuario.

El modulo debe respetar la arquitectura production-ready existente del backend: contratos tipados, autenticacion con doble token, validacion estricta con Zod, persistencia en PostgreSQL/Supabase, uso de Redis para seguridad operativa y pruebas automatizadas.

## 2. Alcance Inicial

La primera fase de integracion debe cubrir:

- Autenticacion real con `/api/auth/login`, `/api/auth/refresh` y `/api/auth/logout`.
- Recuperacion del usuario autenticado con `/api/users/me`.
- Carga real de tareas con `/api/tasks`.
- Creacion y actualizacion de tareas desde el frontend.
- Inicio, deteccion y cierre de sesiones de tiempo con `/api/sessions`.
- Manejo centralizado de errores de API.
- Persistencia segura del access token en cliente y uso de refresh token via cookie `httpOnly`.
- Compatibilidad temporal con mocks cuando no exista sesion autenticada.

Quedan fuera de esta fase, pero preparados para iteraciones posteriores:

- Registro/onboarding completamente persistido.
- Categorias y tags reales en UI.
- Analytics, weekly planning y dashboard avanzado desde endpoints reales.
- Notificaciones Web Push desde el cliente.
- Preferencias de audio, habitos y configuracion completa.

## 3. Principios Arquitectonicos

- El frontend no debe conocer detalles internos de Prisma ni de la base de datos.
- Las paginas React deben consumir un estado de aplicacion estable, no respuestas crudas del backend.
- Debe existir una capa anti-corrupcion entre API y UI para traducir diferencias de modelo.
- El access token debe adjuntarse automaticamente en peticiones protegidas.
- El refresh token no debe estar disponible para JavaScript; debe viajar como cookie segura.
- Los errores deben normalizarse antes de llegar a componentes visuales.
- La integracion debe ser incremental: las pantallas actuales no deben romperse si el backend no esta levantado.
- Todo contrato compartible debe vivir preferiblemente en `packages/shared-types`.

## 4. Requisitos Funcionales

### RF-01. Login Real

El frontend debe permitir iniciar sesion usando email y password.

Criterios:

- Enviar `POST /api/auth/login`.
- Guardar `accessToken` recibido.
- Permitir que el backend establezca cookie `refreshToken`.
- Cargar usuario actual despues de login.
- Redirigir a dashboard cuando el login sea exitoso.
- Mostrar error comprensible cuando las credenciales sean invalidas.

### RF-02. Restauracion de Sesion

Al abrir la aplicacion, si existe access token local, el frontend debe intentar restaurar la sesion.

Criterios:

- Consultar `/api/users/me`.
- Si el access token expiro, intentar `/api/auth/refresh`.
- Si refresh falla, limpiar sesion local y volver a landing.
- Si es exitoso, cargar tareas, sesiones y sesion activa.

### RF-03. Logout

El usuario debe poder cerrar sesion de forma segura.

Criterios:

- Enviar `POST /api/auth/logout`.
- Limpiar access token local.
- Permitir que backend limpie cookie de refresh.
- Reiniciar estado sensible del frontend.

### RF-04. Carga de Tareas

El frontend debe consultar tareas reales del usuario autenticado.

Criterios:

- Consumir `GET /api/tasks`.
- Soportar filtros futuros: `date`, `weekPlanId`, `status`, `categoryId`.
- Mapear `in_progress` del backend a `progress` si la UI conserva ese estado interno.
- Mantener orden y datos necesarios para dashboard y kanban.

### RF-05. Creacion de Tareas

La UI debe crear tareas reales en backend.

Criterios:

- Enviar `POST /api/tasks`.
- Incluir minimo: `title`, `scheduledDate`, `status`, `estimatedMinutes`.
- Actualizar UI con la tarea retornada por backend.
- Mostrar feedback de exito o error.

### RF-06. Actualizacion de Tareas

La UI debe actualizar tareas reales sin recargar toda la aplicacion.

Criterios:

- Enviar `PUT /api/tasks/:id` para cambios generales.
- Enviar `PATCH /api/tasks/:id/status` para cambios simples de estado cuando convenga.
- Aplicar actualizacion optimista solo con rollback si backend falla.
- Mantener mapeo de nombres entre UI y API.

### RF-07. Sesiones de Tiempo

El cronometro del frontend debe integrarse con sesiones reales.

Criterios:

- Iniciar sesion con `POST /api/sessions/start`.
- Consultar sesion activa con `GET /api/sessions/active`.
- Detener sesion con `POST /api/sessions/stop`.
- Calcular tiempo transcurrido localmente desde `startedAt`.
- Refrescar tareas/sesiones despues de cerrar una sesion.

### RF-08. Fallback de Desarrollo

Cuando no exista usuario autenticado, la UI puede seguir usando mocks.

Criterios:

- No bloquear landing ni navegacion de demo.
- Evitar llamadas protegidas si no hay token.
- Separar claramente flujo mock y flujo autenticado.

## 5. Requisitos No Funcionales

### RNF-01. Tipado Estricto

- No usar `any` en nueva capa de integracion.
- Definir tipos explicitos para respuestas de API.
- Reutilizar `packages/shared-types` cuando el empaquetado del monorepo este listo para frontend.

### RNF-02. Seguridad

- No guardar refresh token en `localStorage`.
- Adjuntar access token solo mediante header `Authorization: Bearer`.
- Usar `credentials: include` para permitir cookies `httpOnly`.
- Limpiar tokens ante errores 401 no recuperables.
- No exponer secretos ni URLs sensibles en codigo fuente.

### RNF-03. Performance

- Evitar cascadas innecesarias de requests.
- Cargar usuario, tareas, sesiones y sesion activa de forma paralela cuando sea posible.
- Mantener actualizaciones locales para que la UI responda rapido.
- Preparar cache/query layer futura si el volumen de datos crece.

### RNF-04. Resiliencia

- Todos los errores de API deben transformarse en una forma comun.
- La UI no debe romperse si backend devuelve error estructurado.
- El estado local debe poder recuperarse despues de una falla de red.

### RNF-05. Escalabilidad

- La capa API debe organizarse por dominio: `auth`, `tasks`, `sessions`, `analytics`, etc.
- Los mappers deben estar separados de los componentes.
- La integracion debe permitir migrar luego a React Query, Zustand u otra capa de cache sin reescribir pantallas.

## 6. Contratos Minimos de API

### Auth

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

Respuesta esperada de login/register:

```ts
interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    timezone: string;
    avatarUrl: string | null;
    emailVerified: boolean;
  };
  accessToken: string;
}
```

### Users

- `GET /api/users/me`
- `PATCH /api/users/me`

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `PATCH /api/tasks/:id/position`
- `DELETE /api/tasks/:id`

### Sessions

- `GET /api/sessions`
- `GET /api/sessions/active`
- `POST /api/sessions/start`
- `POST /api/sessions/stop`
- `DELETE /api/sessions/:id`

## 7. Variables de Entorno

Frontend:

```env
VITE_API_BASE_URL="http://localhost:3001/api"
```

Backend:

```env
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."
CORS_ORIGIN="http://localhost:5173"
```

Requisito importante:

- `CORS_ORIGIN` debe coincidir con la URL real del frontend.
- La API debe permitir `credentials: true`.

## 8. Modelo de Integracion Frontend

La estructura sugerida para el frontend es:

```txt
FrontEnd/src/app/api/
  http.ts          Cliente HTTP base
  auth.ts          Servicios de autenticacion
  tasks.ts         Servicios de tareas
  sessions.ts      Servicios de sesiones
  mappers.ts       Transformacion API <-> UI
  types.ts         Tipos de respuestas API
```

Responsabilidades:

- `http.ts`: base URL, headers, refresh automatico, parseo de errores.
- `auth.ts`: login, register, logout, usuario actual.
- `tasks.ts`: CRUD de tareas.
- `sessions.ts`: cronometro y sesiones.
- `mappers.ts`: conversion entre backend y frontend.
- `AppContext.tsx`: orquestacion temporal del estado de app.

## 9. Criterios de Aceptacion

La implementacion se considera aceptada cuando:

- El usuario puede iniciar sesion con credenciales reales.
- El frontend restaura sesion al recargar pagina.
- Las tareas visibles vienen del backend cuando hay usuario autenticado.
- Crear una tarea la persiste en PostgreSQL via API.
- Editar titulo, descripcion o estado persiste en backend.
- Iniciar cronometro crea una sesion real.
- Detener cronometro cierra la sesion real y actualiza tiempos.
- Si el access token expira, el frontend intenta refresh automaticamente.
- Si refresh falla, la sesion local se limpia.
- `npm run build` pasa en frontend.
- `npm run build` y `npm test` pasan en backend.

## 10. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigacion |
|---|---:|---|
| Diferencia de modelos UI/API | Alto | Mantener mappers centralizados |
| Expiracion de tokens durante uso | Alto | Refresh automatico y retry unico |
| Backend no disponible en desarrollo | Medio | Fallback mock sin token |
| CORS mal configurado | Alto | Documentar `CORS_ORIGIN` y `credentials` |
| Sesion activa desincronizada | Medio | Consultar `/sessions/active` al bootstrap |
| Crecimiento de estado en Context | Medio | Migrar a query/cache layer en fase posterior |

## 11. Roadmap de Implementacion

### Fase 1: Conexion Base

- Cliente HTTP.
- Auth real.
- Bootstrap de sesion.
- Tareas y sesiones reales.
- Fallback mock.

### Fase 2: Persistencia de Onboarding

- Registro real.
- Actualizacion de perfil.
- Creacion de primera tarea real.
- Zona horaria persistida.

### Fase 3: Dominio de Tareas Completo

- Tags reales.
- Categorias reales.
- Reordenamiento por posicion.
- Filtros por fecha/semana.
- Adjuntos.

### Fase 4: Analytics y Weekly

- Dashboard conectado a `/analytics/summary`.
- Distribucion por categoria.
- Plan semanal real.
- Resumen de sesiones.

### Fase 5: Produccion y Observabilidad

- Manejo avanzado de errores.
- Instrumentacion de latencia.
- Estados de carga y retry por modulo.
- Tests de integracion frontend con API mockeada.
- Preparacion para deploy con Supabase, Redis y variables por ambiente.

## 12. Definition of Done

- Codigo tipado y sin `any` nuevo.
- Servicios separados por dominio.
- Componentes sin llamadas directas a `fetch`.
- Mappers cubriendo diferencias de contrato.
- Build frontend exitoso.
- Build backend exitoso.
- Tests backend exitosos.
- Documentacion actualizada cuando cambie un contrato.
- Flujo probado manualmente con API real levantada.
