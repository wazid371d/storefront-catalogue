import type { RequestHandler } from 'express';
import type { ProductService } from '../services/product.service';
import type { ListProductsQuery } from '../validation/pagination.schema';

export class ProductController {
  constructor(private readonly products: ProductService) {}

  list: RequestHandler = async (_req, res, next) => {
    try {
      const query = res.locals.query as ListProductsQuery;
      const page = await this.products.list(query);
      res.json(page);
    } catch (err) {
      next(err);
    }
  };

  featured: RequestHandler = async (_req, res, next) => {
    try {
      const items = await this.products.getFeatured();
      res.json({ items });
    } catch (err) {
      next(err);
    }
  };

  getById: RequestHandler = async (req, res, next) => {
    try {
      // non-null: Express guarantees :id is present when this route matches
      const product = await this.products.getById(req.params.id!);
      res.json(product);
    } catch (err) {
      next(err);
    }
  };
}
