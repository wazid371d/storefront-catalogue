import { Router } from 'express';
import type { CategoryController } from '../controllers/category.controller';
import { validateQuery } from '../middleware/validate';
import { paginationQuerySchema } from '../validation/pagination.schema';

export function categoryRoutes(controller: CategoryController): Router {
  const router = Router();

  router.get('/', controller.list);
  router.get('/:slug/products', validateQuery(paginationQuerySchema), controller.productsForCategory);

  return router;
}
