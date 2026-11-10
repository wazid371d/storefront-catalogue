import { Router } from 'express';
import type { ProductController } from '../controllers/product.controller';
import { validateQuery } from '../middleware/validate';
import { listProductsQuerySchema } from '../validation/pagination.schema';

export function productRoutes(controller: ProductController): Router {
  const router = Router();

  // must come before "/:id" — otherwise "featured" is parsed as a product id
  router.get('/featured', controller.featured);
  router.get('/', validateQuery(listProductsQuerySchema), controller.list);
  router.get('/:id', controller.getById);

  return router;
}
