import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createApiRouter, ApiRouterDependencies } from './routes';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found';

export interface AppDependencies extends ApiRouterDependencies {
  corsOrigin: string;
}

/**
 * Pure composition — takes already-built services so tests can swap in fakes
 * (see tests/fakes/) without touching Mongo or the network.
 */
export function createApp(deps: AppDependencies): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: deps.corsOrigin }));
  app.use(express.json());
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('tiny'));
  }

  app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));

  app.use(
    '/api/v1',
    createApiRouter({
      productService: deps.productService,
      enquiryService: deps.enquiryService,
      enquiryRateLimit: deps.enquiryRateLimit,
    }),
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
