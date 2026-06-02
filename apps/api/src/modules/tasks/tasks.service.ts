import { prisma } from '../../config/database.js';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../../shared/errors.js';
import { parseDateString } from '../../shared/utils/date.js';
import type { CreateTaskBody, UpdateTaskBody, CreateAttachmentBody } from './tasks.schema.js';

const MAX_TASK_DURATION_SECONDS = 10 * 60 * 60;
const MAX_TASK_DURATION_MINUTES = 10 * 60;

function validateTaskDuration(data: {
  estimatedSeconds?: number;
  estimatedMinutes?: number;
}) {
  if (data.estimatedSeconds !== undefined && data.estimatedSeconds > MAX_TASK_DURATION_SECONDS) {
    throw new ValidationError('Una tarea no puede durar mas de 10 horas');
  }

  if (data.estimatedMinutes !== undefined && data.estimatedMinutes > MAX_TASK_DURATION_MINUTES) {
    throw new ValidationError('Una tarea no puede durar mas de 10 horas');
  }
}

/**
 * Helper para validar categorías, semana y tags
 */
async function validateTaskRelations(
  userId: string,
  data: {
    systemCategoryId?: string;
    userCategoryId?: string;
    weekPlanId?: string;
    tagIds?: string[];
  }
) {
  // 1. Mutua exclusión de categorías
  if (data.systemCategoryId && data.userCategoryId) {
    throw new ValidationError('Una tarea no puede tener systemCategoryId y userCategoryId simultáneamente');
  }

  // 2. Validar systemCategoryId
  if (data.systemCategoryId) {
    const sysCat = await prisma.systemCategory.findUnique({
      where: { id: data.systemCategoryId }
    });
    if (!sysCat) throw new NotFoundError('La categoría del sistema especificada no existe');
  }

  // 3. Validar userCategoryId
  if (data.userCategoryId) {
    const userCat = await prisma.userCategory.findUnique({
      where: { id: data.userCategoryId }
    });
    if (!userCat) throw new NotFoundError('La categoría del usuario especificada no existe');
    if (userCat.userId !== userId) throw new ForbiddenError('No tienes acceso a esta categoría');
  }

  // 4. Validar weekPlanId
  if (data.weekPlanId) {
    const weekPlan = await prisma.weekPlan.findUnique({
      where: { id: data.weekPlanId }
    });
    if (!weekPlan) throw new NotFoundError('El plan semanal especificado no existe');
    if (weekPlan.userId !== userId) throw new ForbiddenError('No tienes acceso a este plan semanal');
  }

  // 5. Validar tagIds
  if (data.tagIds && data.tagIds.length > 0) {
    const uniqueTags = await prisma.tag.findMany({
      where: {
        id: { in: data.tagIds },
        userId
      }
    });
    if (uniqueTags.length !== data.tagIds.length) {
      throw new ForbiddenError('Una o más etiquetas no existen o no pertenecen a tu usuario');
    }
  }
}

/**
 * Helper para programar o actualizar la notificación de una tarea
 */
async function syncTaskNotification(
  tx: Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>,
  userId: string,
  taskId: string,
  taskTitle: string,
  notificationsEnabled: boolean,
  notifyMinutesBefore: number,
  startTime?: Date | null
) {
  // Primero borramos cualquier notificación pendiente (no enviada) asociada a esta tarea
  await tx.notification.deleteMany({
    where: {
      taskId,
      isSent: false
    }
  });

  // Si están habilitadas y hay un startTime en el futuro, creamos una nueva
  if (notificationsEnabled && startTime) {
    const scheduledFor = new Date(startTime.getTime() - notifyMinutesBefore * 60 * 1000);
    
    // Solo si la fecha de envío programada es en el futuro
    if (scheduledFor > new Date()) {
      await tx.notification.create({
        data: {
          userId,
          taskId,
          type: 'task_start',
          title: `Inicio de tarea: ${taskTitle}`,
          body: `Tu tarea "${taskTitle}" está programada para iniciar pronto.`,
          scheduledFor,
          isSent: false,
          isRead: false
        }
      });
    }
  }
}

