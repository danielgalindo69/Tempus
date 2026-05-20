import { FastifyInstance } from 'fastify';
import { authenticate } from '../../shared/middleware/authenticate.js';
import * as TasksController from './tasks.controller.js';

export async function tasksRoutes(app: FastifyInstance): Promise<void> {
  app.register(async (protectedApp) => {
    protectedApp.addHook('onRequest', authenticate);

    // CRUD Tareas
    protectedApp.get('/', TasksController.getTasks);
    protectedApp.get('/:id', TasksController.getTaskById);
    protectedApp.post('/', TasksController.createTask);
    protectedApp.put('/:id', TasksController.updateTask);
    protectedApp.delete('/:id', TasksController.deleteTask);

    // Parches
    protectedApp.patch('/:id/status', TasksController.updateTaskStatus);
    protectedApp.patch('/:id/position', TasksController.updateTaskPosition);

    // Adjuntos
    protectedApp.post('/:id/attachments', TasksController.addAttachment);
    protectedApp.delete('/attachments/:attachmentId', TasksController.deleteAttachment);
  });
}
