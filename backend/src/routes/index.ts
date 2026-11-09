import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { CategoryController } from '../controllers/category.controller';
import { EnquiryController } from '../controllers/enquiry.controller';
import { productRoutes } from './product.routes';
import { categoryRoutes } from './category.routes';
import { enquiryRoutes } from './enquiry.routes';
import type { ProductService } from '../services/product.service';
import type { EnquiryService } from '../services/enquiry.service';

export interface ApiRouterDependencies {
  productService: ProductService;
  enquiryService: EnquiryService;
  enquiryRateLimit: { windowMs: number; max: number };
}

export function createApiRouter(deps: ApiRouterDependencies): Router {
  const router = Router();

  const productController = new ProductController(deps.productService);
  const categoryController = new CategoryController(deps.productService);
  const enquiryController = new EnquiryController(deps.enquiryService);

  router.use('/products', productRoutes(productController));
  router.use('/categories', categoryRoutes(categoryController));
  router.use('/enquiries', enquiryRoutes(enquiryController, deps.enquiryRateLimit));

  return router;
}