/**
 * Obtener tareas de un usuario con filtros opcionales
 */
export async function getTasks(userId: string, query: {
  date?: string;
  weekPlanId?: string;
  status?: 'planned' | 'in_progress' | 'done';
  categoryId?: string;
}) {
  const where: any = { userId };

  if (query.date) {
    where.scheduledDate = parseDateString(query.date);
  }

  if (query.weekPlanId) {
    where.weekPlanId = query.weekPlanId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.categoryId) {
    where.OR = [
      { systemCategoryId: query.categoryId },
      { userCategoryId: query.categoryId }
    ];
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { position: 'asc' },
    include: {
      systemCategory: true,
      userCategory: true,
      recurrence: true,
      attachments: true,
      taskTags: {
        include: {
          tag: true
        }
      }
    }
  });

  // Limpiar y formatear las etiquetas en la respuesta para una mejor DX
  return tasks.map(task => {
    const tags = task.taskTags.map(tt => tt.tag);
    const { taskTags, ...rest } = task;
    return { ...rest, tags };
  });
}

/**
 * Obtener una sola tarea por ID
 */
export async function getTaskById(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      systemCategory: true,
      userCategory: true,
      recurrence: true,
      attachments: true,
      taskTags: {
        include: {
          tag: true
        }
      }
    }
  });

  if (!task) throw new NotFoundError('Tarea no encontrada');
  if (task.userId !== userId) throw new ForbiddenError('No tienes acceso a esta tarea');

  const tags = task.taskTags.map(tt => tt.tag);
  const { taskTags, ...rest } = task;
  return { ...rest, tags };
}

/**
 * Crear una nueva tarea
 */
export async function createTask(userId: string, data: CreateTaskBody) {
  validateTaskDuration(data);

  // Validar startTime < endTime
  if (data.startTime && data.endTime) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    if (end <= start) {
      throw new ValidationError('La hora de fin debe ser posterior a la hora de inicio');
    }
  }

  await validateTaskRelations(userId, {
    systemCategoryId: data.systemCategoryId,
    userCategoryId: data.userCategoryId,
    weekPlanId: data.weekPlanId,
    tagIds: data.tagIds
  });

  const parsedDate = parseDateString(data.scheduledDate);

  // Calcular la posición al final de la lista del día
  const maxPosTask = await prisma.task.findFirst({
    where: { userId, scheduledDate: parsedDate },
    orderBy: { position: 'desc' }
  });
  const position = maxPosTask ? maxPosTask.position + 1 : 0;

  // Ejecutamos en transacción para asegurar la creación del plan de recurrencia y la notificación
  const result = await prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        colorHex: data.colorHex ?? '#6366F1',
        status: data.status ?? 'planned',
        priority: data.priority ?? 'medium',
        estimatedMinutes: data.estimatedMinutes,
        estimatedSeconds: data.estimatedSeconds,
        notes: data.notes,
        position,
        scheduledDate: parsedDate,
        startTime: data.startTime ? new Date(data.startTime) : null,
        endTime: data.endTime ? new Date(data.endTime) : null,
        notificationsEnabled: data.notificationsEnabled ?? false,
        notifyMinutesBefore: data.notifyMinutesBefore ?? 15,
        systemCategoryId: data.systemCategoryId,
        userCategoryId: data.userCategoryId,
        weekPlanId: data.weekPlanId,
        // Conectar Tags
        taskTags: data.tagIds && data.tagIds.length > 0 ? {
          create: data.tagIds.map(tagId => ({ tagId }))
        } : undefined,
        // Crear recurrencia si existe
        recurrence: data.recurrence ? {
          create: {
            repeatDays: data.recurrence.repeatDays,
            recurrenceStart: parseDateString(data.recurrence.recurrenceStart),
            recurrenceEnd: data.recurrence.recurrenceEnd ? parseDateString(data.recurrence.recurrenceEnd) : null,
          }
        } : undefined
      },
      include: {
        systemCategory: true,
        userCategory: true,
        recurrence: true,
        attachments: true,
        taskTags: {
          include: {
            tag: true
          }
        }
      }
    });

    // Programar notificación
    await syncTaskNotification(
      tx,
      userId,
      task.id,
      task.title,
      task.notificationsEnabled,
      task.notifyMinutesBefore,
      task.startTime
    );

    return task;
  });

  const tags = result.taskTags.map(tt => tt.tag);
  const { taskTags, ...rest } = result;
  return { ...rest, tags };
}

