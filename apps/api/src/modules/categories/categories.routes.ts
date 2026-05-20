import { FastifyInstance } from 'fastify';
import { authenticate } from '../../shared/middleware/authenticate.js';
import * as CategoriesController from './categories.controller.js';

export async function categoriesRoutes(app: FastifyInstance): Promise<void> {
  // Ruta pública para categorías del sistema
  app.get('/system', CategoriesController.getSystemCategories);

  // Rutas protegidas para categorías de usuario
  app.register(async (protectedApp) => {
    protectedApp.addHook('onRequest', authenticate);
    protectedApp.get('/user',        CategoriesController.getUserCategories);
    protectedApp.post('/user',       CategoriesController.createUserCategory);
    protectedApp.patch('/user/:id',  CategoriesController.updateUserCategory);
    protectedApp.delete('/user/:id', CategoriesController.deleteUserCategory);
  });
}
