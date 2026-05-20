import { FastifyInstance } from 'fastify';
import { authenticate } from '../../shared/middleware/authenticate.js';
import * as TagsController from './tags.controller.js';

export async function tagsRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', authenticate);
  app.get('/',        TagsController.getTags);
  app.post('/',       TagsController.createTag);
  app.patch('/:id',   TagsController.updateTag);
  app.delete('/:id',  TagsController.deleteTag);
}