/**
 * Actualizar una tarea existente
 */
export async function updateTask(userId: string, taskId: string, data: UpdateTaskBody) {
  validateTaskDuration(data);

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { recurrence: true }
  });

  if (!task) throw new NotFoundError('Tarea no encontrada');
  if (task.userId !== userId) throw new ForbiddenError('No tienes acceso a esta tarea');

  // Validar startTime < endTime
  const finalStartTime = data.startTime !== undefined ? (data.startTime ? new Date(data.startTime) : null) : task.startTime;
  const finalEndTime = data.endTime !== undefined ? (data.endTime ? new Date(data.endTime) : null) : task.endTime;

  if (finalStartTime && finalEndTime) {
    if (finalEndTime <= finalStartTime) {
      throw new ValidationError('La hora de fin debe ser posterior a la hora de inicio');
    }
  }

  await validateTaskRelations(userId, {
    systemCategoryId: data.systemCategoryId,
    userCategoryId: data.userCategoryId,
    weekPlanId: data.weekPlanId,
    tagIds: data.tagIds
  });

  const parsedDate = data.scheduledDate ? parseDateString(data.scheduledDate) : undefined;

  const result = await prisma.$transaction(async (tx) => {
    // Si se pasan tagIds, primero eliminamos las relaciones previas
    if (data.tagIds !== undefined) {
      await tx.taskTag.deleteMany({ where: { taskId } });
    }

    // Si se pasa recurrence y ya existía, o si se quiere eliminar
    if (data.recurrence === null) {
      await tx.taskRecurrence.deleteMany({ where: { sourceTaskId: taskId } });
    } else if (data.recurrence) {
      // Upsert de la recurrencia
      if (task.recurrence) {
        await tx.taskRecurrence.update({
          where: { sourceTaskId: taskId },
          data: {
            repeatDays: data.recurrence.repeatDays,
            recurrenceStart: parseDateString(data.recurrence.recurrenceStart),
            recurrenceEnd: data.recurrence.recurrenceEnd ? parseDateString(data.recurrence.recurrenceEnd) : null,
          }
        });
      } else {
        await tx.taskRecurrence.create({
          data: {
            sourceTaskId: taskId,
            repeatDays: data.recurrence.repeatDays,
            recurrenceStart: parseDateString(data.recurrence.recurrenceStart),
            recurrenceEnd: data.recurrence.recurrenceEnd ? parseDateString(data.recurrence.recurrenceEnd) : null,
          }
        });
      }
    }

    const updated = await tx.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        colorHex: data.colorHex,
        status: data.status,
        priority: data.priority,
        estimatedMinutes: data.estimatedMinutes,
        estimatedSeconds: data.estimatedSeconds,
        notes: data.notes,
        scheduledDate: parsedDate,
        startTime: data.startTime !== undefined ? (data.startTime ? new Date(data.startTime) : null) : undefined,
        endTime: data.endTime !== undefined ? (data.endTime ? new Date(data.endTime) : null) : undefined,
        notificationsEnabled: data.notificationsEnabled,
        notifyMinutesBefore: data.notifyMinutesBefore,
        systemCategoryId: data.systemCategoryId !== undefined ? data.systemCategoryId : undefined,
        userCategoryId: data.userCategoryId !== undefined ? data.userCategoryId : undefined,
        weekPlanId: data.weekPlanId !== undefined ? data.weekPlanId : undefined,
        taskTags: data.tagIds !== undefined && data.tagIds.length > 0 ? {
          create: data.tagIds.map(tagId => ({ tagId }))
        } : undefined
      },
      include: {
        systemCategory: true,
        userCategory: true,
        recurrence: true,
        attachments: true,
        taskTags: {
          include: {
            tag: true
          }
        }
      }
    });

    // Sincronizar notificaciones
    await syncTaskNotification(
      tx,
      userId,
      updated.id,
      updated.title,
      updated.notificationsEnabled,
      updated.notifyMinutesBefore,
      updated.startTime
    );

    return updated;
  });

  const tags = result.taskTags.map(tt => tt.tag);
  const { taskTags, ...rest } = result;
  return { ...rest, tags };
}

