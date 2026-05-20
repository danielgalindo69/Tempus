import { prisma } from '../../config/database.js';
import { ConflictError, ForbiddenError, NotFoundError } from '../../shared/errors.js';
import { diffInSeconds } from '../../shared/utils/date.js';
import type { StartSessionBody, StopSessionBody } from './time-sessions.schema.js';

/**
 * Obtener la sesión activa del usuario (endedAt es null)
 */
export async function getActiveSession(userId: string) {
  return prisma.timeSession.findFirst({
    where: {
      userId,
      endedAt: null
    },
    include: {
      task: true
    }
  });
}

/**
 * Obtener historial de sesiones de tiempo de un usuario con filtros opcionales
 */
export async function getSessions(userId: string, query: { taskId?: string }) {
  const where: any = { userId };
  
  if (query.taskId) {
    where.taskId = query.taskId;
  }

  return prisma.timeSession.findMany({
    where,
    orderBy: { startedAt: 'desc' },
    include: {
      task: true
    }
  });
}

/**
 * Iniciar una nueva sesión de tiempo para una tarea
 */
export async function startSession(userId: string, data: StartSessionBody) {
  // 1. Validar que la tarea exista y pertenezca al usuario
  const task = await prisma.task.findUnique({
    where: { id: data.taskId }
  });

  if (!task) throw new NotFoundError('La tarea especificada no existe');
  if (task.userId !== userId) throw new ForbiddenError('No tienes acceso a esta tarea');

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    // 2. Buscar si hay una sesión activa actual del usuario
    const activeSession = await tx.timeSession.findFirst({
      where: {
        userId,
        endedAt: null
      }
    });

    // 3. Si hay sesión activa, cerrarla automáticamente antes de iniciar la nueva
    if (activeSession) {
      const activeEnd = now;
      const duration = diffInSeconds(activeSession.startedAt, activeEnd);
      await tx.timeSession.update({
        where: { id: activeSession.id },
        data: {
          endedAt: activeEnd,
          durationSeconds: Math.max(0, duration)
        }
      });
    }

    // 4. Cambiar el estado de la tarea a 'in_progress' si está en 'planned'
    if (task.status === 'planned') {
      await tx.task.update({
        where: { id: task.id },
        data: { status: 'in_progress' }
      });
    }

    // 5. Crear la nueva sesión
    return tx.timeSession.create({
      data: {
        userId,
        taskId: data.taskId,
        startedAt: now
      },
      include: {
        task: true
      }
    });
  });
}

/**
 * Detener la sesión activa o una sesión específica
 */
export async function stopSession(userId: string, data: StopSessionBody) {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    let session;

    if (data.sessionId) {
      // Detener sesión específica
      session = await tx.timeSession.findUnique({
        where: { id: data.sessionId }
      });

      if (!session) throw new NotFoundError('Sesión de tiempo no encontrada');
      if (session.userId !== userId) throw new ForbiddenError('No tienes acceso a esta sesión');
      if (session.endedAt) throw new ConflictError('La sesión ya fue finalizada anteriormente');
    } else {
      // Detener sesión activa del usuario
      session = await tx.timeSession.findFirst({
        where: {
          userId,
          endedAt: null
        }
      });

      if (!session) throw new ConflictError('No tienes ninguna sesión activa ejecutándose en este momento');
    }

    const duration = diffInSeconds(session.startedAt, now);

    return tx.timeSession.update({
      where: { id: session.id },
      data: {
        endedAt: now,
        durationSeconds: Math.max(0, duration),
        note: data.note ?? null
      },
      include: {
        task: true
      }
    });
  });
}

/**
 * Eliminar una sesión de tiempo del historial
 */
export async function deleteSession(userId: string, sessionId: string): Promise<void> {
  const session = await prisma.timeSession.findUnique({
    where: { id: sessionId }
  });

  if (!session) throw new NotFoundError('Sesión de tiempo no encontrada');
  if (session.userId !== userId) throw new ForbiddenError('No tienes acceso a esta sesión');

  await prisma.timeSession.delete({
    where: { id: sessionId }
  });
}
