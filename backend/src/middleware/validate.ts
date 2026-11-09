import type { RequestHandler } from 'express';
import type { ZodError, ZodSchema } from 'zod';
import { HttpError } from '../utils/http-error';

function toFieldErrors(error: ZodError) {
  return error.issues.map((issue) => ({ field: issue.path.join('.') || '(root)', message: issue.message }));
}

/** Validates and replaces req.body with the parsed (and coerced) value. */
export function validateBody(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return next(HttpError.badRequest('Validation failed', toFieldErrors(parsed.error)));
    }
    req.body = parsed.data;
    next();
  };
}

/**
 * Validates req.query and stores the parsed (coerced) value on res.locals —
 * Express's req.query is not reliably reassignable across versions.
 */
export function validateQuery(schema: ZodSchema): RequestHandler {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return next(HttpError.badRequest('Validation failed', toFieldErrors(parsed.error)));
    }
    res.locals.query = parsed.data;
    next();
  };
}
