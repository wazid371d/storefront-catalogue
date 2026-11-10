import type { ErrorRequestHandler } from 'express';
import { HttpError } from '../utils/http-error';
import { logger } from '../utils/logger';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    if (err.details) {
      return res.status(err.status).json({ errors: err.details });
    }
    return res.status(err.status).json({ message: err.message });
  }

  logger.error('Unhandled error', { error: err instanceof Error ? err.stack : String(err) });
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
};
