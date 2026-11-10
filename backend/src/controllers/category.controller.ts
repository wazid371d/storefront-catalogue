import type { RequestHandler } from 'express';
import type { ProductService } from '../services/product.service';
import type { PaginationQuery } from '../validation/pagination.schema';

export class CategoryController {
  constructor(private readonly products: ProductService) {}

  list: RequestHandler = async (_req, res, next) => {
    try {
      const items = await this.products.listCategories();
      res.json({ items });
    } catch (err) {
      next(err);
    }
  };

  productsForCategory: RequestHandler = async (req, res, next) => {
    try {
      const { page, limit } = res.locals.query as PaginationQuery;
      // non-null: Express guarantees :slug is present when this route matches
      const result = await this.products.getCategoryPage(req.params.slug!, page, limit);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