/**
 * Parchear estado de la tarea
 */
export async function updateTaskStatus(userId: string, taskId: string, status: 'planned' | 'in_progress' | 'done') {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Tarea no encontrada');
  if (task.userId !== userId) throw new ForbiddenError('No tienes acceso a esta tarea');

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status },
    include: {
      systemCategory: true,
      userCategory: true,
      recurrence: true,
      attachments: true,
      taskTags: {
        include: {
          tag: true
        }
      }
    }
  });

  const tags = updated.taskTags.map(tt => tt.tag);
  const { taskTags, ...rest } = updated;
  return { ...rest, tags };
}

/**
 * Reordenar la posición de una tarea en su fecha actual
 */
export async function updateTaskPosition(userId: string, taskId: string, newPosition: number) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Tarea no encontrada');
  if (task.userId !== userId) throw new ForbiddenError('No tienes acceso a esta tarea');

  // Obtener todas las tareas de ese mismo día del usuario ordenadas por posición
  const tasks = await prisma.task.findMany({
    where: {
      userId,
      scheduledDate: task.scheduledDate
    },
    orderBy: { position: 'asc' }
  });

  // Remover la tarea actual de su posición previa
  const restTasks = tasks.filter(t => t.id !== taskId);

  // Insertar en la nueva posición deseada
  const targetIndex = Math.max(0, Math.min(newPosition, restTasks.length));
  restTasks.splice(targetIndex, 0, task);

  // Actualizar posiciones secuenciales en una transacción
  await prisma.$transaction(
    restTasks.map((t, idx) =>
      prisma.task.update({
        where: { id: t.id },
        data: { position: idx }
      })
    )
  );

  return getTaskById(userId, taskId);
}

/**
 * Eliminar una tarea (y sus notificaciones pendientes)
 */
export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Tarea no encontrada');
  if (task.userId !== userId) throw new ForbiddenError('No tienes acceso a esta tarea');

  await prisma.$transaction(async (tx) => {
    // Eliminar notificaciones asociadas
    await tx.notification.deleteMany({ where: { taskId } });

    // Eliminar la tarea (se eliminarán en cascada TaskTag, TaskRecurrence, TaskAttachment por FK onDelete Cascade si aplica o Cascade en prisma)
    await tx.task.delete({ where: { id: taskId } });
  });
}

// ─────────────────────────────────────────────
// LÓGICA DE ATTACHMENTS (ADJUNTOS)
// ─────────────────────────────────────────────

/**
 * Agregar un adjunto a la tarea (Máximo 3 por tarea)
 */
export async function addAttachment(userId: string, taskId: string, data: CreateAttachmentBody) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Tarea no encontrada');
  if (task.userId !== userId) throw new ForbiddenError('No tienes acceso a esta tarea');

  // Validar conteo de adjuntos
  const attachmentCount = await prisma.taskAttachment.count({
    where: { taskId }
  });

  if (attachmentCount >= 3) {
    throw new ValidationError('Una tarea no puede tener más de 3 archivos adjuntos');
  }

  return prisma.taskAttachment.create({
    data: {
      taskId,
      userId,
      type: data.type,
      label: data.label,
      url: data.url
    }
  });
}

/**
 * Eliminar un adjunto
 */
export async function deleteAttachment(userId: string, attachmentId: string): Promise<void> {
  const attachment = await prisma.taskAttachment.findUnique({
    where: { id: attachmentId }
  });

  if (!attachment) throw new NotFoundError('Archivo adjunto no encontrado');
  if (attachment.userId !== userId) throw new ForbiddenError('No tienes acceso a este archivo adjunto');

  await prisma.taskAttachment.delete({
    where: { id: attachmentId }
  });
}
